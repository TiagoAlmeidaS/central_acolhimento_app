import type { IconBaseProps } from "./base";

/**
 * Ícones com fill sólido (não usam o IconSvg de stroke).
 * Mantêm a mesma API básica (size + color), `sw` é ignorado.
 */

export function IconWhatsappFilled({
  size = 22,
  color = "currentColor",
  ...rest
}: IconBaseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill={color}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d="M16 3C8.8 3 3 8.8 3 16c0 2.3.6 4.4 1.6 6.3L3 29l6.9-1.6c1.8 1 3.9 1.5 6.1 1.5 7.2 0 13-5.8 13-13S23.2 3 16 3zm7.5 18.2c-.3.9-1.8 1.7-2.5 1.8-.6.1-1.5.1-2.4-.2-.5-.2-1.3-.4-2.2-.8-3.8-1.6-6.3-5.5-6.5-5.7-.2-.2-1.6-2.1-1.6-4 0-1.9 1-2.9 1.4-3.3.4-.4.8-.5 1.1-.5h.8c.3 0 .6 0 .9.7.3.8 1.1 2.7 1.2 2.9.1.2.2.4 0 .7-.1.3-.2.4-.4.7-.2.2-.4.5-.6.7-.2.2-.4.4-.2.8.2.4.9 1.6 2 2.5 1.4 1.2 2.6 1.6 3 1.8.4.2.6.1.8-.1.2-.2.9-1.1 1.2-1.5.2-.4.5-.3.8-.2.3.1 2.1 1 2.5 1.2.4.2.6.3.7.4.1.4.1.9-.2 1.8z" />
    </svg>
  );
}

export function IconUsersFilled({
  size = 22,
  color = "currentColor",
  ...rest
}: IconBaseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <circle cx="9" cy="9" r="3.5" />
      <ellipse cx="9" cy="18" rx="6" ry="3.5" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M17 14c2.5 0 4.5 1.3 4.5 3v2H15v-2c0-1.7 0-3 2-3z" />
    </svg>
  );
}

/**
 * Selo de verificação — usa duas cores fixas (verde + branco) por padrão,
 * permite override do `color` para o fundo.
 */
export function IconVerified({
  size = 16,
  color = "#22C55E",
  ...rest
}: IconBaseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path
        d="M12 1.5l2.4 2 3.2-.2.7 3 2.7 1.6-.9 3 1.6 2.8-2 2.5.1 3.2-3 1-1.6 2.7-3.2-.9-2.8 1.6-2.5-2-3.2.1-1-3-2.7-1.6.9-3-1.6-2.8 2-2.5L1 6.7l3-1L5.7 3l3.2.9L11.7 2.3z"
        fill={color}
      />
      <path
        d="M8 12.5l2.5 2.5L16 9.5"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
