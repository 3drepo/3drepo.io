import sys
from pymongo import MongoClient

if len(sys.argv) < 5:
    print("Not enough arguments.")
    print("cleanViews.py <mongoURL> <mongoPort> <userName> <password>")
    sys.exit(0)

mongoURL = sys.argv[1]
mongoPort = sys.argv[2]
userName = sys.argv[3]
password = sys.argv[4]

connString = "mongodb://"+ userName + ":" + password +"@"+mongoURL + ":" + mongoPort + "/"

##### Enable dry run to not commit to the database #####
dryRun = True

##### Enable verification to compare data #####
verify = True

##### Connect to the Database #####
db = MongoClient(connString)
for database in db.database_names():
    if database != "admin" and database != "local":
        db = MongoClient(connString)[database]
        print("--database:" + database)

##### Get a model ID and find entries #####
        for setting in db.settings.find(no_cursor_timeout=True):
            modelId = setting.get("_id")
            print("\t--model: " +  modelId)
            for view in db[modelId + ".views"].find({"$or":[{"clippingPlanes":{"$exists":True}},{"screenshot":{"$exists":True}}]}):
                viewId = view.get("_id")
                unsetFields = { "$unset": {} }
                print("\t\t--view: " +  str(viewId))
##### Handle old clipping planes #####
                if "clippingPlanes" in view and "clippingPlanes" in view.get("viewpoint"):
                    if not verify or view["viewpoint"]["clippingPlanes"] == view["clippingPlanes"]:
                        unsetFields["$unset"]["clippingPlanes"] = ""
                    else:
                        print("\t\t\tclippingPlanes mismatch, skipping...")
##### Handle old screenshot #####
                if "screenshot" in view and "buffer" in view.get("screenshot") and "thumbnail" in view:
                    if not verify or view["thumbnail"] == view["screenshot"]["buffer"]:
                        unsetFields["$unset"]["screenshot"] = ""
                    else:
                        print("\t\t\tthumbnail mismatch, skipping...")

                if not dryRun and any(unsetFields.get("$unset")):
                    db[modelId + ".views"].update_one({"_id":viewId}, unsetFields)

