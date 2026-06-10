import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import getArticle from "../../services/getArticle";
import setArticle from "../../services/setArticle";
import FormFieldset from "../FormFieldset";

const emptyForm = { title: "", description: "", body: "", tagList: "" };

function ArticleEditorForm() {
  const { state } = useLocation();
  const [{ title, description, body, tagList, published, scheduledAt }, setForm] =
    useState(state || emptyForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState("");
  const { isAuth, headers, loggedUser } = useAuth();

  const navigate = useNavigate();
  const { slug } = useParams();

  useEffect(() => {
    const redirect = () => navigate("/", { replace: true, state: null });
    if (!isAuth) return redirect();

    if (state || !slug) return;

    getArticle({ headers, slug })
      .then(({ author: { username }, body, description, tagList, title, published: pub, scheduledAt: sched }) => {
        if (username !== loggedUser.username) redirect();

        setForm({
          body,
          description,
          tagList,
          title,
          published: pub,
          scheduledAt: sched,
        });

        // Auto-publish if scheduled time has passed
        if (sched && new Date(sched) <= new Date()) {
          setArticle({
            headers,
            slug,
            body,
            description,
            tagList,
            title,
            published: true,
            scheduledAt: null,
          }).catch(() => {
            // Silent fail — user can manually publish
          });
        }
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

  const formSubmit = (e, action) => {
    e.preventDefault();

    let submitPublished = published;
    let submitScheduledAt = scheduledAt;

    if (action === "draft") {
      submitPublished = false;
      submitScheduledAt = null;
    } else if (action === "publish") {
      submitPublished = true;
      submitScheduledAt = null;
    } else if (action === "schedule") {
      submitPublished = false;
      submitScheduledAt = scheduleDateTime
        ? new Date(scheduleDateTime).toISOString()
        : null;
    }

    setArticle({
      headers,
      slug,
      body,
      description,
      tagList,
      title,
      published: submitPublished,
      scheduledAt: submitScheduledAt,
    })
      .then((newSlug) => {
        if (action === "publish") {
          navigate(`/article/${newSlug}`);
        } else if (action === "draft") {
          setErrorMessage("");
          // Stay on editor with a saved indication
        } else if (action === "schedule") {
          navigate(`/profile/${loggedUser.username}/drafts`);
        }
      })
      .catch(setErrorMessage);
  };

  const isEditingPublished = slug && published === true;

  return (
    <form onSubmit={(e) => formSubmit(e, "publish")}>
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

        <div className="btn-group" style={{ display: "flex", gap: "0.5rem" }}>
          {/* Publish / Update button — always primary */}
          <button
            className="btn btn-lg pull-xs-right btn-primary"
            type="submit"
          >
            {slug ? (isEditingPublished ? "Update Article" : "Publish Article") : "Publish Article"}
          </button>

          {/* Save Draft — only for new articles or existing drafts */}
          {!isEditingPublished && (
            <button
              className="btn btn-lg pull-xs-right btn-outline-secondary"
              type="button"
              onClick={(e) => formSubmit(e, "draft")}
            >
              Save Draft
            </button>
          )}

          {/* Schedule — only for new articles or existing drafts */}
          {!isEditingPublished && (
            <button
              className="btn btn-lg pull-xs-right btn-outline-info"
              type="button"
              onClick={() => setShowSchedulePicker(!showSchedulePicker)}
            >
              Schedule…
            </button>
          )}
        </div>

        {showSchedulePicker && (
          <div style={{ marginTop: "1rem" }}>
            <label htmlFor="schedule-datetime">
              Schedule date and time:
            </label>
            <input
              id="schedule-datetime"
              type="datetime-local"
              className="form-control"
              style={{ marginTop: "0.5rem" }}
              value={scheduleDateTime}
              onChange={(e) => setScheduleDateTime(e.target.value)}
            />
            <button
              className="btn btn-sm btn-primary"
              style={{ marginTop: "0.5rem" }}
              type="button"
              disabled={!scheduleDateTime}
              onClick={(e) => formSubmit(e, "schedule")}
            >
              Confirm Schedule
            </button>
          </div>
        )}
      </fieldset>
    </form>
  );
}

export default ArticleEditorForm;
