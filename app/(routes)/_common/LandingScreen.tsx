"use client";

import { useState } from "react";
import PromptInput from "@/components/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import Header from "./Header";

function LandingScreen() {
  const [promptText, setPromptText] = useState<string>("");

  const suggestions = [
    {
      label: "Finance Tracker",
      icon: "💰", // You can use an Emoji, a Lucide icon component, or an SVG path
      value: `Finance app statistics screen. Current balance at top with dollar amount, 
              bar chart showing spending over months (Oct-Mar) with month selector 
              pills below, transaction list with app icons and color-coded amounts.`,
    },
    {
      label: "SaaS Analytics",
      icon: "📈",
      value: `SaaS dashboard layout. Large KPI cards at the top for MRR, Churn, and ARPU. 
              Central multi-line chart showing growth vs target. Right sidebar with 
              'Recent Events' feed and user geographic heatmap at the bottom.`,
    },
    {
      label: "Health Monitor",
      icon: "❤️",
      value: `Fitness tracking interface. Circular progress rings for daily steps and 
              calories. Area chart for resting heart rate over 24 hours. Grid of 
              mini-charts for sleep cycles (REM, Light, Deep) with sleep score at center.`,
    },
    {
      label: "Crypto Portfolio",
      icon: "🪙",
      value: `Dark mode crypto wallet. Candlestick chart for BTC/USD price action. 
              Horizontal bar chart for asset allocation (BTC, ETH, SOL). Live ticker 
              tape at the bottom with percentage change indicators in green and red.`,
    },
  ];

  const handleSuggestionClick = (val: string) => {
    setPromptText(val);
  };

  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col">
        <Header />
        <div className="relative overflow-hidden pt-28">
          <div className="mx-auto max-w-6xl flex flex-col items-center justify-center">
            <div className="space-y-3 mb-8">
              <h1 className="text-center font-semibold text-4xl tracking-tight sm:text-5xl">
                Design mobile apps <br className="md:hidden" />
                <span className="text-primary">in minutes</span>
              </h1>
              <p className="mx-auto max-w-2xl text-center font-medium text-foreground/80 leading-relaxed sm:text-lg">
                Go from idea to beautiful app mockups in minutes by giving
                prompt to AI
              </p>
            </div>

            <div className="flex flex-col w-full max-w-3xl items-center gap-8 relative z-50">
              <div className="w-full">
                <PromptInput
                  className="ring-2 ring-primary rounded-3xl"
                  promptText={promptText}
                  setPromptText={setPromptText}
                  isLoading={false}
                  onSubmit={() => {}}
                />
              </div>

              {/** Static Suggestions */}
              <div className="flex flex-wrap justify-center gap-2 px-5">
                <Suggestions>
                  {suggestions.map((s) => (
                    <Suggestion
                      key={s.label}
                      suggestion={s.label}
                      className="text-xs! h-7! px-2.5 pt-1!"
                      onClick={() => handleSuggestionClick(s.value)}
                    >
                      {s.icon}
                      <span>{s.label}</span>
                    </Suggestion>
                  ))}
                </Suggestions>
              </div>
            </div>

            {/** Radical Design UI */}
            <div className="absolute -translate-x-1/2 left-1/2 w-[5000px] h-[3000px] top-[80%] -z-10">
              <div className="-translate-x-1/2 absolute bottom-[calc(100%-300px)] left-1/2 h-[2000px] w-[2000px] opacity-20 bg-radial-primary"></div>
              <div className="absolute -mt-2.5 size-full rounded-[50%] bg-primary/20 opacity-70 [box-shadow:0_-15px_24.8px_var(--primary)]"></div>
              <div className="absolute z-0 size-full rounded-[50%] bg-background"></div>
            </div>
          </div>
        </div>

        {/** Recent Projects */}
        <div className="w-full py-10">
          <div className="mx-auto max-w-3xl">
            <div>
              <h1 className="font-medium text-xl tracking-tight">
                Recent Projects
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingScreen;
