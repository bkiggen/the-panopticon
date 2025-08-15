// import useSessionStore from "@/stores/sessionStore";

export const Header = () => {
  // const { logout } = useSessionStore();

  // logout();

  return (
    <header
      style={{
        backgroundImage: `url(/panopticon.png)`,
        backgroundRepeat: "repeat-x",
        backgroundPosition: "-100px 0",
        backgroundSize: "300px auto",
        height: "90px",
      }}
    />
  );
};
