import axios from "axios";
import errorHandler from "../helpers/errorHandler";

const VALID_STATUSES = new Set(["draft", "published"]);

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
    const finalStatus = VALID_STATUSES.has(status) ? status : "published";
    const { data } = await axios({
      data: {
        article: { title, description, body, tagList, status: finalStatus },
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
