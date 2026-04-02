import { relations } from "drizzle-orm";
import { users, gameProfiles, savedGames } from "./schema";

export const gameProfilesRelations = relations(gameProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [gameProfiles.userId],
    references: [users.id],
  }),
  savedGames: many(savedGames),
}));

export const savedGamesRelations = relations(savedGames, ({ one }) => ({
  profile: one(gameProfiles, {
    fields: [savedGames.profileId],
    references: [gameProfiles.id],
  }),
}));
