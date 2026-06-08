import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import getArticle from "../../services/getArticle";
import setArticle from "../../services/setArticle";
import FormFieldset from "../FormFieldset";

const emptyForm = { title: "", description: "", body: "", tagList: "" };

function ArticleEditorForm() {
  const { state } = useLocation();
  const [{ title, description, body, tagList }, setForm] = useState(
    state || emptyForm,
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [articleStatus, setArticleStatus] = useState("");
  const { isAuth, headers, loggedUser } = useAuth();

  const navigate = useNavigate();
  const { slug } = useParams();

  useEffect(() => {
    const redirect = () => navigate("/", { replace: true, state: null });
    if (!isAuth) return redirect();

    if (state || !slug) return;

    getArticle({ headers, slug })
      .then(({ author: { username }, body, description, status, tagList, title }) => {
        if (username !== loggedUser.username) redirect();

        setForm({ body, description, tagList, title });
        setArticleStatus(status || "");
      })
      .catch(console.error);

    return () => setForm(emptyForm);
  }, [headers, isAuth, loggedUser.username, navigate, slug, state]);

  const inputHandler = (e) => {
    const type = e.target.name;
    const value = e.target.value;

    setForm((form) => ({ ...form, [type]: value }));
  };

  const tagsInputHandler = (e) => {
    const value = e.target.value;

    setForm((form) => ({ ...form, tagList: value.split(/,| /) }));
  };

  const submitArticle = (e, status) => {
    e.preventDefault();

    setArticle({ headers, slug, body, description, status, tagList, title })
      .then((slug) => navigate(`/article/${slug}`))
      .catch(setErrorMessage);
  };

  const isEditingDraft = Boolean(slug && articleStatus === "draft");
  const isEditingPublished = Boolean(slug && articleStatus === "published");

  return (
    <form>
      <fieldset>
        {errorMessage && <span className="error-messages">{errorMessage}</span>}
        <FormFieldset
          placeholder="Article Title"
          name="title"
          required
          value={title}
          handler={inputHandler}
        ></FormFieldset>

        <FormFieldset
          normal
          placeholder="What's this article about?"
          name="description"
          required
          value={description}
          handler={inputHandler}
        ></FormFieldset>

        <fieldset className="form-group">
          <textarea
            className="form-control"
            rows="8"
            placeholder="Write your article (in markdown)"
            name="body"
            required
            value={body}
            onChange={inputHandler}
          ></textarea>
        </fieldset>

        <FormFieldset
          normal
          placeholder="Enter tags"
          name="tags"
          value={tagList}
          handler={tagsInputHandler}
        >
          <div className="tag-list"></div>
        </FormFieldset>

        {isEditingPublished ? (
          <button
            className="btn btn-lg pull-xs-right btn-primary"
            type="submit"
            onClick={(e) => submitArticle(e, "published")}
          >
            Update Article
          </button>
        ) : (
          <>
            <button
              className="btn btn-lg pull-xs-right btn-primary"
              type="submit"
              onClick={(e) => submitArticle(e, "published")}
            >
              {slug ? "Publish" : "Publish Article"}
            </button>
            <button
              className="btn btn-lg pull-xs-right btn-outline-primary"
              type="submit"
              style={{ marginRight: "0.5rem" }}
              onClick={(e) => submitArticle(e, "draft")}
            >
              Save Draft
            </button>
          </>
        )}
      </fieldset>
    </form>
  );
}

export default ArticleEditorForm;
