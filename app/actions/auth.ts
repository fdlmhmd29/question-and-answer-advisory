"use server";

import { redirect } from "next/navigation";
import { registerUser, loginUser, deleteSession } from "@/lib/auth";

export async function register(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as "penanya" | "penjawab";

  if (!email || !password || !name || !role) {
    return { error: "Semua field harus diisi" };
  }

  if (password.length < 6) {
    return { error: "Password minimal 6 karakter" };
  }

  const result = await registerUser(email, password, name, role);

  if (!result.success) {
    return { error: result.error };
  }

  // Auto login after register
  const loginResult = await loginUser(email, password);
  
  if (loginResult.success) {
    redirect(role === "penanya" ? "/dashboard/penanya" : "/dashboard/penjawab");
  }

  return { success: true };
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan password harus diisi" };
  }

  const result = await loginUser(email, password);

  if (!result.success) {
    return { error: result.error };
  }

  redirect(
    result.user?.role === "penanya" 
      ? "/dashboard/penanya" 
      : "/dashboard/penjawab"
  );
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

export async function updateProfile(formData: FormData) {
  const session = await getSession();

  if (!session) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validation
  if (!name || !email) {
    return { error: "Nama dan email harus diisi" };
  }

  let passwordData: { password?: string } = {};

  // Only update password if user wants to change it
  if (newPassword) {
    if (!currentPassword) {
      return { error: "Password saat ini harus diisi untuk mengubah password" };
    }

    if (newPassword !== confirmPassword) {
      return { error: "Password baru dan konfirmasi tidak sesuai" };
    }

    if (newPassword.length < 6) {
      return { error: "Password baru minimal 6 karakter" };
    }

    // Verify current password
    const { verifyPassword } = await import("@/lib/auth");
    const { sql } = await import("@/lib/db");

    const userRecord = await sql`
      SELECT password_hash FROM users WHERE id = ${session.user.id}
    `;

    const isValid = await verifyPassword(currentPassword, userRecord[0].password_hash);
    if (!isValid) {
      return { error: "Password saat ini tidak sesuai" };
    }

    passwordData.password = newPassword;
  }

  const { updateUserProfile: updateUser } = await import("@/lib/auth");
  const result = await updateUser(session.user.id, {
    name,
    email,
    ...passwordData,
  });

  if (!result.success) {
    return { error: result.error };
  }

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/dashboard/profile");
  return { success: true };
}
