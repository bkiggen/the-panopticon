import panopticonLogo from "/panopticon.png";

export const Header = () => {
  return (
    <header>
      <img
        src={panopticonLogo}
        className="logo"
        alt="Panopticon logo"
        style={{
          width: "300px",
          objectFit: "cover",
        }}
      />
    </header>
  );
};
