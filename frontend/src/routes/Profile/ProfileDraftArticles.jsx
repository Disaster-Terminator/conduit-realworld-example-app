import { useParams } from "react-router-dom";
import ArticlesPagination from "../../components/ArticlesPagination";
import ArticlesPreview from "../../components/ArticlesPreview";
import useArticleList from "../../hooks/useArticles";

function ProfileDraftArticles() {
  const { username } = useParams();

  const { articles, articlesCount, loading, setArticlesData } = useArticleList({
    location: "profile",
    status: "draft",
    username,
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
    <div className="article-preview">No drafts yet.</div>
  );
}

export default ProfileDraftArticles;
