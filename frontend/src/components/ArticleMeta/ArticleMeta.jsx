import { Link } from "react-router-dom";
import dateFormatter from "../../helpers/dateFormatter";
import relativeTimeFormatter from "../../helpers/relativeTimeFormatter";
import Avatar from "../Avatar";

function ArticleMeta({ author, children, createdAt, updatedAt }) {
  const { bio, followersCount, following, image, username } = author || {};
  const wasEdited =
    updatedAt && new Date(updatedAt).getTime() > new Date(createdAt).getTime();

  return (
    <div className="article-meta">
      <Link
        state={{ bio, followersCount, following, image }}
        to={`/profile/${username}`}
      >
        <Avatar alt={username} src={image} />
      </Link>
      <div className="info">
        <Link
          className="author"
          state={{ bio, followersCount, following, image }}
          to={`/profile/${username}`}
        >
          {username}
        </Link>
        <span className="date">{dateFormatter(createdAt)}</span>
        {wasEdited && (
          <span className="last-edited">
            Last edited {relativeTimeFormatter(updatedAt)}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export default ArticleMeta;
