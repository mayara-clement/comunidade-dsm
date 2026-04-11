import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { uniqueCommunitySlug } from "@/lib/slug";

const registerSchema = z.object({
  token: z.string().min(8),
  email: z.string().trim().min(1).max(255),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres").max(128),
  name: z.string().trim().max(120).optional(),
  communityName: z.string().trim().min(2).max(120).optional(),
});

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = registerSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 },
      );
    }

    const { token, email, password, name, communityName } = parsed.data;
    const emailNorm = email.toLowerCase();
    if (!isValidEmail(emailNorm)) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }

    const invite = await prisma.inviteToken.findUnique({
      where: { token: token.trim() },
    });

    if (!invite) {
      return NextResponse.json({ error: "Convite inválido." }, { status: 400 });
    }
    if (invite.usedAt || invite.usedById) {
      return NextResponse.json({ error: "Este convite já foi utilizado." }, { status: 400 });
    }
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return NextResponse.json({ error: "Este convite expirou." }, { status: 400 });
    }

    if (invite.kind === "NEW_COMMUNITY_OWNER") {
      if (!communityName?.trim()) {
        return NextResponse.json(
          { error: "Informe o nome da nova comunidade." },
          { status: 400 },
        );
      }
    }

    if (invite.kind === "COMMUNITY_MEMBER") {
      if (!invite.communityId) {
        return NextResponse.json({ error: "Convite de membro inválido." }, { status: 400 });
      }
      const comm = await prisma.community.findUnique({
        where: { id: invite.communityId },
      });
      if (!comm || comm.status !== "ACTIVE") {
        return NextResponse.json(
          { error: "Esta comunidade não está ativa para novos membros." },
          { status: 400 },
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    try {
      await prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: {
            email: emailNorm,
            passwordHash,
            name: name || null,
            isPlatformFounder: false,
          },
        });

        if (invite.kind === "NEW_COMMUNITY_OWNER") {
          const slug = uniqueCommunitySlug(communityName!.trim());
          await tx.community.create({
            data: {
              name: communityName!.trim(),
              slug,
              status: "PENDING_APPROVAL",
              ownerId: created.id,
            },
          });
        } else {
          await tx.communityMembership.create({
            data: {
              communityId: invite.communityId!,
              userId: created.id,
              status: "PENDING",
            },
          });
        }

        await tx.inviteToken.update({
          where: { id: invite.id },
          data: {
            usedAt: new Date(),
            usedById: created.id,
          },
        });
      });
    } catch (e: unknown) {
      const code =
        typeof e === "object" && e !== null && "code" in e
          ? (e as { code?: string }).code
          : undefined;
      if (code === "P2002") {
        return NextResponse.json(
          { error: "Este email já está cadastrado." },
          { status: 409 },
        );
      }
      throw e;
    }

    const message =
      invite.kind === "NEW_COMMUNITY_OWNER"
        ? "Conta criada. Sua comunidade aguarda aprovação do fundador da plataforma para você poder acessar o painel."
        : "Conta criada. Aguarde a aprovação do administrador da comunidade para acessar.";

    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ error: "Não foi possível concluir o cadastro." }, { status: 500 });
  }
}
