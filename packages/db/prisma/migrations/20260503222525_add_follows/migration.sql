-- CreateTable
CREATE TABLE "user_game_follows" (
    "user_id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_game_follows_pkey" PRIMARY KEY ("user_id","game_id")
);

-- CreateTable
CREATE TABLE "user_event_follows" (
    "user_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_event_follows_pkey" PRIMARY KEY ("user_id","event_id")
);

-- AddForeignKey
ALTER TABLE "user_game_follows" ADD CONSTRAINT "user_game_follows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_game_follows" ADD CONSTRAINT "user_game_follows_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_event_follows" ADD CONSTRAINT "user_event_follows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_event_follows" ADD CONSTRAINT "user_event_follows_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
