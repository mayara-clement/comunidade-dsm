import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  status: z.enum(["ACCEPTED", "DECLINED"]),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const row = await prisma.serviceRequest.findUnique({ where: { id } });
  if (!row) {
    return NextResponse.json({ error: "Solicitação não encontrada." }, { status: 404 });
  }
  if (row.providerId !== session.user.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }
  if (row.status !== "PENDING") {
    return NextResponse.json({ error: "Esta solicitação já foi respondida." }, { status: 400 });
  }

  let status: "ACCEPTED" | "DECLINED";
  try {
    const json = await req.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Status inválido." }, { status: 400 });
    }
    status = parsed.data.status;
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const updated = await prisma.serviceRequest.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ request: updated });
}
