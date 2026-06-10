import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthProvider from "../../context/AuthContext";
import Article from "./Article";

// Mock the getArticle service
vi.mock("../../services/getArticle", () => ({
  default: vi.fn().mockResolvedValue({}),
}));

function TestWrapper({ children }) {
  return (
    <MemoryRouter initialEntries={["/article/test-slug"]}>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
}

describe("Article detail page", () => {
  it("should render cover image when present in state", () => {
    const articleWithCover = {
      slug: "test-slug",
      title: "Test Title",
      body: "Test body",
      tagList: [],
      createdAt: "2024-01-01T00:00:00.000Z",
      author: { username: "testuser", image: "", bio: "", following: false },
      coverImage: "https://example.com/detail-cover.jpg",
    };

    // Use state pass-through via location state
    // We need to pass state via the navigation. Let's mock useLocation
    // But simpler: Article reads from location.state on mount
    // We can wrap in a component that sets location state
    render(
      <MemoryRouter
        initialEntries={[{ pathname: "/article/test-slug", state: articleWithCover }]}
      >
        <AuthProvider>
          <Article />
        </AuthProvider>
      </MemoryRouter>,
    );

    const coverImg = screen.getByAltText("article cover");
    expect(coverImg).toBeInTheDocument();
    expect(coverImg).toHaveAttribute("src", "https://example.com/detail-cover.jpg");
  });

  it("should not render cover image when not present", () => {
    const articleWithoutCover = {
      slug: "test-slug",
      title: "Test Title",
      body: "Test body",
      tagList: [],
      createdAt: "2024-01-01T00:00:00.000Z",
      author: { username: "testuser", image: "", bio: "", following: false },
    };

    render(
      <MemoryRouter
        initialEntries={[{ pathname: "/article/test-slug", state: articleWithoutCover }]}
      >
        <AuthProvider>
          <Article />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.queryByAltText("article cover")).not.toBeInTheDocument();
  });
});
