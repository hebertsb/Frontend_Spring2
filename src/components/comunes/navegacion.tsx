"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { LoadingLink } from "../EfectoCarga/vista-cargando";
import { usePathname } from "next/navigation"; // 👈 importamos el hook
import useAuth from "@/hooks/useAuth";
import { NavUser } from "@/components/nav-user";

export function Navegacion() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const pathname = usePathname();
  const auth = useAuth(); // Mover el hook fuera del callback

  // 👇 cuando cambie la ruta, cerramos el menú
  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-black text-lg">
                B
              </span>
            </div>
            <span className="font-heading font-black text-xl text-foreground">
              Descubre Bolivia
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <LoadingLink href="/">Inicio</LoadingLink>
            <LoadingLink href="/destinos">Destinos</LoadingLink>
            <LoadingLink href="/paquetes">Paquetes</LoadingLink>
            <LoadingLink href="/contacto">Contacto</LoadingLink>
            {/* Mostrar Panel Admin o Mi Panel según el rol */}
            {(() => {
              const { user } = auth;
              if (!user) return null;
              
              // Verificar si el usuario es admin (rol 1 o rol "ADMIN")
              const isAdmin = user?.roles?.includes(1) || user?.role === "ADMIN";
              // Verificar si el usuario es cliente (rol 3 o rol "CLIENTE")
              const isClient = user?.roles?.includes(3) || user?.role === "CLIENTE";
              
              if (isAdmin) {
                return <LoadingLink href="/panel">Panel Admin</LoadingLink>;
              } else if (isClient) {
                return <LoadingLink href="/cliente">Mi Panel</LoadingLink>;
              }
              return null;
            })()}
            {/* Show avatar if logged in, else Login link */}
            {(() => {
              const { user } = auth;
              if (user) {
                return <NavUser user={user} />;
              } else {
                return <LoadingLink href="/login">Login</LoadingLink>;
              }
            })()}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="p-2"
            >
              {menuAbierto ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuAbierto && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <LoadingLink href="/" className="block px-3 py-2">
                Inicio
              </LoadingLink>
              <LoadingLink href="/destinos" className="block px-3 py-2">
                Destinos
              </LoadingLink>
              <LoadingLink href="/paquetes" className="block px-3 py-2">
                Paquetes
              </LoadingLink>
              <LoadingLink href="/contacto" className="block px-3 py-2">
                Contacto
              </LoadingLink>
              {/* Mostrar Panel Admin o Mi Panel según el rol */}
              {(() => {
                const { user } = auth;
                if (!user) return null;
                
                // Verificar si el usuario es admin (rol 1 o rol "ADMIN")
                const isAdmin = user?.roles?.includes(1) || user?.role === "ADMIN";
                // Verificar si el usuario es cliente (rol 3 o rol "CLIENTE")
                const isClient = user?.roles?.includes(3) || user?.role === "CLIENTE";
                
                if (isAdmin) {
                  return (
                    <LoadingLink href="/panel" className="block px-3 py-2">
                      Panel Admin
                    </LoadingLink>
                  );
                } else if (isClient) {
                  return (
                    <LoadingLink href="/cliente" className="block px-3 py-2">
                      Mi Panel
                    </LoadingLink>
                  );
                }
                return null;
              })()}
              {(() => {
                const { user } = auth;
                if (user) {
                  return <NavUser user={user} />;
                } else {
                  return (
                    <LoadingLink href="/login" className="block px-3 py-2">
                      Iniciar Sesión
                    </LoadingLink>
                  );
                }
              })()}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
