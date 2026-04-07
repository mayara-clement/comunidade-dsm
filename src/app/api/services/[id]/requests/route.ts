import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  message: z.string().trim().max(2000).optional().nullable(),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const canRequest =
    session.user.membershipStatus === "APPROVED" &&
    (session.user.role === "MEMBER" || session.user.role === "FOUNDER");
  if (!canRequest) {
    return NextResponse.json({ error: "Você não pode solicitar serviços no momento." }, { status: 403 });
  }

  const { id: serviceId } = await params;
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) {
    return NextResponse.json({ error: "Serviço não encontrado." }, { status: 404 });
  }
  if (service.providerId === session.user.id) {
    return NextResponse.json({ error: "Você não pode contratar o próprio serviço." }, { status: 400 });
  }

  let message: string | null = null;
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }
    message = parsed.data.message ?? null;
  } catch {
    message = null;
  }

  const existing = await prisma.serviceRequest.findFirst({
    where: {
      serviceId,
      requesterId: session.user.id,
      status: "PENDING",
    },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Você já possui uma solicitação pendente para este serviço." },
      { status: 409 },
    );
  }

  const request = await prisma.serviceRequest.create({
    data: {
      serviceId,
      requesterId: session.user.id,
      providerId: service.providerId,
      message,
    },
  });

  return NextResponse.json({ request });
}
