import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, categories, experiments, loans, settings, designStyles, bookLoans, experimentImages, notifications, InsertCategory, InsertExperiment, InsertLoan, InsertSetting, Setting, InsertDesignStyle, DesignStyle, InsertBookLoan, BookLoan, InsertExperimentImage, ExperimentImage, InsertNotification, Notification } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(users.createdAt);
}

/**
 * Categories queries
 */
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(categories).values(data);
  // Return the created category with ID
  const insertedId = result[0].insertId;
  const created = await db.select().from(categories).where(eq(categories.id, insertedId)).limit(1);
  return created[0] || { id: insertedId, ...data };
}

export async function updateCategory(id: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(categories).where(eq(categories.id, id));
}

/**
 * Experiments queries
 */
export async function getAllExperiments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(experiments).orderBy(experiments.title);
}

export async function getExperimentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(experiments).where(eq(experiments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getExperimentsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(experiments).where(eq(experiments.categoryId, categoryId)).orderBy(experiments.title);
}

export async function createExperiment(data: InsertExperiment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(experiments).values(data);
  // Return the created experiment with ID
  const insertedId = result[0].insertId;
  const created = await db.select().from(experiments).where(eq(experiments.id, insertedId)).limit(1);
  return created[0] || { id: insertedId, ...data };
}

export async function updateExperiment(id: number, data: Partial<InsertExperiment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(experiments).set(data).where(eq(experiments.id, id));
  // Return the updated experiment
  const updated = await db.select().from(experiments).where(eq(experiments.id, id)).limit(1);
  return updated[0];
}

export async function deleteExperiment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(experiments).where(eq(experiments.id, id));
}

/**
 * Loans queries
 */
export async function getAllLoans() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(loans).orderBy(loans.createdAt);
}

export async function getLoanById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(loans).where(eq(loans.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createLoan(data: InsertLoan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(loans).values(data);
  return result;
}

export async function updateLoan(id: number, data: Partial<InsertLoan>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(loans).set(data).where(eq(loans.id, id));
}

export async function deleteLoan(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(loans).where(eq(loans.id, id));
}


/**
 * Settings queries
 */
export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return result.length > 0 ? result[0].value : null;
}

export async function setSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  
  if (existing.length > 0) {
    return db.update(settings).set({ value }).where(eq(settings.key, key));
  } else {
    return db.insert(settings).values({ key, value });
  }
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const db = await getDb();
  if (!db) return {};
  
  const allSettings = await db.select().from(settings);
  const result: Record<string, string> = {};
  
  allSettings.forEach(setting => {
    result[setting.key] = setting.value;
  });
  
  return result;
}


/**
 * Design Styles queries
 */
export async function getAllDesignStyles() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(designStyles);
}

export async function getDesignStylesByComponent(componentName: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(designStyles).where(eq(designStyles.componentName, componentName));
}

export async function saveDesignStyle(data: InsertDesignStyle) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if style already exists
  const existing = await db.select().from(designStyles)
    .where(eq(designStyles.componentName, data.componentName))
    .limit(1);
  
  if (existing.length > 0) {
    // Update existing
    await db.update(designStyles)
      .set(data)
      .where(eq(designStyles.componentName, data.componentName));
    const updated = await db.select().from(designStyles)
      .where(eq(designStyles.componentName, data.componentName))
      .limit(1);
    return updated[0];
  } else {
    // Create new
    const result = await db.insert(designStyles).values(data);
    const insertedId = result[0].insertId;
    const created = await db.select().from(designStyles).where(eq(designStyles.id, insertedId)).limit(1);
    return created[0] || { id: insertedId, ...data };
  }
}

export async function deleteDesignStyle(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(designStyles).where(eq(designStyles.id, id));
}

/**
 * Book Loans queries
 */
export async function getAllBookLoans() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookLoans).orderBy(bookLoans.createdAt);
}

export async function getBookLoanById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(bookLoans).where(eq(bookLoans.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createBookLoan(data: InsertBookLoan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Filter out undefined and null values to avoid Drizzle inserting 'default'
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined && v !== null)
  ) as InsertBookLoan;
  const result = await db.insert(bookLoans).values(cleanData);
  return result;
}

export async function updateBookLoan(id: number, data: Partial<InsertBookLoan>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(bookLoans).set(data).where(eq(bookLoans.id, id));
}

export async function deleteBookLoan(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(bookLoans).where(eq(bookLoans.id, id));
}

/**
 * Experiment Images queries
 */
export async function getExperimentImages(experimentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(experimentImages).where(eq(experimentImages.experimentId, experimentId)).orderBy(experimentImages.order);
}

export async function addExperimentImage(data: InsertExperimentImage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(experimentImages).values(data);
  return result;
}

export async function deleteExperimentImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(experimentImages).where(eq(experimentImages.id, id));
}

export async function updateExperimentImage(id: number, data: Partial<InsertExperimentImage>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(experimentImages).set(data).where(eq(experimentImages.id, id));
}


/**
 * Notifications queries
 */
export async function getNotificationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(notifications.createdAt);
}

export async function createNotification(data: Omit<InsertNotification, 'isRead' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notifications).values({
    ...data,
    isRead: 0,
  });
  return result;
}

export async function markNotificationAsRead(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Verify user owns this notification
  const notification = await db.select().from(notifications).where(eq(notifications.id, id));
  if (!notification.length || notification[0].userId !== userId) {
    throw new Error("Unauthorized");
  }
  return db.update(notifications).set({ isRead: 1 }).where(eq(notifications.id, id));
}

export async function deleteNotification(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Verify user owns this notification
  const notification = await db.select().from(notifications).where(eq(notifications.id, id));
  if (!notification.length || notification[0].userId !== userId) {
    throw new Error("Unauthorized");
  }
  return db.delete(notifications).where(eq(notifications.id, id));
}
