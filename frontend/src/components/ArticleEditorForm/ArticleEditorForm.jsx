import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import getArticle from "../../services/getArticle";
import setArticle from "../../services/setArticle";
import FormFieldset from "../FormFieldset";

const emptyForm = { title: "", description: "", body: "", tagList: "" };

function ArticleEditorForm() {
  const { state } = useLocation();
  const [form, setForm] = useState(state || emptyForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [articleStatus, setArticleStatus] = useState("draft");
  const { isAuth, headers, loggedUser } = useAuth();

  const navigate = useNavigate();
  const { slug } = useParams();
  const isEditMode = !!slug;
  const isDraft = articleStatus === "draft";

  const { title, description, body, tagList } = form;

  useEffect(() => {
    const redirect = () => navigate("/", { replace: true, state: null });
    if (!isAuth) return redirect();

    if (state || !slug) return;

    getArticle({ headers, slug })
      .then(({ author: { username }, body, description, tagList, title, status }) => {
        if (username !== loggedUser.username) redirect();

        setForm({ body, description, tagList, title });
        setArticleStatus(status || "draft");
      })
      .catch(console.error);

    return () => {
      setForm(emptyForm);
      setArticleStatus("draft");
    };
  }, [headers, isAuth, loggedUser.username, navigate, slug, state]);

  const inputHandler = (e) => {
    const type = e.target.name;
    const value = e.target.value;

    setForm((form) => ({ ...form, [type]: value }));
  };

  const tagsInputHandler = (e) => {
    const value = e.target.value;

    setForm((form) => ({ ...form, tagList: value ? value.split(/,| /) : [] }));
  };

  const saveDraft = (e) => {
    e.preventDefault();

    setArticle({ headers, slug, body, description, tagList, title, status: "draft" })
      .then((newSlug) => {
        if (!slug) {
          navigate(`/editor/${newSlug}`, { replace: true });
        } else {
          setErrorMessage("");
        }
      })
      .catch(setErrorMessage);
  };

  const publishArticle = (e) => {
    e.preventDefault();

    setArticle({
      headers,
      slug,
      body,
      description,
      tagList,
      title,
      status: isEditMode && !isDraft ? undefined : "published",
    })
      .then((newSlug) => navigate(`/article/${newSlug}`))
      .catch(setErrorMessage);
  };

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
        />

        <FormFieldset
          normal
          placeholder="What's this article about?"
          name="description"
          required
          value={description}
          handler={inputHandler}
        />

        <fieldset className="form-group">
          <textarea
            className="form-control"
            rows="8"
            placeholder="Write your article (in markdown)"
            name="body"
            required
            value={body}
            onChange={inputHandler}
          />
        </fieldset>

        <FormFieldset
          normal
          placeholder="Enter tags"
          name="tags"
          value={tagList}
          handler={tagsInputHandler}
        >
          <div className="tag-list" />
        </FormFieldset>

        {isEditMode && !isDraft ? (
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
              className="btn btn-lg pull-xs-right btn-outline-primary"
              type="submit"
              onClick={saveDraft}
              style={{ marginRight: "0.5rem" }}
            >
              Save Draft
            </button>
            <button
              className="btn btn-lg pull-xs-right btn-primary"
              type="submit"
              onClick={publishArticle}
            >
              Publish Article
            </button>
          </>
        )}
      </fieldset>
    </form>
  );
}

export default ArticleEditorForm;
