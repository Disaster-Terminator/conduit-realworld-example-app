import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ArticleMeta from "./ArticleMeta";

const NOW = new Date("2026-06-07T12:00:00.000Z");

function renderArticleMeta(props) {
  return render(
    <MemoryRouter>
      <ArticleMeta
        author={{ username: "alice", image: null }}
        createdAt="2020-01-01T00:00:00.000Z"
        {...props}
      />
    </MemoryRouter>,
  );
}

describe("ArticleMeta", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the createdAt date when no updatedAt is provided", () => {
    renderArticleMeta();
    expect(screen.getByText("January 1, 2020")).toBeInTheDocument();
    expect(screen.queryByText(/Last edited/)).not.toBeInTheDocument();
  });

  it("does not render 'Last edited' when updatedAt is earlier than createdAt", () => {
    renderArticleMeta({
      createdAt: "2020-01-01T00:00:00.000Z",
      updatedAt: "2019-12-31T00:00:00.000Z",
    });
    expect(screen.queryByText(/Last edited/)).not.toBeInTheDocument();
  });

  it("renders 'Last edited 30 minutes ago' when updatedAt is 30 min newer than createdAt", () => {
    renderArticleMeta({
      createdAt: new Date(NOW.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(NOW.getTime() - 30 * 60 * 1000).toISOString(),
    });
    expect(screen.getByText("Last edited 30 minutes ago")).toBeInTheDocument();
  });

  it("does not render 'Last edited' when updatedAt equals createdAt", () => {
    const same = "2020-01-01T00:00:00.000Z";
    renderArticleMeta({ createdAt: same, updatedAt: same });
    expect(screen.queryByText(/Last edited/)).not.toBeInTheDocument();
  });
});
