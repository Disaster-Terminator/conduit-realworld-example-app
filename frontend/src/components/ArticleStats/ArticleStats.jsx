import { countWords, readingMinutes } from "../../helpers/articleStats";

function ArticleStats({ body }) {
  if (!body) return null;

  const wordCount = countWords(body);
  const minutes = readingMinutes(body);
  const formattedCount = wordCount.toLocaleString("zh-CN");

  return (
    <p className="article-stats">
      本文共 {formattedCount} 字，预计阅读 {minutes} 分钟
    </p>
  );
}

export default ArticleStats;
