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
  const [successMessage, setSuccessMessage] = useState("");
  const [articleStatus, setArticleStatus] = useState("draft");
  const [currentSlug, setCurrentSlug] = useState(null);
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

        setForm({ body, description, tagList, title });
        setArticleStatus(status || "draft");
        setCurrentSlug(slug);
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

  const handleSaveDraft = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const newSlug = await setArticle({
        headers,
        slug: currentSlug,
        body,
        description,
        tagList,
        title,
        status: "draft",
      });

      if (!currentSlug) {
        setCurrentSlug(newSlug);
      }

      setArticleStatus("draft");
      setSuccessMessage("Draft saved");
    } catch (error) {
      setErrorMessage(error.message || "Failed to save draft");
    }
  };

  const handlePublish = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const newSlug = await setArticle({
        headers,
        slug: currentSlug,
        body,
        description,
        tagList,
        title,
        status: "published",
      });

      navigate(`/article/${newSlug}`);
    } catch (error) {
      setErrorMessage(error.message || "Failed to publish article");
    }
  };

  const isEditing = Boolean(slug || currentSlug);
  const isEditingPublished = isEditing && articleStatus === "published";

  return (
    <form>
      <fieldset>
        {errorMessage && <span className="error-messages">{errorMessage}</span>}
        {successMessage && (
          <span className="success-messages" style={{ color: "green" }}>
            {successMessage}
          </span>
        )}
        <FormFieldset
          placeholder="Article Title"
          name="title"
          required={!isEditingPublished}
          value={title}
          handler={inputHandler}
        ></FormFieldset>

        <FormFieldset
          normal
          placeholder="What's this article about?"
          name="description"
          required={!isEditingPublished}
          value={description}
          handler={inputHandler}
        ></FormFieldset>

        <fieldset className="form-group">
          <textarea
            className="form-control"
            rows="8"
            placeholder="Write your article (in markdown)"
            name="body"
            required={!isEditingPublished}
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

        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button
            className="btn btn-lg btn-outline-primary"
            type="button"
            onClick={handleSaveDraft}
          >
            {isEditingPublished ? "Save as Draft" : "Save Draft"}
          </button>

          <button
            className="btn btn-lg btn-primary"
            type="button"
            onClick={handlePublish}
          >
            {isEditing && articleStatus === "published"
              ? "Update & Publish"
              : isEditing && articleStatus === "draft"
                ? "Publish"
                : "Publish Article"}
          </button>
        </div>
      </fieldset>
    </form>
  );
}

export default ArticleEditorForm;
