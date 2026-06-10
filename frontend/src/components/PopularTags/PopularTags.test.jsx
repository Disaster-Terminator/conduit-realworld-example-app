import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PopularTags from "./PopularTags";

const mockGetTags = vi.fn();

vi.mock("../../services/getTags", () => ({
  default: () => mockGetTags(),
}));

vi.mock("../../context/FeedContext", () => ({
  useFeedContext: () => ({ changeTab: vi.fn() }),
}));

describe("PopularTags", () => {
  beforeEach(() => {
    mockGetTags.mockClear();
  });

  it("renders tag list when tags exist", async () => {
    mockGetTags.mockResolvedValue([{ name: "react", count: 30 }]);
    render(<PopularTags />);
    await waitFor(() => {
      expect(screen.getByText("react (30)")).toBeInTheDocument();
    });
  });

  it("returns null when no tags and not loading", async () => {
    mockGetTags.mockResolvedValue([]);
    const { container } = render(<PopularTags />);
    await waitFor(() => expect(container.innerHTML).toBe(""));
  });

  it("shows loading text while fetching", () => {
    mockGetTags.mockReturnValue(new Promise(() => {}));
    render(<PopularTags />);
    expect(screen.getByText("Loading tags...")).toBeInTheDocument();
  });
});
