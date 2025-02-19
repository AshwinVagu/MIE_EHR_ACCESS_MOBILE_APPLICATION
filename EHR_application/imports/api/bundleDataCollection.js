import { Mongo } from 'meteor/mongo';

// Define the collection
export const BundleDataCollection = new Mongo.Collection('fhir_bundle_data');
