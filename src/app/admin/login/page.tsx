"use client";

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

function AdminLoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin/anuncios';
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, redirect }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push(redirect);
        router.refresh();
      } else {
        setError(data.error || 'Senha incorreta');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-surface-card p-8 shadow-card">
        <header className="mb-8 text-center">
          <h1 className="font-display text-headline-lg text-primary">Área Administrativa</h1>
          <p className="mt-2 text-body-md text-on-surface-variant">
            Gerenciamento de anúncios pendentes
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <Input
            name="password"
            label="Senha de Acesso"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="Digite a senha"
            error={error}
          />

          {error && (
            <p className="text-body-sm text-error text-center" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p className="mt-6 text-center text-body-sm text-outline">
          <Link href="/" className="text-secondary hover:underline">
            ← Voltar ao portal
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md mx-auto px-4 py-16 sm:px-6 lg:px-8">Carregando...</div>}>
      <AdminLoginPageContent />
    </Suspense>
  );
}