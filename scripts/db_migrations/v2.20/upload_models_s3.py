import sys
import gridfs
import uuid
from pymongo import MongoClient
import boto3
import re

mongoURL = sys.argv[1]
mongoPort = sys.argv[2]
userName = sys.argv[3]
password = sys.argv[4]
awsBucketName = sys.argv[5]
awsRegionName = sys.argv[6]
awsAccessKeyId = sys.argv[7]
awsSecretAccessKey = sys.argv[8]

##### Connect to AWS S3 #####
s3 = boto3.client(
  's3',
  aws_access_key_id=awsAccessKeyId,
  aws_secret_access_key=awsSecretAccessKey,
  region_name=awsRegionName
)

connString = "mongodb://"+ userName + ":" + password +"@"+mongoURL + ":" + mongoPort + "/"

##### Enable dry run to not commit to the database #####
dry_run = True

##### Connect to the Database #####
db = MongoClient(connString)
for database in db.database_names():
  if database != "admin" and database != "local":
    db = MongoClient(connString)[database]
    print("--database:" + database)

##### Get a model ID and find entries #####
    for setting in db.settings.find():
      for col_prefix in [".history",".stash.json_mpc", ".stash.unity3d" ]:
        model_id = setting.get('_id')
        col_name = model_id + col_prefix
        fs = gridfs.GridFS(db, col_name)
        for entry in fs.find({"filename":{"$not": re.compile("unityAssets.json$")}}):
          filename = entry.filename
          s3_ref = uuid.uuid4()
##### Create Reference BSON #####
          bson_data = {}
          bson_data['_id'] = filename
          bson_data['link'] = str(s3_ref)
          bson_data['type'] = "s3"
          col_name = model_id + ".ref"
          if dry_run:
            print "NOT Inserting bson for: " + filename
          else:
##### Upload to S3 and insert BSON #####
            print "Uploading: " + filename
            s3.upload_fileobj(entry, awsBucketName, str(s3_ref))
            print "Inserting bson for: " + filename
            db[col_name].insert(bson_data)

