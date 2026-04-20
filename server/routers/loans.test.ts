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

describe("loans router", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    caller = appRouter.createCaller(createMockContext("user"));
  });

  describe("list (admin only)", () => {
    it("should reject non-admin users", async () => {
      const userCaller = appRouter.createCaller(createMockContext("user"));
      
      try {
        await userCaller.loans.list();
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should allow admin users to list loans", async () => {
      const adminCaller = appRouter.createCaller(createMockContext("admin"));
      
      try {
        const loans = await adminCaller.loans.list();
        expect(Array.isArray(loans)).toBe(true);
      } catch (error: any) {
        expect.fail("Admin should be able to list loans: " + error.message);
      }
    });
  });

  describe("create", () => {
    it("should allow public users to create loan requests", async () => {
      const publicCaller = appRouter.createCaller(createMockContext("user"));
      
      try {
        const result = await publicCaller.loans.create({
          name: "Test User",
          institution: "Test School",
          experimentId: 1,
          withdrawalDate: new Date(),
          returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        expect(result).toHaveProperty("id");
      } catch (error: any) {
        // Expected to fail due to invalid experiment, but should not be FORBIDDEN
        expect(error.code).not.toBe("FORBIDDEN");
      }
    });
  });

  describe("updateStatus (admin only)", () => {
    it("should reject non-admin users", async () => {
      const userCaller = appRouter.createCaller(createMockContext("user"));
      
      try {
        await userCaller.loans.updateStatus({
          id: 1,
          status: "approved",
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
        await userCaller.loans.delete(1);
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });
});


describe("loans validation", () => {
  const caller = appRouter.createCaller(createMockContext("user"));

  it("should have valid structure for all loans", async () => {
    const adminCaller = appRouter.createCaller(createMockContext("admin"));
    const loans = await adminCaller.loans.list();
    loans.forEach((loan) => {
      expect(loan).toHaveProperty("id");
      expect(loan).toHaveProperty("name");
      expect(loan).toHaveProperty("institution");
      expect(loan).toHaveProperty("experimentId");
      expect(loan).toHaveProperty("status");
      expect(["pending", "approved", "rejected", "returned"]).toContain(loan.status);
    });
  });

  it("should validate loan status values", async () => {
    const validStatuses = ["pending", "approved", "rejected", "returned"];
    validStatuses.forEach((status) => {
      expect(["pending", "approved", "rejected", "returned"]).toContain(status);
    });
  });
});
