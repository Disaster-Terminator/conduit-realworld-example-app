import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import getArticle from "../../services/getArticle";
import setArticle from "../../services/setArticle";
import FormFieldset from "../FormFieldset";

const DRAFT = "draft";
const PUBLISHED = "published";

const emptyForm = { body: "", description: "", tagList: "", title: "" };

function ArticleEditorForm() {
  const { state } = useLocation();
  const [{ title, description, body, tagList }, setForm] = useState(
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

  const submitWith = (status) => (event) => {
    event?.preventDefault?.();

    if (!title) {
      setErrorMessage("A title is required");
      return;
    }
    if (status === PUBLISHED && (!description || !body)) {
      setErrorMessage("Description and body are required to publish");
      return;
    }

    setErrorMessage("");

    setArticle({
      body,
      description,
      headers,
      slug,
      status,
      tagList,
      title,
    })
      .then((newSlug) => navigate(`/article/${newSlug}`))
      .catch(setErrorMessage);
  };

  return (
    <form onSubmit={submitWith(PUBLISHED)} noValidate>
      <fieldset>
        {errorMessage && <span className="error-messages">{errorMessage}</span>}
        <FormFieldset
          handler={inputHandler}
          name="title"
          placeholder="Article Title"
          required
          value={title}
        ></FormFieldset>

        <FormFieldset
          handler={inputHandler}
          name="description"
          normal
          placeholder="What's this article about?"
          required
          value={description}
        ></FormFieldset>

        <fieldset className="form-group">
          <textarea
            className="form-control"
            name="body"
            onChange={inputHandler}
            placeholder="Write your article (in markdown)"
            required
            rows="8"
            value={body}
          ></textarea>
        </fieldset>

        <FormFieldset
          handler={tagsInputHandler}
          name="tags"
          normal
          placeholder="Enter tags"
          value={tagList}
        >
          <div className="tag-list"></div>
        </FormFieldset>

        <button
          className="btn btn-lg pull-xs-right btn-outline-primary"
          onClick={submitWith(DRAFT)}
          type="button"
        >
          {slug ? "Save as Draft" : "Save Draft"}
        </button>{" "}
        <button className="btn btn-lg pull-xs-right btn-primary" type="submit">
          {slug ? "Update & Publish" : "Publish Article"}
        </button>
      </fieldset>
    </form>
  );
}

export default ArticleEditorForm;
