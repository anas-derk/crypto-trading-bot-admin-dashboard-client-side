import "../Scss/index.css";
import "../components/AdminPanelHeader/admin_panel_header.css";
import "../components/ErrorOnLoadingThePage/error_on_loading_the_page.css";
import "../pages/login/login.css";
import "../../config/i18n";

export default function App({ Component, pageProps }) {
  return (
    <Component {...pageProps} />
  );
}