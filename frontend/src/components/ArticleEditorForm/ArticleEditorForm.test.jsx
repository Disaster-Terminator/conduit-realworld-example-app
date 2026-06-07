import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    headers: { Authorization: "Token fake" },
    isAuth: true,
    loggedUser: { username: "owner" },
  }),
}));
vi.mock("../../services/getArticle", () => ({
  default: vi.fn(() => Promise.resolve({})),
}));
vi.mock("../../services/setArticle", () => ({
  default: vi.fn(() => Promise.resolve({ slug: "x" })),
}));

import ArticleEditorForm from "./ArticleEditorForm";

function renderForm(initialPath = "/editor") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/editor" element={<ArticleEditorForm />} />
        <Route path="/editor/:slug" element={<ArticleEditorForm />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ArticleEditorForm", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders a Save Draft button alongside the publish button on a new article", () => {
    renderForm("/editor");

    expect(
      screen.getByRole("button", { name: /publish article/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /save draft/i }),
    ).toBeInTheDocument();
  });

  test("renders a Save Draft button alongside the update button when editing an existing slug", async () => {
    const { default: getArticle } = await import("../../services/getArticle");
    getArticle.mockResolvedValueOnce({
      author: { username: "owner" },
      body: "hello",
      description: "desc",
      tagList: ["react"],
      title: "Hello",
    });

    renderForm("/editor/existing-slug");

    expect(
      await screen.findByRole("button", { name: /update article/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /save draft/i }),
    ).toBeInTheDocument();
  });
});
