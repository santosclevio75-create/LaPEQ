import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  getExperimentImages,
  addExperimentImage,
  deleteExperimentImage,
  updateExperimentImage,
  getExperimentById,
} from "../db";
import { TRPCError } from "@trpc/server";
import { storagePut } from "../storage";

// Schema for experiment image
const experimentImageSchema = z.object({
  experimentId: z.number(),
  imageUrl: z.string().url(),
  caption: z.string().optional(),
  order: z.number().optional(),
});

export const experimentImagesRouter = router({
  /**
   * Public: Get all images for an experiment
   */
  getByExperiment: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return getExperimentImages(input);
    }),

  /**
   * Admin: Add image to experiment
   */
  add: protectedProcedure
    .input(experimentImageSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can add experiment images",
        });
      }

      // Verify experiment exists
      const experiment = await getExperimentById(input.experimentId);
      if (!experiment) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Experiment not found",
        });
      }

      return addExperimentImage({
        experimentId: input.experimentId,
        imageUrl: input.imageUrl,
        caption: input.caption,
        order: input.order || 0,
      });
    }),

  /**
   * Admin: Delete image from experiment
   */
  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete experiment images",
        });
      }

      return deleteExperimentImage(input);
    }),

  /**
   * Admin: Update image caption or order
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        caption: z.string().optional(),
        order: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update experiment images",
        });
      }

      return updateExperimentImage(input.id, {
        caption: input.caption,
        order: input.order,
      });
    }),

  /**
   * Admin: Upload image file to S3 and add to experiment
   */
  uploadAndAdd: protectedProcedure
    .input(
      z.object({
        experimentId: z.number(),
        fileData: z.string(), // base64 encoded file
        fileName: z.string(),
        caption: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can upload experiment images",
        });
      }

      // Verify experiment exists
      const experiment = await getExperimentById(input.experimentId);
      if (!experiment) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Experiment not found",
        });
      }

      try {
        // Convert base64 to buffer
        const buffer = Buffer.from(input.fileData.split(",")[1] || input.fileData, "base64");
        
        // Generate unique file name
        const timestamp = Date.now();
        const fileKey = `experiments/${input.experimentId}/images/${timestamp}-${input.fileName}`;
        
        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, "image/jpeg");
        
        // Get current image count for order
        const images = await getExperimentImages(input.experimentId);
        
        // Add image to database
        return addExperimentImage({
          experimentId: input.experimentId,
          imageUrl: url,
          caption: input.caption,
          order: images.length,
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload image",
        });
      }
    }),
});
