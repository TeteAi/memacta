import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required").optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Invalid input";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { email, name, password } = parsed.data;

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists. Please sign in." },
      { status: 409 }
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user with signup bonus credits
  const user = await prisma.user.create({
    data: {
      email,
      name: name || null,
      password: hashedPassword,
      credits: 3, // signup bonus
    },
  });

  // Log the signup bonus
  await prisma.creditTransaction.create({
    data: {
      userId: user.id,
      amount: 3,
      balance: 3,
      type: "signup",
      description: "Welcome bonus — 3 free credits",
    },
  });

  return NextResponse.json({
    success: true,
    message: "Account created successfully",
  });
}
