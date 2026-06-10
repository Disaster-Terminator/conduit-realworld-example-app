function BannerContainer({ children, coverImage }) {
  return (
    <div
      className={`banner${coverImage ? " has-cover" : ""}`}
      style={coverImage ? { backgroundImage: `url(${coverImage})` } : undefined}
    >
      <div className="container">
        {children}
      </div>
    </div>
  );
}

export default BannerContainer;