import axios from "axios";
import errorHandler from "../helpers/errorHandler";

async function setArticle({
  body,
  description,
  headers,
  slug,
  status,
  tagList,
  title,
}) {
  try {
    const { data } = await axios({
      data: {
        article: { title, description, body, status, tagList },
      },
      headers,
      method: slug ? "PUT" : "POST",
      url: slug ? `api/articles/${slug}` : "api/articles",
    });

    return data.article.slug;
  } catch (error) {
    errorHandler(error);
  }
}

export default setArticle;
