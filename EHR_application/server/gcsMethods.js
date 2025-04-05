import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Storage } from '@google-cloud/storage'; // Import the library


const storage = new Storage(); 


Meteor.methods({
  async 'gcs.generateSignedUploadUrl'(options) {
    check(options, {
      userId: String,  
      objectName: String,
      contentType: String,
      bucketName: String,
    });

    
    if (!options.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to upload files.');
    }

    if (!storage) {
       throw new Meteor.Error('gcs-not-initialized', 'Google Cloud Storage client is not configured on the server.');
    }

    const { objectName, contentType, bucketName } = options;

    // --- Define Signed URL Options ---
    const signedUrlOptions = {
      version: 'v4', // Use v4 for enhanced security features
      action: 'write', // Allow PUT requests to upload the file
      expires: Date.now() + 15 * 60 * 1000, // URL expires in 15 minutes
      contentType: contentType,
    };

    console.log(`Generating GCS v4 signed URL for: bucket='${bucketName}', object='${objectName}', contentType='${contentType}'`);

    try {
      const [signedUrl] = await storage
        .bucket(bucketName)
        .file(objectName)
        .getSignedUrl(signedUrlOptions);

      console.log(`Successfully generated signed URL for ${objectName}`);

      return {
        signedUrl: signedUrl,
      };

    } catch (error) {
      console.error('Error generating GCS Signed URL:', error);
      // Provide a more specific error message if possible
      let errorMessage = 'Failed to generate upload URL.';
      if (error.message) {
           errorMessage += ` Details: ${error.message}`;
      }
      throw new Meteor.Error('gcs-url-error', errorMessage);
    }
  },
});