import { prisma } from "../index";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run the Prisma seed.");
}

const INITIAL_PERMISSION_DEFINITIONS = [
  { key: "manage_games", name: "Manage Games" },
  { key: "manage_players", name: "Manage Players" },
  { key: "manage_events", name: "Manage Events" },
  { key: "manage_users", name: "Manage Users" },
] as const;

const GAMES_TO_SEED = [
  {
    name: "Superfighters Deluxe",
    slug: "superfighters-deluxe",
    description:
      "Superfighters Deluxe is a unique action game that combines brawling, shooting and platforming in dynamic sandboxy 2D levels. Lots of weapons and fun gameplay systems interlock to create absurd action-movie chaos.",
    thumbnailImageUrl:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/855860/header.jpg?t=1774470652",
    backgroundImageUrl:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/855860/ss_0f1d0d077ce556fc003e2f2cd330d0fb8ce8dd7c.1920x1080.jpg?t=1774470652",
    steamUrl: "https://store.steampowered.com/app/855860/Superfighters_Deluxe/",
  },
  {
    name: "Rocket League",
    slug: "rocket-league",
    description:
      "Rocket League is a high-powered hybrid of arcade-style soccer and vehicular mayhem with easy-to-understand controls and fluid, physics-driven competition. Rocket League includes casual and competitive Online Matches, a fully-featured offline Season Mode, special “Mutators” that let you change the rules entirely, hockey and basketball-inspired Extra Modes, and more than 500 trillion possible cosmetic customization combinations.",
    thumbnailImageUrl:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/252950/1bcf75584d0c3613b02b2d0a2721a6b411375784/header_alt_assets_15.jpg?t=1773251703",
    backgroundImageUrl:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/252950/7bf3df882320660bf9e48727c1aa46fb53fbdb9e/ss_7bf3df882320660bf9e48727c1aa46fb53fbdb9e.1920x1080.jpg?t=1773251703",
    steamUrl: "https://store.steampowered.com/app/252950/Rocket_League/",
  },
];

async function seedPermissions() {
  console.log("Seeding permissions...");
  for (const definition of INITIAL_PERMISSION_DEFINITIONS) {
    await prisma.permission.upsert({
      where: { key: definition.key },
      update: { name: definition.name },
      create: {
        key: definition.key,
        name: definition.name,
      },
    });
  }
  console.log("Permissions seeded.");
}

async function seedGames() {
  console.log("Seeding games...");
  for (const game of GAMES_TO_SEED) {
    await prisma.game.upsert({
      where: { slug: game.slug },
      update: {
        name: game.name,
        description: game.description,
        thumbnailImageUrl: game.thumbnailImageUrl,
        backgroundImageUrl: game.backgroundImageUrl,
        steamUrl: game.steamUrl,
      },
      create: {
        name: game.name,
        slug: game.slug,
        description: game.description,
        thumbnailImageUrl: game.thumbnailImageUrl,
        backgroundImageUrl: game.backgroundImageUrl,
        steamUrl: game.steamUrl,
      },
    });
  }
  console.log("Games seeded.");
}

async function main() {
  try {
    await seedPermissions();
    await seedGames();
    console.log("Seed completed successfully.");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
