import React, { useState, useEffect } from 'react';
import qs from "querystring";
import { OAuth2 } from "oauth";
import { useNavigate, useLocation } from "react-router-dom";

export const AuthCode = () => {
  const [accessToken, setAccessToken] = useState(null);
  const clientID = "MIE-localhost";
  const clientSecret = process.env.CLIENT_SECRET;
  const authBaseURL = "https://ashwinvagu.webch.art";
  const navigate = useNavigate();


  useEffect(() => {
    const params = qs.parse(window.location.search.substring(1));
    
    if (params.code) {
      const oauth2 = new OAuth2(
        clientID,
        clientSecret,
        authBaseURL,
        "/webchart.cgi/oauth/authenticate/",
        "/webchart.cgi/oauth/token/",
        null
      );

      oauth2.getOAuthAccessToken(
        params.code,
        {
          redirect_uri: window.location.origin + "/code",
          grant_type: "authorization_code",
        },
        (err, access_token, refresh_token, results) => {
          if (err) {
            console.error("OAuth Error:", err);
            return;
          }
          localStorage.setItem("webchart_access_token", access_token);
          localStorage.setItem("webchart_token_results", JSON.stringify(results));
          setAccessToken(access_token);
          navigate("/ehr-resource-types");
          // fetchMedicalData(access_token);
        }
      );
    }
  }, []);



  return (
    <div>
      <h2>OAuth Callback</h2>
      {accessToken ? <p>Access Token: {accessToken}</p> : <p>Retrieving token...</p>}
    </div>
  );
};