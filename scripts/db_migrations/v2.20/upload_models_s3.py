import sys
import gridfs
import uuid
from pymongo import MongoClient
import boto3
import re

if len(sys.argv) < 9:
	print "Not enough arguments."
	print "upload_models_s3.py <mongoURL> <mongoPort> <userName> <password> <aws bucket name> <aws region name> <aws Access Key Id> <aws secret access key>"
	sys.exit(0)


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
			model_id = setting.get('_id')
			print "\t--model: " +  model_id
			for col_prefix in [".history",".stash.json_mpc", ".stash.unity3d" ]:
				col_name = model_id + col_prefix
				print "\t\t--stash: " +  col_name
				fs = gridfs.GridFS(db, col_name)
				for entry in fs.find({"filename":{"$not": re.compile("unityAssets.json$")}}):
					filename = entry.filename
					s3_ref = uuid.uuid4()
##### Create Reference BSON #####
					bson_data = {}
					bson_data['_id'] = filename
					bson_data['link'] = str(s3_ref)
					bson_data['type'] = "s3"
					bson_data['size'] = entry.length
					if dry_run:
						print "\t\t Writing: " + str(bson_data)
					else:
##### Upload to S3 and insert BSON #####
						s3.upload_fileobj(entry, awsBucketName, str(s3_ref))
						target_col = col_name + ".ref"
						db[target_col].insert(bson_data)

