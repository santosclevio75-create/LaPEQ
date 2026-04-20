import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  getAllExperiments,
  getExperimentById,
  getExperimentsByCategory,
  createExperiment,
  updateExperiment,
  deleteExperiment,
  getAllCategories,
} from "../db";
import { TRPCError } from "@trpc/server";

// Schema for experiment creation/update
const experimentSchema = z.object({
  title: z.string().min(1),
  categoryId: z.number(),
  problem: z.string().optional(),
  objective: z.string().optional(),
  materials: z.string().optional(),
  procedure: z.string().optional(),
  chemicalExplanation: z.string().optional(),
  simplifiedExplanation: z.string().optional(),
  dailyApplication: z.string().optional(),
  epi: z.string().optional(),
  risks: z.string().optional(),
  estimatedTime: z.string().optional(),
  level: z.enum(["fundamental", "medio"]),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
});

export const experimentsRouter = router({
  /**
   * Public: Get all experiments
   */
  list: publicProcedure.query(async () => {
    return getAllExperiments();
  }),

  /**
   * Public: Get all experiments (alias for getAll)
   */
  getAll: publicProcedure.query(async () => {
    return getAllExperiments();
  }),

  /**
   * Public: Get experiment by ID
   */
  getById: publicProcedure.input(z.number()).query(async ({ input }) => {
    const experiment = await getExperimentById(input);
    if (!experiment) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Experiment not found",
      });
    }
    return experiment;
  }),

  /**
   * Public: Get experiments by category
   */
  getByCategory: publicProcedure.input(z.number()).query(async ({ input }) => {
    return getExperimentsByCategory(input);
  }),

  /**
   * Public: Search experiments by title
   */
  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const allExperiments = await getAllExperiments();
      return allExperiments.filter((exp) =>
        exp.title.toLowerCase().includes(input.query.toLowerCase())
      );
    }),

  /**
   * Public: Get experiments with filter and sort
   */
  listWithFilters: publicProcedure
    .input(
      z.object({
        categoryId: z.number().optional(),
        level: z.enum(["fundamental", "medio"]).optional(),
        sortBy: z.enum(["name-asc", "name-desc", "date-newest", "date-oldest", "popularity"]).optional(),
      })
    )
    .query(async ({ input }) => {
      let experiments = await getAllExperiments();

      // Apply category filter
      if (input.categoryId) {
        experiments = experiments.filter((exp) => exp.categoryId === input.categoryId);
      }

      // Apply level filter
      if (input.level) {
        experiments = experiments.filter((exp) => exp.level === input.level);
      }

      // Apply sorting
      if (input.sortBy) {
        switch (input.sortBy) {
          case "name-asc":
            experiments.sort((a, b) => a.title.localeCompare(b.title));
            break;
          case "name-desc":
            experiments.sort((a, b) => b.title.localeCompare(a.title));
            break;
          case "date-newest":
            experiments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
          case "date-oldest":
            experiments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            break;
          case "popularity":
            experiments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
        }
      }

      return experiments;
    }),

  /**
   * Admin: Create experiment
   */
  create: protectedProcedure
    .input(experimentSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can create experiments",
        });
      }

      // Verify category exists
      const categories = await getAllCategories();
      const categoryExists = categories.some((c) => c.id === input.categoryId);
      if (!categoryExists) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Category not found",
        });
      }

      return createExperiment(input);
    }),

  /**
   * Admin: Update experiment
   */
  update: protectedProcedure
    .input(z.object({ id: z.number(), data: experimentSchema.partial() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update experiments",
        });
      }

      const experiment = await getExperimentById(input.id);
      if (!experiment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Experiment not found",
        });
      }

      return updateExperiment(input.id, input.data);
    }),

  /**
   * Admin: Delete experiment
   */
  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete experiments",
        });
      }

      const experiment = await getExperimentById(input);
      if (!experiment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Experiment not found",
        });
      }

      return deleteExperiment(input);
    }),
});
