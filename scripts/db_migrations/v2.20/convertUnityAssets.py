import json
import gridfs
import sys
import re
import uuid
from pymongo import MongoClient

mongoURL = sys.argv[1]
mongoPort = sys.argv[2]
userName = sys.argv[3]
password = sys.argv[4]
connString = "mongodb://"+ userName + ":" + password +"@"+mongoURL + ":" + mongoPort + "/"

##### Enable dry run to not commit to the database #####
dry_run = True

##### Connect to the database #####
db = MongoClient(connString)

##### Loop through each database other than admin and local #####
for database in db.database_names():
	if database != "admin" and database != "local":
		db = MongoClient(connString)[database]
		print("--database:" + database)

##### Get a model ID #####
		for model in db.settings.find({"federate": {"$ne": True}}, {"_id": 1}):
			model_id = model.get('_id')
			print("\t--model:" + model_id)
			source_col = model_id + ".stash.json_mpc"
			dest_col = model_id + ".stash.unity3d"

##### Get file and update the json #####
			fs = gridfs.GridFS(db, source_col)
			unity_asset_files = fs.find({"filename" : {"$regex": "unityAssets.json$" }})

			for asset_file in unity_asset_files:
				rev_id = re.search(r"(?<=revision/).*?(?=/unityAssets\.json)", asset_file.filename).group(0)
				updated_json = json.loads(asset_file.read())

##### Write to database #####
				if dry_run:
					updated_json.update({'_id': rev_id})
					print("\t\tWriting " + json.dumps(updated_json))
				else:
					print("\t\tWriting assets file for rev: " + rev_id)
					updated_json.update({'_id': uuid.UUID(rev_id)})
					db[dest_col].save(updated_json)

