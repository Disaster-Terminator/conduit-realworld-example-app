import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

import ArticleEditorForm from "./ArticleEditorForm";

const { setArticleMock } = vi.hoisted(() => ({
  setArticleMock: vi.fn(() => Promise.resolve("test-slug")),
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    headers: { Authorization: "Token xxx" },
    isAuth: true,
    loggedUser: { username: "tester" },
  }),
}));

vi.mock("../../services/setArticle", () => ({
  default: setArticleMock,
}));

const renderForm = () =>
  render(
    <MemoryRouter>
      <ArticleEditorForm />
    </MemoryRouter>,
  );

describe("ArticleEditorForm", () => {
  beforeEach(() => {
    setArticleMock.mockClear();
  });

  it("renders both Publish and Save Draft buttons", () => {
    renderForm();

    expect(
      screen.getByRole("button", { name: /publish article/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /save draft/i }),
    ).toBeInTheDocument();
  });

  it("submits with status='draft' when only title is typed and Save Draft clicked", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(
      screen.getByPlaceholderText(/article title/i),
      "My draft title",
    );
    await user.click(screen.getByRole("button", { name: /save draft/i }));

    expect(setArticleMock).toHaveBeenCalledWith(
      expect.objectContaining({
        body: "",
        description: "",
        status: "draft",
        title: "My draft title",
      }),
    );
  });

  it("does not call setArticle when Publish is clicked with missing description or body", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(
      screen.getByPlaceholderText(/article title/i),
      "My title",
    );
    await user.click(screen.getByRole("button", { name: /publish article/i }));

    expect(setArticleMock).not.toHaveBeenCalled();
  });
});
