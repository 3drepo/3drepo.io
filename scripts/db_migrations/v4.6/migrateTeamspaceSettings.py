import sys
from pymongo import MongoClient

if len(sys.argv) < 4:
    print("Not enough arguments.")
    print("migrateTeamspaceSettings.py <mongoURL> <mongoPort> <userName> <password>")
    sys.exit(0)

mongoURL = sys.argv[1]
mongoPort = sys.argv[2]
userName = sys.argv[3]
password = sys.argv[4]

connString = "mongodb://"+ userName + ":" + password +"@"+mongoURL + ":" + mongoPort + "/"

##### Enable dry run to not commit to the database #####
dryRun = True
overwrite = False #if there is already an entry for the filename: True = Overwrite regardless, False = Use existing entry

##### Connect to the Database #####
db = MongoClient(connString)
for database in db.database_names():
    if database != "admin" and database != "local":
        db = MongoClient(connString)[database]
        print("--database:" + database)

        readTopicTypes = False
        topicTypesDict = {}

##### Get a model ID and find entries #####
        for setting in db.settings.find(no_cursor_timeout=True):
            modelId = setting.get('_id')
            print("\t--model: " +  modelId)
            try:
                for modelTopicType in setting['properties']['topicTypes']:
                    topicTypesDict[modelTopicType['label']] = modelTopicType
                readTopicTypes = True
##### Delete Topic Types from Model Settings #####
                if not dryRun:
                    del setting['properties']['topicTypes']
                    db['settings'].save(setting)
            except KeyError:
                print("\t\ttopicTypes not found in settings")
                break

##### Create Teamspace Settings BSON #####
        if readTopicTypes:
            topicTypes = []
            for types in topicTypesDict:
                topicTypes.append(topicTypesDict[types])

            teamspaceSettings = {}
            teamspaceSettings['_id'] = database
            teamspaceSettings['riskCategories'] = [
                { u'value': u'commercial', u'name': u'Commercial Issue' },
                { u'value': u'environmental', u'name': u'Environmental Issue' },
                { u'value': u'health_material_effect', u'name': u'Health - Material effect' },
                { u'value': u'health_mechanical_effect', u'name': u'Health - Mechanical effect' },
                { u'value': u'safety_fall', u'name': u'Safety Issue - Fall' },
                { u'value': u'safety_trapped', u'name': u'Safety Issue - Trapped' },
                { u'value': u'safety_event', u'name': u'Safety Issue - Event' },
                { u'value': u'safety_handling', u'name': u'Safety Issue - Handling' },
                { u'value': u'safety_struck', u'name': u'Safety Issue - Struck' },
                { u'value': u'safety_public', u'name': u'Safety Issue - Public' },
                { u'value': u'social', u'name': u'Social Issue' },
                { u'value': u'other', u'name': u'Other Issue' },
                { u'value': u'unknown', u'name': u'UNKNOWN' }
            ]
            teamspaceSettings['topicTypes'] = topicTypes

            if not dryRun:
##### Insert Teamspace Settings BSON #####
                db['teamspace'].save(teamspaceSettings)
            else:
                print(teamspaceSettings)
        else:
            print("\t\tNo topicTypes found -- skipping write to settings")
