"use client";

import { useCanvas } from "@/context/canvas-provider";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { ChevronDown, Palette, Wand2 } from "lucide-react";
import { useState } from "react";
import PromptInput from "./prompt-input";
import { cn } from "@/lib/utils";
import { parseThemeColors } from "@/lib/theme";
import ThemeSelector from "./theme-selector";

const CanvasFloatingToolbar = () => {
  const { themes, theme: currentTheme, setTheme } = useCanvas();
  const [promptText, setPromptText] = useState<string>("");

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2">
      <div className="w-full max-w-2xl bg-background dark:bg-neutral-950 rounded-full shadow-xl border">
        <div className="flex flex-row items-center gap-2 px-3">
          <Popover>
            <PopoverTrigger>
              <Button
                size="icon-sm"
                className="px-4 bg-linear-to-r from bg-purple-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-purple-200/50 cursor-pointer"
              >
                <Wand2 className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-2! rounded-xl! shadow-lg border mt-1">
              <PromptInput
                promptText={promptText}
                setPromptText={setPromptText}
                className="min-h-[150px] ring-1! ring-purple-500! rounded-xl! shadow-none border-muted"
                hideSubmitBtn={true}
              />
              <Button className="mt-2 w-full bg-linear-to-r from bg-purple-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-purple-200/50 cursor-pointe">
                Design
              </Button>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger>
              <div className="flex items-center gap-2 px-3 py-2">
                <Palette className="size-4" />
                <div className="flex gap-1.5">
                  {themes?.slice(0, 4)?.map((theme, index) => {
                    const colors = parseThemeColors(theme.style);

                    return (
                      <div
                        role="button"
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setTheme(theme.id);
                        }}
                        className={cn(
                          `w-6.5 h-6.5 rounded-full cursor-pointer`,
                          currentTheme?.id === theme.id &&
                            "ring-1 ring-offset-1",
                        )}
                        style={{
                          background: `linear-gradient(135deg, ${colors?.primary}, ${colors?.accent})`,
                        }}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  +{themes?.length - 4} more
                  <ChevronDown className="size-4" />
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="px-2 rounded-xl shadow border">
              <ThemeSelector />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default CanvasFloatingToolbar;
