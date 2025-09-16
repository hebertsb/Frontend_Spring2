"use client";

import { DetailBreadcrumbs } from "@/components/comunes/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Star,
  Heart,
  Share2,
  Clock,
  Users,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function DetallePaqueteCliente({ paquete }: { paquete: any }) {
  const [titulo, setTitulo] = useState("");
  useEffect(() => {
    if (paquete) setTitulo(paquete.nombre);
  }, [paquete]);

  // ...aquí va el render original de la página, usando 'paquete', 'esFavorito', etc...
  // Por simplicidad, puedes copiar el contenido del return original aquí.
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      <DetailBreadcrumbs 
        parentPage="Paquetes" 
        parentHref="/paquetes" 
        currentPageTitle={titulo || "Detalle del Paquete"} 
      />
      {/* ...el resto del contenido de la página... */}
      {/* Puedes copiar el return original aquí, usando las props y estados locales */}
    </div>
  );
}
