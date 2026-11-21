import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { InteractiveAuditWorkspace } from "@/components/InteractiveAuditWorkspace";

export default async function AuditPermalinkPage({
  params,
}: {
  params: Promise<{ auditId: string }>;
}) {
  const { auditId } = await params;

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
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Audit Report Not Found</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Could not find audit report record for: {auditId}
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 dark:hover:bg-rose-500 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Lab Workspace</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Format date fields as ISO strings for client component serialization
  const serializedAudit = {
    ...audit,
    createdAt: audit.createdAt.toISOString(),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition backdrop-blur-md"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>All Audits & Specimens</span>
        </Link>
      </div>

      <InteractiveAuditWorkspace initialAudit={serializedAudit as any} />
    </div>
  );
}
