App.info({
    id: "com.yourapp.health",
    name: "HealthApp",
    description: "A Meteor app that integrates with Apple HealthKit",
    author: "Your Name",
    version: "1.0.0",
    buildNumber: "100",
  });
  
App.configurePlugin("cordova-plugin-health", {
HEALTH_READ_PERMISSION: "Allow access to health data",
HEALTH_WRITE_PERMISSION: "Allow the app to store health data",
});

App.accessRule("*");
  