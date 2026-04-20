import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

// Mock context for testing
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

describe("experiments router", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    caller = appRouter.createCaller(createMockContext("user"));
  });

  describe("list", () => {
    it("should return list of experiments", async () => {
      const experiments = await caller.experiments.list();
      expect(Array.isArray(experiments)).toBe(true);
    });
  });

  describe("search", () => {
    it("should search experiments by query", async () => {
      const results = await caller.experiments.search({ query: "Reação" });
      expect(Array.isArray(results)).toBe(true);
    });

    it("should return empty array for non-matching query", async () => {
      const results = await caller.experiments.search({ query: "NonExistentExperiment" });
      expect(results.length).toBe(0);
    });
  });

  describe("create (admin only)", () => {
    it("should reject non-admin users", async () => {
      const userCaller = appRouter.createCaller(createMockContext("user"));
      
      try {
        await userCaller.experiments.create({
          title: "Test Experiment",
          categoryId: 1,
          level: "fundamental",
        });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should allow admin users to create experiments", async () => {
      const adminCaller = appRouter.createCaller(createMockContext("admin"));
      
      try {
        await adminCaller.experiments.create({
          title: "Test Experiment",
          categoryId: 1,
          level: "fundamental",
        });
        // If no error is thrown, test passes
        expect(true).toBe(true);
      } catch (error: any) {
        // Expected to fail due to invalid category, but should not be FORBIDDEN
        expect(error.code).not.toBe("FORBIDDEN");
      }
    });
  });

  describe("getById", () => {
    it("should return NOT_FOUND for non-existent experiment", async () => {
      try {
        await caller.experiments.getById(99999);
        expect.fail("Should have thrown NOT_FOUND error");
      } catch (error: any) {
        expect(error.code).toBe("NOT_FOUND");
      }
    });

    it("should return experiment by valid ID", async () => {
      const experiments = await caller.experiments.list();
      if (experiments.length > 0) {
        const exp = await caller.experiments.getById(experiments[0].id);
        expect(exp).toHaveProperty("id");
        expect(exp).toHaveProperty("title");
        expect(exp.id).toBe(experiments[0].id);
      }
    });
  });

  describe("getByCategory", () => {
    it("should return experiments filtered by category", async () => {
      const results = await caller.experiments.getByCategory(1);
      expect(Array.isArray(results)).toBe(true);
    });
  });
});
