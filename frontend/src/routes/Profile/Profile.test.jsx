import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));
vi.mock("../../components/AuthorInfo", () => ({
  default: () => <div data-testid="author-info" />,
}));
vi.mock("../../components/ContainerRow", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

import { useAuth } from "../../context/AuthContext";
import Profile from "./Profile";

function renderProfile(username) {
  return render(
    <MemoryRouter initialEntries={[`/profile/${username}`]}>
      <Routes>
        <Route path="/profile/:username" element={<Profile />}>
          <Route index element={<div data-testid="outlet" />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("Profile navigation tabs", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("shows the Drafts tab when viewing the logged-in user's own profile", () => {
    useAuth.mockReturnValue({
      loggedUser: { username: "owner" },
    });

    renderProfile("owner");

    expect(screen.getByText("My Articles")).toBeInTheDocument();
    expect(screen.getByText("Favorited Articles")).toBeInTheDocument();
    expect(screen.getByText("Drafts")).toBeInTheDocument();
  });

  test("hides the Drafts tab when viewing another user's profile", () => {
    useAuth.mockReturnValue({
      loggedUser: { username: "owner" },
    });

    renderProfile("someone-else");

    expect(screen.getByText("My Articles")).toBeInTheDocument();
    expect(screen.getByText("Favorited Articles")).toBeInTheDocument();
    expect(screen.queryByText("Drafts")).not.toBeInTheDocument();
  });

  test("hides the Drafts tab when no user is logged in", () => {
    useAuth.mockReturnValue({
      loggedUser: { username: "" },
    });

    renderProfile("owner");

    expect(screen.queryByText("Drafts")).not.toBeInTheDocument();
  });
});
