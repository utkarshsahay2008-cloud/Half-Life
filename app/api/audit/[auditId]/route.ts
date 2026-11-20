import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ auditId: string }> }
) {
  try {
    const { auditId } = await params;

    if (!auditId) {
      return NextResponse.json({ error: "Missing auditId parameter" }, { status: 400 });
    }

    // Try finding by id or by slug
    const audit = await prisma.auditReport.findFirst({
      where: {
        OR: [{ id: auditId }, { slug: auditId }],
      },
      include: {
        claims: {
          orderBy: { claimIndex: "asc" },
          include: {
            sources: true,
          },
        },
      },
    });

    if (!audit) {
      return NextResponse.json({ error: "Audit report not found" }, { status: 404 });
    }

    return NextResponse.json({ audit });
  } catch (err: any) {
    console.error("[GET /api/audit/[auditId]] Error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve audit report", details: err?.message },
      { status: 500 }
    );
  }
}
