import { useAuth } from "../../context/AuthContext";
import { Navigate, useParams } from "react-router-dom";
import ArticlesPagination from "../../components/ArticlesPagination";
import ArticlesPreview from "../../components/ArticlesPreview";
import useArticleList from "../../hooks/useArticles";

function ProfileDrafts() {
  const { username } = useParams();
  const { loggedUser } = useAuth();

  // Only the profile owner can see drafts
  if (!loggedUser || loggedUser.username !== username) {
    return <Navigate to={`/profile/${username}`} replace />;
  }

  const { articles, articlesCount, loading, setArticlesData } = useArticleList({
    location: "profile",
    username,
    status: "draft",
  });

  return loading ? (
    <div className="article-preview">
      <em>Loading {username} drafts...</em>
    </div>
  ) : articles.length > 0 ? (
    <>
      <ArticlesPreview
        articles={articles}
        loading={loading}
        updateArticles={setArticlesData}
        showDraftLink
      />

      <ArticlesPagination
        articlesCount={articlesCount}
        location="profile"
        status="draft"
        updateArticles={setArticlesData}
        username={username}
      />
    </>
  ) : (
    <div className="article-preview">{username} doesn't have drafts.</div>
  );
}

export default ProfileDrafts;
