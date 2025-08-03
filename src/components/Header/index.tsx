import panopticonLogo from "/panopticon.png";

export const Header = () => {
  return (
    <header
      style={{
        backgroundImage: `url(${panopticonLogo})`,
        backgroundRepeat: "repeat-x",
        backgroundPosition: "-100px 0",
        backgroundSize: "300px auto", // maintains your 300px width
        height: "90px",
      }}
    >
      {/* Content can go here if needed */}
    </header>
  );
};
