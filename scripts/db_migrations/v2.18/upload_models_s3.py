import json
import gridfs
import sys
import uuid
from pymongo import MongoClient
import boto3

##### Connect to AWS S3 #####
s3 = boto3.client('s3')
bucket_name = '3drepo-models'

mongoURL = sys.argv[1]
mongoPort = sys.argv[2]
userName = sys.argv[3]
password = sys.argv[4]
connString = "mongodb://"+ userName + ":" + password +"@"+mongoURL + ":" + mongoPort + "/"
##### Enable dry run to not commit to the database #####
dry_run = True

##### Connect to the Database #####
def upload(col_prefix, col_insert_prefix, file_type):
	db = MongoClient(connString)
	for database in db.database_names():
		if database != "admin" and database != "local" and database == "kierongibbons":
			db = MongoClient(connString)[database]
			print(file_type + ": --database:" + database)

##### Get a model ID #####
			for settings in db.settings.find():
				model_id = settings.get('_id')
				col_name = model_id + col_prefix
				fs = gridfs.GridFS(db, col_name)
				fs_model = fs.find()
				for model in fs_model:
					filename = model.filename
					if file_type == "asset files":
						filename = filename.replace("/", "-")
						filename = filename[1:]
					if not filename.endswith("unityAssets.json"):
						outFileName = "/var/lib/backup/" + filename
						outFile = open(outFileName, "wb");
						outFile.write(model.read())
##### Upload to S3 #####
						model_uuid = uuid.uuid4()
						print "Uploading: " + filename
						s3.upload_file(outFileName, bucket_name, str(model_uuid))
##### Create Reference BSON #####
						bson_data = {}
						bson_data['_id'] = filename
						bson_data['link'] = str(model_uuid)
						bson_data['type'] = "s3"
						col_name = model_id + col_insert_prefix
						if dry_run:
							print "NOT Inserting model bson for: " + filename
						else:
							print "Inserting model bson for: " + filename
							db[col_name].insert(bson_data)
					else:
						# Skips unityAssets.json files
						print "Skipping: " + filename

##### Upload Original 3D Models
upload(".history", ".history.ref", "model files")
##### Upload Tree and Materials Mappings
upload(".stash.json_mpc", ".stash.json_mpc.ref", "asset files")

