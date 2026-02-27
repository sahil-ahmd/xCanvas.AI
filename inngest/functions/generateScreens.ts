import { openrouter } from "@/lib/openrouter";
import { inngest } from "../client";
import { z } from "zod";
import { FrameType } from "@/types/project";
import { generateObject, generateText, stepCountIs } from "ai";
import { ANALYSIS_PROMPT, GENERATION_SYSTEM_PROMPT } from "@/lib/prompt";
import prisma from "@/lib/prisma";
import { BASE_VARIABLES, THEME_LIST } from "@/lib/theme";
import { unsplashTool } from "../tool";

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

export const generateScreens = inngest.createFunction(
  { id: "generate-ui-screens" },
  { event: "ui/generate.screens" },
  async ({ event, step, publish }) => {
    const {
      userId,
      projectId,
      prompt,
      frames,
      theme: existingTheme,
    } = event.data;

    const CHANNEL = `user:${userId}`;
    const isExistingGeneration = Array.isArray(frames) && frames.length > 0;

    // Notify client that generation has started
    await publish({
      channel: CHANNEL,
      topic: "generation.start",
      data: { status: "running", projectId },
    });

    // Step 1: Analyze the prompt and plan screens
    const analysis = await step.run("analyze-and-plan-screens", async () => {
      // Notify client that analysis has started
      await publish({
        channel: CHANNEL,
        topic: "analysis.start",
        data: { status: "analyzing", projectId },
      });

      // For regeneration, pass existing HTML as context to the model
      const contextHTML = isExistingGeneration
        ? frames.slice(0, 4).map((frame: FrameType) => frame.htmlContent).join("\n")
        : "";

      // Build prompt based on whether this is a new or existing generation
      const analysisPrompt = isExistingGeneration
        ? `
          USER REQUEST: ${prompt}
          SELECTED THEME: ${existingTheme}
          CONTEXT HTML: ${contextHTML}
        `.trim()
        : `USER REQUEST: ${prompt}`.trim();

      // Use Gemini to analyze the prompt and return structured screen plan + theme
      const { object } = await generateObject({
        model: openrouter.chat("google/gemini-2.5-flash"),
        schema: AnalysisSchema,
        system: ANALYSIS_PROMPT,
        prompt: analysisPrompt,
      });

      // For new generations, use the AI-selected theme; for regenerations, keep existing
      const themeToUse = isExistingGeneration ? existingTheme : object.theme;

      // Persist the selected theme to the project on first generation
      if (!isExistingGeneration) {
        await prisma.project.update({
          where: { id: projectId, userId },
          data: { theme: themeToUse },
        });
      }

      // Notify client that analysis is complete with screen plan details
      await publish({
        channel: CHANNEL,
        topic: "analysis.complete",
        data: {
          status: "generating",
          theme: themeToUse,
          totalScreens: object.screens.length,
          screens: object.screens,
          projectId,
        },
      });

      return { ...object, themeToUse };
    });

    // Step 2: Generate HTML for each planned screen
    for (let i = 0; i < analysis.screens.length; i++) {
      const screenPlan = analysis.screens[i];
      const selectedTheme = THEME_LIST.find((t) => t.id === analysis.themeToUse);

      // Merge base CSS variables with the selected theme styles
      const fullThemeCSS = `
        ${BASE_VARIABLES}
        ${selectedTheme?.style || ""}
      `;

      await step.run(`generated-screen-${i}`, async () => {
        // Generate raw HTML for this screen using Gemini with Unsplash tool support
        const result = await generateText({
          model: openrouter.chat("google/gemini-2.5-flash"),
          system: GENERATION_SYSTEM_PROMPT,
          tools: {
            searchUnsplash: unsplashTool, // Allows model to fetch real images
          },
          stopWhen: stepCountIs(5), // Limit agentic tool call loops to 5 steps
          prompt: `...`.trim(),
        });

        // Extract and sanitize the HTML output from the model response
        let finalHtml = result.text ?? "";
        const match = finalHtml.match(/<div[\s\S]*<\/div>/);
        finalHtml = match ? match[0] : finalHtml;
        finalHtml = finalHtml.replace(/```/g, ""); // Strip any markdown code fences

        // Persist the generated screen as a Frame in the database
        const frame = await prisma.frame.create({
          data: { projectId, title: screenPlan.name, htmlContent: finalHtml },
        });

        // Notify client that a new frame is ready to render
        await publish({
          channel: CHANNEL,
          topic: "frame.created",
          data: { frame, screenId: screenPlan.id, projectId },
        });

        return { success: true, frame };
      });
    }

    // Notify client that all screens have been generated
    await publish({
      channel: CHANNEL,
      topic: "generation.completed",
      data: { status: "completed", projectId },
    });
  },
);
