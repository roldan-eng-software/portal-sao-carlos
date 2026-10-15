'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { AD_CATEGORIES, AD_KINDS } from '@/lib/ads-validation';
import { submitAdAction } from './actions';
import { useToast } from '@/components/ui/Toast';

const KIND_OPTIONS = [
  { value: 'anuncio-gratuito', label: 'Anúncio Gratuito — listagem básica no Guia Comercial' },
  { value: 'anuncio-patrocinado', label: 'Anúncio Patrocinado — destaque comercial com prioridade' },
];

const CATEGORY_OPTIONS = AD_CATEGORIES.map((cat) => ({ value: cat, label: cat }));

export default function AnunciePage() {
  const router = useRouter();
  const { toasts, setToasts } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    kind: 'anuncio-gratuito' as const,
    businessName: '',
    category: '',
    description: '',
    neighborhood: '',
    phone: '',
    whatsapp: '',
    url: '',
    hours: '',
    contactEmail: '',
    website: '', // honeypot
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpa erro do campo quando usuário digita
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        formDataToSend.append(key, value);
      }
    });

    const result = await submitAdAction(formDataToSend);

    if (result.success) {
      // Toast de sucesso via event
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: result.message } }));
      // Reset form
      setFormData({
        kind: 'anuncio-gratuito',
        businessName: '',
        category: '',
        description: '',
        neighborhood: '',
        phone: '',
        whatsapp: '',
        url: '',
        hours: '',
        contactEmail: '',
        website: '',
      });
    } else {
      // Erros de validação
      const fieldErrors: Record<string, string> = {};
      result.errors?.forEach((err) => {
        fieldErrors[err.field] = err.message;
      });
      setErrors(fieldErrors);
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: 'Por favor, corrija os erros abaixo.' } }));
    }

    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      {/* Cabeçalho */}
      <header className="mb-10 text-center">
        <h1 className="font-display text-headline-lg text-primary">Cadastre seu Negócio</h1>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Preencha o formulário abaixo. Sua submissão passará por moderação manual antes de ser publicada.
        </p>
      </header>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Honeypot - campo oculto anti-bot */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} aria-hidden="true" />

        {/* Tipo de anúncio */}
        <Select
          name="kind"
          label="Tipo de Anúncio"
          value={formData.kind}
          onChange={handleChange}
          required
          error={errors.kind}
          options={KIND_OPTIONS}
          placeholder="Selecione o tipo"
        />

        {/* Nome do estabelecimento */}
        <Input
          name="businessName"
          label="Nome do Estabelecimento"
          value={formData.businessName}
          onChange={handleChange}
          required
          maxLength={100}
          placeholder="Ex: Padaria Aurora"
          error={errors.businessName}
        />

        {/* Categoria */}
        <Select
          name="category"
          label="Categoria"
          value={formData.category}
          onChange={handleChange}
          required
          error={errors.category}
          options={CATEGORY_OPTIONS}
          placeholder="Selecione a categoria"
        />

        {/* Descrição */}
        <Textarea
          name="description"
          label="Descrição"
          value={formData.description}
          onChange={handleChange}
          required
          maxLength={300}
          rows={4}
          placeholder="Descreva seu negócio, produtos ou serviços (máx. 300 caracteres)"
          error={errors.description}
        />

        {/* Bairro */}
        <Input
          name="neighborhood"
          label="Bairro"
          value={formData.neighborhood}
          onChange={handleChange}
          required
          maxLength={80}
          placeholder="Ex: Centro, Jardim Embaré, Redenção"
          error={errors.neighborhood}
        />

        {/* Contatos - seção */}
        <fieldset className="space-y-4">
          <legend className="text-label-lg text-primary">Contatos (pelo menos um obrigatório)</legend>

          <Input
            name="phone"
            label="Telefone (com DDD)"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(16) 9999-9999"
            error={errors.phone}
          />

          <Input
            name="whatsapp"
            label="WhatsApp (apenas números com DDD)"
            type="tel"
            value={formData.whatsapp}
            onChange={handleChange}
            placeholder="5516999999999"
            error={errors.whatsapp}
          />

          <Input
            name="url"
            label="Site do Negócio"
            type="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="https://seunegocio.com.br"
            error={errors.url}
          />
        </fieldset>

        {/* Horário de funcionamento */}
        <Input
          name="hours"
          label="Horário de Funcionamento"
          value={formData.hours}
          onChange={handleChange}
          maxLength={120}
          placeholder="Ex: Seg a sex, 8h às 18h | Sáb 8h às 12h"
          error={errors.hours}
        />

        {/* E-mail de contato */}
        <Input
          name="contactEmail"
          label="E-mail para Contato da Moderação"
          type="email"
          value={formData.contactEmail}
          onChange={handleChange}
          required
          placeholder="seu@email.com"
          error={errors.contactEmail}
        />

        {/* Erro genérico de contatos */}
        {errors.contacts && (
          <p className="text-body-sm text-error" role="alert">{errors.contacts}</p>
        )}

        {/* Botão de envio */}
        <div className="pt-4">
          <Button type="submit" size="lg" className="w-full sm:w-auto" loading={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar para Análise'}
          </Button>
        </div>

        <p className="text-body-sm text-outline text-center">
          Ao enviar, você concorda que seus dados serão usados apenas para fins de moderação e publicação do anúncio,
          conforme nossa <a href="/politica-de-privacidade" className="text-secondary hover:underline">Política de Privacidade</a>.
        </p>
      </form>
    </div>
  );
}