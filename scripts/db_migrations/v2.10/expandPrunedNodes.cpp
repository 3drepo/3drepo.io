#include <repo/repo_controller.h>
#include <repo/core/handler/repo_database_handler_mongo.h>
#include <repo/core/model/bson/repo_node_metadata.h>
#include <ctime>
#include <string>

repo::RepoController::RepoToken* connectToProd(repo::RepoController *controller)
{
	std::string errMsg;
	return controller->authenticateToAdminDatabaseMongo(errMsg, "localhost", 9991, "user", "password");
}

repo::RepoController::RepoToken* connectToDev(repo::RepoController *controller)
{
	std::string errMsg;
	return controller->authenticateToAdminDatabaseMongo(errMsg, "localhost", 9997, "user", "password");
}

repo::RepoController::RepoToken* connectToLocal(repo::RepoController *controller)
{
	std::string errMsg;
	return controller->authenticateToAdminDatabaseMongo(errMsg, "localhost", 27017, "user", "password");
}

repo::RepoController::RepoToken* connectToTest(repo::RepoController *controller)
{
	std::string errMsg;
	return controller->authenticateToAdminDatabaseMongo(errMsg, "localhost", 27017, "user", "password");
}

static void getIFCGUIDMapping(repo::core::model::RepoScene* scene,
	std::unordered_map<std::string, std::vector<repo::lib::RepoUUID>> &ifcGuidToParents,
	std::map<repo::lib::RepoUUID, std::string> &idToGuids) {
	//get a mapping of ifc guids to parents
	for (const auto &metaNode : scene->getAllMetadata(repo::core::model::RepoScene::GraphType::DEFAULT)) {
		auto meta = (repo::core::model::MetadataNode*) metaNode;
		auto metaEntries = meta->getObjectField(REPO_NODE_LABEL_METADATA);
		if (!metaEntries.isEmpty() && metaEntries.hasField("IFC GUID")) {
			std::string guid = metaEntries.getStringField("IFC GUID");
			auto parentIDs = meta->getParentIDs();
			if (ifcGuidToParents.find(guid) == ifcGuidToParents.end())
				ifcGuidToParents[guid] = parentIDs;
			else
				ifcGuidToParents[guid].insert(ifcGuidToParents[guid].end(), parentIDs.begin(), parentIDs.end());

			for (const auto &id : parentIDs) {
				idToGuids[id] = guid;
			}
		}
	}
}

static std::vector<repo::lib::RepoUUID> findSharedIDsfromMeta(
	repo::core::model::RepoScene* scene, 
	std::unordered_map<std::string, std::vector<repo::lib::RepoUUID>> & ifcGuidToParents,
	const std::vector<std::string> &ifcGuids)
{

	std::vector<repo::lib::RepoUUID> returnIDs;

	for (const auto &guid : ifcGuids) {
		if (ifcGuidToParents.find(guid) != ifcGuidToParents.end()) {
			returnIDs.insert(returnIDs.end(), ifcGuidToParents[guid].begin(), ifcGuidToParents[guid].end());
		}
		else {
			std::cout << "No matching ID for " << guid << " mapping is " << ifcGuidToParents.size()<< std::endl;
		}
	}
	return returnIDs;
}

static std::set<repo::lib::RepoUUID> GetDescendantMeshIDsFromSharedIDs(
	repo::core::model::RepoScene* scene,
	const std::set<repo::lib::RepoUUID> &_sharedIDs
) {
	std::set<repo::lib::RepoUUID> results;
	auto sharedIDs = _sharedIDs;
	while (sharedIDs.size()) {
		auto sharedID = *sharedIDs.begin();
		sharedIDs.erase(sharedIDs.begin());

		if (auto node = scene->getNodeBySharedID(repo::core::model::RepoScene::GraphType::DEFAULT, sharedID))
		{
			if (node->getTypeAsEnum() == repo::core::model::NodeType::MESH) {
				results.insert(node->getSharedID());
			}
			else if (node->getTypeAsEnum() == repo::core::model::NodeType::TRANSFORMATION) {
				auto children  = scene->getChildrenAsNodes(repo::core::model::RepoScene::GraphType::DEFAULT, node->getSharedID());
				for (const auto child : children) {
					sharedIDs.insert(child->getSharedID());
				}				
			}
		}
	}

	return results;
	
}

