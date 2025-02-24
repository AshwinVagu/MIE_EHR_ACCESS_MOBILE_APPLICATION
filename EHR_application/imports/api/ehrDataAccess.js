import { Meteor } from 'meteor/meteor';
import axios from 'axios';

Meteor.methods({
  'ehrData.get': async function(access_token){
    this.unblock(); // Allow other methods to run while waiting for the API response
    try {
      const response = await axios.get("https://ashwinvagu.webch.art/webchart.cgi/fhir/metadata", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/fhir+json",
        }
      });
      return response.data;
    } catch (error) {
        // return JSON.stringify(error);
        throw new Meteor.Error("FHIR_API_ERROR", error.response?.data || "Failed to fetch FHIR metadata");
    }
  }

});
