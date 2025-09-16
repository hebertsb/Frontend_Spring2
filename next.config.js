const nextConfig = {
  output: 'export', // Habilita exportación estática para Netlify Drop
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true
  },
  poweredByHeader: false,
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
  }
};

module.exports = nextConfig;
