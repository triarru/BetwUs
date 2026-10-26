import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user?.spaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const media = await prisma.media.findFirst({
    where: { id, spaceId: user.spaceId },
  });
  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const filePath = path.join(process.cwd(), "data", "uploads", media.fileName);
    const bytes = await readFile(filePath);
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": media.mimeType,
        "Cache-Control": "private, max-age=3600",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch {
    return NextResponse.json({ error: "Missing file" }, { status: 404 });
  }
}
