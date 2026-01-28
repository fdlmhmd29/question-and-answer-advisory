import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Check if penjawab already exists
    const existing = await sql`
      SELECT id FROM users WHERE email = 'admin@advisory.com'
    `;

    if (existing.length > 0) {
      return NextResponse.json({ 
        message: "Akun penjawab sudah ada",
        email: "admin@advisory.com"
      });
    }

    // Create hashed password
    const passwordHash = await bcrypt.hash("admin123", 10);

    // Insert default penjawab account
    await sql`
      INSERT INTO users (email, password_hash, name, role)
      VALUES ('admin@advisory.com', ${passwordHash}, 'Admin Penjawab', 'penjawab')
    `;

    return NextResponse.json({ 
      message: "Akun penjawab berhasil dibuat",
      email: "admin@advisory.com",
      password: "admin123"
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Gagal membuat akun penjawab" }, { status: 500 });
  }
}
