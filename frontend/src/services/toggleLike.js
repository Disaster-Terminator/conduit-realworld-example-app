import axios from "axios";
import errorHandler from "../helpers/errorHandler";

async function toggleLike({ slug, commentId, liked, headers }) {
  try {
    const { data } = await axios({
      headers,
      method: liked ? "DELETE" : "POST",
      url: `api/articles/${slug}/comments/${commentId}/like`,
    });

    return data.comment;
  } catch (error) {
    errorHandler(error);
  }
}

export default toggleLike;
