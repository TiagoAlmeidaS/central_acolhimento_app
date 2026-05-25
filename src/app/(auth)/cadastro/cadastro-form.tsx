"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ChangeEvent } from "react";
import { Button, Input, Select, Textarea } from "@/components/ui";
import {
  IconArrowRight,
  IconChurch,
  IconPhone,
  IconUser,
} from "@/components/icons";
import { maskBrPhone } from "@/lib/auth/phone";
import { UFS } from "@/lib/data/tenants";
import {
  SignupSchema,
  type SignupInput,
} from "@/lib/validators/membership";
import { submitCuidadorSignup } from "@/server/membership.actions";

interface CadastroFormProps {
  /** Telefone pré-preenchido vindo da sessão (já mascarado). */
  telefonePadrao: string;
  /** Nome pré-preenchido — vazio se ainda não foi setado. */
  nomePadrao: string;
}

/**
 * Estado interno do form. `uf` aceita string vazia para representar o
 * placeholder do `<Select>`; só ao validar convertemos para `SignupInput`.
 */
interface FormState {
  nome: string;
  telefone: string;
  uf: string;
  cidade: string;
  igreja: string;
  bio: string;
}

/**
 * Formulário do `/cadastro` (cuidador self-signup). Espelha o
 * `CadastroScreen` do protótipo (`docs/_prototype/app/screens-onboarding.jsx`).
 *
 * - Telefone vem pré-preenchido da sessão; o usuário pode editar mas a
 *   spec 01 controla o número canônico (ver `submitCuidadorSignup` para
 *   detalhes do contrato).
 * - Validação roda 100% via Zod (`SignupSchema`) — mesmo schema do server
 *   action, assim a UI nunca "sai do contrato".
 */
export function CadastroForm({ telefonePadrao, nomePadrao }: CadastroFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => ({
    nome: nomePadrao,
    telefone: telefonePadrao,
    uf: "",
    cidade: "",
    igreja: "",
    bio: "",
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof SignupInput, string>>>({});
  const [topError, setTopError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const update =
    <K extends keyof FormState>(key: K) =>
    (value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      if (errors[key as keyof SignupInput]) {
        setErrors((p) => ({ ...p, [key as keyof SignupInput]: undefined }));
      }
    };

  const onChangePhone = (e: ChangeEvent<HTMLInputElement>) => {
    update("telefone")(maskBrPhone(e.target.value));
  };

  const requiredFilled =
    form.nome.trim().length > 2 &&
    form.telefone.replace(/\D/g, "").length >= 10 &&
    form.uf &&
    form.cidade.trim().length >= 2 &&
    form.igreja.trim().length >= 2;

  const handleSubmit = () => {
    setTopError(null);
    const parsed = SignupSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const next: Partial<Record<keyof SignupInput, string>> = {};
      for (const [k, v] of Object.entries(fieldErrors)) {
        if (v && v[0]) next[k as keyof SignupInput] = v[0];
      }
      setErrors(next);
      return;
    }
    startTransition(async () => {
      const result = await submitCuidadorSignup(parsed.data);
      if (!result.ok) {
        setTopError(result.error);
        if (result.fieldErrors) {
          const next: Partial<Record<keyof SignupInput, string>> = {};
          for (const [k, v] of Object.entries(result.fieldErrors)) {
            if (v && v[0]) next[k as keyof SignupInput] = v[0];
          }
          setErrors(next);
        }
        return;
      }
      router.push("/analise");
    });
  };

  return (
    <div className="flex-1 overflow-y-auto px-[22px] flex flex-col">
      <div
        className="h-[168px] rounded-[18px] overflow-hidden mb-[22px] relative bg-surface-2"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(15,23,42,0) 50%, rgba(15,23,42,0.6) 100%), url('https://images.unsplash.com/photo-1521791136064-7986c2920216?w=900&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden="true"
      >
        <div
          className="absolute bottom-4 left-[18px] text-white text-[20px] font-bold tracking-tight2"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
        >
          Central de Acolhimento
        </div>
      </div>

      <h2 className="m-0 mb-2 text-[26px] font-extrabold tracking-tight4 leading-[1.1] text-text">
        Junte-se à equipe
      </h2>
      <p className="m-0 mb-6 text-[14.5px] leading-[1.55] tracking-tight2 text-text-2 text-pretty">
        Preencha os campos abaixo para solicitar seu acesso como cuidador e
        comece a impactar vidas.
      </p>

      <div className="flex flex-col gap-[18px] pb-6">
        <Input
          label="Nome Completo"
          value={form.nome}
          onChange={(e) => update("nome")(e.target.value)}
          placeholder="Ex: Maria Silva"
          icon={<IconUser />}
          autoComplete="name"
          error={errors.nome}
        />
        <Input
          label="Telefone (WhatsApp)"
          value={form.telefone}
          onChange={onChangePhone}
          placeholder="(00) 00000-0000"
          icon={<IconPhone />}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          error={errors.telefone}
          hint={
            errors.telefone
              ? undefined
              : "Vinculado à sua sessão. Trocar exige novo OTP."
          }
        />
        <div className="grid grid-cols-[110px_1fr] gap-3">
          <Select
            label="Estado"
            value={form.uf}
            onChange={(e) => update("uf")(e.target.value)}
            placeholder="UF"
            options={[...UFS]}
            error={errors.uf}
          />
          <Input
            label="Cidade"
            value={form.cidade}
            onChange={(e) => update("cidade")(e.target.value)}
            placeholder="Nome da cidade"
            error={errors.cidade}
          />
        </div>
        <Input
          label="Localidade da Igreja"
          value={form.igreja}
          onChange={(e) => update("igreja")(e.target.value)}
          placeholder="Ex: Central · Zona Sul"
          icon={<IconChurch />}
          error={errors.igreja}
          hint={
            errors.igreja
              ? undefined
              : "Como sua comunidade é chamada — o líder valida na aprovação."
          }
        />
        <Textarea
          label="Mini-biografia"
          value={form.bio ?? ""}
          onChange={(e) => update("bio")(e.target.value)}
          placeholder="Conte um pouco sobre sua experiência e por que deseja ser um cuidador..."
          rows={4}
          error={errors.bio}
        />

        {topError && (
          <p
            className="text-[13px] font-semibold text-status-urgente"
            role="alert"
          >
            {topError}
          </p>
        )}
      </div>

      <div className="-mx-[22px] mt-auto px-[22px] pt-4 pb-7 border-t border-border bg-surface sticky bottom-0">
        <Button
          variant="primary"
          full
          iconRight={<IconArrowRight />}
          disabled={!requiredFilled || isPending}
          loading={isPending}
          onClick={handleSubmit}
        >
          Solicitar Acesso
        </Button>
      </div>
    </div>
  );
}
