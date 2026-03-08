Rôle et Contexte :
Tu agis en tant qu'Architecte Logiciel, Chef de Projet et Lead Developer Senior. Ton objectif est de concevoir et de développer un MVP (Minimum Viable Product) de haute qualité pour une application web médicale (SaaS) destinée à digitaliser les prescriptions d'examens radiologiques. Ce projet est un Travail de Fin d'Études (TFE) et doit démontrer une architecture moderne, sécurisée, évolutive et prête pour la production.

Le Problème : L'écriture manuscrite des médecins cause des erreurs d'interprétation et des pertes de documents.
La Solution : Une plateforme SaaS bipartite (Patients / Prestataires médicaux) permettant la digitalisation des ordonnances via deux canaux distincts :

Numérisation assistée par IA (Google Cloud Vision) pour les documents papier apportés par les patients.

Encodage direct via formulaire structuré par le personnel soignant.

🛠️ 1. Choix de la Stack Technique & Architecture "MVC" Moderne
Nous utiliserons une architecture de type "SaaS MVC" adaptée au web moderne :

Le Modèle (Data Layer) : PostgreSQL + Prisma (ou Drizzle). Gestion stricte des relations et des types.

La Vue (UI Layer) : Next.js 14+ (App Router) avec React Server Components, Tailwind CSS, et Shadcn UI (typographie Inter/Outfit, design sobre, premium, teintes "Medical Blue" et "Zinc").

Le Contrôleur (Logic Layer) : Server Actions de Next.js pour les mutations de données, et Route Handlers pour les webhooks/API externes.

Outils tiers obligatoires :

Authentification & Sécurité : Auth.js (NextAuth v5) avec stratégie JWT stateless. Gestion stricte du RBAC (Role-Based Access Control) avec les rôles PATIENT et DOCTOR.

Traitement OCR : API Google Cloud Vision (DOCUMENT_TEXT_DETECTION).

Mailing & Notifications : Resend API avec React Email.

Génération de QR Code : Librairie qrcode.react.

Déploiement : Docker (Dockerfile multistage optimisé pour Coolify).

🔐 2. Système d'Authentification et Gestion des Profils (Core SaaS)
L'application doit posséder une base SaaS solide :

Inscription / Connexion : Formulaires propres avec validation Zod + React Hook Form. Hachage des mots de passe avec bcryptjs.

Tokens JWT & Middleware : La session doit être gérée via des tokens JWT chiffrés contenant l'ID et le Rôle de l'utilisateur. Un fichier middleware.ts doit protéger dynamiquement les routes (ex: redirection de /dashboard vers /login si non authentifié).

Profil Utilisateur : Une page /profile permettant à l'utilisateur de voir ses informations et son statut (Badge "Patient" ou "Prestataire Médical"). Le contenu du dashboard doit s'adapter au rôle (Rendu conditionnel).

⚙️ 3. Fonctionnalités Métier & Parcours Utilisateurs
L'application doit gérer deux flux d'entrée distincts pour les prescriptions, accessibles selon le rôle :

Flux 1 : Accès Prestataire / Personnel Soignant (role: DOCTOR)

Générateur de Prescription : Formulaire rapide avec autocomplétion pour encoder la demande d'examen.

Attribution : La prescription est liée à l'email ou au dossier du patient et apparaît instantanément de son côté.

Flux 2 : Accès Patient (role: PATIENT)

Module d'Upload & OCR : Le patient photographie une ordonnance manuscrite. Une Server Action appelle l'API Google Cloud Vision pour extraire le texte.

Module d'Auto-Vérification : Le texte brut est formaté, et le patient doit vérifier/corriger les champs avant l'enregistrement final.

Dashboard "Mes Examens" : Vue centralisée avec statut (En attente, Planifié, Terminé) et accès au calendrier.

Mécanique Commune :

Génération de QR Code : Chaque prescription validée génère un ID unique encodé dans un QR Code pour le jour de l'examen.

Notification : Envoi d'un email (Resend) au patient avec le récapitulatif, le QR code et un .ics.

🚀 4. Instructions d'exécution pour l'IA (Code-moi ceci étape par étape)
En tant que Lead Dev, je veux que tu me génères un codebase structuré, propre, commenté en français, avec gestion des erreurs (try/catch). Procède dans cet ordre précis :

Étape 1 : Le Modèle et la Sécurité

Génère le fichier schema.prisma complet (modèles User, Role enum, Prescription, AuditLog).

Génère la configuration Auth.js (auth.ts à la racine) configurée avec JWT, CredentialsProvider, bcryptjs, et l'injection du role dans les callbacks JWT/Session.

Génère le middleware.ts pour protéger les routes /dashboard et /profile.

Étape 2 : Les Contrôleurs (Server Actions)
4. Génère les Server Actions pour l'authentification : registerUser et loginUser.
5. Génère la Server Action de l'OCR : processPrescriptionImage qui appelle Google Cloud Vision et renvoie les données extraites en JSON.

Étape 3 : Les Vues (Pages et Composants)
6. Génère la page app/register/page.tsx et app/login/page.tsx (avec un design SaaS premium).
7. Génère la page app/profile/page.tsx qui affiche les données de l'utilisateur connecté et un rendu conditionnel selon qu'il est Patient ou Médecin.
8. Génère le formulaire d'encodage manuel (pour le rôle DOCTOR).

Étape 4 : DevOps
9. Fournis le Dockerfile optimisé pour Next.js 14, frontend, backend, database, prêt à être déployé sur Coolify.

Ne me donne pas de simples snippets, mais un vrai code prêt pour la production (SaaS-ready). Fais preuve d'ingéniosité architecturale.
