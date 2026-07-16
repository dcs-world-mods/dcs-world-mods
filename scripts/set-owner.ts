/**
 * Manually grant (or revoke) the Owner role. This is the ONLY way to make
 * someone an Owner — there is intentionally no UI or API path for it.
 *
 * Usage:
 *   npm run set-owner <username>            -> grant Owner
 *   npm run set-owner <username> -- --revoke -> demote back to Member
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== "--");
  const username = args.find((a) => !a.startsWith("--"));
  const revoke = args.includes("--revoke");

  if (!username) {
    console.error("Usage: npm run set-owner <username> [-- --revoke]");
    process.exit(1);
  }

  const user = await db.user.findUnique({ where: { username } });
  if (!user) {
    console.error(`User "${username}" not found.`);
    process.exit(1);
  }

  const role = revoke ? "USER" : "ADMIN";
  await db.user.update({ where: { id: user.id }, data: { role } });
  console.log(
    revoke
      ? `"${username}" has been demoted to Member.`
      : `"${username}" is now an Owner with full permissions.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
