import {
  pgTable,
  varchar,
  timestamp,
  text,
  integer,
  serial,
  uniqueIndex,
  foreignKey,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const prismaMigrations = pgTable("_prisma_migrations", {
  id: varchar({ length: 36 }).primaryKey().notNull(),
  checksum: varchar({ length: 64 }).notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true, mode: "string" }),
  migrationName: varchar("migration_name", { length: 255 }).notNull(),
  logs: text(),
  rolledBackAt: timestamp("rolled_back_at", {
    withTimezone: true,
    mode: "string",
  }),
  startedAt: timestamp("started_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  appliedStepsCount: integer("applied_steps_count").default(0).notNull(),
});

export const message = pgTable("Message", {
  id: serial().primaryKey().notNull(),
  name: text(),
  email: text(),
  subject: text(),
  message: text().notNull(),
  createdAt: timestamp({ precision: 3, mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const post = pgTable("Post", {
  id: serial().primaryKey().notNull(),
  post: text().notNull(),
  postLink: text("post_link"),
  dateString: text("date_string").notNull(),
  createdAt: timestamp({ precision: 3, mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp({ precision: 3, mode: "string" }).notNull(),
  date: timestamp({ precision: 3, mode: "string" }).notNull(),
});

export const tag = pgTable(
  "Tag",
  {
    id: serial().primaryKey().notNull(),
    tag: text().notNull(),
  },
  table => [
    uniqueIndex("Tag_tag_key").using(
      "btree",
      table.tag.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const postTag = pgTable(
  "PostTag",
  {
    postId: integer().notNull(),
    tagId: integer().notNull(),
  },
  table => [
    foreignKey({
      columns: [table.postId],
      foreignColumns: [post.id],
      name: "PostTag_postId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.tagId],
      foreignColumns: [tag.id],
      name: "PostTag_tagId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    primaryKey({ columns: [table.postId, table.tagId], name: "PostTag_pkey" }),
  ]
);

export const users = pgTable("users", {
  id: serial().primaryKey().notNull(),
  name: varchar("username", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  password: text("password_hash").notNull(),
  created_at: timestamp({ precision: 3, mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: timestamp({ precision: 3, mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
