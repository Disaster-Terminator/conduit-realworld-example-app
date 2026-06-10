import axios from "axios";
import errorHandler from "../helpers/errorHandler";

// prettier-ignore
async function getArticles({ headers, limit = 3, location, page = 0, tagName, username }) {
  try {
    const url = {
      favorites: `api/articles?favorited=${username}&&limit=${limit}&&offset=${page}&&status=published`,
      feed: `api/articles/feed?limit=${limit}&&offset=${page}`,
      global: `api/articles?limit=${limit}&&offset=${page}&&status=published`,
      profile: `api/articles?author=${username}&&limit=${limit}&&offset=${page}&&status=published`,
      tag: `api/articles?tag=${tagName}&&limit=${limit}&&offset=${page}&&status=published`,
      drafts: `api/articles?author=${username}&&limit=${limit}&&offset=${page}&&status=draft`,
    };

    const { data } = await axios({ url: url[location], headers });

    return data;
  } catch (error) {
    errorHandler(error);
  }
}

export default getArticles;
