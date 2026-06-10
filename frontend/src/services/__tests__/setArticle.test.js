import axios from "axios";
import setArticle from "../setArticle";

vi.mock("axios");

describe("setArticle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.mockResolvedValue({ data: { article: { slug: "test-article" } } });
  });

  const defaultArgs = {
    headers: { Authorization: "Token test" },
    body: "article body",
    description: "article description",
    tagList: ["tag1"],
    title: "Test Article",
  };

  it("should include published: false when saving as draft", async () => {
    await setArticle({ ...defaultArgs, published: false });

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          article: expect.objectContaining({ published: false }),
        }),
      }),
    );
  });

  it("should include published: true when publishing", async () => {
    await setArticle({ ...defaultArgs, published: true });

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          article: expect.objectContaining({ published: true }),
        }),
      }),
    );
  });

  it("should include scheduledAt when scheduling", async () => {
    const futureDate = "2026-07-01T12:00:00Z";
    await setArticle({ ...defaultArgs, published: false, scheduledAt: futureDate });

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          article: expect.objectContaining({ scheduledAt: futureDate }),
        }),
      }),
    );
  });
});
