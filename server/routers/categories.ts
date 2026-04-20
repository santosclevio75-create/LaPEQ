import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../db";
import { TRPCError } from "@trpc/server";

// Schema for category creation/update
const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const categoriesRouter = router({
  /**
   * Public: Get all categories
   */
  list: publicProcedure.query(async () => {
    return getAllCategories();
  }),

  /**
   * Public: Get category by ID
   */
  getById: publicProcedure.input(z.number()).query(async ({ input }) => {
    const category = await getCategoryById(input);
    if (!category) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Category not found",
      });
    }
    return category;
  }),

  /**
   * Admin: Create category
   */
  create: protectedProcedure
    .input(categorySchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can create categories",
        });
      }

      return createCategory(input);
    }),

  /**
   * Admin: Update category
   */
  update: protectedProcedure
    .input(z.object({ id: z.number(), data: categorySchema.partial() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update categories",
        });
      }

      const category = await getCategoryById(input.id);
      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return updateCategory(input.id, input.data);
    }),

  /**
   * Admin: Delete category
   */
  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete categories",
        });
      }

      const category = await getCategoryById(input);
      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return deleteCategory(input);
    }),
});
