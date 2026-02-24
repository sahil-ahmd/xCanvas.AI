import { generateProjectName } from "@/app/action/action";
import prisma from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) throw new Error("Unauthorized");
    if (!prompt) throw new Error("Missing Prompt");

    const userId = user.id;
    const projectName = await generateProjectName(prompt);
    const project = await prisma.project.create({
      data: {
        userId,
        name: projectName,
      },
    });

    // Trigger the inngest service

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.log("Error occured", error);
    return NextResponse.json(
      {
        error: "Failed to create project",
      },
      { status: 500 },
    );
  }
}
