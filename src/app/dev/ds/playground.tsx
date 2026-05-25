"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { SearchInput } from "@/components/ui/search-input";
import { Avatar } from "@/components/ui/avatar";
import { InfoBanner } from "@/components/ui/info-banner";
import { BrandMark } from "@/components/ui/brand-mark";
import { StatusStepper } from "@/components/ui/status-stepper";
import { StepBar } from "@/components/ui/step-bar";
import { StatusPill, StatusDot } from "@/components/domain/assistido/status-pill";
import { TenantChip } from "@/components/domain/tenant/tenant-chip";
import { BottomNav, type BottomNavTab } from "@/components/layout/bottom-nav";
import { ScreenHeader } from "@/components/layout/screen-header";
import {
  IconArrowRight,
  IconWhatsapp,
  IconCheck,
  IconLock,
  IconHourglass,
  IconRefresh,
  IconPhone,
  IconChurch,
  IconUser,
  IconHelpCircle,
  IconShield,
  IconBell,
  IconMore,
  IconPlus,
} from "@/components/icons";
import { STATUS_KEYS } from "@/lib/data/status";
import { TENANTS_MOCK, UFS } from "@/lib/data/tenants";

/**
 * Playground completo do design system — renderiza cada componente
 * com 2-3 variações para facilitar inspeção visual e QA.
 *
 * Cliente por causa do toggle dark/light persistido em localStorage.
 */
