





import { paquetesData } from "../paquetesData";
import { Navegacion } from "@/components/comunes/navegacion";
import DetallePaqueteCliente from "./DetallePaqueteCliente";
import { notFound } from 'next/navigation';

export async function generateStaticParams(): Promise<{ id: string }[]> {
  console.log('🔍 Generando rutas estáticas para paquetes:', paquetesData.map(p => p.id));
  return paquetesData.map((paquete: { id: string }) => ({ id: paquete.id }));
}

export default async function Page({ params }: { params: { id: string } }) {
  console.log('🔍 Buscando paquete con ID:', params.id);
  
  // Validar que el ID existe
  if (!params.id || params.id === 'undefined') {
    console.error('❌ ID de paquete inválido:', params.id);
    notFound();
  }
  
  const paquete = paquetesData.find((p) => p.id === params.id);
  
  if (!paquete) {
    console.error('❌ Paquete no encontrado con ID:', params.id);
    notFound();
  }
  
  console.log('✅ Paquete encontrado:', paquete.nombre);
  
  return (
    <>
      <Navegacion />
      <DetallePaqueteCliente paquete={paquete} />
    </>
  );
}
