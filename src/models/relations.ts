import { relations } from "drizzle-orm/relations";
import { post, postTag, tag } from "./schema.js";

export const postTagRelations = relations(postTag, ({ one }) => ({
  post: one(post, {
    fields: [postTag.postId],
    references: [post.id],
  }),
  tag: one(tag, {
    fields: [postTag.tagId],
    references: [tag.id],
  }),
}));

export const postRelations = relations(post, ({ many }) => ({
  postTags: many(postTag),
}));

export const tagRelations = relations(tag, ({ many }) => ({
  postTags: many(postTag),
}));
