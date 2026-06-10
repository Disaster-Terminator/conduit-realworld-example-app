import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import setArticle from "./setArticle";

vi.mock("axios");

describe("setArticle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.mockResolvedValue({ data: { article: { slug: "test-article" } } });
  });

  it("sends status=draft when saving draft", async () => {
    await setArticle({
      headers: {},
      title: "Test",
      description: "Desc",
      body: "Body",
      tagList: [],
      status: "draft",
    });
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        url: "api/articles",
        data: {
          article: expect.objectContaining({ status: "draft" }),
        },
      }),
    );
  });

  it("sends status=published when publishing", async () => {
    await setArticle({
      headers: {},
      slug: "test-article",
      title: "Test",
      description: "Desc",
      body: "Body",
      tagList: [],
      status: "published",
    });
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PUT",
        url: "api/articles/test-article",
        data: {
          article: expect.objectContaining({ status: "published" }),
        },
      }),
    );
  });

  it("does not send status for published article update", async () => {
    await setArticle({
      headers: {},
      slug: "test-article",
      title: "Test",
      description: "Desc",
      body: "Body",
      tagList: [],
    });
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PUT",
        data: {
          article: expect.not.objectContaining({ status: undefined }),
        },
      }),
    );
  });

  it("returns slug from response", async () => {
    const result = await setArticle({
      headers: {},
      title: "Test",
      description: "Desc",
      body: "Body",
      tagList: [],
      status: "published",
    });
    expect(result).toBe("test-article");
  });
});
