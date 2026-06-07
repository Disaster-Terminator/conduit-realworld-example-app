import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import ArticleEditorForm from "./ArticleEditorForm";

vi.mock("../../services/getArticle", () => ({ default: vi.fn() }));
vi.mock("../../services/setArticle", () => ({ default: vi.fn() }));

import getArticle from "../../services/getArticle";
import setArticle from "../../services/setArticle";

function renderWith(initialEntries = ["/editor"], routeState = null) {
  const authValue = {
    headers: { Authorization: "Token t" },
    isAuth: true,
    loggedUser: { username: "me", email: "me@x" },
  };
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/editor" element={<ArticleEditorForm />} />
          <Route
            path="/editor/:slug"
            element={
              <>
                <ArticleEditorForm />
                <RouteCapture />
              </>
            }
          />
          <Route path="/article/:slug" element={<div>article-page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

function RouteCapture() {
  const loc = useLocation();
  return <div data-testid="path">{loc.pathname}</div>;
}

describe("ArticleEditorForm - dual button and status handling", () => {
  it("renders both Publish Article and Save Draft buttons on a fresh editor", () => {
    renderWith(["/editor"], null);
    expect(screen.getByText("Publish Article")).toBeInTheDocument();
    expect(screen.getByText("Save Draft")).toBeInTheDocument();
  });

  it("clicking Save Draft calls setArticle with status=draft and stays in editor", async () => {
    setArticle.mockResolvedValue({ slug: "smoke-draft", status: "draft" });
    renderWith(["/editor"], null);
    fireEvent.change(screen.getByPlaceholderText("Article Title"), {
      target: { name: "title", value: "smoke-draft" },
    });
    fireEvent.click(screen.getByText("Save Draft"));
    await waitFor(() =>
      expect(setArticle).toHaveBeenCalledWith(
        expect.objectContaining({ status: "draft" }),
      ),
    );
  });

  it("clicking Publish Article calls setArticle with status=published", async () => {
    setArticle.mockResolvedValue({ slug: "smoke-pub", status: "published" });
    renderWith(["/editor"], null);
    fireEvent.change(screen.getByPlaceholderText("Article Title"), {
      target: { name: "title", value: "smoke-pub" },
    });
    fireEvent.change(screen.getByPlaceholderText("What's this article about?"), {
      target: { name: "description", value: "d" },
    });
    fireEvent.change(screen.getByPlaceholderText("Write your article (in markdown)"), {
      target: { name: "body", value: "b" },
    });
    fireEvent.click(screen.getByText("Publish Article"));
    await waitFor(() =>
      expect(setArticle).toHaveBeenCalledWith(
        expect.objectContaining({ status: "published" }),
      ),
    );
  });
});
