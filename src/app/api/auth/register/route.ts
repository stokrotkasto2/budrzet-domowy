import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

// Wykorzystujemy globalny klient prisma

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email i hasło są wymagane" },
        { status: 400 }
      );
    }

    if (password.length <= 6) {
      return NextResponse.json(
        { error: "Hasło musi mieć więcej niż 6 znaków" },
        { status: 400 }
      );
    }
    
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: "Hasło musi zawierać co najmniej 1 dużą literę" },
        { status: 400 }
      );
    }
    
    if (!/[^A-Za-z0-9]/.test(password)) {
      return NextResponse.json(
        { error: "Hasło musi zawierać co najmniej 1 znak specjalny" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Konto z tym adresem email już istnieje" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // Tworzymy od razu domyślny portfel
    await prisma.wallet.create({
      data: {
        name: "Glowny Portfel",
        userId: user.id,
      }
    });

    return NextResponse.json(
      { message: "Użytkownik został pomyślnie utworzony" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Błąd podczas rejestracji:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas rejestracji" },
      { status: 500 }
    );
  }
}
