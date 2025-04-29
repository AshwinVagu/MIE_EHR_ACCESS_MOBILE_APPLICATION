import React, { useState, useEffect } from 'react';
import qs from "querystring";
import { OAuth2 } from "oauth";
import { useNavigate, useLocation } from "react-router-dom";

export const AuthCode = () => {
  const [accessToken, setAccessToken] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const params = qs.parse(window.location.search.substring(1));

    const code = params.code;
    
    if (code) {
      Meteor.call('exchangeSmartOnFhirToken', code, (err, result) => {
        if (err) {
          console.error("OAuth Error:", err);
          return;
        }
        localStorage.setItem("webchart_access_token", result.access_token);
        localStorage.setItem("webchart_token_results", JSON.stringify(result));
        setAccessToken(result.access_token);
        navigate("/ehr-resource-types");
      });
    }
  }, []);



  return (
    <div>
      <h2>OAuth Callback</h2>
      {accessToken ? <p>Access Token: {accessToken}</p> : <p>Retrieving token...</p>}
    </div>
  );
};