import { prisma } from "@/lib/prisma";
import { ModalDialog } from "@/components/ModalDialog";
import { ClaimModalContent } from "@/components/ClaimModalContent";

export default async function InterceptedClaimModal({
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
    },
  });

  if (!claim) {
    return (
      <ModalDialog>
        <div className="p-8 text-center">
          <h2 className="text-lg font-bold text-slate-800">Claim Evidence Not Found</h2>
          <p className="mt-2 text-xs text-slate-500">
            The requested claim ID ({claimId}) could not be located in the database.
          </p>
        </div>
      </ModalDialog>
    );
  }

  return (
    <ModalDialog>
      <ClaimModalContent claim={claim} />
    </ModalDialog>
  );
}
