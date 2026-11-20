import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { ClaimModalContent } from "@/components/ClaimModalContent";

export default async function StandaloneClaimPage({
  params,
}: {
  params: Promise<{ auditId: string; claimId: string }>;
}) {
  const { auditId, claimId } = await params;

  const claim = await prisma.claim.findFirst({
    where: {
      id: claimId,
    },
    include: {
      sources: true,
      audit: true,
    },
  });

  if (!claim) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-800">Claim Evidence Record Not Found</h1>
          <p className="mt-2 text-sm text-slate-500">
            Could not retrieve forensic evidence for claim ID: {claimId}
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Lab Workspace</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Navigation Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-100 transition backdrop-blur-md"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to HALF-LIFE Workspace</span>
        </Link>

        <span className="font-mono text-xs text-slate-500">
          Audit: {claim.audit?.title || auditId}
        </span>
      </div>

      {/* Standalone Forensic Card */}
      <div className="rounded-3xl border border-white/90 bg-white/85 p-6 sm:p-10 shadow-lg backdrop-blur-2xl ring-1 ring-black/5">
        <ClaimModalContent claim={claim} isStandalonePage={true} />
      </div>
    </div>
  );
}
