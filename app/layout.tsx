import type { Metadata } from "next";
// Typographie élégante Medical/SaaS Premium : Inter
import { Inter } from "next/font/google";
import "./globals.css"; // L'injection de Tailwind

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

// Balises SEO/Head par défaut pour les pages de l'application
export const metadata: Metadata = {
  title: "Espace Médical SaaS",
  description: "Plateforme digitale pour l'encodage et la gestion des prescriptions radiologiques par IA.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable}`}>
      {/* 
          Le bg-zinc-50 et le text-zinc-900 ont déjà été assignés
          dans le globals.css (layer base), mais c’est une sécurité.
      */}
      <body className="antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
