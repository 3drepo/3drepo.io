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
      colName = model_id + ".stash.json_mpc"

##### Get file and update the json #####
      fs = gridfs.GridFS(db, colName)
      unity_asset_files = fs.find({"filename" : {"$regex": "unityAssets.json$" }})

##### Delete unityAssets.json files #####
      for single_file in unity_asset_files:
        if dry_run:
          print "NOT deleting: " + single_file.filename
        else:
          print "deleting: " + single_file.filename
          fs.delete(single_file._id)
