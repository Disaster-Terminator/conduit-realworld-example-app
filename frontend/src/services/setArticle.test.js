import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

vi.mock("axios");

import setArticle from "./setArticle";

const mockHeaders = { Authorization: "Token test" };

describe("setArticle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("发送 POST 创建文章时传递 status", async () => {
    axios.mockResolvedValue({ data: { article: { slug: "test-title" } } });

    await setArticle({
      headers: mockHeaders,
      title: "Test Title",
      description: "Test description",
      body: "Test body",
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

  it("发送 PUT 更新文章时传递 status", async () => {
    axios.mockResolvedValue({ data: { article: { slug: "test-title" } } });

    await setArticle({
      headers: mockHeaders,
      slug: "test-title",
      title: "Test Title",
      description: "Test description",
      body: "Test body",
      tagList: [],
      status: "published",
    });

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PUT",
        url: "api/articles/test-title",
        data: {
          article: expect.objectContaining({ status: "published" }),
        },
      }),
    );
  });
});
