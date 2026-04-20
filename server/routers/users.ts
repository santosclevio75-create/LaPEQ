import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getAllUsers } from "../db";
import { TRPCError } from "@trpc/server";

export const usersRouter = router({
  /**
   * Admin: Get all users
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can view all users",
      });
    }
    return getAllUsers();
  }),
});
