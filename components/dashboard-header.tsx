"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";
import { LogOut, User, Settings } from "lucide-react";

interface DashboardHeaderProps {
  userName?: string;
  userRole?: "penanya" | "penjawab";
}

export function DashboardHeader({ userName, userRole }: DashboardHeaderProps) {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Advisory System</h1>
          {userRole && (
            <p className="text-sm text-muted-foreground">
              Dashboard {userRole === "penanya" ? "Penanya" : "Penjawab"}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {userName && (
            <>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span>{userName}</span>
              </div>
              <Link href="/dashboard/profile">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Profil
                </Button>
              </Link>
            </>
          )}
          <form action={logout}>
            <Button variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Keluar
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
