import type { SVGProps, ReactNode } from "react";

/**
 * Props compartilhadas por todos os ícones do design system.
 * Mantém compat com `app/icons.jsx` (size, sw, color).
 */
export interface IconBaseProps
  extends Omit<SVGProps<SVGSVGElement>, "color" | "fill" | "stroke"> {
  size?: number;
  sw?: number;
  color?: string;
  fill?: string;
}

interface InternalIconProps extends IconBaseProps {
  children: ReactNode;
}

export function IconSvg({
  size = 22,
  sw = 1.8,
  color = "currentColor",
  fill = "none",
  children,
  ...rest
}: InternalIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}
