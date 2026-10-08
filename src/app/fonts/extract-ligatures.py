#!/usr/bin/env python3
"""Extrai os glifos-alvo das ligaduras do Material Symbols para o subset.

Uso (requer fonttools + brotli: pip install fonttools brotli):

    python src/app/fonts/extract-ligatures.py <fonte-completa.woff2> <nomes...>

Imprime (stdout) os nomes de glifo-alvo das ligaduras correspondentes, prontos
para `pyftsubset --glyphs="$(...)"`. Os glifos-alvo não têm cmap — só são
localizáveis percorrendo o GSUB (LigatureSubst tipo 4, aqui embrulhado em
Extension tipo 7).

Passo seguinte (ver README.md deste diretório):

    pyftsubset fonte-completa.woff2 \
      --output-file=src/app/fonts/material-symbols-outlined.woff2 \
      --text="<mesmos nomes, separados por espaço>" \
      --glyphs="$(python src/app/fonts/extract-ligatures.py fonte-completa.woff2 <nomes...>)" \
      --no-layout-closure --layout-features="*" --flavor=woff2

`--no-layout-closure` é obrigatório: sem ele a closure readiciona todas as
ligaduras da fonte (as letras do --text são componentes de qualquer uma).
"""
import sys

from fontTools.ttLib import TTFont


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__, file=sys.stderr)
        return 2

    font_path, *names = sys.argv[1:]
    wanted = set(names)

    font = TTFont(font_path)
    cmap = font.getBestCmap()
    char_of: dict[str, str] = {}
    for cp, glyph in cmap.items():
        char_of.setdefault(glyph, chr(cp))

    found: dict[str, str] = {}
    gsub = font.get("GSUB")
    if gsub is None:
        print("Fonte sem GSUB (sem ligaduras)", file=sys.stderr)
        return 1

    for lookup in gsub.table.LookupList.Lookup:
        for subtable in lookup.SubTable:
            real = subtable.ExtSubTable if lookup.LookupType == 7 else subtable
            if real.__class__.__name__ != "LigatureSubst":
                continue
            for first, ligatures in real.ligatures.items():
                for lig in ligatures:
                    try:
                        spelled = "".join(char_of[g] for g in [first, *lig.Component])
                    except KeyError:
                        continue
                    if spelled in wanted:
                        found[spelled] = lig.LigGlyph

    missing = wanted - set(found)
    if missing:
        print(f"Ligaduras ausentes na fonte: {sorted(missing)}", file=sys.stderr)
        return 1

    print(" ".join(sorted(set(found.values()))))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
