import "webrtc-adapter";
import { Meteor } from 'meteor/meteor';
import { LinksCollection } from '/imports/api/links';
import '/imports/api/cameraScanningOperations';
import '/imports/api/bundleData';
import '/imports/api/ehrDataAccess';
import '/imports/api/resourceData';
import '/imports/api/usersData.js';
import { BundleDataCollection } from '/imports/api/bundleDataCollection';
import { ResourceDataCollection } from '/imports/api/resourceDataCollection';
import { UsersData } from '/imports/api/usersDataCollection.js';

async function insertLink({ title, url }) {
  await LinksCollection.insertAsync({ title, url, createdAt: new Date() });
}

Meteor.startup(async () => {
  // If the Links collection is empty, add some data.
  if (await LinksCollection.find().countAsync() === 0) {
    await insertLink({
      title: 'Do the Tutorial',
      url: 'https://www.meteor.com/tutorials/react/creating-an-app',
    });

    await insertLink({
      title: 'Follow the Guide',
      url: 'https://guide.meteor.com',
    });

    await insertLink({
      title: 'Read the Docs',
      url: 'https://docs.meteor.com',
    });

    await insertLink({
      title: 'Discussions',
      url: 'https://forums.meteor.com',
    });
  }

  // We publish the entire Links collection to all clients.
  // In order to be fetched in real-time to the clients
  Meteor.publish("links", function () {
    return LinksCollection.find();
  });

  Meteor.publish('fhir_bundle_data', function () {
    return BundleDataCollection.find();
  });

  Meteor.publish('fhir_resource_data', function () {
    return ResourceDataCollection.find();
  });

  Meteor.publish('users_data', function () {
    return UsersData.find();
  });

});
