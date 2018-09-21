import gridfs
import sys
import re
import uuid
from pymongo import MongoClient

mongoURL = sys.argv[1]
mongoPort = sys.argv[2]
userName = sys.argv[3]
password = sys.argv[4]


missing_files = [];

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
			print("\t--model: " + model_id)
			col_name = model_id + ".stash.json_mpc"

##### Check if bson files exist before deleting #####
			fs = gridfs.GridFS(db, col_name)
			unity_asset_files = fs.find({"filename" : {"$regex": "unityAssets.json$" }})
			for asset_file in unity_asset_files:
				rev_id = re.search(r"(?<=revision/).*?(?=/unityAssets\.json)", asset_file.filename).group(0)
				col_name_check = model_id + ".stash.unity3d"
				entry = db[col_name_check].find({"_id" : uuid.UUID(rev_id)})
				if entry.count() > 0:
##### Delete unityAssets.json files #####
					print "\t\tdeleting: " + asset_file.filename
					if not dry_run:
						fs.delete(asset_file._id)
				else:
						missing_files.append(asset_file.filename);

if len(missing_files) > 0:
	print "The following asset bundles did not have matching BSON entries:"
	for asset_file in missing_files:
		print "\t" + asset_file
