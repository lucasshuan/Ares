import { db } from "./index";
import { users } from "@ares/db";

async function test() {
  try {
    console.log("Starting test...");
    const allUsers = await db.select().from(users);
    console.log("Success! Users found:", allUsers.length);
  } catch (error) {
    console.error("Test failed!");
    console.error(error);
  }
}

test();
