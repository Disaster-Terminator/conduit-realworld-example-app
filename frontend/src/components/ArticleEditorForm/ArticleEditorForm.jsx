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
  const [articleStatus, setArticleStatus] = useState(state?.status || "draft");
  const [errorMessage, setErrorMessage] = useState("");
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

        setArticleStatus(status || "draft");
        setForm({ body, description, tagList, title });
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

  const formSubmit = (e, status) => {
    e.preventDefault();

    setArticle({ headers, slug, body, description, tagList, title, status })
      .then((newSlug) => {
        if (status === "draft") {
          navigate(`/editor/${newSlug}`, { replace: true });
        } else {
          navigate(`/article/${newSlug}`);
        }
      })
      .catch(setErrorMessage);
  };

  const isDraft = slug && articleStatus === "draft";
  const isPublished = slug && articleStatus === "published";
  const isNew = !slug;

  return (
    <form onSubmit={(e) => formSubmit(e, "published")}>
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

        {isPublished ? (
          <button className="btn btn-lg pull-xs-right btn-primary" type="submit">
            Update Article
          </button>
        ) : isDraft ? (
          <>
            <button
              className="btn btn-lg pull-xs-right btn-primary"
              type="submit"
            >
              Publish
            </button>
            <button
              className="btn btn-lg pull-xs-right btn-outline-primary"
              type="button"
              style={{ marginRight: "0.5rem" }}
              onClick={(e) => formSubmit(e, "draft")}
            >
              Save Draft
            </button>
          </>
        ) : (
          <>
            <button
              className="btn btn-lg pull-xs-right btn-primary"
              type="submit"
            >
              Publish Article
            </button>
            <button
              className="btn btn-lg pull-xs-right btn-outline-primary"
              type="button"
              style={{ marginRight: "0.5rem" }}
              onClick={(e) => formSubmit(e, "draft")}
            >
              Save as Draft
            </button>
          </>
        )}
      </fieldset>
    </form>
  );
}

export default ArticleEditorForm;
