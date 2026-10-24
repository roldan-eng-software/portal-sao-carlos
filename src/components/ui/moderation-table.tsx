'use client';

import { useState } from 'react';
import { StatusBadge } from './status-badge';
import type { AdSubmission } from '@/modules/ads-pending/types';

interface ModerationTableProps {
  pendingAds: AdSubmission[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  isLoading?: boolean;
}

export function ModerationTable({ pendingAds, onApprove, onReject, isLoading }: ModerationTableProps) {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  if (pendingAds.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-6xl text-neutral-400 mb-4 block" aria-hidden="true">inbox</span>
        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
          Nenhum anúncio pendente
        </h3>
        <p className="text-neutral-500 dark:text-neutral-400">
          Todos os anúncios foram processados.
        </p>
      </div>
    );
  }

  const handleApprove = async (id: string) => {
    if (window.confirm('Confirmar aprovação deste anúncio? Ele será publicado como anúncio gratuito.')) {
      await onApprove(id);
    }
  };

  const handleRejectClick = (id: string) => {
    setRejectingId(id);
    setRejectReason('');
  };

  const handleConfirmReject = async () => {
    if (!rejectingId) return;
    if (!rejectReason.trim()) {
      alert('Motivo da recusa é obrigatório.');
      return;
    }
    if (window.confirm(`Confirmar recusa? Motivo: "${rejectReason}"`)) {
      await onReject(rejectingId, rejectReason);
      setRejectingId(null);
      setRejectReason('');
    }
  };

  const handleCancelReject = () => {
    setRejectingId(null);
    setRejectReason('');
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
      <table className="w-full" role="table">
        <thead className="bg-neutral-50 dark:bg-neutral-800">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">Comércio</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">Categoria</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">Bairro</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">Contato</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">Enviado em</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {pendingAds.map((ad) => (
            <tr key={ad.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
              <td className="px-4 py-3">
                <div className="font-medium text-neutral-900 dark:text-neutral-100">{ad.businessName}</div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 max-w-xs">
                  {ad.description}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="inline-block px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded text-neutral-700 dark:text-neutral-300">
                  {ad.category}
                </span>
              </td>
              <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">{ad.neighborhood}</td>
              <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                {ad.whatsapp && (
                  <a href={`https://wa.me/55${ad.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                    <span className="material-symbols-outlined text-[16px] text-green-600" aria-hidden="true">chat</span>
                    WhatsApp
                  </a>
                )}
                {ad.phone && (
                  <a href={`tel:${ad.phone}`} className="flex items-center gap-1 hover:underline">
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">phone</span>
                    Telefone
                  </a>
                )}
                {ad.url && (
                  <a href={ad.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">link</span>
                    Site
                  </a>
                )}
                {ad.hours && <div className="text-xs">Horário: {ad.hours}</div>}
              </td>
              <td className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                {new Date(ad.submittedAt).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={ad.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {rejectingId === ad.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Motivo da recusa (obrigatório)"
                        className="px-2 py-1 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-900 w-48"
                        autoFocus
                      />
                      <button
                        onClick={handleConfirmReject}
                        className="px-2 py-1 text-sm bg-badge-emergency text-white rounded hover:bg-badge-emergency/90"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={handleCancelReject}
                        className="px-2 py-1 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleApprove(ad.id)}
                        disabled={isLoading}
                        className="px-3 py-1.5 text-sm bg-badge-success text-white rounded hover:bg-badge-success/90 disabled:opacity-50"
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleRejectClick(ad.id)}
                        disabled={isLoading}
                        className="px-3 py-1.5 text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50"
                      >
                        Recusar
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}