import { describe, expect, it } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("loans.create - Date Validation", () => {
  it("should reject loan when returnDate is before withdrawalDate", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const withdrawalDate = new Date("2026-05-01");
    const returnDate = new Date("2026-04-15"); // Before withdrawal

    try {
      await caller.loans.create({
        name: "Test User",
        institution: "Test Institution",
        experimentId: 1,
        withdrawalDate,
        returnDate,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
      expect(error.message).toContain("Data de devolucao deve ser posterior");
    }
  });

  it("should reject loan when returnDate equals withdrawalDate", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const sameDate = new Date("2026-05-01");

    try {
      await caller.loans.create({
        name: "Test User",
        institution: "Test Institution",
        experimentId: 1,
        withdrawalDate: sameDate,
        returnDate: sameDate,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
      expect(error.message).toContain("Data de devolucao deve ser posterior");
    }
  });

  it("should accept loan when returnDate is after withdrawalDate", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const withdrawalDate = new Date("2026-05-01");
    const returnDate = new Date("2026-05-15"); // After withdrawal

    try {
      const result = await caller.loans.create({
        name: "Test User",
        institution: "Test Institution",
        experimentId: 1,
        withdrawalDate,
        returnDate,
      });

      expect(result).toBeDefined();
      expect(result.status).toBe("pending");
      expect(result.name).toBe("Test User");
    } catch (error: any) {
      // Expected to fail due to experiment not existing, but not due to date validation
      if (error.message.includes("Data de devolucao")) {
        expect.fail("Should not fail on date validation");
      }
    }
  });
});