export function DesignSystemPlayground() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [tab, setTab] = useState<BottomNavTab>("home");
  const [step, setStep] = useState(2);
  const [search, setSearch] = useState("");
  const [uf, setUf] = useState<string>("");

  useEffect(() => {
    const stored =
      (typeof window !== "undefined" &&
        localStorage.getItem("acolhe.theme")) ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    setTheme(stored as "light" | "dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    if (typeof window !== "undefined") {
      localStorage.setItem("acolhe.theme", theme);
    }
  }, [theme]);

  return (
    <main className="min-h-dvh bg-bg pb-24">
      <div className="mx-auto max-w-phone px-4 pt-6 pb-12 flex flex-col gap-8">
        <ScreenHeader
          title="Design System"
          tenantId={TENANTS_MOCK[0]!.id}
          right={
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                setTheme((t) => (t === "light" ? "dark" : "light"))
              }
              aria-label="Alternar tema"
            >
              {theme === "light" ? "Modo Escuro" : "Modo Claro"}
            </Button>
          }
        />

        <Section title="Brand">
          <div className="flex items-center gap-6">
            <BrandMark size={72} />
            <BrandMark size={48} />
            <BrandMark size={32} />
          </div>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-col gap-3">
            <Button variant="primary" iconRight={<IconArrowRight />}>
              Continuar
            </Button>
            <Button variant="secondary">Secundário</Button>
            <Button variant="whatsapp" icon={<IconWhatsapp />}>
              Continuar com WhatsApp
            </Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger" size="md">
              Excluir
            </Button>
            <Button variant="link" size="sm">
              É a primeira vez? Cadastre-se
            </Button>
            <Button variant="primary" size="md" full disabled>
              Desabilitado
            </Button>
            <Button variant="primary" size="md" full loading>
              Enviando
            </Button>
            <div className="flex gap-2">
              <Button size="sm">SM</Button>
              <Button size="md">MD</Button>
              <Button size="lg">LG</Button>
            </div>
          </div>
        </Section>

        <Section title="IconButton">
          <div className="flex items-center gap-3">
            <IconButton aria-label="Mais" icon={<IconMore />} variant="flat" />
            <IconButton aria-label="Notificações" icon={<IconBell />} variant="soft" />
            <IconButton aria-label="Nova" icon={<IconPlus />} variant="tinted" />
            <IconButton aria-label="Pequeno" icon={<IconRefresh />} variant="soft" size="sm" />
          </div>
        </Section>

        <Section title="Inputs">
          <div className="flex flex-col gap-4">
            <Input
              label="Nome completo"
              placeholder="Como devemos te chamar?"
              icon={<IconUser size={20} />}
            />
            <Input
              label="Telefone"
              placeholder="(92) 9 9999 9999"
              inputMode="tel"
              type="tel"
              icon={<IconPhone size={20} />}
              hint="Usaremos para enviar o código OTP"
            />
            <Input
              label="E-mail"
              type="email"
              placeholder="voce@email.com"
              error="E-mail inválido"
              defaultValue="x@x"
            />
            <Textarea
              label="Resumo do contato"
              placeholder="Como foi a conversa?"
            />
            <Select
              label="UF"
              placeholder="Selecione a UF"
              value={uf}
              onChange={(e) => setUf(e.target.value)}
              options={UFS.map((u) => ({ value: u, label: u }))}
            />
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </Section>

        <Section title="Status">
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_KEYS.map((k) => (
              <StatusPill key={k} status={k} />
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3">
            {STATUS_KEYS.map((k) => (
              <span key={k} className="inline-flex items-center gap-1.5 text-sm">
                <StatusDot status={k} />
                {k}
              </span>
            ))}
          </div>
        </Section>

        <Section title="Tenant chips">
          <div className="flex flex-col gap-2">
            {TENANTS_MOCK.map((t) => (
              <div key={t.id} className="flex gap-2 items-center">
                <TenantChip tenantId={t.id} size="sm" />
                <TenantChip tenantId={t.id} size="md" />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Avatares">
          <div className="flex items-end gap-3">
            <Avatar name="Daniel Bemol" size={64} src="https://i.pravatar.cc/240?img=68" />
            <Avatar name="Irmã Marta Souza" size={48} src="https://i.pravatar.cc/240?img=20" online />
            <Avatar name="Carlos Silva" size={56} ring src="https://i.pravatar.cc/240?img=15" />
            <Avatar name="Roberto Mendes" size={48} />
          </div>
        </Section>

        <Section title="Cards">
          <Card>
            <h3 className="font-semibold tracking-tight2">Card simples</h3>
            <p className="text-sm text-text-2 mt-1">
              Padding default de 18px e radius 18px.
            </p>
          </Card>
          <Card padding={12} onClick={() => {}}>
            <span className="text-sm">Card clicável compacto</span>
          </Card>
        </Section>

        <Section title="Info banners">
          <div className="flex flex-col gap-3">
            <InfoBanner>
              Dica: você pode pular esta etapa e voltar depois nos Ajustes.
            </InfoBanner>
            <InfoBanner tone="warning" icon={<IconHourglass size={20} />}>
              Seu cadastro está em análise. Avisaremos por WhatsApp.
            </InfoBanner>
            <InfoBanner tone="urgente" icon={<IconShield size={20} />}>
              Conteúdo confidencial — não compartilhe fora da equipe.
            </InfoBanner>
          </div>
        </Section>

        <Section title="StatusStepper · análise do cuidador">
          <StatusStepper
            current={1}
            steps={[
              { label: "Cadastro", icon: <IconCheck /> },
              { label: "Análise", icon: <IconHourglass /> },
              { label: "Liberado", icon: <IconLock /> },
            ]}
          />
        </Section>

        <Section title="StepBar · tenant setup">
          <div className="bg-surface rounded-card border border-border">
            <StepBar
              current={step}
              total={5}
              onBack={() => setStep((s) => Math.max(1, s - 1))}
              onSkip={() => setStep((s) => Math.min(5, s + 1))}
            />
          </div>
        </Section>

        <Section title="Ícones">
          <div className="grid grid-cols-6 gap-3 text-text-2 [&_svg]:mx-auto">
            <IconChurch />
            <IconUser />
            <IconPhone />
            <IconCheck />
            <IconLock />
            <IconRefresh />
            <IconHourglass />
            <IconBell />
            <IconWhatsapp />
            <IconHelpCircle />
            <IconShield />
            <IconArrowRight />
          </div>
        </Section>

        <Section title="BottomNav (líder)">
          <div className="relative h-[88px] -mx-4 border-t border-border bg-bg">
            <BottomNav tab={tab} onTab={setTab} role="lider" urgentBadge={3} />
          </div>
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[14px] font-bold uppercase tracking-[0.06em] text-text-3">
        {title}
      </h2>
      {children}
    </section>
  );
}
