import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toggleLike from "../../services/toggleLike";

function LikeButton({ commentId, liked, likeCount, slug, onToggle }) {
  const [loading, setLoading] = useState(false);
  const { headers, isAuth } = useAuth();

  const handleClick = () => {
    if (!isAuth) return alert("You need to login first");

    setLoading(true);
    toggleLike({ slug, commentId, liked, headers })
      .then(onToggle)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  return (
    <button
      className={`btn btn-sm btn-outline-primary pull-xs-right ${liked ? "active" : ""}`}
      disabled={loading}
      onClick={handleClick}
    >
      <i className="ion-heart"></i>
      <span className="counter"> ( {likeCount} )</span>
    </button>
  );
}

export default LikeButton;
