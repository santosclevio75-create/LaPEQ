import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  getAllLoans,
  getLoanById,
  createLoan,
  updateLoan,
  deleteLoan,
  getExperimentById,
  getUserById,
} from "../db";
import { TRPCError } from "@trpc/server";
import {
  sendLoanApprovalEmail,
  sendLoanRejectionEmail,
  sendReturnConfirmationEmail,
} from "../_core/email";
// Schema for loan creation/update
const loanSchema = z.object({
  name: z.string().min(1),
  institution: z.string().min(1),
  experimentId: z.number(),
  withdrawalDate: z.date(),
  returnDate: z.date(),
  status: z.enum(["pending", "approved", "rejected", "returned"]).optional(),
  notes: z.string().optional(),
});

export const loansRouter = router({
  /**
   * Public: Create loan request with automatic approval if available
   */
  create: publicProcedure
    .input(loanSchema.omit({ status: true, notes: true }))
    .mutation(async ({ input, ctx }) => {
      // Verify experiment exists
      const experiment = await getExperimentById(input.experimentId);
      if (!experiment) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Experiment not found",
        });
      }

      if (input.returnDate <= input.withdrawalDate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Data de devolucao deve ser posterior a data de retirada",
        });
      }

      // Use current user ID if authenticated, otherwise use 1 (guest/admin)
      const userId = ctx.user?.id || 1;

      // For now, always set status to pending (quantity field will be added later)
      const status = "pending";

      const loan = await createLoan({
        ...input,
        userId,
        status: "pending",
      });

      // Email notifications will be sent when admin approves
      // (after quantity field is added to database)

      return loan;
    }),

  /**
   * Admin: Get all loans
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can view all loans",
      });
    }
    return getAllLoans();
  }),

  /**
   * Admin: Get all loans (alias for getAll)
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can view all loans",
      });
    }
    return getAllLoans();
  }),

  /**
   * Admin: Get loan by ID
   */
  getById: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can view loan details",
      });
    }

    const loan = await getLoanById(input);
    if (!loan) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Loan not found",
      });
    }
    return loan;
  }),

  /**
   * Admin: Update loan status with email notifications
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "rejected", "returned"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update loan status",
        });
      }

      const loan = await getLoanById(input.id);
      if (!loan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Loan not found",
        });
      }

      const updatedLoan = await updateLoan(input.id, {
        status: input.status,
        notes: input.notes,
      });

      // Send email notifications
      try {
        const user = await getUserById(loan.userId);
        const experiment = await getExperimentById(loan.experimentId);

        if (user?.email && experiment) {
          if (input.status === "approved") {
            await sendLoanApprovalEmail(
              user.email,
              user.name || "Usuário",
              experiment.title,
              loan.withdrawalDate,
              loan.returnDate
            );
          } else if (input.status === "rejected") {
            await sendLoanRejectionEmail(
              user.email,
              user.name || "Usuário",
              experiment.title,
              input.notes
            );
          } else if (input.status === "returned") {
            await sendReturnConfirmationEmail(
              user.email,
              user.name || "Usuário",
              experiment.title,
              new Date()
            );
          }
        }
      } catch (error) {
        console.error("Error sending email notification:", error);
        // Don't throw - email failure shouldn't block status update
      }

      return updatedLoan;
    }),

  /**
   * Admin: Confirm return of loan
   */
  confirmReturn: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can confirm returns",
        });
      }

      const loan = await getLoanById(input.id);
      if (!loan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Loan not found",
        });
      }

      if (loan.status !== "approved") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only approved loans can be returned",
        });
      }

      return updateLoan(input.id, {
        status: "returned",
      });
    }),

  /**
   * Admin: Delete loan
   */
  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete loans",
        });
      }

      const loan = await getLoanById(input);
      if (!loan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Loan not found",
        });
      }

      return deleteLoan(input);
    }),
});
