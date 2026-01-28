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
