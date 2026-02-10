import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { HomeEntry } from "@/components/home-entry";

export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect(session.user.role === "penanya" ? "/dashboard/penanya" : "/dashboard/penjawab");
  }

  return <HomeEntry />;
}
