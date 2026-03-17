import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    await prisma.user.delete({
      where: { email: 'sdroth04@gmail.com' }
    })
    console.log("Deleted old test user for sdroth04@gmail.com")
  } catch (e) {
    console.log("Error deleting:", e)
  }
}
main()
