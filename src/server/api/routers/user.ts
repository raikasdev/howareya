import { eq } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { users } from "~/server/db/schema";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    const dbRes = await ctx.db.select({ apiKey: users.apiKey }).from(users).where(eq(users.id, ctx.session.user.id)).limit(1);
    
    return {
      apiKey: dbRes && dbRes.length === 1 ? dbRes[0]?.apiKey ?? null : null,
    };
  }),
  setAPIKey: protectedProcedure
    .input(z.object({ apiKey: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const url = new URL(`https://api.cal.com/api/v1/me`);
      const search = new URLSearchParams();
      search.set('apiKey', input.apiKey);
      url.search = search.toString();

      try {
        const res = await fetch(url.toString());
        const json = await res.json() as { user: Record<string, unknown> };
        await ctx.db.update(users)
          .set({
            apiKey: input.apiKey,
          })
          .where(eq(users.id, ctx.session.user.id));
        
        return {
          success: true,
          calUser: json.user,
        };
      } catch(e) {
        return {
          success: false,
          error: 'Invalid API key',
        };
      }
    }),
});
