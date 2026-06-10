import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ArticlesPagination from "../../components/ArticlesPagination";
import ArticlesPreview from "../../components/ArticlesPreview";
import useArticleList from "../../hooks/useArticles";

function ProfileDrafts() {
  const { username } = useParams();
  const { loggedUser } = useAuth();
  const isOwnProfile = loggedUser && loggedUser.username === username;

  const { articles, articlesCount, loading, setArticlesData } = useArticleList({
    location: "drafts",
    username,
  });

  if (!isOwnProfile) {
    return (
      <div className="article-preview">
        You can only view your own drafts.
      </div>
    );
  }

  return loading ? (
    <div className="article-preview">
      <em>Loading drafts...</em>
    </div>
  ) : articles.length > 0 ? (
    <>
      <ArticlesPreview
        articles={articles}
        loading={loading}
        updateArticles={setArticlesData}
      />

      <ArticlesPagination
        articlesCount={articlesCount}
        location="drafts"
        updateArticles={setArticlesData}
        username={username}
      />
    </>
  ) : (
    <div className="article-preview">No drafts yet.</div>
  );
}

export default ProfileDrafts;
