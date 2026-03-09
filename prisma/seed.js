// @ts-check
/**
 * Seed de démonstration — crée 3 comptes si absents (idempotent).
 * Exécuté par entrypoint.sh au démarrage du conteneur.
 * Les mots de passe sont hashés avec bcryptjs (même algorithme que l'auth).
 */

const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

const SEED_USERS = [
  {
    name: "Albert Douille",
    email: "patient@demo.local",
    password: "demo",
    role: "PATIENT",
  },
  {
    name: "Dr. Bernard Martin",
    email: "doctor@demo.local",
    password: "demo",
    role: "DOCTOR",
  },
  {
    name: "Admin Système",
    email: "admin@demo.local",
    password: "demo",
    role: "ADMIN",
  },
]

async function main() {
  console.log("🌱  Seed des comptes de démonstration...")

  for (const userData of SEED_USERS) {
    const existing = await prisma.user.findUnique({ where: { email: userData.email } })
    if (existing) {
      console.log(`   ⏭️   ${userData.role} (${userData.email}) — déjà présent, ignoré.`)
      continue
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10)
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
      },
    })

    await prisma.auditLog.create({
      data: {
        action: "USER_SEEDED",
        entity: "User",
        entityId: user.id,
        details: { role: user.role, seededAt: new Date().toISOString() },
      },
    })

    console.log(`   ✅  ${userData.role} créé : ${userData.email} / ${userData.password}`)
  }

  console.log("🌱  Seed terminé.")
}

main()
  .catch((e) => {
    console.error("❌  Erreur seed :", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
