import { Mongo } from 'meteor/mongo';

// Define the collection
export const ResourceDataCollection = new Mongo.Collection('fhir_resource_data');

// Ensure id is unique
if (Meteor.isServer) {
    ResourceDataCollection.rawCollection().createIndex({ fhir_id: 1, user_id: 1 }, { unique: true })
        .then(() => console.log("Unique index on fhir_id created successfully"))
        .catch(err => console.error("Error creating unique index on fhir_id:", err));
}