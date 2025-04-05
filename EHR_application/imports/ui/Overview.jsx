import React, { useState, useEffect } from "react";
import { FaApple } from "react-icons/fa";
import { HealthKitBarchart } from "./HealthKitBarchart"; // Import the bar chart component
import { BMIGauge } from "./BMIGuage";
import { CircularProgressChart } from "./CircularProgressChart";
import { LineGraph } from "./LineGraph";

export const Overview = () => {
  const allDataTypes = [
    "HKQuantityTypeIdentifierStepCount",
    "HKQuantityTypeIdentifierHeartRate",
    "HKQuantityTypeIdentifierBodyMass",
    "HKQuantityTypeIdentifierDistanceWalkingRunning",
    "HKQuantityTypeIdentifierActiveEnergyBurned",
    "HKQuantityTypeIdentifierOxygenSaturation",
    "HKQuantityTypeIdentifierBodyMassIndex",
  ];

  const [grantedDataTypes, setGrantedDataTypes] = useState([]);
  const [healthData, setHealthData] = useState({});
  const [permissionsChecked, setPermissionsChecked] = useState(false);
  const [shouldOpenSettings, setShouldOpenSettings] = useState(false);
  const [noHealthData, setNoHealthData] = useState(false);
  const [sourceMatch, setSourceMatch] = useState(true); // assume match by default
  const [currentSourceBundleId, setCurrentSourceBundleId] = useState(null);

  useEffect(() => {
    checkHealthKitPermissions();
  }, []);


  const handleAcceptDevice = async () => {
    const userProfile = JSON.parse(localStorage.getItem("user_profile"));
    const user_id = userProfile?.user_id;
  
    if (!user_id || !currentSourceBundleId) return;
  
    const updatePayload = {
      ...userProfile,
      updated_at: new Date().toISOString(),
      HKsourceBundleId: currentSourceBundleId
    };
  
    try {
      const res = await Meteor.callAsync("users.update", updatePayload);
      if(res.success) { 
        const updatedProfile = { ...userProfile, HKsourceBundleId: currentSourceBundleId };
        localStorage.setItem("user_profile", JSON.stringify(updatedProfile)); 
        console.log("Device accepted, user profile updated");
        setSourceMatch(true); // Refresh display
      }
      else{
        console.log("Update failed. Please try again.");
      }
  
    } catch (err) {
      console.error("Failed to update sourceBundleId:", err);
    }
  };

  const checkHealthKitPermissions = () => {
    if (window.plugins && window.plugins.healthkit) {
      let checkPromises = allDataTypes.map(
        (type) =>
          new Promise((resolve, reject) => {
            window.plugins.healthkit.checkAuthStatus(
              { type },
              (status) => resolve({ type, status }),
              reject
            );
          })
      );

      Promise.all(checkPromises)
        .then((results) => {
          console.log("HealthKit permission statuses:", results);

          const hasUndetermined = results.some((res) => res.status === "undetermined");
          const allDecided = results.every((res) => res.status === "authorized" || res.status === "denied");
          const grantedPermissions = results
            .filter((res) => res.status === "authorized")
            .map((res) => res.type);

          if (hasUndetermined) {
            console.log("Some permissions are undetermined. Requesting permissions...");
            updateHealthKitPermissions(); // If permissions are missing, request them
          } else {
            console.log("All permissions are decided. Fetching granted data...");
            setGrantedDataTypes(grantedPermissions);
            fetchHealthData(grantedPermissions); // If permissions already set, fetch data
          }

          setShouldOpenSettings(allDecided); // If all are decided, next action is to open settings
          setPermissionsChecked(true);
        })
        .catch((error) => console.error("Error checking HealthKit permissions:", error));
    } else {
      console.warn("HealthKit plugin not available.");
    }
  };

  const updateHealthKitPermissions = () => {
    if (shouldOpenSettings) {
      openHealthKitSettings(); // If permissions already decided, redirect to settings
    } else {
      requestHealthKitPermissions(); // If permissions are still missing, request authorization
    }
  };

  const requestHealthKitPermissions = () => {
    if (window.plugins && window.plugins.healthkit) {
      window.plugins.healthkit.requestAuthorization(
        {
          readTypes: allDataTypes,
          writeTypes: allDataTypes,
        },
        (success) => {
          if (success) {
            console.log("HealthKit permissions granted successfully.");
            alert("HealthKit permissions granted successfully!");
            checkHealthKitPermissions(); 
          } else {
            console.warn("User did not grant HealthKit permissions.");
          }
        },
        (error) => {
          console.error("HealthKit permission error:", error);
          alert("Error requesting HealthKit permissions. Please check settings.");
        }
      );
    } else {
      console.warn("HealthKit plugin not available");
      alert("HealthKit plugin not available. Make sure you are on a real iPhone.");
    }
  };

  const fetchHealthData = (grantedPermissions) => {
    if (window.plugins && window.plugins.healthkit) {
      let fetchPromises = grantedPermissions.map(
        (type) =>
          new Promise((resolve, reject) => {
            window.plugins.healthkit.querySampleType(
              {
                startDate: new Date(new Date().setDate(new Date().getDate() - 7)), // Last 7 days
                endDate: new Date(),
                sampleType: type,
                unit: getUnitForType(type),
              },
              (data) => resolve({ type, data }),
              (error) => reject({ type, error })
            );
          })
      );

      Promise.all(fetchPromises)
        .then((results) => {
          let dataObj = {};
          results.forEach(({ type, data }) => {
            dataObj[type] = data;
          });

          console.log("HealthKit Data Retrieved:", dataObj);
          setHealthData(dataObj);

          const allEmpty = Object.values(dataObj).every(arr => Array.isArray(arr) && arr.length === 0);
          setNoHealthData(allEmpty);

          if (!allEmpty) {
            const firstValidEntry = Object.values(dataObj)
              .flat()
              .find(entry => entry?.sourceBundleId);
          
            if (firstValidEntry) {
              const hkSourceBundleId = firstValidEntry.sourceBundleId;
              const userProfile = JSON.parse(localStorage.getItem("user_profile"));
              const storedBundleId = userProfile?.HKsourceBundleId;
          
              setCurrentSourceBundleId(hkSourceBundleId); // save for potential update
          
              if (storedBundleId && storedBundleId === hkSourceBundleId) {
                console.log("match");
                setSourceMatch(true);
              } else {
                console.log("no match");
                setSourceMatch(false);
              }
            } else {
              console.log("No valid sourceBundleId found in HealthKit data.");
              setSourceMatch(false);
            }
          }

        })
        .catch((error) => console.error("Error fetching HealthKit data:", error));
    } else {
      console.warn("HealthKit plugin not available.");
    }
  };

  const openHealthKitSettings = () => {
    if (window.cordova && window.cordova.plugins.settings) {
      window.cordova.plugins.settings.open(
        "app-settings",
        () => {
          console.log("Opened iOS App Settings");
          alert("To update HealthKit permissions, go to:\nSettings → Privacy & Security → Health → Your App");
        },
        (error) => console.error("Error opening settings:", error)
      );
    } else {
      console.warn("Settings plugin not available.");
      alert("Cannot open settings. Please go to Settings → Privacy → Health → Your App manually.");
    }
  };

  const getUnitForType = (type) => {
    switch (type) {
      case "HKQuantityTypeIdentifierStepCount":
        return "count";
      case "HKQuantityTypeIdentifierHeartRate":
        return "count/min";
      case "HKQuantityTypeIdentifierBodyMass":
        return "kg";
      case "HKQuantityTypeIdentifierDistanceWalkingRunning":
        return "m";
      case "HKQuantityTypeIdentifierActiveEnergyBurned":
        return "kcal";
      case "HKQuantityTypeIdentifierOxygenSaturation":
        return "percent";
      case "HKQuantityTypeIdentifierBodyMassIndex":
        return "count";  
      default:
        return "";
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Health Data</h2>

      {permissionsChecked && grantedDataTypes.length == 0 && (
        <p style={styles.errorText}>
          No Health Data available. Please grant permissions.
        </p>
      )}

      {permissionsChecked && !noHealthData && !sourceMatch && (
        <div style={styles.buttonContainer}>
          <button
            onClick={handleAcceptDevice}
            style={styles.button}
          >
            Accept HealthKit data from this device?
          </button>
        </div>
      )}

      {permissionsChecked && grantedDataTypes.length > 0 && noHealthData && (
        <p style={styles.errorText}>
          No HealthKit data received. Try again later or check device permissions.
        </p>
      )}

      <div style={styles.buttonContainer}>
        <button onClick={updateHealthKitPermissions} style={styles.button}>
          <FaApple style={styles.icon} /> {shouldOpenSettings ? "Open HealthKit Settings" : "Grant / Update HealthKit Access"}
        </button>
      </div>

      {!noHealthData && sourceMatch && healthData["HKQuantityTypeIdentifierOxygenSaturation"] && healthData["HKQuantityTypeIdentifierOxygenSaturation"].length>0  && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Latest Oxygen Saturation (SpO2)</h3>
          <CircularProgressChart value={healthData["HKQuantityTypeIdentifierOxygenSaturation"][0]["quantity"]*100} unit="%" />
        </div>
      )}

      {/* Render Bar Chart if ActiveEnergyBurned data exists */}
      {!noHealthData && sourceMatch && healthData["HKQuantityTypeIdentifierActiveEnergyBurned"] && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Active Energy Burned in Kcal (Last 7 Days)</h3>
          <HealthKitBarchart rawData={healthData["HKQuantityTypeIdentifierActiveEnergyBurned"]} unit="kcal" />
        </div>
      )}

      {!noHealthData && sourceMatch && healthData["HKQuantityTypeIdentifierBodyMassIndex"] && healthData["HKQuantityTypeIdentifierBodyMassIndex"].length>0  && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Your current Body Mass Index</h3>
          <BMIGauge bmi={healthData["HKQuantityTypeIdentifierBodyMassIndex"][0]["quantity"]} />
        </div>
      )}

      {!noHealthData && sourceMatch && healthData["HKQuantityTypeIdentifierHeartRate"] && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Heartrate for the last 7 days</h3>
          <LineGraph dataPoints={healthData["HKQuantityTypeIdentifierHeartRate"]}  unit="bpm"/>
        </div>
      )}


      {!noHealthData && sourceMatch && healthData["HKQuantityTypeIdentifierDistanceWalkingRunning"] && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Active movement in meters (Last 7 Days)</h3>
          <HealthKitBarchart rawData={healthData["HKQuantityTypeIdentifierDistanceWalkingRunning"]} unit="m" />
        </div>
      )}

      {!noHealthData && sourceMatch && healthData["HKQuantityTypeIdentifierStepCount"] && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Active steps taken (Last 7 Days)</h3>
          <HealthKitBarchart rawData={healthData["HKQuantityTypeIdentifierStepCount"]} unit="steps" />
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    marginTop: "50px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  chartContainer: {
    marginTop: "20px",
    width: "90%",
    maxWidth: "600px",
    padding: "15px",
    borderRadius: "10px",
    backgroundColor: "#f5f5f5",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  chartTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  heading: {
    fontSize: "24px",
    marginBottom: "20px",
    fontWeight: "bold",
    color: "#333",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  listItem: {
    fontSize: "18px",
    marginBottom: "8px",
    color: "#555",
  },
  errorText: {
    color: "red",
    fontSize: "16px",
    marginBottom: "20px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    width: "90%",
    maxWidth: "300px",
    margin: "20px auto",  
  },
  button: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    fontSize: "16px",
    fontWeight: "bold",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "background 0.3s ease",
    outline: "none",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    width: "100%",               
    textAlign: "center",
  },
  icon: {
    marginRight: "10px",
    fontSize: "24px",
  },
};

