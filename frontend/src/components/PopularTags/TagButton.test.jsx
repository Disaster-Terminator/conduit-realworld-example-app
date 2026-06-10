import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TagButton from "./TagButton";

const mockChangeTab = vi.fn();

vi.mock("../../context/FeedContext", () => ({
  useFeedContext: () => ({ changeTab: mockChangeTab }),
}));

describe("TagButton", () => {
  beforeEach(() => {
    mockChangeTab.mockClear();
  });

  it("renders each tag with name and count", () => {
    const tags = [
      { name: "react", count: 30 },
      { name: "nodejs", count: 20 },
    ];
    render(<TagButton tagsList={tags} />);
    expect(screen.getByText("react (30)")).toBeInTheDocument();
    expect(screen.getByText("nodejs (20)")).toBeInTheDocument();
  });

  it("calls changeTab with correct tag name on click", () => {
    const tags = [{ name: "react", count: 30 }];
    render(<TagButton tagsList={tags} />);
    fireEvent.click(screen.getByText("react (30)"));
    expect(mockChangeTab).toHaveBeenCalledWith(
      expect.any(Object),
      "tag",
      "react",
    );
  });

  it("renders all tags without slicing", () => {
    const tags = Array.from({ length: 15 }, (_, i) => ({
      name: `tag${i}`,
      count: i,
    }));
    render(<TagButton tagsList={tags} />);
    expect(screen.getByText("tag0 (0)")).toBeInTheDocument();
    expect(screen.getByText("tag14 (14)")).toBeInTheDocument();
  });
});
