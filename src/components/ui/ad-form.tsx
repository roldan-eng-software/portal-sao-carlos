'use client';

import { useState } from 'react';
import { AD_CATEGORIES } from '@/modules/ads-pending/types';

interface AdFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isSubmitting: boolean;
  submitError?: string;
  submitSuccess?: boolean;
}

interface FormErrors {
  businessName?: string;
  category?: string;
  description?: string;
  neighborhood?: string;
  phone?: string;
  whatsapp?: string;
  url?: string;
  cnpj?: string;
  hours?: string;
}

export function AdForm({
  onSubmit,
  isSubmitting,
  submitError,
  submitSuccess,
}: AdFormProps) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'businessName':
        if (!value.trim()) return 'Nome do comércio/serviço é obrigatório.';
        if (value.trim().length > 120) return 'Máximo 120 caracteres.';
        break;
      case 'category':
        if (!value) return 'Selecione uma categoria.';
        break;
      case 'description':
        if (!value.trim()) return 'Descrição é obrigatória.';
        if (value.trim().length > 500) return 'Máximo 500 caracteres.';
        break;
      case 'neighborhood':
        if (!value.trim()) return 'Bairro/região é obrigatório.';
        if (value.trim().length > 80) return 'Máximo 80 caracteres.';
        break;
      case 'phone':
        if (value && value.replace(/\D/g, '').length < 10) return 'Telefone deve ter 10 ou 11 dígitos (com DDD).';
        break;
      case 'whatsapp':
        if (value && value.replace(/\D/g, '').length < 10) return 'WhatsApp deve ter 10 ou 11 dígitos (com DDD).';
        break;
      case 'url':
        if (value) {
          try {
            const url = new URL(value);
            if (url.protocol !== 'http:' && url.protocol !== 'https:') return 'URL deve ser http:// ou https://';
          } catch {
            return 'URL inválida.';
          }
        }
        break;
      case 'cnpj':
        if (value) {
          const clean = value.replace(/\D/g, '');
          if (clean.length !== 14) return 'CNPJ deve ter 14 dígitos.';
        }
        break;
    }
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, e.target.value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Marca todos como tocados
    const formData = new FormData(e.currentTarget);
    const allFields = ['businessName', 'category', 'description', 'neighborhood', 'phone', 'whatsapp', 'url', 'hours', 'cnpj'];
    allFields.forEach((name) => setTouched((prev) => ({ ...prev, [name]: true })));

    // Valida todos
    const newErrors: FormErrors = {};
    let hasErrors = false;

    allFields.forEach((name) => {
      const value = formData.get(name)?.toString() || '';
      const error = validateField(name, value);
      if (error) {
        newErrors[name as keyof FormErrors] = error;
        hasErrors = true;
      }
    });

    // Pelo menos telefone OU WhatsApp
    const phone = formData.get('phone')?.toString() || '';
    const whatsapp = formData.get('whatsapp')?.toString() || '';
    if (!phone.replace(/\D/g, '') && !whatsapp.replace(/\D/g, '')) {
      newErrors.phone = 'Informe pelo menos telefone ou WhatsApp.';
      newErrors.whatsapp = 'Informe pelo menos telefone ou WhatsApp.';
      hasErrors = true;
    }

    setErrors(newErrors);

    if (hasErrors) return;

    await onSubmit(formData);
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const formatCNPJ = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  };

  if (submitSuccess) {
    return (
      <div className="text-center py-12" role="status" aria-live="polite">
        <span className="material-symbols-outlined text-6xl text-badge-success mb-4 block" aria-hidden="true">check_circle</span>
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          Anúncio enviado com sucesso!
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
          Seu anúncio foi enviado para moderação. A equipe do Portal São Carlos analisará e entrará em contato.
          Você receberá uma notificação no WhatsApp ou e-mail informado.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2.5 text-label-lg text-on-secondary"
        >
          <span className="material-symbols-outlined" aria-hidden="true">add</span>
          Enviar outro anúncio
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {submitError && (
        <div
          className="rounded-lg bg-badge-emergency/10 border border-badge-emergency/30 p-4 text-sm text-badge-emergency"
          role="alert"
        >
          {submitError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="businessName" className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
            Nome do comércio/serviço <span className="text-badge-emergency" aria-hidden="true">*</span>
          </label>
          <input
            type="text"
            id="businessName"
            name="businessName"
            maxLength={120}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full rounded-lg border px-3 py-2.5 text-body-md transition-colors ${
              errors.businessName && touched.businessName
                ? 'border-badge-emerging focus:border-badge-emerging focus:ring-badge-emerging/20'
                : 'border-neutral-300 dark:border-neutral-600 focus:border-secondary focus:ring-secondary/20'
            } bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100`}
            aria-invalid={!!(errors.businessName && touched.businessName)}
            aria-describedby={errors.businessName && touched.businessName ? 'businessName-error' : undefined}
          />
          {errors.businessName && touched.businessName && (
            <p id="businessName-error" className="mt-1 text-sm text-badge-emerging" role="alert">
              {errors.businessName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
            Categoria <span className="text-badge-emergency" aria-hidden="true">*</span>
          </label>
          <select
            id="category"
            name="category"
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full rounded-lg border px-3 py-2.5 text-body-md transition-colors appearance-none bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 ${
              errors.category && touched.category
                ? 'border-badge-emerging focus:border-badge-emerging focus:ring-badge-emerging/20'
                : 'border-neutral-300 dark:border-neutral-600 focus:border-secondary focus:ring-secondary/20'
            }`}
            aria-invalid={!!(errors.category && touched.category)}
            aria-describedby={errors.category && touched.category ? 'category-error' : undefined}
          >
            <option value="">Selecione...</option>
            {AD_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && touched.category && (
            <p id="category-error" className="mt-1 text-sm text-badge-emerging" role="alert">
              {errors.category}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
          Descrição curta <span className="text-badge-emergency" aria-hidden="true">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={500}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full rounded-lg border px-3 py-2.5 text-body-md transition-colors resize-y ${
            errors.description && touched.description
              ? 'border-badge-emerging focus:border-badge-emerging focus:ring-badge-emerging/20'
              : 'border-neutral-300 dark:border-neutral-600 focus:border-secondary focus:ring-secondary/20'
          } bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100`}
          aria-invalid={!!(errors.description && touched.description)}
          aria-describedby={errors.description && touched.description ? 'description-error' : undefined}
        />
        {errors.description && touched.description && (
          <p id="description-error" className="mt-1 text-sm text-badge-emerging" role="alert">
            {errors.description}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="neighborhood" className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
            Bairro/região <span className="text-badge-emergency" aria-hidden="true">*</span>
          </label>
          <input
            type="text"
            id="neighborhood"
            name="neighborhood"
            maxLength={80}
            placeholder="Ex: Centro, Vila Prado, Cidade Aracy..."
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full rounded-lg border px-3 py-2.5 text-body-md transition-colors ${
              errors.neighborhood && touched.neighborhood
                ? 'border-badge-emerging focus:border-badge-emerging focus:ring-badge-emerging/20'
                : 'border-neutral-300 dark:border-neutral-600 focus:border-secondary focus:ring-secondary/20'
            } bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100`}
            aria-invalid={!!(errors.neighborhood && touched.neighborhood)}
            aria-describedby={errors.neighborhood && touched.neighborhood ? 'neighborhood-error' : undefined}
          />
          {errors.neighborhood && touched.neighborhood && (
            <p id="neighborhood-error" className="mt-1 text-sm text-badge-emerging" role="alert">
              {errors.neighborhood}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
            Telefone (com DDD)
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            maxLength={15}
            placeholder="(16) 99999-9999"
            onChange={(e) => handleChange({ ...e, target: { ...e.target, value: formatPhone(e.target.value) } })}
            onBlur={handleBlur}
            className={`w-full rounded-lg border px-3 py-2.5 text-body-md transition-colors ${
              errors.phone && touched.phone
                ? 'border-badge-emerging focus:border-badge-emerging focus:ring-badge-emerging/20'
                : 'border-neutral-300 dark:border-neutral-600 focus:border-secondary focus:ring-secondary/20'
            } bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100`}
            aria-invalid={!!(errors.phone && touched.phone)}
            aria-describedby={errors.phone && touched.phone ? 'phone-error' : undefined}
          />
          {errors.phone && touched.phone && (
            <p id="phone-error" className="mt-1 text-sm text-badge-emerging" role="alert">
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
            WhatsApp (com DDD)
          </label>
          <input
            type="tel"
            id="whatsapp"
            name="whatsapp"
            maxLength={15}
            placeholder="(16) 99999-9999"
            onChange={(e) => handleChange({ ...e, target: { ...e.target, value: formatPhone(e.target.value) } })}
            onBlur={handleBlur}
            className={`w-full rounded-lg border px-3 py-2.5 text-body-md transition-colors ${
              errors.whatsapp && touched.whatsapp
                ? 'border-badge-emerging focus:border-badge-emerging focus:ring-badge-emerging/20'
                : 'border-neutral-300 dark:border-neutral-600 focus:border-secondary focus:ring-secondary/20'
            } bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100`}
            aria-invalid={!!(errors.whatsapp && touched.whatsapp)}
            aria-describedby={errors.whatsapp && touched.whatsapp ? 'whatsapp-error' : undefined}
          />
          {errors.whatsapp && touched.whatsapp && (
            <p id="whatsapp-error" className="mt-1 text-sm text-badge-emerging" role="alert">
              {errors.whatsapp}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="url" className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
            Site/Redes sociais (opcional)
          </label>
          <input
            type="url"
            id="url"
            name="url"
            maxLength={500}
            placeholder="https://exemplo.com"
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full rounded-lg border px-3 py-2.5 text-body-md transition-colors ${
              errors.url && touched.url
                ? 'border-badge-emerging focus:border-badge-emerging focus:ring-badge-emerging/20'
                : 'border-neutral-300 dark:border-neutral-600 focus:border-secondary focus:ring-secondary/20'
            } bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100`}
            aria-invalid={!!(errors.url && touched.url)}
            aria-describedby={errors.url && touched.url ? 'url-error' : undefined}
          />
          {errors.url && touched.url && (
            <p id="url-error" className="mt-1 text-sm text-badge-emerging" role="alert">
              {errors.url}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="hours" className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
            Horário de atendimento (opcional)
          </label>
          <input
            type="text"
            id="hours"
            name="hours"
            maxLength={200}
            placeholder="Ex: Seg-Sex 8h-18h, Sáb 8h-12h"
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full rounded-lg border px-3 py-2.5 text-body-md transition-colors ${
              errors.hours && touched.hours
                ? 'border-badge-emerging focus:border-badge-emerging focus:ring-badge-emerging/20'
                : 'border-neutral-300 dark:border-neutral-600 focus:border-secondary focus:ring-secondary/20'
            } bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100`}
          />
        </div>

        <div>
          <label htmlFor="cnpj" className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
            CNPJ (opcional, para verificação de duplicidade)
          </label>
          <input
            type="text"
            id="cnpj"
            name="cnpj"
            maxLength={18}
            placeholder="00.000.000/0000-00"
            onChange={(e) => handleChange({ ...e, target: { ...e.target, value: formatCNPJ(e.target.value) } })}
            onBlur={handleBlur}
            className={`w-full rounded-lg border px-3 py-2.5 text-body-md transition-colors ${
              errors.cnpj && touched.cnpj
                ? 'border-badge-emerging focus:border-badge-emerging focus:ring-badge-emerging/20'
                : 'border-neutral-300 dark:border-neutral-600 focus:border-secondary focus:ring-secondary/20'
            } bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100`}
            aria-invalid={!!(errors.cnpj && touched.cnpj)}
            aria-describedby={errors.cnpj && touched.cnpj ? 'cnpj-error' : undefined}
          />
          {errors.cnpj && touched.cnpj && (
            <p id="cnpj-error" className="mt-1 text-sm text-badge-emerging" role="alert">
              {errors.cnpj}
            </p>
          )}
        </div>
      </div>

      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Campos marcados com <span className="text-badge-emerging" aria-hidden="true">*</span> são obrigatórios.
        Ao enviar, você concorda com a <a href="/politica-de-privacidade" className="underline hover:text-secondary">Política de Privacidade</a>
        e com os <a href="/termos-de-uso" className="underline hover:text-secondary">Termos de Uso</a>.
      </p>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto rounded-full bg-secondary px-8 py-3 text-label-lg text-on-secondary shadow-[0_2px_8px_rgba(2,102,255,0.25)] transition-all hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Enviando...
          </>
        ) : (
          'Enviar para Moderação'
        )}
      </button>
    </form>
  );
}