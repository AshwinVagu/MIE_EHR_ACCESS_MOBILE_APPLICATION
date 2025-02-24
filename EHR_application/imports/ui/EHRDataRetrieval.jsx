import React, { useEffect, useState } from "react";
import { Card, CardActionArea, CardContent, Typography, Box } from "@mui/material";
import qs from "querystring";
import { OAuth2 } from "oauth";

export const EHRDataRetrieval = () => {

  const [clientSecret, setClientSecret] = useState(process.env.CLIENT_SECRET || "");
  const clientID = "MIE-localhost";
  const authBaseURL = "https://ashwinvagu.webch.art";

  useEffect(() => {
    if (!clientSecret) {
      const userSecret = prompt("Enter the client secret:");
      if (userSecret) setClientSecret(userSecret);
    }
  }, []);

  const handleAuth = () => {
    if (!clientSecret) {
      alert("Client Secret is required to proceed.");
      return;
    }

    // Initialize OAuth2 instance
    const oauth2 = new OAuth2(
      clientID,
      clientSecret,
      authBaseURL,
      "/webchart.cgi/oauth/authenticate/",
      "/webchart.cgi/oauth/token/",
      null
    );

    // Generate OAuth authorization URL
    const authURL = oauth2.getAuthorizeUrl({
      response_type: "code",
      redirect_uri: window.location.origin + "/code",
      scope: "launch/patient openid fhirUser offline_access patient/*.read",
      state: "secure_random_state",
      aud: `${authBaseURL}/webchart.cgi`,
    });

    console.log("Redirecting to:", authURL);
    window.location.href = authURL; // Redirect user to WebChart authentication
  };


  return (
    <div>
      <Box
      sx={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Card sx={{ maxWidth: "90%", borderRadius: 2, boxShadow: 3 }}>
      <CardActionArea sx={{ display: "flex", alignItems: "center", p: 2 }} onClick={handleAuth}>
        <Typography variant="h6" sx={{ flexGrow: 1, marginRight: '5px' }}>
          Get data from WebChart
        </Typography>
        <Box
          component="img"
          src="../../assets/wc_logo_full.png"
          alt="WebChart Logo"
        />
      </CardActionArea>
    </Card>
    </Box>
    </div>
  );
};