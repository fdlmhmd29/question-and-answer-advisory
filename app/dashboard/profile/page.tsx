import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard-header";
import { ProfileForm } from "@/components/profile-form";

export const metadata = {
  title: "Edit Profil - Advisory System",
  description: "Edit profil pengguna",
};

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = session.user;

  return (
    <div className="min-h-screen w-full bg-background">
      <DashboardHeader userName={user.name} userRole={user.role} />
      <ProfileForm userName={user.name} userEmail={user.email} userRole={user.role} />
    </div>
  );
}
