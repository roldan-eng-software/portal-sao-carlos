-- Defaults para colunas de data NOT NULL que já existem em produção sem default.
-- Sem isso, inserts de seed e de aprovação falham por updated_at/approved_at nulos.
ALTER TABLE ads_published ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE ads_published ALTER COLUMN approved_at SET DEFAULT now();
