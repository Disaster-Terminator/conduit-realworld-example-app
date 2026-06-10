import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Profile from "./Profile";

const mockUseAuth = vi.hoisted(() => vi.fn());

vi.mock("../../context/AuthContext", () => ({
  useAuth: mockUseAuth,
}));

vi.mock("../../components/AuthorInfo", () => ({
  default: () => <div data-testid="author-info">Author Info</div>,
}));

vi.mock("../../components/ContainerRow", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock("../../components/NavItem", () => ({
  default: ({ text, url }) => <a href={url}>{text}</a>,
}));

function renderProfile(username, loggedUsername) {
  mockUseAuth.mockReturnValue({
    loggedUser: { username: loggedUsername },
  });

  return render(
    <MemoryRouter initialEntries={[`/profile/${username}`]}>
      <Routes>
        <Route path="profile/:username" element={<Profile />}>
          <Route index element={<div>Articles List</div>} />
          <Route path="favorites" element={<div>Favorites List</div>} />
          <Route path="drafts" element={<div>Drafts List</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("Profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders My Articles and Favorited Articles tabs for all visitors", () => {
    renderProfile("john", "otherUser");
    expect(screen.getByText("My Articles")).toBeInTheDocument();
    expect(screen.getByText("Favorited Articles")).toBeInTheDocument();
  });

  it("does NOT render Drafts tab when viewing another user's profile", () => {
    renderProfile("john", "otherUser");
    expect(screen.queryByText("Drafts")).not.toBeInTheDocument();
  });

  it("renders Drafts tab when viewing own profile", () => {
    renderProfile("john", "john");
    expect(screen.getByText("Drafts")).toBeInTheDocument();
  });

  it("renders all three tabs when viewing own profile", () => {
    renderProfile("john", "john");
    expect(screen.getByText("My Articles")).toBeInTheDocument();
    expect(screen.getByText("Favorited Articles")).toBeInTheDocument();
    expect(screen.getByText("Drafts")).toBeInTheDocument();
  });

  it("renders AuthorInfo component", () => {
    renderProfile("john", "john");
    expect(screen.getByTestId("author-info")).toBeInTheDocument();
  });
});
