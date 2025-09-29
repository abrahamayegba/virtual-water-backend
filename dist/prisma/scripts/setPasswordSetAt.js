"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("Updating all users to set passwordSetAt = null...");
    const updated = await prisma.user.updateMany({
        data: { passwordSetAt: null },
    });
    console.log(`Updated ${updated.count} users.`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
