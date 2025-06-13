import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Configuración experimental para optimizaciones
  experimental: {
    optimizePackageImports: ['lucide-react']
  },

  // Configuración para i18n en sitemap y metadata
  async generateBuildId() {
    // Puedes personalizar el build ID si necesitas
    return 'foor-dev-build-' + Date.now();
  },

  // Headers para SEO y performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Redirects para manejo de rutas legacy si es necesario
  async redirects() {
    return [
      // Ejemplo: Redirigir rutas legacy a versiones localizadas
      // {
      //   source: '/old-path',
      //   destination: '/en/new-path',
      //   permanent: true,
      // },
    ];
  },

  // Rewrites para manejar rutas de API si es necesario
  async rewrites() {
    return [
      // Ejemplo: Reescribir API routes
      // {
      //   source: '/api/i18n/:path*',
      //   destination: '/api/translations/:path*',
      // },
    ];
  },
};

export default nextConfig;
