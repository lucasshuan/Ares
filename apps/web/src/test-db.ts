import "dotenv/config";
import { db } from "@/server/db/client";
import { permissions, userPermissions } from "@ares/db";

async function main() {
  await db.delete(userPermissions);
  await db.delete(permissions);
  console.log("Truncated");
}
main()
  .catch(console.error)
  .then(() => process.exit(0));
