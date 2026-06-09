const { slugify, appendLikes } = require("./helpers");

describe("Slugify", () => {
  const stringsArray = [
    "  Hello World  ",
    "  Hello WORLD  ",
    " HELLO WORLD",
    "Hello World",
    "Hello_world ",
    "Hello-world",
  ];

  test.each(stringsArray)("%p", (string) => {
    expect(slugify(string)).toBe("hello-world");
  });
});

describe("appendLikes", () => {
  const makeMockComment = ({ hasUserResult, countUsersResult }) => ({
    hasUser: vi.fn().mockResolvedValue(hasUserResult),
    countUsers: vi.fn().mockResolvedValue(countUsersResult),
    dataValues: {},
  });

  test("sets liked=true and likeCount when user has liked", async () => {
    const comment = makeMockComment({ hasUserResult: true, countUsersResult: 5 });
    const loggedUser = { id: 1 };

    await appendLikes(loggedUser, comment);

    expect(comment.dataValues.liked).toBe(true);
    expect(comment.dataValues.likeCount).toBe(5);
    expect(comment.hasUser).toHaveBeenCalledWith(loggedUser);
    expect(comment.countUsers).toHaveBeenCalled();
  });

  test("sets liked=false when user has not liked", async () => {
    const comment = makeMockComment({ hasUserResult: false, countUsersResult: 3 });
    const loggedUser = { id: 2 };

    await appendLikes(loggedUser, comment);

    expect(comment.dataValues.liked).toBe(false);
    expect(comment.dataValues.likeCount).toBe(3);
  });

  test("sets liked=false when loggedUser is null", async () => {
    const comment = makeMockComment({ hasUserResult: false, countUsersResult: 7 });

    await appendLikes(null, comment);

    expect(comment.dataValues.liked).toBe(false);
    expect(comment.dataValues.likeCount).toBe(7);
    expect(comment.hasUser).toHaveBeenCalledWith(null);
  });
});
