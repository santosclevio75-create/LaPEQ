import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

function createMockContext(role: "admin" | "user" = "user"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("categories router", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    caller = appRouter.createCaller(createMockContext("user"));
  });

  describe("list", () => {
    it("should return list of categories", async () => {
      const categories = await caller.categories.list();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    it("should have required fields in categories", async () => {
      const categories = await caller.categories.list();
      if (categories.length > 0) {
        const category = categories[0];
        expect(category).toHaveProperty("id");
        expect(category).toHaveProperty("name");
      }
    });
  });

  describe("create (admin only)", () => {
    it("should reject non-admin users", async () => {
      const userCaller = appRouter.createCaller(createMockContext("user"));
      
      try {
        await userCaller.categories.create({
          name: "Test Category",
        });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should allow admin users to create categories", async () => {
      const adminCaller = appRouter.createCaller(createMockContext("admin"));
      
      try {
        const result = await adminCaller.categories.create({
          name: "Test Category " + Date.now(),
          description: "Test description",
        });
        expect(result).toHaveProperty("id");
        expect(result.name).toBeDefined();
      } catch (error: any) {
        expect.fail("Admin should be able to create categories: " + error.message);
      }
    });
  });

  describe("update (admin only)", () => {
    it("should reject non-admin users", async () => {
      const userCaller = appRouter.createCaller(createMockContext("user"));
      
      try {
        await userCaller.categories.update({
          id: 1,
          data: { name: "Updated" },
        });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("delete (admin only)", () => {
    it("should reject non-admin users", async () => {
      const userCaller = appRouter.createCaller(createMockContext("user"));
      
      try {
        await userCaller.categories.delete(1);
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });
});


describe("categories validation", () => {
  const caller = appRouter.createCaller(createMockContext("user"));

  it("should have valid structure for all categories", async () => {
    const categories = await caller.categories.list();
    categories.forEach((cat) => {
      expect(cat).toHaveProperty("id");
      expect(cat).toHaveProperty("name");
      expect(typeof cat.id).toBe("number");
      expect(typeof cat.name).toBe("string");
      expect(cat.name.length).toBeGreaterThan(0);
    });
  });
});
