import { Link } from "react-router-dom";
import ArticleMeta from "../ArticleMeta";
import ArticleTags from "../ArticleTags";
import FavButton from "../FavButton";
import dateFormatter from "../../helpers/dateFormatter";

function ArticlesPreview({ articles, loading, updateArticles, showDraftLink }) {
  const handleFav = (article) => {
    const items = [...articles];

    const updatedArticles = items.map((item) =>
      item.slug === article.slug ? { ...item, ...article } : item,
    );

    updateArticles((prev) => ({ ...prev, articles: updatedArticles }));
  };

  return articles?.length > 0 ? (
    articles.map((article) => {
      const isDraft = article.published === false;
      const isScheduled = isDraft && article.scheduledAt;

      return (
        <div className="article-preview" key={article.slug}>
          <ArticleMeta author={article.author} createdAt={article.createdAt}>
            {!isDraft && (
              <FavButton
                favorited={article.favorited}
                favoritesCount={article.favoritesCount}
                handler={handleFav}
                right
                slug={article.slug}
              />
            )}
          </ArticleMeta>

          {/* Status badge */}
          {isDraft && (
            <span
              className="tag-pill"
              style={{
                float: "right",
                backgroundColor: isScheduled ? "#17a2b8" : "#6c757d",
                color: "#fff",
                padding: "0.2rem 0.6rem",
                fontSize: "0.75rem",
              }}
            >
              {isScheduled
                ? `Scheduled: ${dateFormatter(article.scheduledAt)}`
                : "Draft"}
            </span>
          )}

          {showDraftLink && isDraft ? (
            <Link
              to={`/editor/${article.slug}`}
              state={article}
              className="preview-link"
            >
              <h1>{article.title}</h1>
              <p>{article.description}</p>
              <span>Edit draft...</span>
              <ArticleTags tagList={article.tagList} />
            </Link>
          ) : (
            <Link
              to={`/article/${article.slug}`}
              state={article}
              className="preview-link"
            >
              <h1>{article.title}</h1>
              <p>{article.description}</p>
              <span>Read more...</span>
              <ArticleTags tagList={article.tagList} />
            </Link>
          )}
        </div>
      );
    })
  ) : loading ? (
    <div className="article-preview">Loading article...</div>
  ) : (
    <div className="article-preview">No articles available.</div>
  );
}

export default ArticlesPreview;
