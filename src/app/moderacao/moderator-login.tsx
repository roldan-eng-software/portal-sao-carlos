'use client';

import { useState } from 'react';

export function ModeratorLogin() {
  const [secret, setSecret] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/moderacao/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret }),
      });
      if (!response.ok) {
        setError('Senha incorreta.');
        return;
      }
      window.location.reload();
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Área restrita</h1>
      <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-sm">
        Informe a senha do moderador para continuar.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Senha</span>
          <input
            type="password"
            name="secret"
            autoComplete="current-password"
            required
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-badge-emergency">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-secondary px-4 py-2 text-white font-medium disabled:opacity-60"
        >
          {isSubmitting ? 'Verificando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
