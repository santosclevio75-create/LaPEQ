import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import {
  getAllDesignStyles,
  getDesignStylesByComponent,
  saveDesignStyle,
  deleteDesignStyle,
} from "../db";

export const designStylesRouter = router({
  list: publicProcedure.query(async () => {
    return getAllDesignStyles();
  }),

  getByComponent: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return getDesignStylesByComponent(input);
    }),

  save: adminProcedure
    .input(
      z.object({
        componentName: z.string(),
        cssClass: z.string(),
        cssValue: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return saveDesignStyle(input);
    }),

  delete: adminProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      return deleteDesignStyle(input);
    }),
});
