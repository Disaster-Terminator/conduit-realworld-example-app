import Markdown from "markdown-to-jsx";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import ArticleMeta from "../../components/ArticleMeta";
import ArticlesButtons from "../../components/ArticlesButtons";
import ArticleTags from "../../components/ArticleTags";
import BannerContainer from "../../components/BannerContainer";
import { useAuth } from "../../context/AuthContext";
import getArticle from "../../services/getArticle";

function Article() {
  const { state } = useLocation();
  const [article, setArticle] = useState(state || {});
  const { title, body, tagList, createdAt, author } = article || {};
  const { headers, isAuth } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams();

  const wordCount = (() => {
    if (!body) return 0;
    const chineseChars = (body.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (body.match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  })();

  const readingMinutes = (() => {
    if (wordCount === 0) return 0;
    const chineseChars = (body.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (body.match(/[a-zA-Z]+/g) || []).length;
    const minutes = Math.ceil(chineseChars / 300 + englishWords / 200);
    return Math.max(1, minutes);
  })();

  useEffect(() => {
    if (state) return;

    getArticle({ slug, headers })
      .then(setArticle)
      .catch((error) => {
        console.error(error);
        navigate("/not-found", { replace: true });
      });
  }, [slug, headers, state, navigate]);

  return (
    <div className="article-page">
      <BannerContainer>
        <h1>{title}</h1>
        <ArticleMeta author={author} createdAt={createdAt}>
          <ArticlesButtons article={article} setArticle={setArticle} />
        </ArticleMeta>
      </BannerContainer>

      <div className="container page">
        <div className="row article-content">
          <div className="col-md-12">
            {body && <Markdown options={{ forceBlock: true }}>{body}</Markdown>}
            {wordCount > 0 && (
              <p className="text-muted small mt-3">
                字数：{wordCount} · 预计阅读时间：{readingMinutes} 分钟
              </p>
            )}
            <ArticleTags tagList={tagList} />
          </div>
        </div>

        <hr />

        <div className="article-actions">
          <ArticleMeta author={author} createdAt={createdAt}>
            <ArticlesButtons article={article} setArticle={setArticle} />
          </ArticleMeta>
        </div>

        <Outlet />
      </div>
    </div>
  );
}

export default Article;
