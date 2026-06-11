import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import Login from "./app/Login.tsx";
import { AuthProvider, useAuth } from "./lib/auth.tsx";
import "./styles/index.css";

function Root() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div
          className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#b4ff57", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return user ? <App /> : <Login />;
}

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <Root />
  </AuthProvider>
);
