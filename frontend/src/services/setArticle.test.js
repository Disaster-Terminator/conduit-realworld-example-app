import { vi, describe, it, expect, beforeEach } from "vitest";
import axios from "axios";

vi.mock("axios");

// Mock errorHandler to avoid side effects
vi.mock("../helpers/errorHandler", () => ({
  default: vi.fn(),
}));

describe("setArticle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.mockResolvedValue({ data: { article: { slug: "test-article" } } });
  });

  it("should pass coverImage in POST request body", async () => {
    const { default: setArticle } = await import("./setArticle");

    await setArticle({
      title: "Test",
      description: "Desc",
      body: "Body",
      coverImage: "https://example.com/cover.jpg",
      headers: {},
    });

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          article: expect.objectContaining({
            coverImage: "https://example.com/cover.jpg",
          }),
        },
        method: "POST",
      }),
    );
  });

  it("should pass coverImage in PUT request body", async () => {
    const { default: setArticle } = await import("./setArticle");

    await setArticle({
      title: "Test",
      description: "Desc",
      body: "Body",
      coverImage: "https://example.com/updated.jpg",
      slug: "test-article",
      headers: {},
    });

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          article: expect.objectContaining({
            coverImage: "https://example.com/updated.jpg",
          }),
        },
        method: "PUT",
      }),
    );
  });

  it("should work without coverImage (backward compatible)", async () => {
    const { default: setArticle } = await import("./setArticle");

    await setArticle({
      title: "Test",
      description: "Desc",
      body: "Body",
      headers: {},
    });

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          article: expect.not.objectContaining({
            coverImage: expect.anything(),
          }),
        },
      }),
    );
  });
});
