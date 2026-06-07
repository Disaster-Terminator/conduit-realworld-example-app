import { describe, expect, test } from "vitest";
import { buildArticlesUrl } from "./getArticles";

describe("buildArticlesUrl", () => {
  test("profile location encodes the author username", () => {
    const url = buildArticlesUrl({ location: "profile", username: "alice" });
    expect(url).toContain("api/articles?");
    expect(url).toContain("author=alice");
    expect(url).not.toContain("status=");
  });

  test("profile location forwards status=draft", () => {
    const url = buildArticlesUrl({
      location: "profile",
      username: "alice",
      status: "draft",
    });
    expect(url).toContain("author=alice");
    expect(url).toContain("status=draft");
  });

  test("global location passes through status=published", () => {
    const url = buildArticlesUrl({ location: "global", status: "published" });
    expect(url).toContain("api/articles?");
    expect(url).toContain("status=published");
    expect(url).not.toContain("author=");
  });

  test("feed location omits status (server forces published)", () => {
    const url = buildArticlesUrl({ location: "feed", status: "draft" });
    expect(url).toContain("api/articles/feed");
    expect(url).not.toContain("status=");
  });
});
