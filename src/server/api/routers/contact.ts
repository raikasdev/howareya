import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { contacts } from "~/server/db/schema";
import { client } from "~/trigger";

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
      const contact = await ctx.db
        .insert(contacts)
        .values({
          name: input.name,
          createdById: ctx.session.user.id,
          url: input.url,
          frequency: input.frequency,
          timePreference: input.timePreference,
        })
        .returning();
      if (!contact[0]?.id) return;

      await client.sendEvent({
        name: "schedule.contact",
        payload: { id: contact[0].id, userId: ctx.session.user.id },
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

  snooze: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(contacts)
        .set({
          latestMeeting: new Date(),
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
      where: eq(contacts.createdById, ctx.session.user.id),
      orderBy: (contacts, { desc }) => [desc(contacts.createdAt)],
    });
  }),

  get: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(contacts)
        .where(
          and(
            eq(contacts.id, input.id),
            eq(contacts.createdById, ctx.session.user.id),
          ),
        )
        .limit(1);

      return rows[0] ?? null;
    }),

  scheduleNow: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await client.sendEvent({
        name: "schedule.contact",
        payload: { id: input.id, userId: ctx.session.user.id },
      });
    }),
});
