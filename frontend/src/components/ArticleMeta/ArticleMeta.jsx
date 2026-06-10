import { Link } from "react-router-dom";
import dateFormatter from "../../helpers/dateFormatter";
import timeAgo from "../../helpers/timeAgo";
import Avatar from "../Avatar";

function ArticleMeta({ author, children, createdAt, updatedAt }) {
  const { bio, followersCount, following, image, username } = author || {};
  const showEdited =
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
        {showEdited && (
          <span className="date">最后编辑于 {timeAgo(updatedAt)}</span>
        )}
      </div>
      {children}
    </div>
  );
}

export default ArticleMeta;