static void processGroupsInModel(repo::RepoController *controller,
	repo::RepoController::RepoToken *token, 
	const std::string dbName,
	const std::string modelID
) {
	std::cout << "Processing model: " << modelID << std::endl;
	auto scene = controller->fetchScene(token, dbName, modelID, REPO_HISTORY_MASTER_BRANCH, true, false, false, true);
	if (!scene) {
		std::cout << "Failed to load scene." << std::endl;
		return;
	}
	std::unordered_map<std::string, std::unordered_map<std::string, std::vector<repo::lib::RepoUUID>>> ifcGuidToParents;
	std::unordered_map<std::string, std::map<repo::lib::RepoUUID, std::string>> idToGuids;

	//fetch groups
	auto groups = controller->getAllFromCollectionContinuous(token, dbName, modelID + ".groups");
	for (const auto &group : groups) {
		if (group.hasField("objects")) {
			auto objectBSON = group.getObjectField("objects");
			std::set<std::string> fieldNames;
			objectBSON.getFieldNames(fieldNames);
			if (!fieldNames.size()) continue;

			std::vector<repo::core::model::RepoBSON> newGroupObjects;

			std::cout << "\tProcessing group: " << group.getUUIDField("_id").toString() << std::endl;
			for (const auto &field : fieldNames) {
				std::cout << "\t\tprocessing object " << field << std::endl;
				repo::core::model::RepoBSON entryBSON = objectBSON.getObjectField(field);
				std::string account = entryBSON.getStringField("account");
				std::string model = entryBSON.getStringField("model");
				std::set<repo::lib::RepoUUID> sharedIDs;
				repo::core::model::RepoScene* sceneOfObject = nullptr;
				if (modelID == model) {
					//not a submodel
					sceneOfObject = scene;
				}
				else
				{
					auto refNodes = scene->getAllReferences(repo::core::model::RepoScene::GraphType::DEFAULT);
					for (const auto &refNode : refNodes) {
						auto ref = (repo::core::model::ReferenceNode*)refNode;
						if (ref->getProjectName() == model) {
							sceneOfObject = scene->getSceneFromReference(repo::core::model::RepoScene::GraphType::DEFAULT, ref->getSharedID());
							break;
						}
					}
				}

				if (!sceneOfObject) {
					std::cerr << "\t\t\tCannot find scene for " << model << std::endl;
					continue;
				}

				if (entryBSON.hasField("ifc_guids")) {

					if (ifcGuidToParents.find(model) == ifcGuidToParents.end())
					{
						ifcGuidToParents[model] = std::unordered_map < std::string, std::vector<repo::lib::RepoUUID>>();
						idToGuids[model] = std::map<repo::lib::RepoUUID, std::string>();
						getIFCGUIDMapping(sceneOfObject, ifcGuidToParents[model], idToGuids[model]);
					}
					
					
					auto ifcGuids = entryBSON.getStringArray("ifc_guids");
					
				
					auto res = findSharedIDsfromMeta(sceneOfObject, ifcGuidToParents[model], ifcGuids);
					sharedIDs.insert(res.begin(), res.end());
					
				}

				if (entryBSON.hasField("shared_ids")) {
					auto nodeIds = entryBSON.getUUIDFieldArray("shared_ids");
					sharedIDs.insert(nodeIds.begin(), nodeIds.end());
				}

				auto meshIDs = GetDescendantMeshIDsFromSharedIDs(sceneOfObject, sharedIDs);

				std::set<repo::lib::RepoUUID> resSharedIDs;
				std::set<std::string> resIFCGuids;
				if (idToGuids.find(model) != idToGuids.end())
				{
					for (const auto &mesh : meshIDs) {
						if (idToGuids[model].find(mesh) != idToGuids[model].end())
							resIFCGuids.insert(idToGuids[model][mesh]);
						else
							resSharedIDs.insert(mesh);
					}
				}
				else {
					resSharedIDs = meshIDs;
				}

				std::cout << "\t\t\t" << resIFCGuids.size() << " IFC guids ," << resSharedIDs.size() << " mesh IDs found" << std::endl;

				if (resIFCGuids.size() || resSharedIDs.size()) {
					repo::core::model::RepoBSONBuilder builder;
					if (resIFCGuids.size()) {
						std::vector<std::string> ifcGuidsVector(resIFCGuids.begin(), resIFCGuids.end());
						builder.appendArray("ifc_guids", ifcGuidsVector);
					}

					if (resSharedIDs.size()) {
						std::vector<repo::lib::RepoUUID> resSharedIDsVector(resSharedIDs.begin(), resSharedIDs.end());
						builder.appendArray("shared_ids", resSharedIDsVector);
					}
					builder << "account" << account;
					builder << "model" << model;
					newGroupObjects.push_back(builder.obj());
				}
				else
				{
					newGroupObjects.push_back(entryBSON);
				}
			}
			repo::core::model::RepoBSONBuilder groupBuilder;
			groupBuilder.appendArray("objects", newGroupObjects);
			groupBuilder.appendElementsUnique(group);
			controller->upsertDocument(token, dbName, modelID + ".groups", groupBuilder.obj());
		}


		break;
	}

	delete scene;
}

static void unpruneDB(repo::RepoController *controller, repo::RepoController::RepoToken *token, const std::string dbName) {
	const auto modelSettings = controller->getAllFromCollectionContinuous(token, dbName, "settings");
	std::cout << "============================= " << dbName << " ==================================" << std::endl;
	for (const auto &setting : modelSettings) {
		const std::string modelID = setting.getStringField("_id");
		if (!modelID.empty()) {
			processGroupsInModel(controller, token, dbName, modelID);
		}
	}

}

int main(int argc, char* argv[])
{
	repo::RepoController *controller = new repo::RepoController();
	std::string errMsg;
	repo::RepoController::RepoToken* token = connectToDev(controller);
	controller->setLoggingLevel(repo::lib::RepoLog::RepoLogLevel::FATAL);
	auto dbNames = controller->getDatabases(token);

	for (const auto &db : dbNames) {
		if (db == "groupTest")
			unpruneDB(controller, token, db);
	}
}

