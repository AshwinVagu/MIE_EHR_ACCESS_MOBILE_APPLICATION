import React, { useState, useEffect } from 'react';
import qs from "querystring";
import { OAuth2 } from "oauth";

export const AuthCode = () => {
  const [accessToken, setAccessToken] = useState(null);
  const clientID = "MIE-localhost";
  const clientSecret = process.env.CLIENT_SECRET;
  const authBaseURL = "https://ashwinvagu.webch.art";


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
          localStorage.setItem("access_token", access_token);
          setAccessToken(access_token);
          fetchMedicalData(access_token);
        }
      );
    }
  }, []);


  const fetchMedicalData = async (access_token) => {

    try {
      const res = await Meteor.callAsync("ehrData.get", access_token);
      console.log("Data obtained:", res);
    } catch (err) {
      console.log("Error:", err); 
    }
  };


  return (
    <div>
      <h2>OAuth Callback</h2>
      {accessToken ? <p>Access Token: {accessToken}</p> : <p>Retrieving token...</p>}
    </div>
  );
};