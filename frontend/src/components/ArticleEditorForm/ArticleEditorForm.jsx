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
  scheduledAt: "",
};

function ArticleEditorForm() {
  const { state } = useLocation();
  const [form, setForm] = useState(state || emptyForm);
  const { title, description, body, tagList, status, scheduledAt } = form;
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const { isAuth, headers, loggedUser } = useAuth();

  const navigate = useNavigate();
  const { slug } = useParams();
  const isEditing = !!slug;

  // Load article data when editing
  useEffect(() => {
    const redirect = () => navigate("/", { replace: true, state: null });
    if (!isAuth) return redirect();

    if (state || !slug) return;

    getArticle({ headers, slug })
      .then((article) => {
        if (article.author.username !== loggedUser.username) redirect();

        setForm({
          title: article.title || "",
          description: article.description || "",
          body: article.body || "",
          tagList: article.tagList || [],
          status: article.status || "published",
          scheduledAt: article.scheduledAt
            ? new Date(article.scheduledAt).toISOString().slice(0, 16)
            : "",
        });

        // If editing a scheduled article, show the schedule prompt
        if (article.status === "scheduled") {
          setShowScheduleModal(true);
        }
      })
      .catch(console.error);

    return () => setForm(emptyForm);
  }, [headers, isAuth, loggedUser?.username, navigate, slug, state]);

  const inputHandler = (e) => {
    const type = e.target.name;
    const value = e.target.value;

    setForm((f) => ({ ...f, [type]: value }));
  };

  const tagsInputHandler = (e) => {
    const value = e.target.value;

    setForm((f) => ({ ...f, tagList: value.split(/,| /) }));
  };

  const handleSubmit = async (overrides = {}) => {
    setErrorMessage("");
    setSuccessMessage("");

    const payload = {
      headers,
      slug,
      title,
      description,
      body,
      tagList: Array.isArray(tagList) ? tagList : [],
      status: overrides.status || form.status,
      scheduledAt: overrides.scheduledAt !== undefined
        ? overrides.scheduledAt
        : form.scheduledAt || undefined,
    };

    try {
      const result = await setArticle(payload);

      if (!result || !result.slug) {
        setErrorMessage("Failed to save article.");
        return;
      }

      setSuccessMessage(
        result.status === "draft"
          ? "Draft saved successfully!"
          : result.status === "scheduled"
            ? `Article scheduled for ${new Date(result.scheduledAt).toLocaleString()}`
            : "Article published successfully!",
      );

      // Update slug in URL if creating new article
      if (!slug && result.slug) {
        navigate(`/editor/${result.slug}`, { replace: true });
      }
    } catch (error) {
      setErrorMessage(error.message || "An error occurred");
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit();
  };

  // Custom modal for editing scheduled articles
  const ScheduleModal = () => {
    if (!showScheduleModal) return null;

    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
        onClick={() => setShowScheduleModal(false)}
      >
        <div
          style={{
            background: "#fff",
            padding: "2rem",
            borderRadius: "8px",
            maxWidth: "400px",
            width: "90%",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h4>Scheduled Article</h4>
          <p>What would you like to do with this scheduled article?</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowScheduleModal(false);
                // Keep schedule — continue editing as scheduled
                setForm((f) => ({ ...f, status: "scheduled" }));
              }}
            >
              Keep Schedule
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowScheduleModal(false);
                setForm((f) => ({ ...f, status: "draft", scheduledAt: "" }));
                handleSubmit({ status: "draft", scheduledAt: null });
              }}
            >
              Cancel Schedule (Move to Draft)
            </button>
            <button
              className="btn btn-outline-primary"
              onClick={() => {
                setShowScheduleModal(false);
                // Allow user to modify schedule time
                setForm((f) => ({ ...f, status: "scheduled" }));
              }}
            >
              Modify Schedule
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <fieldset>
        {errorMessage && (
          <span className="error-messages" style={{ display: "block", marginBottom: "1rem" }}>
            {errorMessage}
          </span>
        )}
        {successMessage && (
          <span
            style={{
              display: "block",
              marginBottom: "1rem",
              color: "#5cb85c",
              fontWeight: "bold",
            }}
          >
            {successMessage}
          </span>
        )}

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
          required={status === "published"}
          value={description}
          handler={inputHandler}
        />

        <fieldset className="form-group">
          <textarea
            className="form-control"
            rows="8"
            placeholder="Write your article (in markdown)"
            name="body"
            required={status === "published"}
            value={body}
            onChange={inputHandler}
          />
        </fieldset>

        <FormFieldset
          normal
          placeholder="Enter tags"
          name="tags"
          value={Array.isArray(tagList) ? tagList.join(", ") : tagList}
          handler={tagsInputHandler}
        >
          <div className="tag-list" />
        </FormFieldset>

        {/* Scheduled publish time picker */}
        <fieldset className="form-group" style={{ marginBottom: "1rem" }}>
          <label htmlFor="scheduledAt" style={{ display: "block", marginBottom: "0.25rem", color: "#666" }}>
            Schedule publish time (optional):
          </label>
          <input
            id="scheduledAt"
            type="datetime-local"
            className="form-control"
            name="scheduledAt"
            value={scheduledAt || ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                scheduledAt: e.target.value,
                status: e.target.value ? "scheduled" : f.status,
              }))
            }
            style={{ maxWidth: "280px" }}
          />
        </fieldset>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => handleSubmit({ status: "draft" })}
          >
            Save as Draft
          </button>

          <button
            type="button"
            className="btn btn-outline-info"
            onClick={() => {
              const time = scheduledAt || new Date(Date.now() + 3600000).toISOString().slice(0, 16);
              setForm((f) => ({ ...f, scheduledAt: time, status: "scheduled" }));
              handleSubmit({ status: "scheduled", scheduledAt: time });
            }}
          >
            Schedule
          </button>

          <button className="btn btn-lg btn-primary" type="submit">
            {isEditing ? "Update Article" : "Publish Now"}
          </button>
        </div>
      </fieldset>

      <ScheduleModal />
    </form>
  );
}

export default ArticleEditorForm;
