'use client';

import { useState } from 'react';
import { StatusBadge } from './status-badge';
import type { AdPublished, ManageActionData } from '@/modules/ads-pending/types';

interface PublishedAdsManagerProps {
  publishedAds: AdPublished[];
  onAction: (adId: string, action: 'edit' | 'suspend' | 'reactivate' | 'remove', data?: ManageActionData) => Promise<void>;
  isLoading?: boolean;
}

export function PublishedAdsManager({ publishedAds, onAction, isLoading }: PublishedAdsManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<ManageActionData>({});

  if (publishedAds.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-6xl text-neutral-400 mb-4 block" aria-hidden="true">storefront</span>
        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
          Nenhum anúncio publicado
        </h3>
        <p className="text-neutral-500 dark:text-neutral-400">
          Anúncios aprovados aparecerão aqui.
        </p>
      </div>
    );
  }

  const handleEditStart = (ad: AdPublished) => {
    setEditingId(ad.id);
    setEditData({
      businessName: ad.businessName,
      category: ad.category,
      description: ad.description,
      neighborhood: ad.neighborhood,
      phone: ad.phone || '',
      whatsapp: ad.whatsapp || '',
      url: ad.url || '',
      hours: ad.hours || '',
    });
  };

  const handleEditSave = async () => {
    if (!editingId) return;
    await onAction(editingId, 'edit', editData);
    setEditingId(null);
    setEditData({});
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleEditChange = (field: keyof ManageActionData, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
      <table className="w-full" role="table">
        <thead className="bg-neutral-50 dark:bg-neutral-800">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">Comércio</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">Categoria</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">Bairro</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">Aprovado em</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {publishedAds.map((ad) => (
            <tr key={ad.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
              <td className="px-4 py-3">
                {editingId === ad.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editData.businessName}
                      onChange={(e) => handleEditChange('businessName', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-900"
                    />
                    <select
                      value={editData.category}
                      onChange={(e) => handleEditChange('category', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-900"
                    >
                      <option value="Alimentação">Alimentação</option>
                      <option value="Serviços">Serviços</option>
                      <option value="Comércio">Comércio</option>
                      <option value="Saúde">Saúde</option>
                      <option value="Educação">Educação</option>
                      <option value="Automotivo">Automotivo</option>
                      <option value="Construção">Construção</option>
                      <option value="Beleza">Beleza</option>
                      <option value="Outros">Outros</option>
                    </select>
                    <textarea
                      value={editData.description}
                      onChange={(e) => handleEditChange('description', e.target.value)}
                      rows={2}
                      className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-900"
                    />
                    <input
                      type="text"
                      value={editData.neighborhood}
                      onChange={(e) => handleEditChange('neighborhood', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-900"
                    />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={(e) => handleEditChange('phone', e.target.value)}
                        placeholder="Telefone"
                        className="px-2 py-1 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-900"
                      />
                      <input
                        type="tel"
                        value={editData.whatsapp}
                        onChange={(e) => handleEditChange('whatsapp', e.target.value)}
                        placeholder="WhatsApp"
                        className="px-2 py-1 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-900"
                      />
                    </div>
                    <input
                      type="url"
                      value={editData.url}
                      onChange={(e) => handleEditChange('url', e.target.value)}
                      placeholder="https://exemplo.com"
                      className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-900"
                    />
                    <input
                      type="text"
                      value={editData.hours}
                      onChange={(e) => handleEditChange('hours', e.target.value)}
                      placeholder="Horário de atendimento"
                      className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-900"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleEditSave} className="px-3 py-1 text-sm bg-secondary text-white rounded hover:bg-primary-container">Salvar</button>
                      <button onClick={handleEditCancel} className="px-3 py-1 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">{ad.businessName}</div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-1">{ad.description}</div>
                  </>
                )}
              </td>
              <td className="px-4 py-3">
                {editingId === ad.id ? (
                  <select
                    value={editData.category}
                    onChange={(e) => handleEditChange('category', e.target.value)}
                    className="px-2 py-1 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-900"
                  >
                    <option value="Alimentação">Alimentação</option>
                    <option value="Serviços">Serviços</option>
                    <option value="Comércio">Comércio</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Educação">Educação</option>
                    <option value="Automotivo">Automotivo</option>
                    <option value="Construção">Construção</option>
                    <option value="Beleza">Beleza</option>
                    <option value="Outros">Outros</option>
                  </select>
                ) : (
                  <span className="inline-block px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded text-neutral-700 dark:text-neutral-300">
                    {ad.category}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">{ad.neighborhood}</td>
              <td className="px-4 py-3">
                <StatusBadge status={ad.status} />
              </td>
              <td className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                {new Date(ad.approvedAt).toLocaleDateString('pt-BR')}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {editingId === ad.id ? (
                    <div className="flex gap-2">
                      <button onClick={handleEditSave} className="px-3 py-1 text-sm bg-secondary text-white rounded hover:bg-primary-container">Salvar</button>
                      <button onClick={handleEditCancel} className="px-3 py-1 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100">Cancelar</button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditStart(ad)}
                        disabled={isLoading}
                        className="px-3 py-1 text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50"
                      >
                        Editar
                      </button>
                      {ad.status === 'publicado' && (
                        <button
                          onClick={() => onAction(ad.id, 'suspend')}
                          disabled={isLoading}
                          className="px-3 py-1 text-sm bg-accent-amber text-white rounded hover:bg-accent-amber/90 disabled:opacity-50"
                        >
                          Suspender
                        </button>
                      )}
                      {ad.status === 'suspenso' && (
                        <button
                          onClick={() => onAction(ad.id, 'reactivate')}
                          disabled={isLoading}
                          className="px-3 py-1 text-sm bg-badge-success text-white rounded hover:bg-badge-success/90 disabled:opacity-50"
                        >
                          Reativar
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm('Confirmar remoção? Esta ação é irreversível.')) {
                            onAction(ad.id, 'remove');
                          }
                        }}
                        disabled={isLoading}
                        className="px-3 py-1 text-sm bg-badge-emergency text-white rounded hover:bg-badge-emergency/90 disabled:opacity-50"
                      >
                        Remover
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