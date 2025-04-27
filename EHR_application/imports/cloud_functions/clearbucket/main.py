from google.cloud import storage
from flask import jsonify

def clear_bucket(request):
    try:
        BUCKET_NAME = "mie_fhir_mobile_app_fhir_jsons"  

        storage_client = storage.Client()
        bucket = storage_client.bucket(BUCKET_NAME)

        blobs = bucket.list_blobs()
        deleted_count = 0

        for blob in blobs:
            blob.delete()
            deleted_count += 1

        return jsonify({"message": f"Deleted {deleted_count} objects from {BUCKET_NAME}"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
