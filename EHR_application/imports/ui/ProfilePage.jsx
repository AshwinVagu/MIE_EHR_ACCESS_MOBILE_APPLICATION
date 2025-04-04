import React, { useEffect, useState } from "react";
import { Meteor } from "meteor/meteor";

export const ProfilePage = () => {
  const [formData, setFormData] = useState(null);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const profile = localStorage.getItem("user_profile");
    if (profile) {
      setFormData(JSON.parse(profile));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const payload = {
      ...formData,
      age: parseInt(formData.age),
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
      updated_at: new Date().toISOString(),
    };

    try {
      await Meteor.call("users.update", payload);
      localStorage.setItem("user_profile", JSON.stringify(payload));
      setMessage("Profile updated successfully.");
      setEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage(`Update failed: ${err.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      // Call Firebase logout API here
  
      // Clear localStorage and redirect
      localStorage.removeItem("user_profile");
      localStorage.removeItem("user_id");
      localStorage.removeItem("auth_id_token");
  
      if (window.plugins && window.plugins.toast) {
        window.plugins.toast.showWithOptions(
          {
            message: "Logged out successfully!",
            duration: "short",
            position: "bottom",
          },
          () => window.location.href = "/", // navigate to login
          (err) => console.error("Toast failed", err)
        );
      } else {
        window.location.href = "/";
      }
  
    } catch (err) {
      console.error("Logout failed:", err);
      setMessage("Logout failed. Please try again.");
    }
  };
  

  if (!formData) {
    return <div style={styles.loading}>Loading profile...</div>;
  }

  return (
    <div style={styles.scrollContainer}>
      <div style={styles.container}>
      <div style={styles.avatarWrapper}>
        <div style={styles.avatar}>
            {/* Placeholder initials or icon */}
            <span style={styles.avatarText}>
            {formData?.first_name?.[0] || "U"}
            </span>
        </div>
        </div>

        {!editing ? (
          <>
            <div style={styles.displayBox}>
              <h3 style={styles.name}>
                {formData.first_name} {formData.last_name}
              </h3>
              <p style={styles.email}>{formData.email}</p>

              <ProfileItem label="Mobile" value={formData.mobile} />
              <ProfileItem label="Age" value={formData.age} />
              <ProfileItem label="Height" value={`${formData.height} cm`} />
              <ProfileItem label="Weight" value={`${formData.weight} kg`} />
            </div>
          </>
        ) : (
          <>
            {[
              { name: "first_name", label: "First Name" },
              { name: "last_name", label: "Last Name" },
              { name: "mobile", label: "Mobile" },
              { name: "age", label: "Age" },
              { name: "height", label: "Height (cm)" },
              { name: "weight", label: "Weight (kg)" },
            ].map(({ name, label }) => (
              <div key={name} style={styles.inputGroup}>
                <label style={styles.label}>{label}</label>
                <input
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            ))}
          </>
        )}

        <div style={styles.buttonGroup}>
          {editing ? (
            <>
              <button style={styles.saveButton} onClick={handleSave}>Save</button>
              <button style={styles.cancelButton} onClick={() => setEditing(false)}>Cancel</button>
            </>
          ) : (
            <button style={styles.editButton} onClick={() => setEditing(true)}>Edit Profile</button>
          )}
        </div>

        {message && <p style={styles.message}>{message}</p>}
      </div>
      <div style={styles.logoutCard}>
        <button style={styles.logoutButton} onClick={handleLogout}>
            Logout
        </button>
        </div>
    </div>
  );
};

const ProfileItem = ({ label, value }) => (
  <div style={styles.profileRow}>
    <span style={styles.profileLabel}>{label}</span>
    <span style={styles.profileValue}>{value}</span>
  </div>
);

const styles = {
  scrollContainer: {
    height: "100vh",
    overflowY: "auto",
    backgroundColor: "#fafafa",
    padding: "16px",
    boxSizing: "border-box",
  },
  container: {
    maxWidth: "500px",
    margin: "0 auto",
    padding: "24px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  title: {
    fontSize: "22px",
    fontWeight: "600",
    marginBottom: "24px",
    textAlign: "center",
    color: "#222",
  },
  displayBox: {
    marginBottom: "20px",
  },
  name: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "4px",
    color: "#111",
    textAlign: "center",
  },
  email: {
    fontSize: "14px",
    color: "#555",
    marginBottom: "24px",
    textAlign: "center",
  },
  profileRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #eee",
  },
  profileLabel: {
    color: "#666",
    fontWeight: "500",
  },
  profileValue: {
    color: "#333",
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "500",
    color: "#444",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    fontSize: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    boxSizing: "border-box",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "24px",
  },
  editButton: {
    flex: 1,
    padding: "12px",
    fontSize: "15px",
    borderRadius: "8px",
    backgroundColor: "#333",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  saveButton: {
    flex: 1,
    padding: "12px",
    fontSize: "15px",
    borderRadius: "8px",
    backgroundColor: "#00796b",
    color: "#fff",
    border: "none",
    marginRight: "10px",
    cursor: "pointer",
  },
  cancelButton: {
    flex: 1,
    padding: "12px",
    fontSize: "15px",
    borderRadius: "8px",
    backgroundColor: "#888",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  message: {
    marginTop: "16px",
    textAlign: "center",
    color: "#c62828",
    fontSize: "14px",
  },
  loading: {
    padding: "24px",
    textAlign: "center",
    fontSize: "16px",
    color: "#777",
  },
  avatarWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "16px",
  },
  
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    backgroundColor: "#e0e0e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    fontWeight: "600",
    color: "#555",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
  },
  
  avatarText: {
    userSelect: "none",
  },

  logoutCard: {
    maxWidth: "500px",
    margin: "24px auto",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    textAlign: "center",
  },
  
  logoutButton: {
    padding: "12px 24px",
    backgroundColor: "#fff",
    color: "#d32f2f",
    fontSize: "16px",
    fontWeight: "600",
    border: "1px solid #d32f2f",
    borderRadius: "8px",
    cursor: "pointer",
    width: "100%",
    transition: "all 0.2s ease-in-out",
  },
};
