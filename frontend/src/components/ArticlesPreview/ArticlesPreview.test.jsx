import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthProvider from "../../context/AuthContext";
import ArticlesPreview from "./ArticlesPreview";

function TestWrapper({ children }) {
  return (
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
}

const baseArticle = {
  slug: "test-article",
  title: "Test Article",
  description: "Test description",
  body: "Test body",
  tagList: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  author: { username: "testuser", image: "" },
  favorited: false,
  favoritesCount: 0,
};

describe("ArticlesPreview", () => {
  it("should render cover image when article has coverImage", () => {
    const article = {
      ...baseArticle,
      coverImage: "https://example.com/cover.jpg",
    };

    render(
      <TestWrapper>
        <ArticlesPreview articles={[article]} loading={false} updateArticles={() => {}} />
      </TestWrapper>,
    );

    const coverImg = screen.getByAltText("article cover");
    expect(coverImg).toBeInTheDocument();
    expect(coverImg).toHaveAttribute("src", "https://example.com/cover.jpg");
  });

  it("should not render cover image when article has no coverImage", () => {
    render(
      <TestWrapper>
        <ArticlesPreview articles={[baseArticle]} loading={false} updateArticles={() => {}} />
      </TestWrapper>,
    );

    expect(screen.queryByAltText("article cover")).not.toBeInTheDocument();
  });
});
