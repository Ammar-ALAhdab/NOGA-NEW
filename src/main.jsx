import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider.jsx";
import { SaleProvider } from "./context/SaleProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <AuthProvider>
      <SaleProvider>
        <Routes>
          <Route path="/*" element={<App />} />
        </Routes>
      </SaleProvider>
    </AuthProvider>
  </Router>
);
