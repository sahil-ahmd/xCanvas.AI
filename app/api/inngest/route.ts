import { inngest } from "@/inngest/client";
import { generateScreens } from "@/inngest/functions/generateScreens";
import { helloWorld } from "@/inngest/functions/helloWorld";
import { serve } from "inngest/next";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
    helloWorld,
    generateScreens,
  ],
});
