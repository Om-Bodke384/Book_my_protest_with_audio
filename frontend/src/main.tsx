import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import "./api/axios";
import "./index.css";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

const Root = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* Google sign-in buttons silently no-op if this isn't set, so local dev
        without a Google Client ID configured yet still works fine. */}
    {googleClientId ? <GoogleOAuthProvider clientId={googleClientId}>{Root}</GoogleOAuthProvider> : Root}
  </React.StrictMode>
);
