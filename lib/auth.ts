import { cookies } from "next/headers";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);

export type User = {
  id: number;
  email: string;
  name: string;
  role: "penanya" | "penjawab";
  created_at: Date;
};

export type Session = {
  id: number;
  user_id: number;
  session_token: string;
  expires_at: Date;
};

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate session token
function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

// Create session
export async function createSession(userId: number): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await sql`
    INSERT INTO sessions (user_id, session_token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
  `;

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return token;
}

// Get current session
export async function getSession(): Promise<{
  user: User;
  session: Session;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  const result = await sql`
    SELECT 
      s.id as session_id,
      s.user_id,
      s.expires_at,
      u.id,
      u.email,
      u.name,
      u.role,
      u.created_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.session_token = ${token} AND s.expires_at > NOW()
  `;

  if (result.length === 0) return null;

  const row = result[0];
  return {
    session: {
      id: row.session_id,
      user_id: row.user_id,
      session_token: token,
      expires_at: new Date(row.expires_at),
    },
    user: {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      created_at: new Date(row.created_at),
    },
  };
}

// Logout
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (token) {
    await sql`DELETE FROM sessions WHERE session_token = ${token}`;
    cookieStore.delete("session");
  }
}

// Register user
export async function registerUser(
  email: string,
  password: string,
  name: string,
  role: "penanya" | "penjawab"
): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    // Check if user exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return { success: false, error: "Email sudah terdaftar" };
    }

    const hashedPassword = await hashPassword(password);

    const result = await sql`
      INSERT INTO users (email, password_hash, name, role)
      VALUES (${email}, ${hashedPassword}, ${name}, ${role})
      RETURNING id, email, name, role, created_at
    `;

    const user = result[0] as User;
    return { success: true, user };
  } catch (error) {
    console.error("Register error:", error);
    return { success: false, error: "Terjadi kesalahan saat registrasi" };
  }
}

// Login user
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    const result = await sql`
      SELECT id, email, password_hash, name, role, created_at
      FROM users WHERE email = ${email}
    `;

    if (result.length === 0) {
      return { success: false, error: "Email atau password salah" };
    }

    const user = result[0];
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return { success: false, error: "Email atau password salah" };
    }

    await createSession(user.id);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: new Date(user.created_at),
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Terjadi kesalahan saat login" };
  }
}
