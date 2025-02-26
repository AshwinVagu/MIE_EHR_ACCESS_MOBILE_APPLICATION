import { Meteor } from 'meteor/meteor';
import axios from 'axios';

Meteor.methods({
  'ehrData.getMetadata': async function(access_token){
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
  },
  'ehrData.get': async function (access_token, resourceType, filters_submitted) {
    this.unblock(); 

    try {
        let url = `https://ashwinvagu.webch.art/webchart.cgi/fhir/${resourceType}`;
        let queryParams = new URLSearchParams();

        if (filters_submitted) {
            if (filters_submitted._id) {
                url += `/${encodeURIComponent(filters_submitted._id.toString())}`; 
                delete filters_submitted._id; 
            }

            Object.entries(filters_submitted).forEach(([key, value]) => {
                if (value) {
                    queryParams.append(key, value);
                }
            });

            if (queryParams.toString()) {
                url += `?${queryParams.toString()}`;
            }
        }

        console.log("Final FHIR API URL:", url); 

        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${access_token}`,
                Accept: "application/fhir+json",
            },
        });

        return response.data;
    } catch (error) {
        throw new Meteor.Error("FHIR_API_ERROR", error.response?.data || "Failed to fetch FHIR metadata");
    }
}

});
