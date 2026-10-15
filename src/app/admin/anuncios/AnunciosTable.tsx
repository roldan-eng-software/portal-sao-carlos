'use client';

import { useState } from 'react';
import { approveAdAction, rejectAdAction } from './actions';
import { Button } from '@/components/ui/Button';

interface PendingAd {
  id: string;
  kind: 'anuncio-gratuito' | 'anuncio-patrocinado';
  businessName: string;
  category: string;
  description: string;
  neighborhood: string;
  phone: string | null;
  whatsapp: string | null;
  url: string | null;
  hours: string | null;
  submittedAt: string;
  contactEmail: string;
}

interface AnunciosTableProps {
  initialAds: PendingAd[];
}

export default function AnunciosTable({ initialAds }: AnunciosTableProps) {
  const [pendingAds, setPendingAds] = useState<PendingAd[]>(initialAds);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleApprove = async (id: string) => {
    setLoading(true);
    const result = await approveAdAction(id);
    if (result.success) {
      showToast('success', 'Anúncio aprovado e publicado!');
      setPendingAds((prev) => prev.filter((ad) => ad.id !== id));
    } else {
      showToast('error', result.error || 'Erro ao aprovar');
    }
    setLoading(false);
  };

  const handleReject = async (id: string) => {
    if (!confirm('Tem certeza que deseja rejeitar este anúncio?')) return;
    setLoading(true);
    const result = await rejectAdAction(id);
    if (result.success) {
      showToast('success', 'Anúncio rejeitado e removido.');
      setPendingAds((prev) => prev.filter((ad) => ad.id !== id));
    } else {
      showToast('error', result.error || 'Erro ao rejeitar');
    }
    setLoading(false);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const kindLabel = (kind: string) =>
    kind === 'anuncio-patrocinado' ? 'Patrocinado' : 'Gratuito';
  const kindBadge = (kind: string) =>
    kind === 'anuncio-patrocinado'
      ? 'bg-accent-amber/20 text-accent-amber'
      : 'bg-secondary/20 text-secondary';

  return (
    <>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-xl border px-4 py-3 shadow-lg animate-slide-up ${
            toast.type === 'success'
              ? 'bg-badge-success text-on-success border-success'
              : 'bg-error text-on-error border-error'
          }`}
          role="alert"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <p className="text-body-md">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Tabela */}
      {pendingAds.length === 0 ? (
        <div className="rounded-2xl bg-surface-card p-12 text-center shadow-card">
          <span className="material-symbols-outlined text-6xl text-outline" aria-hidden="true">
            inbox
          </span>
          <h2 className="mt-4 font-display text-headline-md text-on-surface">Nenhum anúncio pendente</h2>
          <p className="mt-2 text-body-md text-on-surface-variant">
            Novas submissões aparecerão aqui automaticamente.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-surface-card shadow-card">
          <table className="w-full text-left" role="table">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-container-low">
                <th className="px-4 py-3 text-label-sm uppercase tracking-wider text-outline">Estabelecimento</th>
                <th className="px-4 py-3 text-label-sm uppercase tracking-wider text-outline">Tipo</th>
                <th className="px-4 py-3 text-label-sm uppercase tracking-wider text-outline">Categoria</th>
                <th className="px-4 py-3 text-label-sm uppercase tracking-wider text-outline">Bairro</th>
                <th className="px-4 py-3 text-label-sm uppercase tracking-wider text-outline">Enviado em</th>
                <th className="px-4 py-3 text-label-sm uppercase tracking-wider text-outline">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pendingAds.map((ad) => (
                <tr key={ad.id} className="border-b border-border-subtle/50 hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-display text-headline-sm text-primary">{ad.businessName}</p>
                      <p className="text-body-sm text-on-surface-variant truncate max-w-xs">
                        {ad.description}
                      </p>
                      <p className="text-body-sm text-outline">
                        Contato: {ad.contactEmail}
                        {ad.phone && ` | Tel: ${ad.phone}`}
                        {ad.whatsapp && ` | WhatsApp: ${ad.whatsapp}`}
                        {ad.url && ` | Site: ${ad.url}`}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-label-sm font-medium ${kindBadge(ad.kind)}`}>
                      {kindLabel(ad.kind)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-body-md text-on-surface">{ad.category}</td>
                  <td className="px-4 py-4 text-body-md text-on-surface">{ad.neighborhood}</td>
                  <td className="px-4 py-4 text-body-sm text-outline">{formatDate(ad.submittedAt)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleApprove(ad.id)}
                        disabled={loading}
                      >
                        Aprovar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleReject(ad.id)} disabled={loading}>
                        Rejeitar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}