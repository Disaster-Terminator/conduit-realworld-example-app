import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";

import Profile from "./Profile";

const { useAuthMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: useAuthMock,
}));

vi.mock("../../components/AuthorInfo", () => ({
  default: () => <div>AuthorInfoStub</div>,
}));

const renderProfile = (username) =>
  render(
    <MemoryRouter initialEntries={[`/profile/${username}`]}>
      <Routes>
        <Route path="/profile/:username" element={<Profile />}>
          <Route index element={<div>OutletStub</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe("Profile navigation tabs", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
  });

  it("shows the Drafts tab when the viewer is the profile owner", () => {
    useAuthMock.mockReturnValue({
      isAuth: true,
      loggedUser: { username: "alice" },
    });

    renderProfile("alice");

    expect(screen.getByText("My Articles")).toBeInTheDocument();
    expect(screen.getByText("Favorited Articles")).toBeInTheDocument();
    expect(screen.getByText("Drafts")).toBeInTheDocument();
  });

  it("hides the Drafts tab when the viewer is not the profile owner", () => {
    useAuthMock.mockReturnValue({
      isAuth: true,
      loggedUser: { username: "bob" },
    });

    renderProfile("alice");

    expect(screen.getByText("My Articles")).toBeInTheDocument();
    expect(screen.getByText("Favorited Articles")).toBeInTheDocument();
    expect(screen.queryByText("Drafts")).not.toBeInTheDocument();
  });

  it("hides the Drafts tab when the viewer is logged out", () => {
    useAuthMock.mockReturnValue({
      isAuth: false,
      loggedUser: { username: "" },
    });

    renderProfile("alice");

    expect(screen.queryByText("Drafts")).not.toBeInTheDocument();
  });
});
