---
title: 0001 · Stack Next.js Mobile-First
kind: ADR
status: accepted
date: 2026-05-25
deciders: tech-acolhe
---

# ADR 0001 · Stack Next.js mobile-first (sem nativo, sem React Native)

## Contexto

O protótipo atual é um conjunto de arquivos React UMD servidos por HTML estático (`Central Acolhimento.html`) + Babel inline. Funciona para demo, não para produção: sem auth, sem DB, sem testes, sem build. Precisamos decidir a stack alvo.

Alternativas avaliadas:

| Opção | Pros | Contras |
|---|---|---|
| **A) Next.js (App Router) + Tailwind, mobile-first** | Web é universal; deploy simples; RSC reduz bundle no mobile; PWA cobre 80% das necessidades nativas | Não roda em offline robusto sem PWA caprichado; push notification limitado |
| B) React Native (Expo) | App store presence; push robusto | Time pequeno; mais código pra manter; build pipeline pesado; sem urgência por nativo |
| C) Flutter | Stack diferente do time; já houve `.fvm` mas foi deletado | Idem React Native + curva |
| D) Híbrido (Next + Capacitor mais tarde) | Reaproveita 100% | Pode esperar |

## Decisão

Vamos com **Next.js 15+ App Router, mobile-first, mantendo a porta aberta para Capacitor no futuro**.

Mais detalhes em [`../architecture/overview.md`](../architecture/overview.md).

## Consequências

✔ Velocidade de iteração alta (uma codebase só).
✔ PWA cobre o caso de uso do cuidador no campo.
✔ Mesma stack para landing, app e admin.
✘ Push notification depende de web push + FCM (limitação iOS Safari).
✘ Cliente final precisa "instalar PWA" para experiência tipo app.
✘ Mitigação: WhatsApp é o canal de notificação primário (decisão de produto já tomada), o que neutraliza a maior limitação.

## Reversibilidade

Capacitor pode envolver o app Next.js como WebView e publicar nas stores sem rewrite. Decisão é **reversível com baixo custo**.
