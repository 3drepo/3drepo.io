import sys
import uuid
from pymongo import MongoClient
import boto3
import re

##### Connect to AWS S3 #####
s3 = boto3.client(
  's3',
  aws_access_key_id='AKIAJIJNXOYFX5B6SHXA',
  aws_secret_access_key='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',
  region_name='eu-west-1',
)
bucket_name = '3d-models-test'

mongoURL = sys.argv[1]
mongoPort = sys.argv[2]
userName = sys.argv[3]
password = sys.argv[4]
connString = "mongodb://"+ userName + ":" + password +"@"+mongoURL + ":" + mongoPort + "/"

##### Enable dry run to not commit to the database #####
dry_run = True

##### Connect to the Database #####
db = MongoClient(connString)
for database in db.database_names():
  if database != "admin" and database != "local":
    db = MongoClient(connString)[database]
    print("--database:" + database)

##### Get a model ID #####
    for setting in db.settings.find():
      def upload(col_prefix):
        model_id = setting.get('_id')
        col_name = model_id + col_prefix
        fs = gridfs.GridFS(db, col_name)
        for entry in fs.find({"filename":{"$not": re.compile("unityAssets.json$")}}):
          filename = entry.filename
##### Upload to S3 #####
          s3_ref = uuid.uuid4()
          print "Uploading: " + filename
          s3.upload_fileobj(entry, bucket_name, str(s3_ref))
##### Create Reference BSON #####
          bson_data = {}
          bson_data['_id'] = filename
          bson_data['link'] = str(s3_ref)
          bson_data['type'] = "s3"
          col_name = model_id + ".ref"
          if dry_run:
            print "NOT Inserting bson for: " + filename
          else:
            print "Inserting bson for: " + filename
            db[col_name].insert(bson_data)
##### Calling function for each asset type
      upload(".history")
      upload(".stash.json_mpc")
      upload(".stash.unity3d")
