import { useFeedContext } from "../../context/FeedContext";

function FeedNavLink({ icon, name, text }) {
  const { tabName, changeTab } = useFeedContext();

  const handleClick = (e) => {
    changeTab(e, name, name === "tag" ? text : undefined);
  };

  return (
    <li className="nav-item">
      <button
        className={`nav-link ${tabName === name ? "active" : ""}`}
        onClick={handleClick}
      >
        {icon && <i className="ion-pound"></i>} {text}
      </button>
    </li>
  );
}

export default FeedNavLink;
