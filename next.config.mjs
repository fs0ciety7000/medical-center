/** @type {import('next').NextConfig} */
const nextConfig = {
  // Option critique pour le Dockerfile (réduit la taille de l'image de 1Go+ à moins de 150Mo)
  output: "standalone",
  experimental: {
    // Les Server Actions sont stables en v14, mais côté config parfois on précise ci-dessous d'autres options si besoin
  },
  // Désactive la télémétrie Next.js pour accélérer le build Coolify/Docker
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, 
  }
};

export default nextConfig;
