import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  
  // Configuración para Netlify (comentado por ahora para build normal)
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  
  // Optimizaciones para producción
  poweredByHeader: false,
  
  // Variables de entorno
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
  }
};

export default nextConfig;
