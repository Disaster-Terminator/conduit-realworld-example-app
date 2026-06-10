import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

// Mock useAuth before any imports that use it
const mockUseAuth = vi.fn();
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
  default: ({ children }) => <>{children}</>,
}));

// Mock the API services
vi.mock("../../services/setArticle", () => ({
  default: vi.fn(() =>
    Promise.resolve({ slug: "test-article", status: "published" }),
  ),
}));

import ArticleEditorForm from "./ArticleEditorForm";

describe("ArticleEditorForm — Draft & Schedule support", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      isAuth: true,
      headers: { Authorization: "Token test" },
      loggedUser: { username: "testuser", id: 1, image: null, bio: "" },
    });
  });

  const renderEditor = () => {
    return render(
      <MemoryRouter initialEntries={["/editor"]}>
        <Routes>
          <Route path="/editor" element={<ArticleEditorForm />} />
        </Routes>
      </MemoryRouter>,
    );
  };

  it("renders the Save as Draft button", async () => {
    renderEditor();

    const draftButton = screen.getByRole("button", { name: /save as draft/i });
    expect(draftButton).toBeDefined();
  });

  it("renders the Publish Now button", async () => {
    renderEditor();

    const publishButton = screen.getByRole("button", { name: /publish now/i });
    expect(publishButton).toBeDefined();
  });

  it("renders the Schedule button", async () => {
    renderEditor();

    const scheduleButton = screen.getByRole("button", { name: /schedule/i });
    expect(scheduleButton).toBeDefined();
  });

  it("renders the datetime-local input for scheduling", async () => {
    renderEditor();

    const dateInput = screen.getByLabelText(/schedule publish time/i);
    expect(dateInput).toBeDefined();
  });
});
