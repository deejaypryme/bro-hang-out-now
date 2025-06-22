
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "btn-bro",
  {
    variants: {
      variant: {
        default: "btn-accent", // Orange is now the default primary CTA
        primary: "btn-accent", // Orange as primary brand color
        accent: "btn-accent", // Orange gradient
        secondary: "btn-primary", // Navy as secondary
        glass: "btn-glass",
        ghost: "btn-ghost",
        outline: "btn-outline",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "",
        sm: "btn-sm",
        lg: "btn-lg", 
        xl: "btn-xl",
        icon: "h-10 w-10 min-h-[40px] p-0",
      },
    },
    defaultVariants: {
      variant: "default", // Now defaults to orange accent
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
