# Ícones auto-hospedados

`material-symbols-outlined.woff2` — subset local de34 ligaduras do Material
Symbols Outlined usadas no projeto (≈34 KB), com os eixos variáveis
FILL/GRAD/opsz/wght preservados. Substitui o `<link>` da Google Fonts
(layout.tsx) — ver `@font-face` em `../globals.css`.

## Ao adicionar um ícone

1. Use o nome da ligadura em `<span className="material-symbols-outlined">nome</span>`.
   **Confirme o nome no catálogo oficial** (materialsymbols.google.com) — nomes
   inexistentes renderizam como texto cru (ex.: `fog` não existe, o certo é `foggy`).
2. Regere o subset a partir da fonte completa `MaterialSymbolsOutlined[wght].ttf`
   (baixar de fonts.googleapis.com/css2 com `text=` e UA de navegador, ou do
   repositório google/material-design-icons):

```bash
# Extrai os glifos-alvo das ligaduras (GSUB) e gera o subset:
pyftsubset material-full.woff2 \
  --output-file=src/app/fonts/material-symbols-outlined.woff2 \
  --text="<todos os nomes de ícone usados no projeto, separados por espaço>" \
  --glyphs="$(python src/app/fonts/extract-ligatures.py <fonte> <nomes...>)" \
  --no-layout-closure \
  --layout-features="*" \
  --flavor=woff2
```

Pontos críticos:

- `--no-layout-closure` é **obrigatório**: sem ele, a closure do GSUB
  readiciona todas as ~3.000 ligaduras da fonte (as letras do `--text`
  formam componentes de qualquer ligadura) e o subset não reduz.
- `--glyphs` deve conter os **glifos-alvo** das ligaduras usadas — eles não
  têm cmap, então só são localizáveis pelo GSUB (tipo 4 embrulhado em
  Extension tipo 7): percorra os subtables e compare a sequência de letras
  com os nomes usados no código.
- `font-display: block` no `@font-face` é obrigatório: sem ele a ligadura
  crua aparece como texto antes do fonte carregar.
- Após regerar, rode `npm run build` e confira visualmente a home
  (incluindo os cartões de emergência de `#contatos`).

## Ícones atuais (34)

add_business, air, arrow_forward, calendar_today, call, chat, check_circle,
info, launch, local_fire_department, location_on, mail, medical_services,
notifications_active, open_in_new, phone, rocket_launch, schedule, send,
shield, storefront, verified, water_drop, bolt, recycling, account_balance,
campaign, wb_sunny, partly_cloudy_day, cloud, foggy, rainy, weather_snowy,
thunderstorm

Lista dinâmica: `wmoToIcon()` em `weather-section.tsx` (clima) e
`sourceIcon()` em `notices-section.tsx` (emissor).
