
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-monark text-sm font-medium font-primary ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "monark-button-primary hover:gentle-glow",
        destructive:
          "bg-red-600 text-monark-ivory hover:bg-red-700 hover:gentle-glow",
        outline:
          "border-2 border-monark-copper/30 text-monark-copper bg-transparent hover:bg-monark-copper/10 hover:border-monark-copper hover:gentle-glow",
        secondary:
          "monark-button-secondary hover:gentle-glow",
        ghost: "hover:bg-monark-copper/10 hover:text-monark-copper",
        link: "text-monark-copper underline-offset-4 hover:underline hover:text-monark-copper/80",
      },
      size: {
        default: "h-10 px-6 py-3",
        sm: "h-9 rounded-lg px-4 py-2",
        lg: "h-12 rounded-monark-lg px-8 py-4",
        icon: "h-10 w-10",
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
