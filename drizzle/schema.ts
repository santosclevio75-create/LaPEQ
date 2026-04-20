import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Categories table for organizing experiments
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }), // lucide-react icon name
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Experiments table with standardized template fields
 */
export const experiments = mysqlTable("experiments", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  categoryId: int("categoryId").notNull(),
  problem: text("problem"), // Problema investigativo
  objective: text("objective"), // Objetivo
  materials: text("materials"), // JSON array of materials
  procedure: text("procedure"), // Procedimento
  chemicalExplanation: text("chemicalExplanation"), // Explicação química
  simplifiedExplanation: text("simplifiedExplanation"), // Explicação simplificada
  dailyApplication: text("dailyApplication"), // Aplicação no cotidiano
  epi: text("epi"), // EPIs (Equipamentos de Proteção Individual)
  risks: text("risks"), // Riscos
  estimatedTime: varchar("estimatedTime", { length: 50 }), // ex: "30 minutos"
  level: mysqlEnum("level", ["fundamental", "medio"]).notNull(), // Nível
  imageUrl: text("imageUrl"), // URL da imagem do experimento
  videoUrl: text("videoUrl"), // URL do vídeo do experimento
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Experiment = typeof experiments.$inferSelect;
export type InsertExperiment = typeof experiments.$inferInsert;

/**
 * Experiment Images table for storing multiple images per experiment
 */
export const experimentImages = mysqlTable("experimentImages", {
  id: int("id").autoincrement().primaryKey(),
  experimentId: int("experimentId").notNull(),
  imageUrl: text("imageUrl").notNull(),
  caption: text("caption"), // Optional caption for the image
  order: int("order").default(0), // Order of images
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExperimentImage = typeof experimentImages.$inferSelect;
export type InsertExperimentImage = typeof experimentImages.$inferInsert;

/**
 * Loans table for managing experiment kit loans
 */
export const loans = mysqlTable("loans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // User who made the loan request
  name: varchar("name", { length: 255 }).notNull(),
  institution: varchar("institution", { length: 255 }).notNull(),
  experimentId: int("experimentId").notNull(),
  withdrawalDate: timestamp("withdrawalDate").notNull(),
  returnDate: timestamp("returnDate").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "returned"]).default("pending").notNull(),
  notes: text("notes"), // Admin notes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Loan = typeof loans.$inferSelect;
export type InsertLoan = typeof loans.$inferInsert;

/**
 * Settings table for site configuration
 */
export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;

/**
 * Design Styles table for persisting visual changes made in the editor
 */
export const designStyles = mysqlTable("designStyles", {
  id: int("id").autoincrement().primaryKey(),
  componentName: varchar("componentName", { length: 255 }).notNull(), // e.g., "Home", "ExperimentsPage", "Header"
  cssClass: varchar("cssClass", { length: 255 }).notNull(), // e.g., "bg-primary", "text-xl"
  cssValue: text("cssValue").notNull(), // e.g., "#10b981", "1.25rem"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DesignStyle = typeof designStyles.$inferSelect;
export type InsertDesignStyle = typeof designStyles.$inferInsert;

/**
 * Book Loans table for managing book loans
 */
export const bookLoans = mysqlTable("bookLoans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  institution: varchar("institution", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(), // Email for notifications
  bookTitle: varchar("bookTitle", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }),
  withdrawalDate: timestamp("withdrawalDate").notNull(),
  returnDate: timestamp("returnDate").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "returned"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BookLoan = typeof bookLoans.$inferSelect;
export type InsertBookLoan = typeof bookLoans.$inferInsert;


/**
 * Notifications table for managing user notifications
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["loan_pending", "loan_approved", "loan_rejected", "loan_returned", "book_loan_pending", "book_loan_approved", "book_loan_rejected", "book_loan_returned"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  loanId: int("loanId"), // Reference to loans table
  bookLoanId: int("bookLoanId"), // Reference to bookLoans table
  isRead: int("isRead").default(0).notNull(), // 0 = false, 1 = true
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
