import React, { useState } from "react";
import { loginWithEmail } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { Meteor } from "meteor/meteor";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await loginWithEmail(email, password);

    const idToken = result.data.idToken;

    if (result.success) {
      const user_id = result.data.localId;

      try {
        const userProfile = await Meteor.callAsync("users.getById", user_id);
        console.log("User profile fetched:", userProfile);

        localStorage.setItem("user_profile", JSON.stringify(userProfile));
        localStorage.setItem("user_id", user_id);
        localStorage.setItem("auth_id_token", JSON.stringify(idToken));

        if (window.plugins && window.plugins.toast) {
          window.plugins.toast.showWithOptions(
            {
              message: "Login & Profile Loaded!",
              duration: "short",
              position: "bottom",
            },
            () => navigate("/home"),
            (err) => {
              console.error("Toast failed", err);
              navigate("/home");
            }
          );
        } else {
          navigate("/home");
        }

      } catch (err) {
        console.error("Error fetching user profile:", err);
        setMessage(`Login succeeded but profile fetch failed: ${err.message}`);
      }

    } else {
      setMessage(`Error: ${result.error}`);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Login</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Login</button>
      </form>
      {message && <p style={styles.message}>{message}</p>}
      <p style={styles.link} onClick={() => navigate("/signup")}>Don't have an account? Sign Up</p>
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    marginTop: "50px",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "24px",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  input: {
    padding: "12px",
    margin: "8px",
    width: "250px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "12px 20px",
    backgroundColor: "#42A5F5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
  },
  message: {
    marginTop: "10px",
    color: "red",
  },
  link: {
    marginTop: "20px",
    color: "#1976d2",
    cursor: "pointer",
  },
};
