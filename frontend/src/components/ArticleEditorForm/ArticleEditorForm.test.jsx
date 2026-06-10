import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ArticleEditorForm from "./ArticleEditorForm";

// Mock dependencies
vi.mock("../../services/setArticle", () => ({
  default: vi.fn(() => Promise.resolve("test-article")),
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    isAuth: true,
    headers: { Authorization: "Token test" },
    loggedUser: { username: "testuser" },
  }),
}));

const renderForm = () => {
  return render(
    <MemoryRouter initialEntries={["/editor"]}>
      <Routes>
        <Route path="/editor" element={<ArticleEditorForm />} />
      </Routes>
    </MemoryRouter>,
  );
};

describe("ArticleEditorForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render Save Draft and Publish and Schedule buttons", async () => {
    renderForm();

    expect(screen.getByText("Publish Article")).toBeTruthy();
    expect(screen.getByText("Save Draft")).toBeTruthy();
    expect(screen.getByText("Schedule…")).toBeTruthy();
  });

  it("should show datetime input when Schedule is clicked", async () => {
    renderForm();

    fireEvent.click(screen.getByText("Schedule…"));

    expect(screen.getByLabelText(/schedule date/i)).toBeTruthy();
  });
});
