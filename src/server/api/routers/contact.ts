import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { contacts } from "~/server/db/schema";

export const contactRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        url: z.string().url(),
        frequency: z.enum([
          "weekly",
          "biweekly",
          "monthly",
          "quarterly",
          "annually",
        ]),
        timePreference: z.enum([
          "any",
          "morning",
          "lunchtime",
          "afternoon",
          "evening",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(contacts).values({
        name: input.name,
        createdById: ctx.session.user.id,
        url: input.url,
        frequency: input.frequency,
        timePreference: input.timePreference,
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        url: z.string().url().optional(),
        frequency: z
          .enum(["weekly", "biweekly", "monthly", "quarterly", "annually"])
          .optional(),
        timePreference: z
          .enum(["any", "morning", "lunchtime", "afternoon", "evening"])
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(contacts)
        .set({
          createdById: ctx.session.user.id,
          url: input.url,
          frequency: input.frequency,
          timePreference: input.timePreference,
        })
        .where(
          and(
            eq(contacts.createdById, ctx.session.user.id),
            eq(contacts.id, input.id),
          ),
        );
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(contacts)
        .where(
          and(
            eq(contacts.createdById, ctx.session.user.id),
            eq(contacts.id, input.id),
          ),
        );
    }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.contacts.findMany({
      orderBy: (contacts, { desc }) => [desc(contacts.createdAt)],
    });
  }),
});
