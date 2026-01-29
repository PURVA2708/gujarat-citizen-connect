import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const govButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md hover:shadow-lg active:scale-[0.98]",
        success:
          "bg-completed text-completed-foreground hover:bg-completed/90 shadow-md hover:shadow-lg active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg active:scale-[0.98]",
        outline:
          "border-2 border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground active:scale-[0.98]",
        ghost:
          "text-primary hover:bg-primary/10 active:scale-[0.98]",
        link:
          "text-primary underline-offset-4 hover:underline",
        hero:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg hover:shadow-xl text-base px-8 py-3 active:scale-[0.98]",
        "hero-outline":
          "border-2 border-secondary-foreground/80 bg-transparent text-secondary-foreground hover:bg-secondary-foreground/10 shadow-lg text-base px-8 py-3 active:scale-[0.98]",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface GovButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof govButtonVariants> {
  asChild?: boolean;
}

const GovButton = React.forwardRef<HTMLButtonElement, GovButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(govButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
GovButton.displayName = "GovButton";

export { GovButton, govButtonVariants };
