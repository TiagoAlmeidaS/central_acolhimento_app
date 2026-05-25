---
title: Visão de Produto · Central de Acolhimento
kind: ProductOverview
owner: produto-acolhe
status: stable
updated: 2026-05-25
---

# 1. Visão

> **Acolhe** é a *central de cuidado pastoral* das comunidades de fé brasileiras. Em um único app mobile, **líderes e cuidadores** acompanham os irmãos assistidos com clareza, presença e dignidade — sem planilhas perdidas, sem perder ninguém de vista.

A promessa é **operacional, não evangelística**: a gente não substitui o pastoreio — a gente garante que ninguém caia entre as fendas.

---

# 2. Problema

Comunidades pastorais hoje sofrem com:

| Sintoma | Consequência |
|---|---|
| Lista de assistidos em WhatsApp / papel / planilha | Pessoa em crise *some* da agenda |
| Cuidadores trabalham em silos | Mesma pessoa abordada 3× ou nenhuma |
| Líder não sabe quantos urgentes existem hoje | Decisão de visita pastoral é reativa |
| Equipe rotaciona, conhecimento sai com a pessoa | Histórico perdido a cada troca |
| Dados sensíveis vazam entre igrejas/células | Privacidade violada → quebra de confiança |

**Acolhe** resolve isso com um modelo onde cada localidade é um *tenant fechado* e cada interação fica registrada na linha do tempo do assistido.

---

# 3. Personas

## 3.1 Líder (Founder/Admin) — *Daniel, 38*

- Pastor / coordenador de uma localidade
- Fundador da localidade no app, **paga a assinatura**
- Aprova cuidadores que se autocadastraram
- Convida pessoas direto pelo WhatsApp (acesso já liberado)
- Olha dashboard semanalmente, age sobre urgentes
- Pode existir em **múltiplas localidades** ao mesmo tempo (rede regional)

**Dores:** "Não sei quem está sendo cuidado de verdade. Não sei se o André já foi visitado essa semana."

## 3.2 Cuidador — *Irmã Marta, 52*

- Voluntária da equipe pastoral
- Recebe casos atribuídos pelo líder ou pega da fila aguardando
- Faz visitas, registra notas, marca contatos
- Conversa com o agente IA pra cadastrar irmão novo ou atualizar status sem mexer em form
- **Não enxerga billing**, não enxerga outras localidades

**Dores:** "Esqueço de quem liguei semana passada. Anotação fica perdida no WhatsApp."

## 3.3 Cuidador convidado — *Cláudia, 29*

- Variante da persona Cuidador
- Entra pelo **link de convite recebido no WhatsApp**
- **Pula a fila de aprovação** (líder já validou via convite)
- Onboarding é apenas "confirmar dados" → bem-vinda

## 3.4 Cuidador self-signup — *Tiago, 41*

- Variante da persona Cuidador
- Se cadastra sozinho via Login → Cadastre-se aqui
- Vai pra fila **"Em análise"** até o líder aprovar
- Recebe notificação WhatsApp ao ser liberado

## 3.5 Assistido — *Carlos, 47*

- **Não é usuário do app** — é o sujeito do cuidado
- Tem perfil dentro da localidade com timeline, status, próxima reunião
- Recebe mensagens via WhatsApp do cuidador
- Foto, telefone, contexto pastoral, família ficam armazenados de forma confidencial

---

# 4. Princípios de produto

1. **Tenant é sagrado.** Nenhum dado de uma localidade vai parar em outra. Nem busca cross-tenant, nem export, nem cache.
2. **WhatsApp é o canal-mãe.** Auth (OTP), convites, notificações, recibo de pagamento — tudo flui pelo WhatsApp.
3. **Mobile-first literal.** Design parte de 380 px de largura. Desktop é "mobile esticado", não o contrário.
4. **A IA confirma, nunca presume.** Antes de criar cadastro ou mudar status, o agente descreve o que vai fazer.
5. **Tom acolhedor, nunca burocrático.** "Bem-vinda à equipe" > "Cadastro efetuado com sucesso".
6. **Confidencialidade visível.** Toda tela com dado sensível mostra que é confidencial (ícone, banner, ou nota de rodapé).
7. **Líder paga, equipe usa.** Apenas o líder fundador vê o módulo de assinatura/billing.
8. **14 dias grátis sem cartão é a régua.** Conversão acontece pelo valor entregue, não pelo dark pattern.

