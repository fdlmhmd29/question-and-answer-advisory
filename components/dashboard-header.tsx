"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";
import { LogOut, User, Settings, Menu, X } from "lucide-react";
import { useState } from "react";

interface DashboardHeaderProps {
  userName?: string;
  userRole?: "penanya" | "penjawab";
}

export function DashboardHeader({ userName, userRole }: DashboardHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b bg-card sticky top-0 z-40">
      <div className="w-full px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-xl font-bold truncate">Advisory System</h1>
            {userRole && (
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                Dashboard {userRole === "penanya" ? "Penanya" : "Penjawab"}
              </p>
            )}
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            {userName && (
              <>
                <div className="flex items-center gap-1.5 lg:gap-2 text-xs sm:text-sm">
                  <User className="h-3.5 w-3.5 lg:h-4 lg:w-4 flex-shrink-0" />
                  <span className="truncate">{userName}</span>
                </div>
                <Link href="/dashboard/profile">
                  <Button variant="outline" size="sm" className="text-xs lg:text-sm">
                    <Settings className="h-3.5 w-3.5 mr-1.5 lg:mr-2" />
                    <span className="hidden sm:inline">Profil</span>
                  </Button>
                </Link>
              </>
            )}
            <form action={logout}>
              <Button variant="outline" size="sm" className="text-xs lg:text-sm">
                <LogOut className="h-3.5 w-3.5 mr-1.5 lg:mr-2" />
                <span className="hidden sm:inline">Keluar</span>
              </Button>
            </form>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-1.5 hover:bg-accent rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t space-y-2 animate-slide-in-up">
            {userName && (
              <>
                <div className="flex items-center gap-2 text-sm px-2 py-2 text-muted-foreground">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{userName}</span>
                </div>
                <Link href="/dashboard/profile" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profil
                  </Button>
                </Link>
              </>
            )}
            <form action={logout}>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </Button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
