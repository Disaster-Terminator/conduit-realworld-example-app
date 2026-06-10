import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import getArticle from "../../services/getArticle";
import setArticle from "../../services/setArticle";
import FormFieldset from "../FormFieldset";

const emptyForm = { title: "", description: "", body: "", tagList: "", status: "draft" };

function ArticleEditorForm() {
  const { state } = useLocation();
  const [{ title, description, body, tagList, status }, setForm] = useState(
    state || emptyForm,
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { isAuth, headers, loggedUser } = useAuth();

  const navigate = useNavigate();
  const { slug } = useParams();

  useEffect(() => {
    const redirect = () => navigate("/", { replace: true, state: null });
    if (!isAuth) return redirect();

    if (state || !slug) return;

    getArticle({ headers, slug })
      .then(({ author: { username }, body, description, tagList, title, status }) => {
        if (username !== loggedUser.username) redirect();

        setForm({ body, description, tagList, title, status });
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

  const publishArticle = (e) => {
    e.preventDefault();
    setSuccessMessage("");

    setArticle({ headers, slug, body, description, tagList, title, status: "published" })
      .then((slug) => navigate(`/article/${slug}`))
      .catch(setErrorMessage);
  };

  const saveDraft = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    setArticle({ headers, slug, body, description, tagList, title, status: "draft" })
      .then(() => setSuccessMessage("Draft saved!"))
      .catch(setErrorMessage);
  };

  const isEditingDraft = Boolean(slug && status === "draft");
  const isEditingPublished = Boolean(slug && status === "published");

  return (
    <form>
      <fieldset>
        {errorMessage && <span className="error-messages">{errorMessage}</span>}
        {successMessage && (
          <span className="text-success" style={{ display: "block", marginBottom: "1rem" }}>
            {successMessage}
          </span>
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

        {isEditingPublished ? (
          <button
            className="btn btn-lg pull-xs-right btn-primary"
            type="submit"
            onClick={publishArticle}
          >
            Update Article
          </button>
        ) : (
          <>
            <button
              className="btn btn-lg pull-xs-right btn-primary"
              type="submit"
              onClick={publishArticle}
              style={{ marginLeft: "0.5rem" }}
            >
              {slug ? "Publish Article" : "Publish Article"}
            </button>
            <button
              className="btn btn-lg pull-xs-right btn-outline-primary"
              type="submit"
              onClick={saveDraft}
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
