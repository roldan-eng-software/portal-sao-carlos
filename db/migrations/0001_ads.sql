-- Esquema de anúncios: fila de pendentes, publicados e log de moderação.
-- Idempotente: a tabela ads_pending já existia em produção (criada manualmente),
-- por isso usa IF NOT EXISTS e ADD COLUMN IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS ads_pending (
  id text PRIMARY KEY,
  business_name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  neighborhood text NOT NULL,
  phone text,
  whatsapp text,
  url text,
  hours text,
  cnpj text,
  status text NOT NULL DEFAULT 'pendente',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  rejection_reason text,
  source_ip text
);

ALTER TABLE ads_pending ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'anuncio-gratuito';
ALTER TABLE ads_pending ADD COLUMN IF NOT EXISTS contact_email text;

CREATE TABLE IF NOT EXISTS ads_published (
  id text PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('anuncio-gratuito', 'anuncio-patrocinado')),
  business_name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  neighborhood text NOT NULL,
  phone text,
  whatsapp text,
  url text,
  hours text,
  image_url text,
  cnpj text,
  contact_email text,
  status text NOT NULL DEFAULT 'publicado' CHECK (status IN ('publicado', 'suspenso')),
  approved_at timestamptz NOT NULL DEFAULT now(),
  expires_at date,
  suspended_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ajustes para o schema já existente em produção (ads_published foi criada com id uuid
-- e sem contact_email). A tabela estava vazia no momento da migração.
ALTER TABLE ads_published ALTER COLUMN id TYPE text;
ALTER TABLE ads_published ADD COLUMN IF NOT EXISTS contact_email text;

-- Um CNPJ não pode ter dois anúncios publicados (inclusive suspensos).
CREATE UNIQUE INDEX IF NOT EXISTS ads_published_cnpj_unique
  ON ads_published (cnpj) WHERE cnpj IS NOT NULL;

CREATE TABLE IF NOT EXISTS ads_moderation_log (
  id bigserial PRIMARY KEY,
  actor text NOT NULL DEFAULT 'moderador',
  action text NOT NULL CHECK (action IN ('aprovar', 'recusar', 'editar', 'suspender', 'reativar', 'remover', 'migrar')),
  submission_id text,
  ad_id text,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
