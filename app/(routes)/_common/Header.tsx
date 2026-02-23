"use client";

import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

function Header() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="sticky top-0 right-0 left-0 z-30">
      <header className="h-16 border-b border-dashed bg-background py-4">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
          <Logo />
          <div className="flex flex-1 items-center justify-end gap-3">
            <Button
              variant="outline"
              size="icon"
              className="relative rounded-md h-8 w-8"
              onClick={() => setTheme(isDark ? "light" : "dark")}
            >
              <SunIcon
                className={cn(
                  "absolute h-5 w-5 transition",
                  isDark ? "scale-100" : "scale-0"
                )}
              />
              <MoonIcon
                className={cn(
                  "absolute h-5 w-5 transition",
                  isDark ? "scale-0" : "scale-100"
                )}
              />
            </Button>
            <Button>Log in</Button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Header;
