import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().min(10).max(4000),
  priceLabel: z.string().trim().max(80).optional().nullable(),
});

export async function GET(req: Request) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const mine = searchParams.get("mine") === "1";
  const marketplace = searchParams.get("marketplace") === "1";

  if (mine) {
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    const list = await prisma.service.findMany({
      where: { providerId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ services: list });
  }

  if (marketplace) {
    const list = await prisma.service.findMany({
      where: {
        active: true,
        ...(session?.user?.id ? { providerId: { not: session.user.id } } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        provider: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    return NextResponse.json({ services: list });
  }

  return NextResponse.json(
    { error: "Use ?mine=1 ou ?marketplace=1." },
    { status: 400 },
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const canUseServices =
    session.user.membershipStatus === "APPROVED" &&
    (session.user.role === "MEMBER" || session.user.role === "FOUNDER");
  if (!canUseServices) {
    return NextResponse.json({ error: "Você não pode publicar serviços no momento." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 },
      );
    }
    const { title, description, priceLabel } = parsed.data;
    const service = await prisma.service.create({
      data: {
        title,
        description,
        priceLabel: priceLabel ?? null,
        providerId: session.user.id,
      },
    });
    return NextResponse.json({ service });
  } catch {
    return NextResponse.json({ error: "Não foi possível criar o serviço." }, { status: 500 });
  }
}
