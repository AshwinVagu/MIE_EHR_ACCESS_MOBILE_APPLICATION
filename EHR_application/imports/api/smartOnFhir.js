import { Meteor } from 'meteor/meteor';
import fetch from 'node-fetch';
import {CLIENT_SECRET} from "../../credentials/secrets.js"; 

Meteor.methods({
  async exchangeSmartOnFhirToken(code) {
    const clientID = 'MIE-localhost';
    const clientSecret = CLIENT_SECRET;     
    const redirectUri = 'http://localhost:12496/code';

    const tokenUrl = 'https://ashwinvagu.webch.art/webchart.cgi/oauth/token/';

    const params = new URLSearchParams();
    params.append('code', code);
    params.append('client_id', clientID);
    params.append('client_secret', clientSecret);
    params.append('redirect_uri', redirectUri);
    params.append('grant_type', 'authorization_code');

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });


    if (!response.ok) {
      const text = await response.text();
      throw new Meteor.Error('token-exchange-failed', text);
    }

    return await response.json();
  }
});