---

# 5. Modelo de negócio

| Plano | Preço/mês | Limites |
|---|---|---|
| **Essencial** | R$ 19,90 | 50 assistidos · 8 cuidadores · 200 interações IA/mês |
| **Pró** | R$ 29,90 | Ilimitados · IA ilimitada · PDF · suporte WhatsApp · histórico sem expiração |

- **Trial:** 14 dias, sem cartão obrigatório (mas pré-autoriza Stripe)
- **Cobrança:** mensal, recorrente, via Stripe (cartão ou PIX)
- **Cancelamento:** a qualquer momento, mantém acesso até o fim do ciclo pago
- **Multi-localidade:** o plano Pró habilita criar mais de uma localidade na mesma conta

---

# 6. Glossário (Linguagem Ubíqua)

| Termo | Definição |
|---|---|
| **Localidade** (tenant) | Espaço fechado da comunidade. Cada igreja/célula é uma localidade. Equivale a tenant no sistema. |
| **Assistido** | Pessoa que recebe acolhimento. Não é usuário do app. |
| **Cuidador** | Membro da equipe que acompanha assistidos. Não vê billing. |
| **Líder** | Cuidador com papel de admin. Aprova entradas, convida, paga, vê dashboard. |
| **Acolhimento** | Ato + processo de acompanhar um assistido. Tem ciclo de vida (Urgente → Concluído). |
| **Status do caso** | Urgente · Aguardando · Em Acompanhamento · Concluído |
| **Convite** | Link enviado pelo líder via WhatsApp. Quem aceita pula a fila de aprovação. |
| **Análise** | Fila de espera de cuidadores que se autocadastraram e aguardam aprovação do líder. |
| **Funil** | Distribuição quantitativa de assistidos por status, visível no dashboard do líder. |
| **Agente** (IA) | Assistente conversacional dentro de Mensagens. Cadastra, busca, sumariza. |
| **Timeline** | Linha do tempo de eventos de um assistido (notas, IA, sistema). |
| **OTP** | Código de 6 dígitos enviado por WhatsApp para verificar telefone. |

---

# 7. Princípios de UX

- **Plus Jakarta Sans** como tipografia base (já no protótipo)
- **Tema claro + escuro** lado a lado desde o dia 1 (tokens já definidos em `Central Acolhimento.html`)
- **Acento azul** (`#2D7FF9`) como cor primária; **verde WhatsApp** para CTAs de canal
- **Status como pílulas pastel** (bg suave + fg saturado) — já definidos em `app/data.jsx`
- **Phone frame na desktop** (artboard 380×800) — visualização privilegiada do produto
- **Bottom-nav** com 4 abas: Início · Agenda · Mensagens · Ajustes
- **FAB azul** no Início para "novo irmão"

---

# 8. Não-objetivos (escopo NEGATIVO)

A primeira versão do Acolhe **não** vai:

- ❌ Substituir o sistema de gestão de membros da igreja (não é Church-CMS)
- ❌ Processar dízimos / ofertas
- ❌ Ser usado **pelo assistido** (ele não loga, é cuidado)
- ❌ Fazer videoconferência (linka pro Meet/Zoom)
- ❌ Sincronizar com Google Calendar (agenda nativa primeiro)
- ❌ Ter web app desktop dedicado (mobile-first, desktop = mobile esticado)
- ❌ Permitir export massivo de dados sensíveis (LGPD)

---

# 9. Métricas de sucesso (norte)

| Métrica | Meta 90 dias |
|---|---|
| Tempo do "Sou líder" até "Localidade criada" | < 5 min |
| % de assistidos com pelo menos 1 evento na timeline/semana | > 70% |
| Tempo médio até urgente ser respondido | < 6h |
| NPS do cuidador | > 50 |
| Churn de assinatura (líder) | < 5%/mês |
| % de convites aceitos em < 24h | > 80% |

---

*Leitura complementar:* [`domain-model.md`](./domain-model.md) · [`user-flows.md`](./user-flows.md)
