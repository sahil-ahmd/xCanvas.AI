import { openrouter } from "@/lib/openrouter";
import { inngest } from "../client";
import { z } from "zod";
import { FrameType } from "@/types/project";
import { generateObject } from "ai";
import { ANALYSIS_PROMPT } from "@/lib/prompt";
import prisma from "@/lib/prisma";

const AnalysisSchema = z.object({
  theme: z
    .string()
    .describe(
      "The specific visual theme ID (e.g., 'midnight', 'ocean-breeze', 'neo-brutalism')",
    ),
  screens: z
    .array(
      z.object({
        id: z
          .string()
          .describe(
            "Unique identifier for the screen (e.g., 'home-dashboard', 'profile-settings', 'transaction-history'). Use kebab-case.",
          ),
        name: z
          .string()
          .describe(
            "Shorty, descriptive name of the screen (e.g., 'Home Dashboard', 'Profile', 'Transaction History')",
          ),
        purpose: z
          .string()
          .describe(
            "One clear sentence explaining what this screen accomplishes for the user and its role in the app.",
          ),
        visualDescription: z
          .string()
          .describe(
            "A dense, high-fidelity visual directive (like an image generation prompt()). Describe the layout, specific data examples (e.g., 'Oct-Mar'), component hierarchy and physical attributes (e.g., 'Chunky cards', 'Floating header', 'Floating action button', 'Bottom navigation', Header with user avatar).",
          ),
      }),
    )
    .min(1)
    .max(4),
});

export const generateScreen = inngest.createFunction(
  { id: "generate-ui-screens" },
  { event: "ui/generate.screens" },
  async ({ event, step }) => {
    const {
      userId,
      projectId,
      prompt,

      frames,
      theme: existingTheme,
    } = event.data;
    const isRegeneration = frames.length > 0;

    // Analyze and Plan
    const analysis = await step.run("analyze-and-plan-screens", async () => {
      const contextHTML = frames
        .slice(0, 4)
        .map((frame: FrameType) => frame.htmlContent)
        .join("\n");

      const analysisPrompt = isRegeneration
        ? `
        USER REQUEST: ${prompt}
        SELECTED THEME: ${existingTheme}
        CONTEXT HTML: ${contextHTML}
        `.trim()
        : `
         USER REQUEST: ${prompt}
        `.trim();

      const { object } = await generateObject({
        model: openrouter.chat("google/gemini-2.5-flash-lite"),
        schema: AnalysisSchema,
        system: ANALYSIS_PROMPT,
        prompt: analysisPrompt,
      });

      const themeToUse = isRegeneration ? existingTheme : object.theme;

      if (!isRegeneration) {
        await prisma.project.update({
          where: {
            id: projectId,
            userId: userId,
          },
          data: {
            theme: themeToUse,
          }
        });
      }

      return { ...object, themeToUse };
    });

    // Actual generation of each screens
  },
);
