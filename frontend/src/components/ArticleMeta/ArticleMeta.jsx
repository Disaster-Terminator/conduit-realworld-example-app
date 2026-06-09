import { Link } from "react-router-dom";
import dateFormatter from "../../helpers/dateFormatter";
import relativeTime from "../../helpers/relativeTime";
import Avatar from "../Avatar";

function ArticleMeta({ author, children, createdAt, updatedAt }) {
  const { bio, followersCount, following, image, username } = author || {};
  const showEdited = updatedAt && updatedAt !== createdAt;

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
        {showEdited && (
          <span className="date edited-date">
            (Last edited {relativeTime(updatedAt)})
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export default ArticleMeta;
