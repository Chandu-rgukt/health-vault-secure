import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { PanelLeft } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

const SidebarContext = React.createContext(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}

const SidebarProvider = React.forwardRef(function SidebarProvider(
  { defaultOpen = true, open: openProp, onOpenChange, className, children, style, ...props },
  ref
) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [_open, _setOpen] = React.useState(defaultOpen);

  const open = openProp ?? _open;

  const setOpen = React.useCallback(
    (value) => {
      const next = typeof value === "function" ? value(open) : value;
      onOpenChange ? onOpenChange(next) : _setOpen(next);
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [open, onOpenChange]
  );

  const toggleSidebar = React.useCallback(() => {
    isMobile ? setOpenMobile((o) => !o) : setOpen((o) => !o);
  }, [isMobile, setOpen]);

  React.useEffect(() => {
    const handler = (e) => {
      if (e.key === SIDEBAR_KEYBOARD_SHORTCUT && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleSidebar]);

  const state = open ? "expanded" : "collapsed";

  const value = React.useMemo(
    () => ({
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
      state,
    }),
    [open, isMobile, openMobile, toggleSidebar, state]
  );

  return (
    <SidebarContext.Provider value={value}>
      <TooltipProvider delayDuration={0}>
        <div
          ref={ref}
          className={cn("group/sidebar-wrapper flex min-h-screen w-full", className)}
          style={{
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            ...style,
          }}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
});

const Sidebar = React.forwardRef(function Sidebar(
  { side = "left", collapsible = "offcanvas", className, children, ...props },
  ref
) {
  const { isMobile, openMobile, setOpenMobile, state } = useSidebar();

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side={side}
          className="w-[--sidebar-width] bg-sidebar p-0"
          style={{ "--sidebar-width": SIDEBAR_WIDTH_MOBILE }}
        >
          {children}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      ref={ref}
      data-state={state}
      className={cn(
        "hidden md:flex h-screen bg-sidebar text-sidebar-foreground",
        collapsible === "icon" && "w-[--sidebar-width-icon]",
        collapsible !== "icon" && "w-[--sidebar-width]",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
});

const SidebarTrigger = React.forwardRef(function SidebarTrigger(
  { className, ...props },
  ref
) {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={toggleSidebar}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
});

const SidebarContent = ({ className, ...props }) => (
  <div className={cn("flex flex-1 flex-col overflow-auto", className)} {...props} />
);

const SidebarHeader = ({ className, ...props }) => (
  <div className={cn("p-2", className)} {...props} />
);

const SidebarFooter = ({ className, ...props }) => (
  <div className={cn("p-2 mt-auto", className)} {...props} />
);

const SidebarSeparator = React.forwardRef(function SidebarSeparator(props, ref) {
  return <Separator ref={ref} {...props} />;
});

const SidebarMenu = ({ className, ...props }) => (
  <ul className={cn("flex flex-col gap-1", className)} {...props} />
);

const sidebarMenuButtonVariants = cva(
  "flex w-full items-center gap-2 rounded-md p-2 text-sm hover:bg-sidebar-accent",
  {
    variants: {
      size: {
        default: "h-8",
        sm: "h-7 text-xs",
        lg: "h-12",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const SidebarMenuButton = React.forwardRef(function SidebarMenuButton(
  { asChild = false, size, className, ...props },
  ref
) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      className={cn(sidebarMenuButtonVariants({ size }), className)}
      {...props}
    />
  );
});

const SidebarMenuSkeleton = ({ showIcon }) => (
  <div className="flex h-8 items-center gap-2 px-2">
    {showIcon && <Skeleton className="h-4 w-4" />}
    <Skeleton className="h-4 flex-1" />
  </div>
);

export {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuSkeleton,
  useSidebar,
};
