import { useFeedContext } from "../../context/FeedContext";

function TagButton({ tagsList }) {
  const { changeTab } = useFeedContext();

  const handleClick = (name) => (e) => {
    changeTab(e, "tag", name);
  };

  return tagsList.map(({ name, count }) => (
    <button
      className="tag-pill tag-default"
      key={name}
      onClick={handleClick(name)}
    >
      {name} ({count})
    </button>
  ));
}

export default TagButton;
