import { Link } from "react-router-dom";
import dateFormatter, { relativeTime } from "../../helpers/dateFormatter";
import Avatar from "../Avatar";

function ArticleMeta({ author, children, createdAt, updatedAt }) {
  const { bio, followersCount, following, image, username } = author || {};
  const wasEdited = updatedAt && createdAt && updatedAt !== createdAt;

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
          <span className="date edited-date">
            最后编辑于 {relativeTime(updatedAt)}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export default ArticleMeta;
