import React, { useState } from "react";
import { signUpWithEmail, deleteFirebaseUser } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { Meteor } from "meteor/meteor";

export const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    mobile: "",
    age: "",
    height: "",
    weight: ""
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    const {
      email,
      password,
      confirmPassword,
      first_name,
      last_name,
      mobile,
      age,
      height,
      weight
    } = formData;

    if (password !== confirmPassword) {
      setMessage("Error: Passwords do not match");
      return;
    }

    const result = await signUpWithEmail(email, password);

    const idToken = result.data.idToken;

    console.log(result);

    // const result = {success:true, data:{localID:"4567898765hgvuyuybuybuibu"}};

    if (result.success) {

        const now = new Date().toISOString();
        const user_id = result.data.localId;  // e.g., Firebase UID

        const payload = {
          user_id,
          first_name,
          last_name,
          email,
          mobile,
          age: parseInt(age),
          height: parseFloat(height),
          weight: parseFloat(weight),
          created_at: now,
          updated_at: now,
        };
      
        try {
          const res = await Meteor.callAsync("users.insert", payload);
          console.log("User profile created:", res);
          localStorage.setItem("user_profile", JSON.stringify(res.data));
          localStorage.setItem("user_id", res.data.user_id);
          localStorage.setItem("auth_id_token", JSON.stringify(idToken));
      
          if (window.plugins && window.plugins.toast) {
            window.plugins.toast.showWithOptions(
              {
                message: "Signup & Profile Created Successfully!",
                duration: "short",
                position: "bottom",
              },
              () => navigate("/home"), // Success callback
              (err) => console.error("Toast failed", err) // Error callback
            );
          } else {
            console.error("Cordova toast plugin not available.");
            navigate("/home");
          }
      
        } catch (err) {
          console.error("Error inserting user profile:", err);
          setMessage(`Signup succeeded but saving profile failed. Please try signup again: ${err.message}`);
          try {
            const res = await deleteFirebaseUser(idToken);
            console.log("User deleted:", res);
          } catch (err) {
            console.error("Failed to delete user:", err.message);
          }
        }

    } else {
      setMessage(`Error: ${result.error}`);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Sign Up</h2>
      <form onSubmit={handleSignUp} style={styles.form}>
        <input name="first_name" type="text" placeholder="First Name" value={formData.first_name} onChange={handleChange} required style={styles.input} />
        <input name="last_name" type="text" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required style={styles.input} />
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required style={styles.input} />
        <input name="mobile" type="tel" placeholder="Mobile" value={formData.mobile} onChange={handleChange} required style={styles.input} />
        <input name="age" type="number" placeholder="Age" value={formData.age} onChange={handleChange} required style={styles.input} />
        <input name="height" type="number" placeholder="Height (cm)" value={formData.height} onChange={handleChange} required style={styles.input} />
        <input name="weight" type="number" placeholder="Weight (kg)" value={formData.weight} onChange={handleChange} required style={styles.input} />
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required style={styles.input} />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required style={styles.input} />
        <button type="submit" style={styles.button}>Sign Up</button>
      </form>
      {message && <p style={styles.message}>{message}</p>}
      <p style={styles.link} onClick={() => navigate("/")}>Already have an account? Login</p>
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
