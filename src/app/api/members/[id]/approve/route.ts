import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== "FOUNDER") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.role !== "MEMBER") {
    return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });
  }
  if (user.membershipStatus === "APPROVED") {
    return NextResponse.json({ message: "Membro já estava aprovado." });
  }

  await prisma.user.update({
    where: { id },
    data: { membershipStatus: "APPROVED" },
  });

  return NextResponse.json({ message: "Membro aprovado com sucesso." });
}
