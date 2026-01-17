import { relations } from "drizzle-orm/relations";
import { czn_bookmarks, czn_saved_data } from "./schema";
import { auth_account, auth_session, auth_user } from "./auth-schema";

export const auth_userRelations = relations(auth_user, ({ many }) => ({
    auth_sessions: many(auth_session),
    auth_accounts: many(auth_account),

    // User's own saved data
    ownSavedData: many(czn_saved_data, {
        relationName: "savedDataOwner",
    }),

    // Data bookmarked by the user
    bookmarkedSavedData: many(czn_bookmarks, {
        relationName: "bookmarkingUser",
    }),
}));

export const auth_sessionRelations = relations(auth_session, ({ one }) => ({
    auth_user: one(auth_user, {
        fields: [auth_session.userId],
        references: [auth_user.id],
    }),
}));

export const auth_accountRelations = relations(auth_account, ({ one }) => ({
    auth_user: one(auth_user, {
        fields: [auth_account.userId],
        references: [auth_user.id],
    }),
}));

export const czn_saved_dataRelations = relations(czn_saved_data, ({ one, many }) => ({
    // Owner of the saved data
    owner: one(auth_user, {
        fields: [czn_saved_data.userId],
        references: [auth_user.id],
        relationName: "savedDataOwner",
    }),

    // Users who bookmarked this data
    bookmarks: many(czn_bookmarks, {
        relationName: "bookmarkedData",
    }),
}));

export const czn_bookmarksRelations = relations(czn_bookmarks, ({ one }) => ({
    // User who made the bookmark
    user: one(auth_user, {
        fields: [czn_bookmarks.userId],
        references: [auth_user.id],
        relationName: "bookmarkingUser",
    }),

    // The saved data being bookmarked
    savedData: one(czn_saved_data, {
        fields: [czn_bookmarks.savedDataId],
        references: [czn_saved_data.id],
        relationName: "bookmarkedData",
    }),
}));