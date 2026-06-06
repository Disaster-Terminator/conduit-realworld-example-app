import {
  countWords,
  readingMinutes,
  stripMarkdown,
} from "./articleStats";

describe("stripMarkdown", () => {
  test("returns empty string for non-string input", () => {
    expect(stripMarkdown(null)).toBe("");
    expect(stripMarkdown(undefined)).toBe("");
    expect(stripMarkdown(123)).toBe("");
  });

  test("returns empty string for empty input", () => {
    expect(stripMarkdown("")).toBe("");
  });

  test("strips fenced code blocks", () => {
    const md = "正文\n```js\nconst x = 1;\n```\n结尾";
    expect(stripMarkdown(md)).toBe("正文 结尾");
  });

  test("strips inline code", () => {
    expect(stripMarkdown("请用 `npm i` 安装")).toBe("请用 安装");
  });

  test("strips image syntax but keeps alt text", () => {
    expect(stripMarkdown("看 ![示例图](https://x.com/a.png) 结束")).toBe(
      "看 示例图 结束",
    );
  });

  test("strips link syntax but keeps link text", () => {
    expect(stripMarkdown("访问 [官网](https://x.com) 看看")).toBe(
      "访问 官网 看看",
    );
  });

  test("strips heading markers", () => {
    expect(stripMarkdown("# 标题一\n## 标题二\n正文")).toBe(
      "标题一 标题二 正文",
    );
  });

  test("strips emphasis markers", () => {
    expect(stripMarkdown("这是 **加粗** 和 *斜体* 内容")).toBe(
      "这是 加粗 和 斜体 内容",
    );
    expect(stripMarkdown("还有 __bold__ 和 _em_")).toBe("还有 bold 和 em");
  });

  test("strips unordered list markers", () => {
    expect(stripMarkdown("- 第一项\n- 第二项\n- 第三项")).toBe(
      "第一项 第二项 第三项",
    );
  });

  test("strips ordered list markers", () => {
    expect(stripMarkdown("1. 第一\n2. 第二\n10. 第三")).toBe("第一 第二 第三");
  });

  test("strips blockquote markers", () => {
    expect(stripMarkdown("> 引用内容\n> 继续")).toBe("引用内容 继续");
  });

  test("strips horizontal rules", () => {
    expect(stripMarkdown("上文\n\n---\n\n下文")).toBe("上文 下文");
  });

  test("strips raw HTML tags", () => {
    expect(stripMarkdown("一段 <strong>强调</strong> 文字")).toBe(
      "一段 强调 文字",
    );
  });

  test("collapses whitespace", () => {
    expect(stripMarkdown("多   空格\t和\n\n换行")).toBe("多 空格 和 换行");
  });
});

describe("countWords", () => {
  test("returns 0 for empty body", () => {
    expect(countWords("")).toBe(0);
    expect(countWords(null)).toBe(0);
    expect(countWords(undefined)).toBe(0);
  });

  test("returns 0 when only markdown symbols", () => {
    expect(countWords("## \n**\n---\n")).toBe(0);
  });

  test("counts plain English words", () => {
    expect(countWords("Hello world this is a test")).toBe(6);
  });

  test("counts CJK characters individually", () => {
    expect(countWords("你好世界")).toBe(4);
  });

  test("counts mixed CJK and English", () => {
    // "Hello 世界 great" -> "Hello"(1) + "世界"(2) + "great"(1) = 4
    expect(countWords("Hello 世界 great")).toBe(4);
  });

  test("strips markdown before counting", () => {
    // 源码有 markdown 符号，应比字符串长度小
    const md =
      "# 标题\n这是一段带有 [链接](https://x.com) 和 ![图](a.png) 的正文。";
    expect(countWords(md)).toBeLessThan(md.length);
    // 剥离后: "标题 这是一段带有 链接 和 图 的正文。"
    // CJK = 15, 英文/标点 token = 1 (".")
    expect(countWords(md)).toBe(16);
  });

  test("code blocks do not inflate the count", () => {
    const md = "简介\n```\n超长代码片段不算字数\n```\n结尾";
    expect(countWords(md)).toBe(4); // 简介 结尾
  });
});

describe("readingMinutes", () => {
  test("returns 0 for empty body", () => {
    expect(readingMinutes("")).toBe(0);
    expect(readingMinutes(null)).toBe(0);
  });

  test("returns 0 when count is 0", () => {
    expect(readingMinutes("## \n---\n")).toBe(0);
  });

  test("floors at 1 minute for short content", () => {
    expect(readingMinutes("短文")).toBe(1);
    // 299 个空格分隔的 token < 300 cpm，应向上取整到 1 分钟
    expect(readingMinutes("a ".repeat(299).trim())).toBe(1);
  });

  test("uses ceil for content at or above threshold (default 300 cpm)", () => {
    // 用空格分隔的 token 模拟英文单词（"aaa...a" 不带空格是 1 个 token）
    const tokens300 = "a ".repeat(300).trim();
    const tokens301 = "a ".repeat(301).trim();
    const tokens900 = "a ".repeat(900).trim();
    expect(readingMinutes(tokens300)).toBe(1);
    expect(readingMinutes(tokens301)).toBe(2);
    expect(readingMinutes(tokens900)).toBe(3);
  });

  test("respects custom cpm", () => {
    // 500 words at 100 cpm -> 5 minutes
    expect(readingMinutes("a ".repeat(500).trim(), 100)).toBe(5);
    // 50 words at 100 cpm -> 1 minute (floored)
    expect(readingMinutes("a ".repeat(50).trim(), 100)).toBe(1);
  });
});
