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
  const [
    { title, description, body, tagList, status },
    setForm,
  ] = useState(state || emptyForm);
  const [errorMessage, setErrorMessage] = useState("");
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

        setForm({
          body,
          description,
          tagList,
          title,
          status: status || "published",
        });
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

  const submit = (e, nextStatus) => {
    e.preventDefault();
    const targetStatus = nextStatus || status;
    setArticle({
      body,
      description,
      headers,
      slug,
      status: targetStatus,
      tagList,
      title,
    })
      .then(({ slug: returnedSlug, status: returnedStatus }) => {
        if (returnedStatus === "draft") {
          navigate(`/editor/${returnedSlug}`);
        } else {
          navigate(`/article/${returnedSlug}`);
        }
      })
      .catch(setErrorMessage);
  };

  const isDraft = status === "draft";
  const descriptionRequired = !isDraft;
  const bodyRequired = !isDraft;

  return (
    <form onSubmit={submit}>
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
          required={descriptionRequired}
          value={description}
          handler={inputHandler}
        ></FormFieldset>

        <fieldset className="form-group">
          <textarea
            className="form-control"
            rows="8"
            placeholder="Write your article (in markdown)"
            name="body"
            required={bodyRequired}
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

        {isDraft && (
          <button
            className="btn btn-lg pull-xs-right btn-outline-primary"
            type="button"
            onClick={(e) => submit(e, "published")}
          >
            Publish
          </button>
        )}

        {!isDraft && !slug && (
          <button
            className="btn btn-lg pull-xs-right btn-outline-primary"
            type="button"
            onClick={(e) => submit(e, "draft")}
          >
            Save Draft
          </button>
        )}

        <button
          className="btn btn-lg pull-xs-right btn-primary"
          type="submit"
        >
          {slug ? "Update Article" : "Publish Article"}
        </button>
      </fieldset>
    </form>
  );
}

export default ArticleEditorForm;
