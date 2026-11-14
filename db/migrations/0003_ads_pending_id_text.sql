-- A fila `ads_pending` foi criada manualmente em produção com `id uuid`,
-- mas o formulário oficial (/anuncie → Server Action) gera ids text
-- (`generateAdId()` → "slug-do-negocio-timestamp"). Com a coluna uuid, TODO
-- envio falhava com SQLSTATE 22P02 (invalid input syntax for type uuid) e o
-- anúncio nunca chegava à área de moderação.
--
-- `ads_published` já havia sido convertida para text em 0001_ads.sql; esta
-- migração alinha a fila com os publicados (aceita ids text e uuid).
ALTER TABLE ads_pending
  ALTER COLUMN id TYPE text USING id::text;
