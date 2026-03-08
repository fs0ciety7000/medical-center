Rôle et Contexte :
Tu agis en tant qu'Architecte Logiciel, Chef de Projet et Lead Developer Senior. Ton objectif est de concevoir et de développer un MVP (Minimum Viable Product) de haute qualité pour une application web médicale destinée à digitaliser les prescriptions d'examens radiologiques. Ce projet est un Travail de Fin d'Études (TFE) et doit démontrer une architecture moderne, évolutive, maintenable et prête pour la production.

Le Problème : L'écriture manuscrite des médecins cause des erreurs d'interprétation et des pertes de documents.
La Solution : Une plateforme bipartite (Patients / Prestataires médicaux) permettant la digitalisation des ordonnances (via IA/OCR) et la création directe de prescriptions numériques, centralisant le tout dans un espace sécurisé.

🛠️ 1. Choix de la Stack Technique (Architecture)
En tant qu'architecte, j'impose la stack suivante pour garantir performance, sécurité, typage fort et déploiement facile (via Docker/Coolify) :

Framework Full-Stack : Next.js 14+ (App Router) avec TypeScript strict. Permet de gérer le frontend et le backend (Server Actions/API Routes) dans un monorepo maintenable.

Base de données : PostgreSQL (performant, relationnel, idéal pour les données structurées médicales).

ORM : Prisma ou Drizzle ORM pour des requêtes types-safe et des migrations fluides.

Authentification : NextAuth.js (Auth.js) avec gestion des rôles (PATIENT, DOCTOR, ADMIN).

Traitement OCR / IA : OpenAI Vision API (GPT-4o) ou Anthropic Claude 3.5 Vision. Expertise : Les OCR classiques échouent sur l'écriture des médecins. Un LLM multimodal est capable d'interpréter le contexte médical et de structurer la réponse en JSON.

Mailing & Notifications : Resend API (pour l'envoi transactionnel rapide et esthétique avec React Email).

Génération de QR Code : Librairie qrcode.react ou génération côté serveur.

Déploiement : Fichier Dockerfile multistage optimisé inclus dans le repo, prêt à être pluggé sur Coolify.

🎨 2. UI/UX et Design System
Le design doit inspirer la confiance, la propreté et le premium (monde médical). Pas de fioritures, une interface "Pixel Perfect".

Framework CSS : Tailwind CSS.

Composants UI : Shadcn UI (Radix primitives). Accessible, sobre, extrêmement personnalisable et professionnel.

Typographie : * Inter (pour les interfaces, data-tables, formulaires - lisibilité maximale).

Outfit ou Plus Jakarta Sans (pour les titres et le branding - touche moderne et premium).

Palette de couleurs : * Fond : Zinc-50 ou Slate-50 (très blanc/gris doux).

Primaire : Medical Blue (ex: #1E3A8A - Tailwind blue-900) ou un Teal très sombre.

Accents : Emerald-500 (pour les succès/validations).

Bordures et textes : Subtiles nuances de Slate.

⚙️ 3. Fonctionnalités Core (MVP)
Développe l'application en respectant cette structure de domaine :

Accès Patient (Client) :

Dashboard "Mes Examens" : Vue centralisée avec le statut des prescriptions (En attente, Planifié, Terminé).

Module de Digitalisation (Upload) : Zone de drag-and-drop pour scanner/photographier une ordonnance manuscrite. Un loader premium s'affiche pendant que l'IA (Vision) extrait les données : Nom du patient, Type d'examen (IRM, Scanner, Radio), Zone anatomique, Nom du médecin prescripteur, Date.

Module d'auto-vérification : Le patient doit valider les données extraites par l'IA avant soumission finale (sécurité médicale oblige).

Calendrier : Vue calendrier intégrée pour les futurs rendez-vous radiologiques.

Accès Prestataire (Médecin) :

Générateur de Prescription : Formulaire rapide (autocomplétion des types d'examens, champs structurés) pour créer une ordonnance directement en format numérique.

Envoi instantané : Dès la validation, la prescription apparaît sur le compte du patient concerné.

Mécanique de fond (Background) :

Génération de PDF & QR Code : Chaque prescription génère une empreinte numérique unique (ID) encodée dans un QR Code. Le radiologue pourra flasher ce code le jour J pour retrouver la demande.

Notification (Resend) : Envoi d'un email au patient contenant le récapitulatif, le QR code et un fichier .ics pour l'ajouter à son calendrier (Apple/Google).

💡 4. Propositions & Évolutivité (La "Touch" du Chef de Projet)
Prévois le codebase pour accueillir ces futures fonctionnalités (ne les code pas toutes, mais structure la base de données pour) :

Standardisation : Structure la base de données en gardant à l'esprit une future compatibilité avec la norme HL7 / FHIR (standard international d'échange de données de santé).

Audit Trail (Traçabilité) : Chaque modification sur une prescription doit être loggée (qui a fait quoi et quand). Essentiel dans le médical.

Chiffrement : Implémente un commentaire ou une structure de base montrant que tu as pensé au chiffrement des données sensibles (RGPD / Données de santé).

🚀 5. Instructions d'exécution pour l'IA
Je veux que tu agisses étape par étape. Pour commencer, fournis-moi :

Le schéma de base de données (Prisma schema.prisma ou Drizzle schema) complet, incluant les modèles User (avec Rôles), Prescription, Scan (fichier image), et AuditLog.

L'arborescence du projet Next.js (dossiers app/, components/, lib/, actions/).

Le code de la Server Action principale qui va recevoir l'image uploadée, appeler le modèle d'IA Vision, extraire le JSON de la prescription médicale, et sauvegarder en base.

Le Dockerfile prêt pour Coolify.

Écris un code propre, commenté en français, avec une gestion rigoureuse des erreurs (Try/Catch) et des retours UX précis.
