import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

/**
 * Integration test for experiment CRUD operations
 * Tests that create, update, and delete operations persist data correctly
 */

const adminUser = {
  id: 1,
  openId: "test-admin",
  email: "admin@test.com",
  name: "Test Admin",
  loginMethod: "test",
  role: "admin" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function createAdminContext(): TrpcContext {
  return {
    user: adminUser,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Experiments CRUD Integration", () => {
  let createdExperimentId: number;
  const adminCtx = createAdminContext();

  it("should create an experiment and return it with ID", async () => {
    const caller = appRouter.createCaller(adminCtx);

    const result = await caller.experiments.create({
      title: "Test Experiment",
      categoryId: 1,
      problem: "Test problem",
      objective: "Test objective",
      materials: "Material 1\nMaterial 2",
      procedure: "Step 1\nStep 2",
      chemicalExplanation: "Chemical explanation",
      simplifiedExplanation: "Simplified explanation",
      dailyApplication: "Daily application",
      epi: "EPI 1\nEPI 2",
      risks: "Risk 1\nRisk 2",
      estimatedTime: "30 minutes",
      level: "fundamental",
      imageUrl: "https://example.com/image.jpg",
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.title).toBe("Test Experiment");
    expect(result.imageUrl).toBe("https://example.com/image.jpg");

    createdExperimentId = result.id;
  });

  it("should retrieve the created experiment by ID", async () => {
    const caller = appRouter.createCaller(adminCtx);

    const result = await caller.experiments.getById(createdExperimentId);

    expect(result).toBeDefined();
    expect(result?.id).toBe(createdExperimentId);
    expect(result?.title).toBe("Test Experiment");
    expect(result?.imageUrl).toBe("https://example.com/image.jpg");
  });

  it("should update an experiment and persist changes", async () => {
    const caller = appRouter.createCaller(adminCtx);

    const updateResult = await caller.experiments.update({
      id: createdExperimentId,
      data: {
        title: "Updated Test Experiment",
        imageUrl: "https://example.com/updated-image.jpg",
      },
    });

    expect(updateResult).toBeDefined();
    expect(updateResult.title).toBe("Updated Test Experiment");
    expect(updateResult.imageUrl).toBe("https://example.com/updated-image.jpg");

    // Verify the update persisted by fetching again
    const fetchResult = await caller.experiments.getById(createdExperimentId);
    expect(fetchResult?.title).toBe("Updated Test Experiment");
    expect(fetchResult?.imageUrl).toBe("https://example.com/updated-image.jpg");
  });

  it("should list all experiments including the created one", async () => {
    const caller = appRouter.createCaller(adminCtx);

    const result = await caller.experiments.list();

    expect(Array.isArray(result)).toBe(true);
    const found = result.find((exp) => exp.id === createdExperimentId);
    expect(found).toBeDefined();
    expect(found?.title).toBe("Updated Test Experiment");
  });

  it("should delete an experiment", async () => {
    const caller = appRouter.createCaller(adminCtx);

    const deleteResult = await caller.experiments.delete(createdExperimentId);

    expect(deleteResult).toBeDefined();
  });

  it("should verify deletion persisted", async () => {
    const caller = appRouter.createCaller(adminCtx);

    // After deletion, the experiment should not be in the list
    const result = await caller.experiments.list();
    const found = result.find((exp) => exp.id === createdExperimentId);
    expect(found).toBeUndefined();
  });

  it("should prevent non-admin from creating experiments", async () => {
    const userCtx: TrpcContext = {
      user: {
        id: 2,
        openId: "test-user",
        email: "user@test.com",
        name: "Test User",
        loginMethod: "test",
        role: "user" as const,
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

    const caller = appRouter.createCaller(userCtx);

    try {
      await caller.experiments.create({
        title: "Unauthorized Experiment",
        categoryId: 1,
        problem: "Test",
        objective: "Test",
        materials: "Test",
        procedure: "Test",
        chemicalExplanation: "Test",
        simplifiedExplanation: "Test",
        dailyApplication: "Test",
        epi: "Test",
        risks: "Test",
        estimatedTime: "30 min",
        level: "fundamental",
      });

      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });
});
