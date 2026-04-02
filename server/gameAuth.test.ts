import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type CookieCall = {
  name: string;
  value?: string;
  options: Record<string, unknown>;
};

function createPublicContext(): { ctx: TrpcContext; setCookies: CookieCall[]; clearedCookies: CookieCall[] } {
  const setCookies: CookieCall[] = [];
  const clearedCookies: CookieCall[] = [];

  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        setCookies.push({ name, value, options });
      },
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, setCookies, clearedCookies };
}

describe("gameAuth", () => {
  it("me returns null when not authenticated", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.gameAuth.me();
    expect(result).toBeNull();
  });

  it("register validates pseudo length", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Pseudo trop court (< 2 chars) should throw validation error
    await expect(
      caller.gameAuth.register({
        pseudo: "A",
        email: "test@test.com",
        password: "password123",
      })
    ).rejects.toThrow();
  });

  it("register validates email format", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Invalid email should throw validation error
    await expect(
      caller.gameAuth.register({
        pseudo: "TestUser",
        email: "not-an-email",
        password: "password123",
      })
    ).rejects.toThrow();
  });

  it("register validates password length", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Password too short (< 6 chars) should throw validation error
    await expect(
      caller.gameAuth.register({
        pseudo: "TestUser",
        email: "test@test.com",
        password: "12345",
      })
    ).rejects.toThrow();
  });

  it("login validates required fields", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Empty identifier should throw validation error
    await expect(
      caller.gameAuth.login({
        identifier: "",
        password: "password123",
      })
    ).rejects.toThrow();
  });

  it("logout clears the game_session cookie", async () => {
    const { ctx, clearedCookies } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.gameAuth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe("game_session");
    expect(clearedCookies[0]?.options).toMatchObject({
      maxAge: -1,
    });
  });
});
