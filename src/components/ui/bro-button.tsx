
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const broButtonVariants = cva(
  "btn-bro",
  {
    variants: {
      variant: {
        primary: "btn-primary",
        accent: "btn-accent", 
        glass: "btn-glass",
        ghost: "btn-ghost",
        outline: "btn-outline",
      },
      size: {
        default: "",
        sm: "btn-sm",
        lg: "btn-lg",
        xl: "btn-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface BroButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof broButtonVariants> {
  asChild?: boolean
}

const BroButton = React.forwardRef<HTMLButtonElement, BroButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(broButtonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)

BroButton.displayName = "BroButton"

export { BroButton, broButtonVariants }
export type { BroButtonProps }
