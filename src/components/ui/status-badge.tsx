'use client';

interface StatusBadgeProps {
  status: 'pendente' | 'aprovado' | 'recusado' | 'publicado' | 'suspenso' | 'removido';
  className?: string;
}

const statusConfig = {
  pendente: { label: 'Pendente', bg: 'bg-accent-amber/10', text: 'text-accent-amber', border: 'border-accent-amber/30' },
  aprovado: { label: 'Aprovado', bg: 'bg-badge-success/10', text: 'text-badge-success', border: 'border-badge-success/30' },
  recusado: { label: 'Recusado', bg: 'bg-badge-emergency/10', text: 'text-badge-emergency', border: 'border-badge-emergency/30' },
  publicado: { label: 'Publicado', bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/30' },
  suspenso: { label: 'Suspenso', bg: 'bg-neutral-500/10', text: 'text-neutral-500', border: 'border-neutral-500/30' },
  removido: { label: 'Removido', bg: 'bg-neutral-700/10', text: 'text-neutral-700 dark:text-neutral-300', border: 'border-neutral-700/30' },
} as const;

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {config.label}
    </span>
  );
}