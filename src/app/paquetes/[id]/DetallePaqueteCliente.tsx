"use client";

import { DetailBreadcrumbs } from "@/components/comunes/breadcrumbs";

import React, { useEffect, useState } from "react";

// Importa o define el tipo Paquete aquí
// Ejemplo de importación (ajusta la ruta según tu proyecto):
// import { Paquete } from "@/types/Paquete";

type Paquete = {
  nombre: string;
  // Agrega aquí otras propiedades necesarias
};

export default function DetallePaqueteCliente({ paquete }: { paquete: Paquete | undefined }) {
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
