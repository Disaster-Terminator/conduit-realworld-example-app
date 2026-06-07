import axios from "axios";
import errorHandler from "../helpers/errorHandler";

// prettier-ignore
async function getArticles({
  headers,
  limit = 3,
  location,
  page = 0,
  status,
  tagName,
  username,
}) {
  try {
    const statusQuery = status ? `&&status=${status}` : "";
    const url = {
      drafts: `api/articles?author=${username}&status=draft&limit=${limit}&offset=${page}`,
      favorites: `api/articles?favorited=${username}&&limit=${limit}&&offset=${page}${statusQuery}`,
      feed: `api/articles/feed?limit=${limit}&&offset=${page}`,
      global: `api/articles?limit=${limit}&&offset=${page}${statusQuery}`,
      profile: `api/articles?author=${username}&&limit=${limit}&&offset=${page}${statusQuery}`,
      tag: `api/articles?tag=${tagName}&&limit=${limit}&&offset=${page}${statusQuery}`,
    };

    const { data } = await axios({ url: url[location], headers });

    return data;
  } catch (error) {
    errorHandler(error);
  }
}

export default getArticles;
