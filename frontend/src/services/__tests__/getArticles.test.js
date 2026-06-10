import axios from "axios";
import getArticles from "../getArticles";

vi.mock("axios");

describe("getArticles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.mockResolvedValue({ data: { articles: [], articlesCount: 0 } });
  });

  const defaultArgs = {
    headers: { Authorization: "Token test" },
    location: "profile",
    username: "testuser",
  };

  it("should include status=draft when fetching drafts", async () => {
    await getArticles({ ...defaultArgs, status: "draft" });

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining("status=draft"),
      }),
    );
  });

  it("should not include status when not specified", async () => {
    await getArticles(defaultArgs);

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.not.stringContaining("status="),
      }),
    );
  });

  it("should include status=draft in pagination URL", async () => {
    await getArticles({ ...defaultArgs, status: "draft", page: 1, limit: 3 });

    const callArg = axios.mock.calls[0][0];
    expect(callArg.url).toContain("status=draft");
    expect(callArg.url).toContain("offset=1");
  });
});
