import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Meteor } from "meteor/meteor";

const getGcsPublicUrl = (bucketName, objectName) => {
    return `https://storage.googleapis.com/${bucketName}/${objectName}`;
};

export const ProfilePage = () => {
    const [formData, setFormData] = useState(null);
    const [message, setMessage] = useState("");
    const [editing, setEditing] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null); 
    const [uploading, setUploading] = useState(false); 
    const fileInputRef = useRef(null); 
    const navigate = useNavigate();

    // GCS Configuration 
    const GCS_BUCKET_NAME = "mie_fhir_mobile_app";

    useEffect(() => {
        const profile = localStorage.getItem("user_profile");
        if (profile) {
            console.log("Profile loaded from local storage:", profile);
            setFormData(JSON.parse(profile));
        } 
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarClick = () => {
        if (editing && !uploading) {
            fileInputRef.current?.click();
        }
    };

   
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setSelectedFile(file);
            const previewUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, avatar: previewUrl })); // Temporary preview
        } else if (file) {
            setMessage("Please select a valid image file.");
            setSelectedFile(null); 
        }
    
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };



    const handleSave = async (dataToSave = formData) => {
        if (!dataToSave) return;

        setMessage(""); 
        let avatarUrl = formData.avatar;

        // Upload only if a new image file was selected (not already a GCS URL)
        if (selectedFile && !avatarUrl?.includes("storage.googleapis.com")) {
            try {
                setUploading(true);
                setMessage("Uploading image...");

                const userId = localStorage.getItem("user_id");
                const objectName = `${userId}_dp`;

                const signedUrlResponse = await Meteor.callAsync("gcs.generateSignedUploadUrl", {
                    userId,
                    objectName,
                    contentType: selectedFile.type,
                    bucketName: GCS_BUCKET_NAME,
                });

                if (!signedUrlResponse || !signedUrlResponse.signedUrl) {
                    throw new Error("Failed to get upload URL.");
                }

                const uploadResponse = await fetch(signedUrlResponse.signedUrl, {
                    method: "PUT",
                    headers: {
                        "Content-Type": selectedFile.type,
                    },
                    body: selectedFile,
                });

                if (!uploadResponse.ok) {
                    let errorDetails = `HTTP status ${uploadResponse.status}`;
                    try {
                        const textResponse = await uploadResponse.text();
                        errorDetails += `: ${textResponse}`;
                    } catch (_) {}
                    throw new Error(`GCS upload failed: ${errorDetails}`);
                }

                setUploading(false);

                const timestamp = Date.now();
                avatarUrl = `${getGcsPublicUrl(GCS_BUCKET_NAME, objectName)}?v=${timestamp}`;
            } catch (uploadErr) {
                setUploading(false);
                setMessage(`Image upload failed: ${uploadErr.message}`);
                return;
            }
        }

        const payload = {
            ...dataToSave,
            avatar: avatarUrl,
            age: dataToSave.age ? parseInt(dataToSave.age, 10) : null,
            height: dataToSave.height ? parseFloat(dataToSave.height) : null,
            weight: dataToSave.weight ? parseFloat(dataToSave.weight) : null,
            updated_at: new Date().toISOString(),
        };


        if (isNaN(payload.age)) payload.age = null;
        if (isNaN(payload.height)) payload.height = null;
        if (isNaN(payload.weight)) payload.weight = null;


        try {
            let res = await Meteor.callAsync("users.update", payload);
            if (res.success) {
                localStorage.setItem("user_profile", JSON.stringify(payload)); // Save updated profile
                setFormData(payload); // Update state with saved data
                setMessage("Profile updated successfully.");
                setEditing(false);
            } else {
                setMessage(res.message || "Update failed. Please try again.");
            }
        } catch (err) {
            console.error("Error updating profile:", err);
            setMessage(`Update failed: ${err.message}`);
        }
    };

    const handleLogout = async () => {
        // ... (logout logic remains the same)
        try {
           
            localStorage.removeItem("user_profile");
            localStorage.removeItem("user_id");
            localStorage.removeItem("auth_id_token"); 

            if (window.plugins && window.plugins.toast) {
                window.plugins.toast.showWithOptions(
                    {
                        message: "Logged out successfully!",
                        duration: "short", 
                        position: "bottom", 
                        addPixelsY: -40, 
                    },
                    () => navigate("/"), 
                    (err) => { 
                        console.error("Toast failed", err);
                        navigate("/"); // Fallback redirect
                    }
                );
            } else {
                alert("Logged out successfully!"); // Simple alert as fallback
                navigate("/");
            }
        } catch (err) {
            console.error("Logout failed:", err);
            setMessage("Logout failed. Please try again.");
        }
    };

    if (!formData) {
        return <div style={styles.loading}>Loading profile...</div>;
    }

    const getImage = () => {
      return formData.avatar; 
    }

    return (
        <div style={styles.scrollContainer}>
            <div style={styles.container}>
                {/* --- Avatar Display/Upload Trigger --- */}
                <div style={styles.avatarWrapper}>
                    <div
                        style={{ ...styles.avatar, cursor: editing ? 'pointer' : 'default' }}
                        onClick={handleAvatarClick}
                        title={editing ? "Click to change photo" : ""}
                    >
                        {uploading ? (
                             <div style={styles.spinner}></div> // Simple spinner
                        ) : formData.avatar ? (
                            <img
                                src={getImage()}
                                alt="Profile"
                                style={styles.avatarImage}
                                // Add onError handler to fallback if image fails to load
                                onError={(e) => {
                                    e.target.onerror = null; 
                                    e.target.src = ""; 
                                    console.warn("Failed to load avatar image.");
                                }}
                            />
                        ) : (
                            <span style={styles.avatarText}>
                                {formData?.first_name?.[0]?.toUpperCase() || "U"}
                            </span>
                        )}
                    </div>

                    {editing && !uploading && (
                      <p style={styles.avatarHint}>Tap the image to upload a new profile picture</p>
                    )}

                    {/* Hidden File Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        accept="image/png, image/jpeg, image/gif, image/webp" // Specify acceptable image types
                        disabled={!editing || uploading} // Disable if not editing or currently uploading
                    />
                </div>

                {!editing ? (
                    <>
                        <div style={styles.displayBox}>
                            <h3 style={styles.name}>
                                {formData.first_name} {formData.last_name}
                            </h3>
                            <p style={styles.email}>{formData.email}</p>
                            <ProfileItem label="Mobile" value={formData.mobile || "-"} />
                            <ProfileItem label="Age" value={formData.age || "-"} />
                            <ProfileItem label="Height" value={formData.height ? `${formData.height} cm` : "-"} />
                            <ProfileItem label="Weight" value={formData.weight ? `${formData.weight} kg` : "-"} />
                        </div>
                    </>
                ) : (
                    <>
                        <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSave();
                        }}
                        >
                        {[
                            { name: "first_name", label: "First Name", type: "text" },
                            { name: "last_name", label: "Last Name", type: "text" },
                            { name: "mobile", label: "Mobile", type: "tel" },
                            { name: "age", label: "Age", type: "number" },
                            { name: "height", label: "Height (cm)", type: "number", step: "0.1" },
                            { name: "weight", label: "Weight (kg)", type: "number", step: "0.1" },
                        ].map(({ name, label, type, step }) => (
                            <div key={name} style={styles.inputGroup}>
                            <label style={styles.label}>{label}</label>
                            <input
                                name={name}
                                type={type}
                                step={step}
                                value={formData[name] || ""}
                                onChange={handleChange}
                                style={styles.input}
                                disabled={uploading}
                                required
                                {...(name === "mobile" ? { pattern: "\\d{10,15}" } : {})}
                                {...(["age", "height", "weight"].includes(name) ? { min: 1 } : {})}
                            />
                            </div>
                        ))}

                        <div style={styles.buttonGroup}>
                            <button
                            type="submit"
                            style={styles.saveButton}
                            disabled={uploading}
                            >
                            {uploading ? "Uploading..." : "Save"}
                            </button>
                            <button
                            type="button"
                            style={styles.cancelButton}
                            onClick={() => {
                                setEditing(false);
                                setSelectedFile(null);
                                const originalProfile = localStorage.getItem("user_profile");
                                if (originalProfile) setFormData(JSON.parse(originalProfile));
                                setMessage("");
                            }}
                            disabled={uploading}
                            >
                            Cancel
                            </button>
                        </div>
                        </form>
                    </>
                )}

              
                <div style={styles.buttonGroup}>
                    {!editing  && (
                        <button style={styles.editButton} onClick={() => setEditing(true)}>
                            Edit Profile
                        </button>
                    )}
                </div>

                {/* --- Status Message --- */}
                {message && <p style={styles.message}>{message}</p>}
            </div>

            {/* --- Logout Card --- */}
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
        backgroundColor: "#97caf7",
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
        alignItems: 'center', 
    },
    profileLabel: {
        color: "#666",
        fontWeight: "500",
        marginRight: '10px', 
    },
    profileValue: {
        color: "#333",
        fontWeight: "500",
        textAlign: 'right', 
    },
    inputGroup: {
        marginBottom: "16px",
    },
    label: {
        display: "block",
        marginBottom: "6px",
        fontWeight: "500",
        color: "#444",
        fontSize: "14px", // Slightly smaller label
    },
    input: {
        width: "100%",
        padding: "10px 14px",
        fontSize: "15px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        backgroundColor: "#fff",
        boxSizing: "border-box",
        transition: 'border-color 0.2s ease-in-out',
        ':focus': { 
            borderColor: '#00796b',
            outline: 'none',
        },
        ':disabled': {
             backgroundColor: '#f0f0f0',
             cursor: 'not-allowed',
        }
    },
    buttonGroup: {
        display: "flex",
        justifyContent: "space-between",
        gap: '10px', // Add gap between buttons
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
        fontWeight: "bold",
        transition: "background-color 0.2s ease",
        ':hover': {
            backgroundColor: "#555",
        }
    },
    saveButton: {
        flex: 1,
        padding: "12px",
        fontSize: "15px",
        borderRadius: "8px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        cursor: "pointer",
        fontWeight: "bold",
        transition: "background-color 0.2s ease",
        ':hover': {
             backgroundColor: "#004d40",
        },
        ':disabled': {
            backgroundColor: '#a5d6a7', // Lighter green when disabled
            cursor: 'not-allowed',
        }
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
        fontWeight: "bold",
        transition: "background-color 0.2s ease",
         ':hover': {
             backgroundColor: "#666",
        },
        ':disabled': {
            backgroundColor: '#bdbdbd', // Lighter grey when disabled
            cursor: 'not-allowed',
        }
    },
    message: {
        marginTop: "16px",
        textAlign: "center",
        color: "#c62828", 
        fontSize: "14px",
        minHeight: '1.2em', 
    },
    loading: {
        padding: "24px",
        textAlign: "center",
        fontSize: "16px",
        color: "#777",
    },
    avatarWrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: "24px",
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
        overflow: 'hidden', // Ensure image stays within bounds
        position: 'relative', // For positioning spinner
        border: '3px solid #fff', // Optional white border
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover', 
        display: 'block', 
    },
    avatarText: {
        userSelect: "none",
        textTransform: 'uppercase', 
    },
    logoutCard: {
        maxWidth: "500px",
        margin: "24px auto 0", 
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
        fontWeight: "bold",
        border: "1px solid #d32f2f", 
        borderRadius: "8px",
        cursor: "pointer",
        width: "100%",
        transition: "all 0.2s ease-in-out",
         ':hover': {
            backgroundColor: '#ffebee', 
            color: '#b71c1c', 
            borderColor: '#c62828', 
        }
    },
    avatarHint: {
      fontSize: "12px",
      color: "#666",
      marginTop: "8px",
      textAlign: "center",
    },
    
    
    spinner: {
        border: '4px solid rgba(0, 0, 0, 0.1)',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        borderLeftColor: '#555', // Spinner color
        animation: 'spin 1s ease infinite',
    },
    

};


const keyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`;
const styleSheet = document.styleSheets[0];
try {
    if (styleSheet) { 
         styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
    }
} catch (e) {
    console.warn("Could not insert keyframes rule:", e);
}





