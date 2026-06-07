import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import getArticles from "./getArticles";

vi.mock("axios");

describe("getArticles url builder", () => {
  const headers = { Authorization: "Token x" };

  beforeEach(() => {
    axios.mockResolvedValue({ data: { articles: [], articlesCount: 0 } });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("omits the status param when status is not provided", async () => {
    await getArticles({ headers, location: "global", page: 0 });
    const call = axios.mock.calls[0][0];
    expect(call.url).not.toContain("status=");
  });

  it("appends status=draft when drafts are requested for own profile", async () => {
    await getArticles({ headers, location: "drafts", username: "me", page: 0 });
    const call = axios.mock.calls[0][0];
    expect(call.url).toContain("author=me");
    expect(call.url).toContain("status=draft");
  });

  it("does not add status for non-draft locations (favorites)", async () => {
    await getArticles({ headers, location: "favorites", username: "x", page: 0 });
    const call = axios.mock.calls[0][0];
    expect(call.url).not.toContain("status=");
  });
});
