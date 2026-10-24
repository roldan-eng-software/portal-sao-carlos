'use client';

import { useState } from 'react';
import { ModerationTable } from '@/components/ui/moderation-table';
import { PublishedAdsManager } from '@/components/ui/published-ads-manager';
import { StatusBadge } from '@/components/ui/status-badge';
import type { AdSubmission, AdPublished, ManageActionData } from '@/modules/ads-pending/types';

interface ModerationClientProps {
  initialPending: AdSubmission[];
  initialPublished: AdPublished[];
}

export function ModerationClient({ initialPending, initialPublished }: ModerationClientProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'published'>('pending');
  const [pendingAds, setPendingAds] = useState<AdSubmission[]>(initialPending);
  const [publishedAds, setPublishedAds] = useState<AdPublished[]>(initialPublished);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleApprove = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ads/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: id }),
      });
      const result = await response.json();

      if (!result.success) {
        showToast(result.errors?.[0] || 'Erro ao aprovar', 'error');
        return;
      }

      // Remove da lista de pendentes
      setPendingAds((prev) => prev.filter((ad) => ad.id !== id));
      // Adiciona à lista de publicados
      if (result.publishedAd) {
        setPublishedAds((prev) => [result.publishedAd, ...prev]);
      }

      showToast('Anúncio aprovado e publicado!', 'success');

      // Mostra links de notificação
      if (result.notificationLinks?.whatsapp) {
        if (window.confirm('Anúncio aprovado! Deseja abrir WhatsApp para notificar o comerciante?')) {
          window.open(result.notificationLinks.whatsapp, '_blank');
        }
      }
    } catch {
      showToast('Erro de conexão ao aprovar', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ads/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: id, reason }),
      });
      const result = await response.json();

      if (!result.success) {
        showToast(result.errors?.[0] || 'Erro ao recusar', 'error');
        return;
      }

      // Atualiza status na lista local
      setPendingAds((prev) =>
        prev.map((ad) =>
          ad.id === id ? { ...ad, status: 'recusado' as const, rejectionReason: reason, reviewedAt: new Date().toISOString() } : ad
        )
      );

      showToast('Anúncio recusado', 'success');

      if (result.notificationLinks?.whatsapp) {
        if (window.confirm('Anúncio recusado. Deseja abrir WhatsApp para notificar o comerciante?')) {
          window.open(result.notificationLinks.whatsapp, '_blank');
        }
      }
    } catch {
      showToast('Erro de conexão ao recusar', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishedAction = async (adId: string, action: 'edit' | 'suspend' | 'reactivate' | 'remove', data?: ManageActionData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ads/manage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId, action, data }),
      });
      const result = await response.json();

      if (!result.success) {
        showToast(result.errors?.[0] || 'Erro ao processar ação', 'error');
        return;
      }

      // Atualiza lista local
      setPublishedAds((prev) => {
        if (action === 'remove') {
          return prev.filter((ad) => ad.id !== adId);
        }
        return prev.map((ad) => {
          if (ad.id !== adId) return ad;
          if (action === 'edit') return { ...ad, ...data, updatedAt: new Date().toISOString() };
          if (action === 'suspend') return { ...ad, status: 'suspenso' as const, suspendedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
          if (action === 'reactivate') return { ...ad, status: 'publicado' as const, updatedAt: new Date().toISOString() };
          return ad;
        });
      });

      showToast(`Ação "${action}" realizada com sucesso`, 'success');
    } catch {
      showToast('Erro de conexão', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Moderação de Anúncios</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Gerencie anúncios gratuitos pendentes e publicados
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
          <StatusBadge status={pendingAds.filter((a) => a.status === 'pendente').length > 0 ? 'pendente' : 'publicado'} />
          <span className="text-sm text-neutral-500 dark:text-neutral-400 ml-2">
            {pendingAds.filter((a) => a.status === 'pendente').length} pendentes
          </span>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-neutral-200 dark:border-neutral-700">
        <nav className="flex gap-8" aria-label="Abas de moderação">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'pending'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            Pendentes ({pendingAds.filter((a) => a.status === 'pendente').length})
          </button>
          <button
            onClick={() => setActiveTab('published')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'published'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            Publicados ({publishedAds.length})
          </button>
        </nav>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-badge-success text-white'
              : 'bg-badge-emergency text-white'
          }`}
          role="alert"
        >
          {toast.message}
        </div>
      )}

      {/* Conteúdo das abas */}
      {activeTab === 'pending' && (
        <ModerationTable
          pendingAds={pendingAds.filter((a) => a.status === 'pendente')}
          onApprove={handleApprove}
          onReject={handleReject}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'published' && (
        <PublishedAdsManager
          publishedAds={publishedAds}
          onAction={handlePublishedAction}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}