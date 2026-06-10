import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import getArticles from "./getArticles";

vi.mock("axios");

describe("getArticles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.mockResolvedValue({ data: { articles: [], articlesCount: 0 } });
  });

  it("calls global URL with status=published by default", async () => {
    await getArticles({ headers: {}, location: "global" });
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "api/articles?limit=3&&offset=0&&status=published",
      }),
    );
  });

  it("calls profile URL with status=published", async () => {
    await getArticles({ headers: {}, location: "profile", username: "john" });
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "api/articles?author=john&&limit=3&&offset=0&&status=published",
      }),
    );
  });

  it("calls favorites URL with status=published", async () => {
    await getArticles({ headers: {}, location: "favorites", username: "john" });
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "api/articles?favorited=john&&limit=3&&offset=0&&status=published",
      }),
    );
  });

  it("calls tag URL with status=published", async () => {
    await getArticles({ headers: {}, location: "tag", tagName: "react" });
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "api/articles?tag=react&&limit=3&&offset=0&&status=published",
      }),
    );
  });

  it("calls feed URL without status filter", async () => {
    await getArticles({ headers: {}, location: "feed" });
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "api/articles/feed?limit=3&&offset=0",
      }),
    );
  });

  it("calls drafts URL with status=draft", async () => {
    await getArticles({ headers: {}, location: "drafts", username: "john" });
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "api/articles?author=john&&limit=3&&offset=0&&status=draft",
      }),
    );
  });

  it("passes headers through", async () => {
    const headers = { Authorization: "Token abc123" };
    await getArticles({ headers, location: "global" });
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({ headers }));
  });

  it("uses custom limit and page", async () => {
    await getArticles({ headers: {}, location: "global", limit: 10, page: 2 });
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "api/articles?limit=10&&offset=2&&status=published",
      }),
    );
  });
});
