import { Meteor } from 'meteor/meteor';
import { check } from "meteor/check";
import { BundleDataCollection } from './bundleDataCollection'; // Import the MongoDB collection

Meteor.methods({
  'bundleData.insert'(doc) {
    try {
      // Insert document into MongoDB
      const docId = BundleDataCollection.insertAsync(doc);
      console.log('Document inserted with ID:', docId);
      return docId;
    } catch (error) {
      console.log('Error inserting bundle data:', error);
      throw new Meteor.Error('insert-failed', 'Failed to insert bundle data');
    }
  },
  'bundleData.getByUserId'(userId) {
    try {
      // Validate input
      check(userId, String);
      const records = BundleDataCollection.find({ user_id: userId }).fetch();

      console.log(`Fetched ${records.length} records for user_id:`, userId);
      return records;
    } catch (error) {
      console.log('Error fetching bundle data:', error);
      throw new Meteor.Error('fetch-failed', 'Failed to fetch bundle data');
    }
  }

});
