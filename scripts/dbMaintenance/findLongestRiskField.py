import sys
from pymongo import MongoClient

if len(sys.argv) < 5:
    print("Not enough arguments.")
    print("findLongestRiskField.py <mongoURL> <mongoPort> <userName> <password>")
    sys.exit(0)

mongoURL = sys.argv[1]
mongoPort = sys.argv[2]
userName = sys.argv[3]
password = sys.argv[4]

connString = "mongodb://"+ userName + ":" + password +"@"+mongoURL + ":" + mongoPort + "/"

maxChars = 0
maxCharDB = ""
maxCharModel = ""
maxCharRisk = ""
maxCharField = ""

##### Connect to the Database #####
db = MongoClient(connString)
for database in db.database_names():

##### Skipping AMC_Bridge due to this: #####
# ============ LONGEST RISK FIELD RESULT ============
# Database: AMC_Bridge
# Model: 3a452b40-96b5-11ea-9a72-bfd7967ddc89
# Risk: 3b411dd0-db19-11ea-898a-53db1f8e2f7b
# Field: desc
# Characters: 842

    if database != "admin" and database != "local" and database != "AMC_Bridge":
        db = MongoClient(connString)[database]
        print("--database:" + database)

##### Get a model ID and find entries #####
        for setting in db.settings.find(no_cursor_timeout=True):
            modelId = setting.get("_id")
            print("\t--model: " +  modelId)
            for entry in db[modelId + ".risks"].find():
                for field in ["desc", "mitigation_desc", "residual_risk"]:
                    if entry.get(field) and len(entry.get(field)) > maxChars:
                        maxChars = len(entry.get(field))
                        maxCharDB = database
                        maxCharModel = modelId
                        maxCharRisk = str(entry.get("_id"))
                        maxCharField = field
print("")
print("============ LONGEST RISK FIELD RESULT ============")

print("Database: " + maxCharDB)
print("Model: " + maxCharModel)
print("Risk: " + maxCharRisk)
print("Field: " + maxCharField)
print("Characters: " + str(maxChars))

##### Longest client result: #####
# ============ LONGEST RISK FIELD RESULT ============
# Field: mitigation_desc
# Characters: 655
