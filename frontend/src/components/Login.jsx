import React, { useState } from "react";
import { login } from "../api";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin, apiBase }) {
  const [username, setUsername] = useState("admin@agrimanage.com");
  const [password, setPassword] = useState("admin123");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  console.log("🔐 Login component mounted", { apiBase, hasOnLogin: !!onLogin });

  // Function to add timeout to any promise
  const withTimeout = (promise, timeoutMs = 10000) => {
    console.log(`⏰ Setting timeout of ${timeoutMs}ms for request`);
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => {
          console.warn(`⏰ Request timed out after ${timeoutMs}ms`);
          reject(new Error(`Request timed out after ${timeoutMs}ms`));
        }, timeoutMs)
      ),
    ]);
  };

  async function submit(e) {
    e.preventDefault();
    console.log("🚀 Login form submitted", {
      username,
      passwordLength: password.length,
    });

    setMsg("");
    setLoading(true);

    try {
      console.log("📡 Attempting login...", { apiBase, username });

      // Wrap the login call with timeout. Call signature: login(username, password)
      const data = await withTimeout(login(username, password), 10000);

      console.log("✅ Login successful", {
        hasAccessToken: !!data.access_token,
        dataKeys: Object.keys(data),
        userRoles: data.user?.roles,
      });

      // Store tokens and user info. Prefer onLogin callback if provided.
      try {
        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
        }
        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
        }
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        localStorage.setItem("logged_in", "true");
      } catch (e) {
        console.warn("Failed to persist tokens to localStorage", e);
      }

      if (onLogin) {
        onLogin(data);
      }

      // Navigate based on user role
      const userRoles = data.user?.roles || [];
      console.log("🔀 Routing user based on roles:", userRoles);

      if (userRoles.includes("ADMIN") || userRoles.includes("OPERATOR")) {
        navigate("/operator");
      } else if (userRoles.includes("VIEWER")) {
        navigate("/viewer");
      } else if (userRoles.includes("FARMER")) {
        navigate("/farmer");
      } else {
        // Default fallback
        navigate("/operator");
      }
    } catch (err) {
      console.error("❌ Login failed", {
        error: err.message,
        errorType: err.constructor.name,
      });
      setMsg(err.message);
    } finally {
      console.log("🏁 Login process completed", { loading: false });
      setLoading(false);
    }
  }

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    console.log("📝 Username changed", {
      from: username,
      to: newUsername,
      length: newUsername.length,
    });
    setUsername(newUsername);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    console.log("🔑 Password changed", {
      length: newPassword.length,
      masked: "*".repeat(newPassword.length),
    });
    setPassword(newPassword);
  };

  console.log("🎨 Rendering Login component", {
    loading,
    hasMessage: !!msg,
    username,
    passwordLength: password.length,
  });

  return (
    <div className="view" style={{ display: "flex", justifyContent: "center" }}>
      <div className="card" style={{ width: 420 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <h2 style={{ margin: 0 }}>Login</h2>
          <button
            className="btn-icon"
            title="Scan QR"
            onClick={() => console.log("📷 QR scan button clicked")}
          >
            📷
          </button>
        </div>
        <form onSubmit={submit}>
          <label>Email or NRC</label>
          <input
            type="text"
            value={username}
            onChange={handleUsernameChange}
            onFocus={() => console.log("👆 Username input focused")}
            onBlur={() => console.log("👋 Username input blurred")}
            required
          />
          <label style={{ marginTop: 12 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            onFocus={() => console.log("👆 Password input focused")}
            onBlur={() => console.log("👋 Password input blurred")}
            required
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 18,
            }}
          >
            <button
              type="submit"
              disabled={loading}
              onClick={() =>
                console.log("🖱️ Login button clicked", { loading })
              }
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
        {msg && (
          <div className="message" style={{ color: "red", marginTop: 10 }}>
            {msg}
          </div>
        )}

        {/* Debug info - remove in production */}
        <div
          style={{
            marginTop: 20,
            padding: 10,
            background: "#f5f5f5",
            borderRadius: 4,
            fontSize: "12px",
            fontFamily: "monospace",
          }}
        >
          <strong>Debug Info:</strong>
          <div>API Base: {apiBase}</div>
          <div>Loading: {loading.toString()}</div>
          <div>Has onLogin: {(!!onLogin).toString()}</div>
          <div>Username: {username}</div>
          <div>Password length: {password.length}</div>
        </div>
      </div>
    </div>
  );
}
