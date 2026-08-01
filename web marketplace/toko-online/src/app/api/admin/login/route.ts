import { NextRequest, NextResponse } from "next/server";
import { createAdminSession } from "@/lib/auth";

// Untuk kesederhanaan, kredensial admin disimpan di environment variable
// (ADMIN_EMAIL / ADMIN_PASSWORD), bukan tabel database dengan hash bcrypt.
// Untuk toko dengan banyak staf admin, ganti ini dengan tabel Admin + bcrypt.compare().
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const validEmail = process.env.ADMIN_EMAIL;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!validEmail || !validPassword) {
    return NextResponse.json(
      { error: "ADMIN_EMAIL / ADMIN_PASSWORD belum diset di server" },
      { status: 500 }
    );
  }

  if (email !== validEmail || password !== validPassword) {
    return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
  }

  createAdminSession(email);
  return NextResponse.json({ ok: true });
}
