'use client';

import { useState } from 'react';
import { AdForm } from '@/components/ui/ad-form';
import { ContentLabel } from '@/components/ui/content-label';

export function AdFormSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setSubmitError(undefined);

    try {
      const data = Object.fromEntries(formData.entries());
      const response = await fetch('/api/ads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        if (result.errors?._rateLimit) {
          setSubmitError(result.errors._rateLimit);
        } else if (result.errors?.cnpj) {
          setSubmitError(result.errors.cnpj);
        } else {
          setSubmitError('Erro ao enviar anúncio. Verifique os campos e tente novamente.');
        }
        return;
      }

      setSubmitSuccess(true);
    } catch {
      setSubmitError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section aria-labelledby="ad-form-heading" className="max-w-3xl mx-auto space-y-6">
      <header className="flex items-center gap-3">
        <ContentLabel kind="anuncio-gratuito" />
        <h2 id="ad-form-heading" className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Anuncie Gratuitamente
        </h2>
      </header>

      <div className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-6 sm:p-8 shadow-sm">
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Preencha o formulário abaixo para cadastrar seu comércio ou serviço no Guia Comercial do Portal São Carlos.
          Todos os anúncios passam por moderação manual antes de serem publicados. Não há custo para anúncios gratuitos.
        </p>

        <div className="space-y-1 text-sm text-neutral-500 dark:text-neutral-400 mb-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <p><strong>Política de anúncios gratuitos:</strong> 1 anúncio por CNPJ/negócio, duração indeterminada até remoção manual.</p>
          <p>Comércio local geral (lojas, restaurantes, serviços) — consulte <a href="/termos-de-uso" className="underline hover:text-secondary">Termos de Uso</a>.</p>
        </div>

        <AdForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitError={submitError}
          submitSuccess={submitSuccess}
        />
      </div>
    </section>
  );
}