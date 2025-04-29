App.info({
  id: "com.yourapp.health",
  name: "HealthApp",
  description: "A Meteor app that integrates with Apple HealthKit",
  author: "Your Name",
  version: "1.0.0",
  buildNumber: "100",
});

// Apple HealthKit plugin config
App.configurePlugin("cordova-plugin-health", {
  HEALTH_READ_PERMISSION: "Allow access to health data",
  HEALTH_WRITE_PERMISSION: "Allow the app to store health data",
});

// Camera/QR Scanner Plugin
App.configurePlugin("phonegap-plugin-barcodescanner", {
  CAMERA_USAGE_DESCRIPTION: "This app uses the camera to scan QR codes.",
  // Optional: customize permission messages
  CAMERA_PERMISSION: "Allow access to camera for scanning QR codes",
});

// General permissions and access
App.accessRule("*");

// iOS-specific permissions
App.appendToConfig(`
  <platform name="ios">
    <edit-config target="NSCameraUsageDescription" file="*-Info.plist" mode="merge">
      <string>This app uses the camera to scan QR codes</string>
    </edit-config>
  </platform>
`);

App.appendToConfig(`
  <allow-navigation href="https://ashwinvagu.webch.art/*" />
  <allow-navigation href="http://localhost:*" />
  <access origin="https://ashwinvagu.webch.art" />
`);
