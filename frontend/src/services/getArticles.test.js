import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

vi.mock("axios");

import getArticles from "./getArticles";

describe("getArticles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.mockResolvedValue({ data: { articles: [], articlesCount: 0 } });
  });

  it("drafts 位置类型使用正确的 URL", async () => {
    await getArticles({
      headers: { Authorization: "Token test" },
      location: "drafts",
      username: "testuser",
    });

    expect(axios).toHaveBeenCalledWith({
      url: "api/articles?author=testuser&&status=draft&&limit=3&&offset=0",
      headers: { Authorization: "Token test" },
    });
  });

  it("profile 位置类型使用正确的 URL", async () => {
    await getArticles({
      headers: { Authorization: "Token test" },
      location: "profile",
      username: "testuser",
    });

    expect(axios).toHaveBeenCalledWith({
      url: "api/articles?author=testuser&&limit=3&&offset=0",
      headers: { Authorization: "Token test" },
    });
  });
});
