import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db/prisma";

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await prisma.users.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    // Check if username already exists
    const existingUsername = await prisma.users.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        username,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        elo_rating: 1200,
        coins: 0,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Account created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
