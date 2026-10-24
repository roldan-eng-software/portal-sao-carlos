import postgres from 'postgres';

let _sql: ReturnType<typeof postgres> | null = null;

export function getSql() {
  if (_sql) return _sql;

  const url = process.env.DATABASE_URL;
  
  // Durante build (SSR static), DATABASE_URL pode não estar disponível
  // Retornamos um cliente mock que lança erro apenas quando usado
  if (!url) {
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
      // Build time no Vercel - não falha, apenas avisa
      console.warn('DATABASE_URL não configurada durante build. Funções que usam banco falharão em runtime se não configurada.');
    }
    
    // Mock para evitar erro de build - lança erro real apenas quando chamado
    _sql = new Proxy({} as ReturnType<typeof postgres>, {
      get() {
        throw new Error('DATABASE_URL não configurada. Configure a variável de ambiente no Vercel (Production).');
      }
    }) as ReturnType<typeof postgres>;
    
    return _sql;
  }

  _sql = postgres(url, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
    onnotice: () => {},
  });

  return _sql;
}

export const sql = getSql();