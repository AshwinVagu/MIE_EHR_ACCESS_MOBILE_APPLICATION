import { Meteor } from 'meteor/meteor';
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
});
