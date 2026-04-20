import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  getAllBookLoans,
  getBookLoanById,
  createBookLoan,
  updateBookLoan,
  deleteBookLoan,
} from "../db";
import { TRPCError } from "@trpc/server";

// Schema for book loan creation/update
const bookLoanSchema = z.object({
  name: z.string().min(1),
  institution: z.string().min(1),
  email: z.string().email("Email inválido"),
  bookTitle: z.string().min(1),
  author: z.string().optional(),
  withdrawalDate: z.date(),
  returnDate: z.date(),
  status: z.enum(["pending", "approved", "rejected", "returned"]).optional(),
  notes: z.string().optional(),
});

export const bookLoansRouter = router({
  /**
   * Public: Create book loan request
   */
  create: publicProcedure
    .input(bookLoanSchema.omit({ status: true, notes: true }))
    .mutation(async ({ input, ctx }) => {
      if (input.returnDate <= input.withdrawalDate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Data de devolucao deve ser posterior a data de retirada",
        });
      }

      // Use current user ID if authenticated, otherwise use 1 (guest/admin)
      const userId = ctx.user?.id || 1;

      return createBookLoan({
        ...input,
        userId,
        email: input.email,
        author: input.author?.trim() || undefined,
        status: "pending",
      });
    }),

  /**
   * Admin: Get all book loans
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can view all book loans",
      });
    }
    return getAllBookLoans();
  }),

  /**
   * Admin: Get all book loans (alias for getAll)
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can view all book loans",
      });
    }
    return getAllBookLoans();
  }),

  /**
   * Admin: Get book loan by ID
   */
  getById: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can view book loan details",
      });
    }

    const bookLoan = await getBookLoanById(input);
    if (!bookLoan) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Book loan not found",
      });
    }
    return bookLoan;
  }),

  /**
   * Admin: Update book loan status
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
          message: "Only admins can update book loan status",
        });
      }

      const bookLoan = await getBookLoanById(input.id);
      if (!bookLoan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Book loan not found",
        });
      }

      return updateBookLoan(input.id, {
        status: input.status,
        notes: input.notes,
      });
    }),

  /**
   * Admin: Delete book loan
   */
  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete book loans",
        });
      }

      const bookLoan = await getBookLoanById(input);
      if (!bookLoan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Book loan not found",
        });
      }

      return deleteBookLoan(input);
    }),
});
