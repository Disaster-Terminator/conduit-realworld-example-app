import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProfileDrafts from "./ProfileDrafts";

const mockUseAuth = vi.fn();

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("../../hooks/useArticles", () => ({
  default: () => ({
    articles: [],
    articlesCount: 0,
    loading: false,
    setArticlesData: vi.fn(),
  }),
}));

describe("ProfileDrafts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render drafts page for the profile owner", () => {
    mockUseAuth.mockReturnValue({
      isAuth: true,
      headers: { Authorization: "Token test" },
      loggedUser: { username: "testuser" },
    });

    render(
      <MemoryRouter initialEntries={["/profile/testuser/drafts"]}>
        <Routes>
          <Route path="profile/:username/drafts" element={<ProfileDrafts />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/doesn't have drafts/i)).toBeTruthy();
  });

  it("should redirect non-owner away from drafts", () => {
    mockUseAuth.mockReturnValue({
      isAuth: true,
      headers: { Authorization: "Token test" },
      loggedUser: { username: "otheruser" },
    });

    render(
      <MemoryRouter initialEntries={["/profile/testuser/drafts"]}>
        <Routes>
          <Route path="profile/:username/drafts" element={<ProfileDrafts />} />
          <Route
            path="profile/:username"
            element={<div>Profile Page</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

    // Non-owner should see the profile page (redirected)
    expect(screen.getByText("Profile Page")).toBeTruthy();
  });
});
