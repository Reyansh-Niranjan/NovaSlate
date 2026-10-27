import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).filter(Boolean).join(" ").trim();
  if (React.isValidElement(node) && (node.props as any)?.children) {
    return extractText((node.props as any).children);
  }
  return "";
}

const buttonVariants = cva(
  "btn-main",
  {
    variants: {
      variant: {
        default: "btn-main--primary btn-main--black",
        primary: "btn-main--primary btn-main--black",
        secondary: "btn-main--secondary btn-main--black",
        outline: "btn-main--secondary btn-main--black",
        ghost: "btn-main--secondary btn-main--black",
        white: "btn-main--primary btn-main--white",
        accent: "btn-main--primary btn-main--accent",
        destructive: "btn-main--primary btn-main--accent",
        link: "btn-main--secondary btn-main--black",
      },
      size: {
        default: "btn-main--md",
        md: "btn-main--md",
        sm: "btn-main--sm",
        lg: "btn-main--lg",
        xs: "btn-main--xs",
        icon: "btn-main--icon",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  dataText?: string;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", children, dataText, type = "button", ...props }, ref) => {
    const text = dataText || extractText(children);

    return (
      <button
        ref={ref}
        type={type}
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        <span className="btn-main__outer">
          <span className="btn-main__inner">
            <span className="btn-main__text u-height-fix">{children}</span>
          </span>
          <span className="btn-main__hover" aria-hidden="true">
            <span className="btn-main__text u-height-fix" data-text={text}></span>
          </span>
        </span>
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
