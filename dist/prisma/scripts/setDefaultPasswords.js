"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const defaultPassword = "SuperMushroom1!";
    const hashedPassword = await bcrypt_1.default.hash(defaultPassword, 10);
    // find all users missing a password hash
    const usersWithoutPassword = await prisma.user.findMany({
        where: { passwordHash: null },
    });
    console.log(`Found ${usersWithoutPassword.length} users without password`);
    for (const user of usersWithoutPassword) {
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: hashedPassword },
        });
        console.log(`Updated user ${user.email}`);
    }
}
main()
    .then(() => {
    console.log("Done setting default passwords");
})
    .catch((e) => {
    console.error(e);
})
    .finally(async () => {
    await prisma.$disconnect();
});
