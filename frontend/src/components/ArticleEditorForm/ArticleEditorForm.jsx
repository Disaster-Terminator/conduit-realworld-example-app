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
  const [statusMessage, setStatusMessage] = useState("");
  const { isAuth, headers, loggedUser } = useAuth();

  const navigate = useNavigate();
  const { slug } = useParams();

  useEffect(() => {
    const redirect = () => navigate("/", { replace: true, state: null });
    if (!isAuth) return redirect();

    if (state || !slug) return;

    getArticle({ headers, slug })
      .then(
        ({
          author: { username },
          body,
          description,
          status: articleStatus,
          tagList,
          title,
        }) => {
          if (username !== loggedUser.username) redirect();

          setForm({
            body,
            description,
            status: articleStatus || "published",
            tagList,
            title,
          });
        },
      )
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

  const save = (targetStatus) => {
    setForm((form) => ({ ...form, status: targetStatus }));

    return setArticle({
      headers,
      slug,
      body,
      description,
      tagList,
      title,
      status: targetStatus,
    }).then((returnedSlug) => {
      if (targetStatus === "published") {
        navigate(`/article/${returnedSlug}`);
      } else if (!slug) {
        navigate(`/editor/${returnedSlug}`, { replace: true });
        setStatusMessage("Draft saved.");
      } else {
        setStatusMessage("Draft saved.");
      }
    });
  };

  const handlePublish = (e) => {
    e.preventDefault();
    save("published").catch((message) => setStatusMessage(message));
  };

  const handleSaveDraft = (e) => {
    e.preventDefault();
    save("draft").catch((message) => setStatusMessage(message));
  };

  const isDraft = status === "draft";
  const primaryText = !slug
    ? "Publish Article"
    : isDraft
      ? "Publish Article"
      : "Update Article";
  const bodyRequired = !isDraft;
  const descriptionRequired = !isDraft;

  return (
    <form onSubmit={handlePublish}>
      <fieldset>
        {statusMessage && <span className="error-messages">{statusMessage}</span>}
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

        <div style={{ float: "right" }}>
          <button
            type="button"
            className="btn btn-lg btn-outline-primary"
            onClick={handleSaveDraft}
          >
            Save Draft
          </button>{" "}
          <button
            type="submit"
            className="btn btn-lg btn-primary"
          >
            {primaryText}
          </button>
        </div>
      </fieldset>
    </form>
  );
}

export default ArticleEditorForm;
