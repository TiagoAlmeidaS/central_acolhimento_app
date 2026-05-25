# Protótipos legados (referência visual)

Estes arquivos são o protótipo **React UMD via HTML standalone** que serviu de base para descobrir o produto. Ficam aqui só como referência — **não são executáveis no app Next.js**.

## Conteúdo

| Arquivo | Função |
|---|---|
| `Central Acolhimento.html` | Canvas principal do app (todas as telas em phone frames) |
| `Landing.html` | Landing page estática |
| `design-canvas.jsx` | Layout do canvas |
| `tweaks-panel.jsx` | Painel de dev (dark toggle etc.) |
| `app/` | Todos os screens, ícones, ui e data do protótipo |

## Como abrir

Servir os HTMLs com qualquer static server. Eles carregam React 18 + Babel inline via CDN.

```powershell
npx serve docs/_prototype
# depois abra http://localhost:3000/Central%20Acolhimento.html
```

## Origem das specs

Os arquivos `app/screens-*.jsx` foram a base para as 13 specs em `docs/specs/`. Tudo o que está aqui foi mapeado em produto + arquitetura + spec — pode ser usado para conferir *como deve ficar* visualmente.

## Status

- **Não toque** os arquivos deste diretório a partir das specs Next.js.
- Para mudanças visuais, atualize `docs/architecture/design-system.md` e os componentes em `src/components/`.
- Este diretório pode ser **deletado** quando o produto Next.js cobrir 100% do que o protótipo cobre.
