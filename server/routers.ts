import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { experimentsRouter } from "./routers/experiments";
import { categoriesRouter } from "./routers/categories";
import { loansRouter } from "./routers/loans";
import { notificationsRouter } from "./routers/notifications";
import { bookLoansRouter } from "./routers/bookLoans";
import { experimentImagesRouter } from "./routers/experimentImages";
import { settingsRouter } from "./routers/settings";
import { designStylesRouter } from "./routers/designStyles";
import { usersRouter } from "./routers/users";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  experiments: experimentsRouter,
  categories: categoriesRouter,
  loans: loansRouter,
  notifications: notificationsRouter,
  bookLoans: bookLoansRouter,
  experimentImages: experimentImagesRouter,
  settings: settingsRouter,
  designStyles: designStylesRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
