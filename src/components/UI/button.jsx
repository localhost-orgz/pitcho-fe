import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive uppercase tracking-wide",
  {
    variants: {
      variant: {
        default:
          "bg-white text-black border-slate-200 border-2 border-b-[5px] active:border-b-2 hover:bg-slate-100 text-slate-500",
        primary:
          "bg-sky-400 text-primary-foreground hover:bg-sky-400/90 border-sky-500 border-b-[5px] active:border-b-0",
        primaryOutline: "bg-white text-sky-500 hover:bg-slate-100",
        secondary:
          "bg-green-500 text-primary-foreground hover:bg-green-500/90 border-green-600 border-b-[5px] active:border-b-0",
        secondaryOutline: "bg-white text-green-500 hover:bg-slate-100",
        danger:
          "bg-rose-500 text-primary-foreground hover:bg-rose-500/90 border-rose-600 cborder-b-[5px] active:border-b-0",
        dangerOutline:
          "bg-white text-rose-500 hover:bg-slate-100 cursor-pointer",
        sidebar:
          "bg-transparent text-slate-500 border-2 border-transparent hover:bg-slate-100 transition-none cursor-pointer",
        sidebarOutline:
          "bg-sky-500/15 text-sky-500 border-sky-300 border-[1.5px] hover:bg-sky-500/20 transition-none",
        lessonOpen:
          "absolute bg-sky-400 shadow-[0_10px_0_#0084d1] active:shadow-[0_2px_0_#0084d1] active:translate-y-1 transition-all duration-100 flex items-center justify-center transform-[perspective(500px)_rotateX(30deg)] origin-bottom",
        lessonLocked:
          "absolute bg-[#e5e5e5] shadow-[0_10px_0_#b7b7b7] active:shadow-[0_2px_0_#b7b7b7] active:translate-y-1 transition-all duration-100 flex items-center justify-center transform-[perspective(500px)_rotateX(30deg)] origin-bottom",
        uploadButton:
          "absolute right-0 bottom-0 border-2 rounded-full bg-white cursor-pointer",
        adminAddNew:
          "capitalize text-primary-foreground font-semibold text-sm bg-green-500",
        editProfile:
          "bg-yellow-400 text-primary-foreground hover:bg-yellow-400/90 border-yellow-500 border-b-[5px] active:border-b-0 cursor-pointer",
        search: "text-primary-foreground font-semibold text-sm bg-green-500 ",
        edit: "text-primary-foreground font-semibold text-sm bg-yellow-500 rounded-md",
        delete:
          "bg-rose-500 text-primary-foreground hover:bg-rose-500/90 border-rose-600 border-b-[5px] active:border-b-0",
        option:
          "bg-white hover:bg-gray-100/80 border-2 text-gray-800 cursor-pointer border-b-[5px] active:border-b-0 normal-case",
        optionTrue:
          "bg-lime-200 border-lime-400 border-2 text-gray-800 border-b-[5px] active:border-b-0 normal-case cursor-pointer",
        optionFalse:
          "bg-rose-200 border-rose-400 border-2 text-gray-800 border-b-[5px] active:border-b-0 normal-case cursor-pointer",
        nextLocked: "cursor-not-allowed bg-gray-400 text-gray-700",
        skip: "bg-rose-500 text-primary-foreground hover:bg-rose-500/90 border-rose-700 border-b-[5px] active:border-b-0",
        haveAcc:
          "bg-transparent text-slate-500 border-2 border-transparent cursor-pointer whitespace-nowrap",
      },
      size: {
        default: "h-11 px-4 py-2 has-[>svg]:px-3",
        optionButton: "min-h-13 px-4 py-2 has-[>svg]:px-3",
        sm: "h-9 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 px-8 has-[>svg]:px-4",
        rounded: "w-20 h-20 rounded-full",
        search: "h-10 w-10 p-10",
        action: "h-8 w-8",
        uploadButton: "p-2",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
