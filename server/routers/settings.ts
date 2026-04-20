import { z } from "zod";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getSetting, setSetting, getAllSettings } from "../db";

export const settingsRouter = router({
  // Get a specific setting (public)
  get: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const value = await getSetting(input.key);
      return { key: input.key, value };
    }),

  // Get all settings (public)
  getAll: publicProcedure.query(async () => {
    return await getAllSettings();
  }),

  // Set a setting (admin only)
  set: adminProcedure
    .input(z.object({ key: z.string(), value: z.string() }))
    .mutation(async ({ input }) => {
      await setSetting(input.key, input.value);
      return { success: true, key: input.key, value: input.value };
    }),

  // Update logo size (admin only)
  updateLogoSize: adminProcedure
    .input(z.object({ size: z.enum(["small", "medium", "large"]) }))
    .mutation(async ({ input }) => {
      const sizeMap = {
        small: "h-8",
        medium: "h-12",
        large: "h-16",
      };
      await setSetting("logoSize", sizeMap[input.size]);
      return { success: true, size: input.size };
    }),

  // Get logo size (public)
  getLogoSize: publicProcedure.query(async () => {
    const size = await getSetting("logoSize");
    return { size: size || "h-10" };
  }),
});
