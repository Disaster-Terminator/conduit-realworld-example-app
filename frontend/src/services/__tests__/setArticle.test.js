import { vi, describe, it, expect } from "vitest";
import axios from "axios";

vi.mock("axios");

import setArticle from "../setArticle";

describe("setArticle", () => {
  it("不传 status 时不包含 status 字段", async () => {
    axios.mockResolvedValue({ data: { article: { slug: "test-article" } } });

    await setArticle({
      headers: { Authorization: "Token xxx" },
      title: "Test",
      description: "Desc",
      body: "Body",
      tagList: [],
    });

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { article: { title: "Test", description: "Desc", body: "Body", tagList: [] } },
      }),
    );
  });

  it("传 status=draft 时请求体包含 status", async () => {
    axios.mockResolvedValue({ data: { article: { slug: "draft-article" } } });

    await setArticle({
      headers: { Authorization: "Token xxx" },
      title: "Draft",
      description: "Desc",
      body: "Body",
      tagList: [],
      status: "draft",
    });

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { article: { title: "Draft", description: "Desc", body: "Body", tagList: [], status: "draft" } },
      }),
    );
  });

  it("传 status=published 时请求体包含 status", async () => {
    axios.mockResolvedValue({ data: { article: { slug: "pub-article" } } });

    await setArticle({
      headers: { Authorization: "Token xxx" },
      title: "Published",
      description: "Desc",
      body: "Body",
      tagList: [],
      status: "published",
    });

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { article: { title: "Published", description: "Desc", body: "Body", tagList: [], status: "published" } },
      }),
    );
  });

  it("POST 时使用正确的 URL", async () => {
    axios.mockResolvedValue({ data: { article: { slug: "new-article" } } });

    await setArticle({
      headers: { Authorization: "Token xxx" },
      title: "New",
      description: "Desc",
      body: "Body",
      tagList: [],
    });

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        url: "api/articles",
      }),
    );
  });

  it("PUT 时使用正确的 URL", async () => {
    axios.mockResolvedValue({ data: { article: { slug: "updated-slug" } } });

    await setArticle({
      headers: { Authorization: "Token xxx" },
      slug: "my-article",
      title: "Updated",
      description: "Desc",
      body: "Body",
      tagList: [],
    });

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PUT",
        url: "api/articles/my-article",
      }),
    );
  });
});
