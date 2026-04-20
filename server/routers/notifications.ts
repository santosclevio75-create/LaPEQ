import { router, protectedProcedure } from "../_core/trpc";
import { createNotification, getNotificationsByUser, markNotificationAsRead, deleteNotification } from "../db";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const notificationsRouter = router({
  /**
   * Get all notifications for current user
   */
  getByUser: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getNotificationsByUser(ctx.user.id);
    } catch (err) {
      console.error("[API Query Error]", err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch notifications",
      });
    }
  }),

  /**
   * Mark notification as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        return await markNotificationAsRead(input.id, ctx.user.id);
      } catch (err) {
        console.error("[API Mutation Error]", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update notification",
        });
      }
    }),

  /**
   * Create notification (admin only)
   */
  create: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        type: z.enum([
          "loan_pending",
          "loan_approved",
          "loan_rejected",
          "loan_returned",
          "book_loan_pending",
          "book_loan_approved",
          "book_loan_rejected",
          "book_loan_returned",
        ]),
        title: z.string(),
        message: z.string(),
        loanId: z.number().optional(),
        bookLoanId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can create notifications",
          });
        }

        return await createNotification({
          userId: input.userId,
          type: input.type,
          title: input.title,
          message: input.message,
          loanId: input.loanId,
          bookLoanId: input.bookLoanId,
        });
      } catch (err) {
        if (err instanceof TRPCError) {
          throw err;
        }
        console.error("[API Mutation Error]", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create notification",
        });
      }
    }),

  /**
   * Delete notification
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        return await deleteNotification(input.id, ctx.user.id);
      } catch (err) {
        console.error("[API Mutation Error]", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete notification",
        });
      }
    }),
});
