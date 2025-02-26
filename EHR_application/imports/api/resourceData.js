import { Meteor } from 'meteor/meteor';
import { check } from "meteor/check";
import { ResourceDataCollection } from './resourceDataCollection'; // Import MongoDB collection

Meteor.methods({
  'resourceData.bulkInsert'(docs) {
    try {
      check(docs, Array); 

      // Insert only if fhir_id does not already exist
      const insertedIds = docs.map(async (doc) => {
        const exists = await ResourceDataCollection.findOneAsync({ fhir_id: doc.fhir_id });

        if (!exists) {
          return ResourceDataCollection.insertAsync(doc);
        } else {
          console.log(`Skipping duplicate resource: ${doc.fhir_id}`);
          return null; 
        }
      });

      return {"ids_added": insertedIds.filter(fhir_id => fhir_id !== null), "status": "success"};
    } catch (error) {
      console.log('Error inserting resource data:', error);
      throw new Meteor.Error('insert-failed', 'Failed to insert resource data');
    }
  },
  'resourceData.getByUserId'(userId) {
    try {
      // Validate input
      check(userId, String);
      const records = ResourceDataCollection.find({ user_id: userId }).fetch();

      return records;
    } catch (error) {
      console.log('Error fetching resource data:', error);
      throw new Meteor.Error('fetch-failed', 'Failed to fetch resource data');
    }
  }
});
