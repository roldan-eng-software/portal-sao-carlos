import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware para:
 * 1. Rate limiting em /anuncie (Server Actions POST)
 * 2. Autenticação simples para /admin/*
 *
 * Armazenamento em memória (Map global) - suficiente para porte atual.
 * Em produção na Vercel, considerar @vercel/kv ou Redis para persistência cross-instance.
 */

// ============ RATE LIMITING ============
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 5,           // 5 requisições por janela
};

function getClientIp(request: NextRequest): string {
  // Em produção (Vercel), usar header x-forwarded-for
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  // Fallback para desenvolvimento - usar x-real-ip ou IP genérico
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return '127.0.0.1';
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    // Nova janela ou primeira requisição
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_CONFIG.windowMs });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT_CONFIG.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  return { allowed: true };
}

// ============ ADMIN AUTH ============
const ADMIN_COOKIE_NAME = 'admin_session';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

function verifyAdminPassword(password: string): boolean {
  return ADMIN_PASSWORD.length > 0 && password === ADMIN_PASSWORD;
}

function getSessionCookie(request: NextRequest): string | undefined {
  return request.cookies.get(ADMIN_COOKIE_NAME)?.value;
}

function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

function isLoginRoute(pathname: string): boolean {
  return pathname === '/admin/login';
}

function isAnuncieAction(pathname: string): boolean {
  // Server Actions em /anuncie fazem POST para a própria rota
  return pathname === '/anuncie';
}

// ============ MIDDLEWARE PRINCIPAL ============
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);

  // 1. Rate limiting para /anuncie (POST)
  if (isAnuncieAction(pathname) && request.method === 'POST') {
    const { allowed, retryAfter } = checkRateLimit(ip);

    if (!allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Muitas tentativas. Tente novamente mais tarde.',
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter || 60),
          },
        },
      );
    }
  }

  // 2. Proteção de rotas /admin/*
  if (isAdminRoute(pathname) && !isLoginRoute(pathname)) {
    const session = getSessionCookie(request);

    if (!session || !verifyAdminPassword(session)) {
      // Redireciona para login
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Headers de segurança básicos
  const response = NextResponse.next();

  // CSP básico (já temos via next.config.ts headers, mas reforça)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    '/anuncie',           // rate limiting no formulário
    '/admin/:path*',      // proteção admin
  ],
};