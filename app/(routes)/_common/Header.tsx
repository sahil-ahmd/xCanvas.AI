"use client";

import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { LogOutIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

function Header() {
  const { theme, setTheme } = useTheme();
  const { user } = useKindeBrowserClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? theme === "dark" : false;

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
                  isDark ? "scale-100" : "scale-0",
                )}
              />
              <MoonIcon
                className={cn(
                  "absolute h-5 w-5 transition",
                  isDark ? "scale-0" : "scale-100",
                )}
              />
            </Button>

            {/** show user if login or login button */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="cursor-pointer">
                  <Avatar className="h-8 w-8 shrink-0 rounded-full">
                    <AvatarImage
                      src={user?.picture || ""}
                      alt={user?.given_name || ""}
                    />
                    <AvatarFallback className="rounded-lg">
                      {user?.given_name?.charAt(0)}
                      {user?.family_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogoutLink className="w-full flex items-center gap-2">
                      <LogOutIcon className="size-4" />
                      Logout
                    </LogoutLink>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <LoginLink>
                <Button>Log in</Button>
              </LoginLink>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}

export default Header;
