import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import getArticle from "../../services/getArticle";
import setArticle from "../../services/setArticle";
import FormFieldset from "../FormFieldset";

const emptyForm = {
  title: "",
  description: "",
  body: "",
  tagList: "",
  status: "published",
};

function ArticleEditorForm() {
  const { state } = useLocation();
  const [{ title, description, body, tagList, status }, setForm] = useState(
    state || emptyForm,
  );
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

        setForm({ body, description, status, tagList, title });
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

  const formSubmit = (e) => {
    e.preventDefault();

    const action = e.nativeEvent.submitter?.value || "publish";
    const nextStatus = action === "draft" ? "draft" : "published";

    setArticle({ headers, slug, body, description, status: nextStatus, tagList, title })
      .then((newSlug) => navigate(`/article/${newSlug}`))
      .catch(setErrorMessage);
  };

  const isEditingDraft = Boolean(slug) && status === "draft";

  return (
    <form onSubmit={formSubmit}>
      <fieldset>
        {errorMessage && <span className="error-messages">{errorMessage}</span>}
        {isEditingDraft && (
          <p className="text-muted">
            <span className="badge badge-secondary mr-1">DRAFT</span>
            This is a draft. Only you can see this article until you publish it.
          </p>
        )}
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

        <div className="d-flex justify-content-end" style={{ gap: "0.5rem" }}>
          <button
            className="btn btn-lg btn-outline-primary"
            type="submit"
            name="action"
            value="draft"
          >
            Save as Draft
          </button>
          <button
            className="btn btn-lg pull-xs-right btn-primary"
            type="submit"
            name="action"
            value="publish"
          >
            {slug ? "Update Article" : "Publish Article"}
          </button>
        </div>
      </fieldset>
    </form>
  );
}

export default ArticleEditorForm;
