import Markdown from "markdown-to-jsx";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import ArticleMeta from "../../components/ArticleMeta";
import ArticlesButtons from "../../components/ArticlesButtons";
import ArticleTags from "../../components/ArticleTags";
import BannerContainer from "../../components/BannerContainer";
import { useAuth } from "../../context/AuthContext";
import getArticle from "../../services/getArticle";
import dateFormatter from "../../helpers/dateFormatter";

function Article() {
  const { state } = useLocation();
  const [article, setArticle] = useState(state || {});
  const { title, body, tagList, createdAt, author, published, scheduledAt } =
    article || {};
  const { headers, isAuth, loggedUser } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams();

  useEffect(() => {
    if (state) return;

    getArticle({ slug, headers })
      .then((data) => {
        // If article is unpublished and user is not the author -> redirect
        if (data.published === false) {
          if (
            !loggedUser ||
            !data.author ||
            loggedUser.username !== data.author.username
          ) {
            navigate("/not-found", { replace: true });
            return;
          }
        }
        setArticle(data);
      })
      .catch((error) => {
        console.error(error);
        navigate("/not-found", { replace: true });
      });
  }, [isAuth, slug, headers, state, navigate, loggedUser]);

  const isDraft = published === false;
  const isScheduled = isDraft && scheduledAt;

  return (
    <div className="article-page">
      <BannerContainer>
        <h1>{title}</h1>

        {/* Draft/scheduled banner for author */}
        {isDraft && (
          <div
            className="alert alert-warning"
            style={{ marginTop: "1rem" }}
          >
            {isScheduled
              ? `This article is scheduled for ${dateFormatter(scheduledAt)}. It is not visible to other users.`
              : "This article is a draft. Only you can see it."}
          </div>
        )}

        <ArticleMeta author={author} createdAt={createdAt}>
          {!isDraft && (
            <ArticlesButtons article={article} setArticle={setArticle} />
          )}
        </ArticleMeta>
      </BannerContainer>

      <div className="container page">
        <div className="row article-content">
          <div className="col-md-12">
            {body && (
              <Markdown options={{ forceBlock: true }}>{body}</Markdown>
            )}
            <ArticleTags tagList={tagList} />
          </div>
        </div>

        {!isDraft && (
          <>
            <hr />

            <div className="article-actions">
              <ArticleMeta author={author} createdAt={createdAt}>
                <ArticlesButtons
                  article={article}
                  setArticle={setArticle}
                />
              </ArticleMeta>
            </div>

            <Outlet />
          </>
        )}
      </div>
    </div>
  );
}

export default Article;
