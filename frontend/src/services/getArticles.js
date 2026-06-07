import axios from "axios";
import errorHandler from "../helpers/errorHandler";

const toQuery = (params) =>
  Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join("&");

export function buildArticlesUrl({
  headers: _headers,
  limit = 3,
  location,
  page = 0,
  status,
  tagName,
  username,
} = {}) {
  const base = {
    favorites: "api/articles",
    feed: "api/articles/feed",
    global: "api/articles",
    profile: "api/articles",
    tag: "api/articles",
  }[location];

  if (!base) return "";

  const params = { limit, offset: page * limit };

  if (location === "favorites") params.favorited = username;
  if (location === "profile") params.author = username;
  if (location === "tag") params.tag = tagName;
  if (location !== "feed" && status) params.status = status;

  return `${base}?${toQuery(params)}`;
}

// prettier-ignore
async function getArticles({ headers, limit = 3, location, page = 0, status, tagName, username }) {
  try {
    const url = buildArticlesUrl({ limit, location, page, status, tagName, username });

    const { data } = await axios({ url, headers });

    return data;
  } catch (error) {
    errorHandler(error);
  }
}

export default getArticles;
