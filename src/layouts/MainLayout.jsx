import Header from "../components/Header/index.jsx";
import Menu from "../components/Menu/index.jsx";
import Footer from "../components/Footer/index.jsx";

function MainLayout({ children }) {
  return (
    <>
      <Header style={{ position: "sticky", top: 0, zIndex: 100 }} />
      <Menu />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default MainLayout;
