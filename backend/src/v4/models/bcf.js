/**
 *  Copyright (C) 2019 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

const _ = require("lodash");
const archiver = require("archiver");
const xml2js = require("xml2js");
const yauzl = require("yauzl-promise");

const C = require("../constants");
const systemLogger = require("../logger.js").systemLogger;
const utils = require("../utils");
const responseCodes = require("../response_codes.js");

const { addPreExistingComment } = require("./comment");
const FileRef = require("./fileRef");
const Group = require("./group");
const Meta = require("./meta");
const Viewpoint = require("./viewpoint");

const statusEnum = C.ISSUE_STATUS;

const priorityEnum = {
	"NONE": "none",
	"LOW": "low",
	"MEDIUM": "medium",
	"HIGH": "high"
};

const xmlBuilder = new xml2js.Builder({
	explicitRoot: false,
	xmldec: {
		version: "1.0",
		encoding: "UTF-8",
		standalone: false
	},
	explicitCharkey: true,
	attrkey: "@"
});

const bcf = {};

function getBCFVersion() {
	return `<?xml version="1.0" encoding="UTF-8"?>
		<Version VersionId="2.1" xsi:noNamespaceSchemaLocation="version.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
		<DetailedVersion>2.1</DetailedVersion>
		</Version>`;
}

function parseXmlString(xmlString, options) {
	return new Promise((resolve, reject) => {
		xml2js.parseString(xmlString, options, function (err, xml) {
			if(err) {
				reject(err);
			} else {
				resolve(xml);
			}
		});
	});
}

// TODO comment code should reside in comment
function isSystemComment(comment) {
	return !_.isEmpty(comment.action);
}

function sanitise(data, list) {
	if (!data) {
		return data;
	}

	const dataSanitised = data.toLowerCase();

	if (_.map(list).indexOf(dataSanitised) === -1) {
		return data;
	}

	return dataSanitised;
}

async function getIssueBCF(issue, account, model, unit) {
	const viewpointEntries = [];
	const snapshotEntries = [];

	let scale = 1;

	if(unit === "dm") {
		scale = 0.1;
	} else if (unit === "cm") {
		scale = 0.01;
	} else if (unit === "mm") {
		scale = 0.001;
	} else if (unit === "ft") {
		scale = 0.3048;
	}

	const markup = {
		Markup:{
			"@" : {
				"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
				"xmlns:xsd": "http://www.w3.org/2001/XMLSchema"
			},
			Header:{},
			Topic: {
				"@" : {
					"Guid": utils.uuidToString(issue._id),
					"TopicStatus": issue.status ? issue.status : (issue.closed ? "closed" : "open")
				}
			},
			"Comment": [],
			"Viewpoints": []
		}
	};

	const markupMapping = {
		"TopicType": "topic_type",
		"Markup.Header": "extras.Header",
		"Markup.Topic.ReferenceLink": "extras.ReferenceLink",
		"Markup.Topic.Title": "name",
		"Markup.Topic.Priority": "priority",
		"Markup.Topic.Index": "extras.Index",
		"Markup.Topic.Labels": "extras.Labels",
		"Markup.Topic.CreationDate": "created",
		"Markup.Topic.CreationAuthor": "owner",
		"Markup.Topic.ModifiedDate": "extras.ModifiedDate",
		"Markup.Topic.ModifiedAuthor": "extras.ModifiedAuthor",
		"Markup.Topic.DueDate": "due_date",
		"Markup.Topic.AssignedTo": "assigned_roles",
		"Markup.Topic.Description": "desc",
		"Markup.Topic.BimSnippet": "extras.BimSnippet",
		"Markup.Topic.DocumentReference": "extras.DocumentReference",
		"Markup.Topic.RelatedTopic": "extras.RelatedTopic"
	};

	Object.keys(markupMapping).forEach((key) => {
		switch (key) {
			case "TopicType":
				if (issue[markupMapping[key]]) {
					markup.Markup.Topic["@"].TopicType = issue[markupMapping[key]];
				}
				break;
			case "Markup.Topic.CreationDate":
				if (_.has(issue, markupMapping[key])) {
					_.set(markup, key, utils.timestampToISOString(_.get(issue, markupMapping[key])));
				}
				break;
			case "Markup.Topic.DueDate":
				if (_.has(issue, markupMapping[key])) {
					_.set(markup, key, utils.timestampToISOString(_.get(issue, markupMapping[key])));
				} else if (_.has(issue, "extras.DueDate")) {
					_.set(markup, key, _.get(issue, "extras.DueDate"));
				}
				break;
			case "Markup.Topic.AssignedTo":
				if (_.has(issue, markupMapping[key]) && issue[markupMapping[key]].length > 0) {
					_.set(markup, key, _.get(issue, markupMapping[key]).toString());
				} else if (_.has(issue, "extras.AssignedTo")) {
					_.set(markup, key, _.get(issue, "extras.AssignedTo"));
				}
				break;
			default:
				if (_.has(issue, markupMapping[key])) {
					_.set(markup, key, _.get(issue, markupMapping[key]));
				}
		}
	});

	// add comments
	issue.comments && issue.comments.forEach(comment => {

		if(isSystemComment(comment)) {
			return;
		}

		const getViewpointId = (viewId = utils.generateUUID()) => {
			try {
				utils.uuidToString(viewId);

			} catch (err) {
				return utils.uuidToString(utils.generateUUID());
			}
		};

		const commentXmlObj = {
			"@":{
				Guid: utils.uuidToString(comment.guid ? comment.guid : utils.generateUUID())
			},
			"Date": utils.timestampToISOString(comment.created),
			"Author": comment.owner,
			"Comment": comment.comment,
			"Viewpoint": {
				"@": {Guid: getViewpointId(comment.viewpoint)}
			},
			// bcf 1.0 for back comp
			"Status": issue.topic_type ? utils.ucFirst(issue.topic_type.replace(/_/g, " ")) : "",
			"VerbalStatus": issue.status ? issue.status : (issue.closed ? "closed" : "open")
		};

		_.get(comment, "extras.ModifiedDate") && (commentXmlObj.ModifiedDate = _.get(comment, "extras.ModifiedDate"));
		_.get(comment, "extras.ModifiedAuthor") && (commentXmlObj.ModifiedAuthor = _.get(comment, "extras.ModifiedAuthor"));

		markup.Markup.Comment.push(commentXmlObj);
	});

	const viewpointsPromises = [];

	// generate viewpoints
	let snapshotNo = 0;

	if (issue.viewpoints) {
		for (let vpIdx = 0; vpIdx < issue.viewpoints.length; vpIdx++) {
			const vp = issue.viewpoints[vpIdx];
			const number = vpIdx === 0 ? "" : vpIdx;
			const viewpointFileName = `viewpoint${number}.bcfv`;
			const snapshotFileName = `snapshot${(snapshotNo === 0 ? "" : snapshotNo)}.png`;

			const vpObj = {
				"@": {
					"Guid": utils.uuidToString(vp.guid)
				},
				"Viewpoint": viewpointFileName,
				"Snapshot":  null
			};

			let screenshotContent;

			if (vp.screenshot_ref) {
				try {
					screenshotContent = await FileRef.fetchFile(account, model, "issues", vp.screenshot_ref);
				} catch {
					screenshotContent = undefined;
				}
			} else if (vp.screenshot && vp.screenshot.flag) {
				screenshotContent = vp.screenshot.content.buffer;
			}

			if (screenshotContent) {
				vpObj.Snapshot = snapshotFileName;
				snapshotEntries.push({
					filename: snapshotFileName,
					snapshot: screenshotContent
				});
				snapshotNo++;
			}

			_.get(vp, "extras.Index") && (vpObj.Index = vp.extras.Index);

			markup.Markup.Viewpoints.push(vpObj);

			const viewpointXmlObj = {
				VisualizationInfo:{
					"@":{
						"Guid": utils.uuidToString(vp.guid),
						"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
						"xmlns:xsd": "http://www.w3.org/2001/XMLSchema"
					}
				}
			};

			if (_.get(vp, "extras.Components")) {
				// TODO: Consider if extras.Components should only be used if groups don't exist
				// TODO: Could potentially check each sub-property (ViewSetupHints, Selection, etc.
				viewpointXmlObj.VisualizationInfo.Components = _.get(vp, "extras.Components");

				_.get(vp, "extras.Spaces") && (viewpointXmlObj.VisualizationInfo.Components.SpacesVisible = _.get(vp, "extras.Spaces"));
				_.get(vp, "extras.SpaceBoundaries") && (viewpointXmlObj.VisualizationInfo.Components.SpaceBoundariesVisible = _.get(vp, "extras.SpaceBoundaries"));
				_.get(vp, "extras.Openings") && (viewpointXmlObj.VisualizationInfo.Components.OpeningsVisible = _.get(vp, "extras.Openings"));
			}

			const componentsPromises = [];

			if (_.get(vp, "highlighted_group_id")) {
				const highlightedGroupId = _.get(vp, "highlighted_group_id");
				componentsPromises.push(
					Group.findByUID(account, model, undefined, undefined, highlightedGroupId, false, true, true).then(group => {
						if (group && group.objects && group.objects.length > 0) {
							for (let i = 0; i < group.objects.length; i++) {
								const groupObject = group.objects[i];
								if (!viewpointXmlObj.VisualizationInfo.Components) {
									viewpointXmlObj.VisualizationInfo.Components = {};
								}
								if (!viewpointXmlObj.VisualizationInfo.Components.Selection) {
									viewpointXmlObj.VisualizationInfo.Components.Selection = {};
									viewpointXmlObj.VisualizationInfo.Components.Selection.Component = [];
								}
								for (let j = 0; groupObject.ifc_guids && j < groupObject.ifc_guids.length; j++) {
									viewpointXmlObj.VisualizationInfo.Components.Selection.Component.push({
										"@": {
											IfcGuid: groupObject.ifc_guids[j]
										},
										OriginatingSystem: "3D Repo"
									});
								}
							}
						}
					}).catch(()=> {
						// catching this error and ignoring - if we can't find the group, we should still export the issue.
						systemLogger.logInfo("Failed to find group - " + utils.uuidToString(highlightedGroupId));
					})
				);
			}

			if (_.get(vp, "hidden_group_id")) {
				const hiddenGroupId = _.get(vp, "hidden_group_id");
				componentsPromises.push(
					Group.findByUID(account, model, undefined, undefined, hiddenGroupId, false, true, true).then(group => {
						if (group && group.objects && group.objects.length > 0) {
							for (let i = 0; i < group.objects.length; i++) {
								const groupObject = group.objects[i];
								if (!viewpointXmlObj.VisualizationInfo.Components) {
									viewpointXmlObj.VisualizationInfo.Components = {};
								}
								if (!viewpointXmlObj.VisualizationInfo.Components.Visibility) {
									viewpointXmlObj.VisualizationInfo.Components.Visibility = {
										"@": {
											DefaultVisibility: true
										}
									};
									viewpointXmlObj.VisualizationInfo.Components.Visibility.Exceptions = {};
									viewpointXmlObj.VisualizationInfo.Components.Visibility.Exceptions.Component = [];
								}
								for (let j = 0; groupObject.ifc_guids && j < groupObject.ifc_guids.length; j++) {
									viewpointXmlObj.VisualizationInfo.Components.Visibility.Exceptions.Component.push({
										"@": {
											IfcGuid: groupObject.ifc_guids[j]
										},
										OriginatingSystem: "3D Repo"
									});
								}
							}
						}
					}).catch(()=> {
						// catching this error and ignoring - if we can't find the group, we should still export the issue.
						systemLogger.logInfo("Failed to find group - " + utils.uuidToString(hiddenGroupId));
					})
				);
			}

			if (_.get(vp, "shown_group_id")) {
				const shownGroupId = _.get(vp, "shown_group_id");
				componentsPromises.push(
					Group.findByUID(account, model, undefined, undefined, shownGroupId, false, true, true).then(group => {
						if (group && group.objects && group.objects.length > 0) {
							for (let i = 0; i < group.objects.length; i++) {
								const groupObject = group.objects[i];
								if (!viewpointXmlObj.VisualizationInfo.Components) {
									viewpointXmlObj.VisualizationInfo.Components = {};
								}
								if (!viewpointXmlObj.VisualizationInfo.Components.Visibility) {
									viewpointXmlObj.VisualizationInfo.Components.Visibility = {
										"@": {
											DefaultVisibility: false
										}
									};
									viewpointXmlObj.VisualizationInfo.Components.Visibility.Exceptions = {};
									viewpointXmlObj.VisualizationInfo.Components.Visibility.Exceptions.Component = [];
								}
								for (let j = 0; groupObject.ifc_guids && j < groupObject.ifc_guids.length; j++) {
									viewpointXmlObj.VisualizationInfo.Components.Visibility.Exceptions.Component.push({
										"@": {
											IfcGuid: groupObject.ifc_guids[j]
										},
										OriginatingSystem: "3D Repo"
									});
								}
							}
						}
					}).catch(()=> {
						// catching this error and ignoring - if we can't find the group, we should still export the issue.
						systemLogger.logInfo("Failed to find group - " + utils.uuidToString(shownGroupId));
					})
				);
			}

			viewpointsPromises.push(
				Promise.all(componentsPromises).then(() => {
					if (vp.position && vp.position.length >= 3 &&
						vp.view_dir && vp.view_dir.length >= 3 &&
						vp.up && vp.up.length >= 3) {
						const camera = {
							CameraViewPoint:{
								X: vp.position[0] * scale,
								Y: -vp.position[2] * scale,
								Z: vp.position[1] * scale
							},
							CameraDirection:{
								X: vp.view_dir[0],
								Y: -vp.view_dir[2],
								Z: vp.view_dir[1]
							},
							CameraUpVector:{
								X: vp.up[0],
								Y: -vp.up[2],
								Z: vp.up[1]
							}
						};

						if ("orthographic" === vp.type && vp.orthographicSize) {
							viewpointXmlObj.VisualizationInfo.OrthogonalCamera = {
								...camera,
								ViewToWorldScale: vp.orthographicSize
							};
						}

						if (("perspective" === vp.type || !_.get(vp, "extras._noPerspective"))) {
							viewpointXmlObj.VisualizationInfo.PerspectiveCamera = {
								...camera,
								FieldOfView: vp.fov ? vp.fov * 180 / Math.PI : 60
							};
						}
					} else if (_.get(vp, "extras.OrthogonalCamera")) {
						viewpointXmlObj.VisualizationInfo.OrthogonalCamera = _.get(vp, "extras.OrthogonalCamera");
					}

					_.get(vp, "extras.Lines") && (viewpointXmlObj.VisualizationInfo.Lines = _.get(vp, "extras.Lines"));

					if (_.get(vp, "clippingPlanes") && vp.clippingPlanes.length > 0) {
						viewpointXmlObj.VisualizationInfo.ClippingPlanes = {};
						viewpointXmlObj.VisualizationInfo.ClippingPlanes.ClippingPlane = [];
						for (let i = 0; i < vp.clippingPlanes.length; i++) {
							viewpointXmlObj.VisualizationInfo.ClippingPlanes.ClippingPlane.push({
								Location:{
									X: -vp.clippingPlanes[i].normal[0] * vp.clippingPlanes[i].distance * scale,
									Y: vp.clippingPlanes[i].normal[2] * vp.clippingPlanes[i].distance * scale,
									Z: -vp.clippingPlanes[i].normal[1] * vp.clippingPlanes[i].distance * scale
								},
								Direction:{
									X: vp.clippingPlanes[i].normal[0] * vp.clippingPlanes[i].clipDirection,
									Y: -vp.clippingPlanes[i].normal[2] * vp.clippingPlanes[i].clipDirection,
									Z: vp.clippingPlanes[i].normal[1] * vp.clippingPlanes[i].clipDirection
								}
							});
						}
					} else if (_.get(vp, "extras.ClippingPlanes")) {
						viewpointXmlObj.VisualizationInfo.ClippingPlanes = _.get(vp, "extras.ClippingPlanes");
					}

					_.get(vp, "extras.Bitmap") && (viewpointXmlObj.VisualizationInfo.Bitmap = _.get(vp, "extras.Bitmap"));

					viewpointEntries.push({
						filename: viewpointFileName,
						xml:  xmlBuilder.buildObject(viewpointXmlObj)
					});
				})
			);
		}
	}

	return Promise.all(viewpointsPromises).then(() => {
		return {
			markup: xmlBuilder.buildObject(markup),
			viewpoints: viewpointEntries,
			snapshots: snapshotEntries
		};
	});
}

bcf.getBCFZipReadStream = function(account, model, issues, unit) {
	const zip = archiver.create("zip");

	// Optional project extensions not currently utilised
	// zip.append(new Buffer.from(getProjectExtension(model), "utf8"), {name: "project.bcfp"})
	zip.append(new Buffer.from(getBCFVersion(), "utf8"), {name: "bcf.version"});

	const bcfPromises = [];

	issues.forEach(issue => {

		const issueAccount = issue.origin_account || account;
		const issueModel = issue.origin_model || model;

		bcfPromises.push(
			getIssueBCF(issue, issueAccount, issueModel, unit).then(bcfResult => {
				zip.append(new Buffer.from(bcfResult.markup, "utf8"), {name: `${utils.uuidToString(issue._id)}/markup.bcf`});

				bcfResult.viewpoints.forEach(vp => {
					zip.append(new Buffer.from(vp.xml, "utf8"), {name: `${utils.uuidToString(issue._id)}/${vp.filename}`});
				});

				bcfResult.snapshots.forEach(snapshot => {
					zip.append(snapshot.snapshot, {name: `${utils.uuidToString(issue._id)}/${snapshot.filename}`});
				});
			})
		);
	});

	return Promise.all(bcfPromises).then(() => {
		zip.finalize();
		return zip;
	});
};

function parseViewpoints(issueGuid, issueFiles, vps) {
	const viewpoints = {};
	const vpPromises = [];

	vps && vps.forEach(vp => {
		if(!_.get(vp, "@.Guid")) {
			return;
		}

		const vpFile = issueFiles[`${issueGuid}/${_.get(vp, "Viewpoint[0]._")}`];

		viewpoints[vp["@"].Guid] = {
			snapshot: issueFiles[`${issueGuid}/${_.get(vp, "Snapshot[0]._")}`]
		};

		vpFile && vpPromises.push(parseXmlString(vpFile.toString("utf8"), {explicitCharkey: 1, attrkey: "@"}).then(xml => {
			viewpoints[vp["@"].Guid].viewpointXml = xml;
			viewpoints[vp["@"].Guid].Index = _.get(vp, "Index");
			viewpoints[vp["@"].Guid].Viewpoint = _.get(vp, "Viewpoint");
			viewpoints[vp["@"].Guid].Snapshot = _.get(vp, "Snapshot");
		}));
	});

	return Promise.all(vpPromises).then(() => viewpoints);
}

function parseViewpointComponentIfc(model, component, ifcToModelMap, isFederation) {
	return {
		model: isFederation && ifcToModelMap[component["@"].IfcGuid] ? ifcToModelMap[component["@"].IfcGuid] : model,
		ifcGuid: component["@"].IfcGuid
	};
}

function compileGroupObjects(account, componentIfcs) {
	const objects = [];
	const modelIndexes = {};

	for (let i = 0; i < componentIfcs.length; i++) {
		if (modelIndexes[componentIfcs[i].model] === undefined) {
			modelIndexes[componentIfcs[i].model] = Object.keys(modelIndexes).length;

			objects.push({
				account,
				model: componentIfcs[i].model,
				ifc_guids: []
			});
		}

		objects[modelIndexes[componentIfcs[i].model]].ifc_guids.push(componentIfcs[i].ifcGuid);
	}

	return objects;
}

function parseMarkupBuffer(markupBuffer) {
	if (!markupBuffer) {
		return Promise.resolve();
	}

	return parseXmlString(markupBuffer.toString("utf8"), { explicitCharkey: 1, attrkey: "@" }).then(xml => {
		const issue = {};
		// issue._id = utils.stringToUUID(guid);
		issue.comments = [];
		issue.extras = {};
		// issue.rev_id = revId;
		issue.viewpoints = [];

		if (xml.Markup) {
			issue.extras.Header = _.get(xml, "Markup.Header");
			if (_.get(xml, "Markup.Topic[0].@.TopicType")) {
				issue.topic_type = _.get(xml, "Markup.Topic[0].@.TopicType");
			}
			issue.status = sanitise(_.get(xml, "Markup.Topic[0].@.TopicStatus"), statusEnum);
			if (!issue.status || issue.status === "") {
				issue.status = "open";
			}
			_.get(xml, "Topic[0].ReferenceLink") && (issue.extras.ReferenceLink = _.get(xml, "Topic[0].ReferenceLink"));
			issue.name = _.get(xml, "Markup.Topic[0].Title[0]._");
			issue.priority = sanitise(_.get(xml, "Markup.Topic[0].Priority[0]._"), priorityEnum) || "None";
			_.get(xml, "Markup.Topic[0].Index[0]._") && (issue.extras.Index = _.get(xml, "Markup.Topic[0].Index[0]._"));
			_.get(xml, "Markup.Topic[0].Labels[0]._") && (issue.extras.Labels = _.get(xml, "Markup.Topic[0].Labels[0]._"));
			issue.created = utils.isoStringToTimestamp(_.get(xml, "Markup.Topic[0].CreationDate[0]._"));
			issue.owner = _.get(xml, "Markup.Topic[0].CreationAuthor[0]._") || "Unknown";
			_.get(xml, "Markup.Topic[0].ModifiedDate[0]._") && (issue.extras.ModifiedDate = _.get(xml, "Markup.Topic[0].ModifiedDate[0]._"));
			_.get(xml, "Markup.Topic[0].ModifiedAuthor[0]._") && (issue.extras.ModifiedAuthor = _.get(xml, "Markup.Topic[0].ModifiedAuthor[0]._"));
			if (_.get(xml, "Markup.Topic[0].DueDate[0]._")) {
				issue.due_date = utils.isoStringToTimestamp(_.get(xml, "Markup.Topic[0].DueDate[0]._"));
			}
			if (_.get(xml, "Markup.Topic[0].AssignedTo[0]._")) {
				issue.assigned_roles = _.get(xml, "Markup.Topic[0].AssignedTo[0]._").split(",");
			} else {
				issue.assigned_roles = [];
			}

			issue.desc = (_.get(xml, "Markup.Topic[0].Description[0]._")) ? _.get(xml, "Markup.Topic[0].Description[0]._") : "(No Description)";
			_.get(xml, "Markup.Topic[0].BimSnippet") && (issue.extras.BimSnippet = _.get(xml, "Markup.Topic[0].BimSnippet"));
			_.get(xml, "Markup.Topic[0].DocumentReference") && (issue.extras.DocumentReference = _.get(xml, "Markup.Topic[0].DocumentReference"));
			_.get(xml, "Markup.Topic[0].RelatedTopic") && (issue.extras.RelatedTopic = _.get(xml, "Markup.Topic[0].RelatedTopic"));
		}

		_.get(xml, "Markup.Comment") && xml.Markup.Comment.forEach(comment => {

			const obj = addPreExistingComment(
				_.get(comment, "Author[0]._"),
				_.get(comment, "Comment[0]._") ?? "",
				{ guid: utils.stringToUUID(_.get(comment, "Viewpoint[0].@.Guid"))},
				undefined,
				utils.isoStringToTimestamp(_.get(comment, "Date[0]._")),
				utils.stringToUUID(_.get(comment, "@.Guid"))
			);

			const commentExtras = {};
			_.get(comment, "ModifiedDate") && (commentExtras.ModifiedDate = _.get(comment, "ModifiedDate"));
			_.get(comment, "ModifiedDate") && (commentExtras.ModifiedAuthor = _.get(comment, "ModifiedAuthor"));

			if(Object.keys(commentExtras).length) {
				obj.extras = commentExtras;
			}
			issue.comments.push(obj);
		});

		return {
			issue,
			viewpointsData: xml.Markup.Viewpoints
		};
	});
}

function parseViewpointClippingPlanes(clippingPlanes, scale) {
	const parsedPlanes = [];

	for (let planeIdx = 0; planeIdx < clippingPlanes.length; planeIdx++) {
		for (let clipIdx = 0; clippingPlanes[planeIdx].ClippingPlane && clipIdx < clippingPlanes[planeIdx].ClippingPlane.length; ++clipIdx) {
			const fieldName = "ClippingPlane[" + clipIdx + "]";
			const clip = {};
			clip.normal = [
				parseFloat(_.get(clippingPlanes[planeIdx], fieldName + ".Direction[0].X[0]._")),
				parseFloat(_.get(clippingPlanes[planeIdx], fieldName + ".Direction[0].Z[0]._")),
				-parseFloat(_.get(clippingPlanes[planeIdx], fieldName + ".Direction[0].Y[0]._"))
			];
			const position = [
				parseFloat(_.get(clippingPlanes[planeIdx], fieldName + ".Location[0].X[0]._")) * scale,
				parseFloat(_.get(clippingPlanes[planeIdx], fieldName + ".Location[0].Z[0]._")) * scale,
				-parseFloat(_.get(clippingPlanes[planeIdx], fieldName + ".Location[0].Y[0]._")) * scale
			];

			clip.distance = - (position[0] * clip.normal[0]
				+ position[1] * clip.normal[1]
				+ position[2] * clip.normal[2]);

			clip.clipDirection = 1;
			parsedPlanes.push(clip);
		}
	}

	return parsedPlanes;
}

async function parseViewpointComponents(groupDbCol, vpComponents, isFederation, issueName, issueId, ifcToModelMap) {
	const vp = { extras: {}};
	const groupPromises = [];

	for (let componentsIdx = 0; componentsIdx < vpComponents.length; componentsIdx++) {
		let selectionObjects = [];
		let shownObjects = [];
		let hiddenObjects = [];

		Object.keys(vpComponents[componentsIdx]).sort().forEach((componentType) => {
			if ("ViewSetupHints" === componentType) {
				// TODO: Full ViewSetupHints support -
				// SpaceVisible should correspond to !hideIfc
				vp.extras.ViewSetupHints = vpComponents[componentsIdx][componentType];
			} else {
				switch (componentType) {
					case "Selection": {
						let componentIfcs;

						for (let i = 0; i < vpComponents[componentsIdx][componentType].length; i++) {
							if (vpComponents[componentsIdx][componentType][i].Component) {
								componentIfcs = vpComponents[componentsIdx][componentType][i].Component.map(component =>
									parseViewpointComponentIfc(groupDbCol.model, component, ifcToModelMap, isFederation)
								);
							}
						}

						selectionObjects = componentIfcs ?
							selectionObjects.concat(compileGroupObjects(groupDbCol.account, componentIfcs)) :
							selectionObjects;
						break;
					}
					case "Coloring": {
						for (let i = 0; i < vpComponents[componentsIdx][componentType].length; i++) {
							for (let j = 0; vpComponents[componentsIdx][componentType][i].Color && j < vpComponents[componentsIdx][componentType][i].Color.length; j++) {
								// TODO: handle colour import
								// groupData.color = vpComponents[componentsIdx][componentType][i].Color[j]["@"].Color;

								let componentIfcs;

								if (vpComponents[componentsIdx][componentType][i].Color[j].Component) {
									componentIfcs = vpComponents[componentsIdx][componentType][i].Color[j].Component.map(component =>
										parseViewpointComponentIfc(groupDbCol.model, component, ifcToModelMap, isFederation)
									);
								}

								selectionObjects = componentIfcs ?
									selectionObjects.concat(compileGroupObjects(groupDbCol.account, componentIfcs)) :
									selectionObjects;
							}
						}
						break;
					}
					case "Visibility": {
						for (let i = 0; i < vpComponents[componentsIdx][componentType].length; i++) {
							const defaultVisibility = JSON.parse(vpComponents[componentsIdx][componentType][i]["@"].DefaultVisibility);
							let componentIfcs;
							let exceptionIfcs;

							if (vpComponents[componentsIdx][componentType][i].Component) {
								componentIfcs = vpComponents[componentsIdx][componentType][i].Component.map(component =>
									parseViewpointComponentIfc(groupDbCol.model, component, ifcToModelMap, isFederation)
								);
							}
							if (vpComponents[componentsIdx][componentType][i].Exceptions?.Component) {
								exceptionIfcs = vpComponents[componentsIdx][componentType][i].Exceptions[0].Component.map(component =>
									parseViewpointComponentIfc(groupDbCol.model, component, ifcToModelMap, isFederation)
								);
							}

							const componentsToShow = defaultVisibility ? componentIfcs : exceptionIfcs;
							const componentsToHide = defaultVisibility ? exceptionIfcs : componentIfcs;

							if (componentsToShow && componentsToShow.length > 0) {
								shownObjects = selectionObjects.concat(compileGroupObjects(groupDbCol.account, componentsToShow));
							} else if (componentsToHide && componentsToHide.length > 0) {
								hiddenObjects = compileGroupObjects(groupDbCol.account, componentsToHide);
							}
						}
						break;
					}
				}
			}
		});

		if (selectionObjects && selectionObjects.length > 0) {
			const groupData = {
				issue_id: utils.stringToUUID(issueId),
				name: issueName,
				color: [255, 0, 0],
				objects: selectionObjects
			};

			groupPromises.push(
				Group.create(groupDbCol.account, groupDbCol.model, undefined, undefined, undefined, undefined, groupData).then(group => {
					return vp.highlighted_group_id = utils.stringToUUID(group._id);
				})
			);
		}

		if (shownObjects && shownObjects.length > 0) {
			const groupData = {
				issue_id: utils.stringToUUID(issueId),
				name: issueName,
				color: [255, 0, 0],
				objects: shownObjects
			};

			groupPromises.push(
				Group.create(groupDbCol.account, groupDbCol.model, undefined, undefined, undefined, undefined, groupData).then(group => {
					return vp.shown_group_id = utils.stringToUUID(group._id);
				})
			);
		}

		if (hiddenObjects && hiddenObjects.length > 0) {
			const groupData = {
				issue_id: utils.stringToUUID(issueId),
				name: issueName,
				color: [255, 0, 0],
				objects: hiddenObjects
			};

			groupPromises.push(
				Group.create(groupDbCol.account, groupDbCol.model, undefined, undefined, undefined, undefined, groupData).then(group => {
					return vp.hidden_group_id = utils.stringToUUID(group._id);
				})
			);
		}
	}

	await Promise.all(groupPromises);

	return vp;
}

function parseViewpointCamera(camera, scale) {
	const up = [
		parseFloat(_.get(camera, "CameraUpVector[0].X[0]._")),
		parseFloat(_.get(camera, "CameraUpVector[0].Z[0]._")),
		-parseFloat(_.get(camera, "CameraUpVector[0].Y[0]._"))
	];
	const view_dir = [
		parseFloat(_.get(camera, "CameraDirection[0].X[0]._")),
		parseFloat(_.get(camera, "CameraDirection[0].Z[0]._")),
		-parseFloat(_.get(camera, "CameraDirection[0].Y[0]._"))
	];
	const position = [
		parseFloat(_.get(camera, "CameraViewPoint[0].X[0]._")) * scale,
		parseFloat(_.get(camera, "CameraViewPoint[0].Z[0]._")) * scale,
		-parseFloat(_.get(camera, "CameraViewPoint[0].Y[0]._")) * scale
	];

	return {up, view_dir, position};
}

function parseViewpointExtras(vpXML, viewpoint, snapshot) {
	const extras = {};

	_.get(vpXML, "VisualizationInfo.Spaces") && (extras.Spaces = _.get(vpXML, "VisualizationInfo.Spaces"));
	_.get(vpXML, "VisualizationInfo.SpaceBoundaries") && (extras.SpaceBoundaries = _.get(vpXML, "VisualizationInfo.SpaceBoundaries"));
	_.get(vpXML, "VisualizationInfo.Openings") && (extras.Openings = _.get(vpXML, "VisualizationInfo.Openings"));
	_.get(vpXML, "VisualizationInfo.OrthogonalCamera")	&& (extras.OrthogonalCamera = _.get(vpXML, "VisualizationInfo.OrthogonalCamera"));
	_.get(vpXML, "VisualizationInfo.Lines") && (extras.Lines = _.get(vpXML, "VisualizationInfo.Lines"));
	_.get(vpXML, "VisualizationInfo.Bitmap") && (extras.Bitmap = _.get(vpXML, "VisualizationInfo.Bitmap"));
	extras.Index = viewpoint;
	extras.Snapshot = snapshot;
	!_.get(vpXML, "VisualizationInfo.PerspectiveCamera[0]") && (extras._noPerspective = true);

	return extras;
}

const processZipFileEntry = async(entry, files) => {
	// read each item zip file, put them in files object
	let paths;

	if (entry.fileName.indexOf("\\") !== -1) {
		// give tolerance to file path using \ instead of /
		paths = entry.fileName.split("\\");
	} else {
		paths = entry.fileName.split("/");
	}

	const guid = paths[0] && utils.isUUID(paths[0]) && paths[0];

	if (guid && !files[guid]) {
		files[guid] = {};
	}

	// if entry is a file and start with guid
	if (!entry.fileName.endsWith("/") && !entry.fileName.endsWith("\\") && guid && entry.uncompressedSize > 0) {
		const rs = await entry.openReadStream();
		return new Promise((resolve, reject) => {

			const bufs = [];

			rs.on("data", d => bufs.push(d));

			rs.on("end", () => {
				const buf = Buffer.concat(bufs);
				files[guid][paths.join("/")] = buf;
				resolve();
			});

			rs.on("error", error =>{
				reject(error);
			});

		});
	}
	return Promise.resolve();

};

async function readBCF(account, model, requester, ifcToModelMap, dataBuffer, settings) {

	const promises = [];
	const files = {};
	const zipFile = await yauzl.fromBuffer(dataBuffer, {lazyEntries: true});

	let entry = await zipFile.readEntry();
	while (entry) {
		promises.push(processZipFileEntry(entry, files));
		entry = await zipFile.readEntry();
	}

	await Promise.all(promises);

	let scale = 1;
	const unit = _.get(settings, "properties.unit");
	if (unit === "dm") {
		scale = 10;
	} else if (unit === "cm") {
		scale = 100;
	} else if (unit === "mm") {
		scale = 1000;
	} else if (unit === "ft") {
		scale = 3.28084;
	}

	const parsePromises = [];

	const fileGuids = Object.keys(files);
	for (let i = 0; i < fileGuids.length; i++) {
		const guid = fileGuids[i];
		try {
			// FIXME - separate?
			const {issue, viewpointsData} = await parseMarkupBuffer(files[guid][`${guid}/markup.bcf`]);
			issue._id = utils.stringToUUID(guid);

			// TODO: instead of doing a foreach with await inside (forcing serialisation on the processing), we should
			//       it should really be a foreach with a promise.push(...). and assign issue.viewpoints to promise.all()
			//       to ensure the order of the viewpoints, instead of pushing it within the loop.
			const viewpoints = await parseViewpoints(utils.uuidToString(issue._id), files[guid], viewpointsData);
			const vpGuids = Object.keys(viewpoints);

			for (let vpGuidIdx = 0; vpGuidIdx < vpGuids.length; vpGuidIdx++) {
				const vpGuid = vpGuids[vpGuidIdx];
				if (!viewpoints[vpGuid].viewpointXml) {
					systemLogger.logInfo("Cannot find viewpoint xml for ", vpGuid);
					continue;
				}

				const vpXML = viewpoints[vpGuid].viewpointXml;

				let vp = {
					guid: utils.stringToUUID(vpGuid)
				};

				const extras = parseViewpointExtras(vpXML, viewpoints[vpGuid].Viewpoint, viewpoints[vpGuid].Snapshot);
				if (Object.keys(extras)) {
					vp.extras = extras;
				}

				if (viewpoints[vpGuid].snapshot) {
					vp.screenshot = viewpoints[vpGuid].snapshot;
					// TODO do not import View
					await Viewpoint.setExternalScreenshotRef(vp, account, model, "issues");
				}

				if (_.get(vpXML, "VisualizationInfo.ClippingPlanes")) {
					vp.clippingPlanes = parseViewpointClippingPlanes(_.get(vpXML, "VisualizationInfo.ClippingPlanes"), scale);
				}

				if (_.get(vpXML, "VisualizationInfo.PerspectiveCamera[0]")) {
					vp = {...vp, ...parseViewpointCamera(_.get(vpXML, "VisualizationInfo.PerspectiveCamera[0]"), scale)};
					vp.fov = parseFloat(_.get(vpXML, "VisualizationInfo.PerspectiveCamera[0].FieldOfView[0]._")) * Math.PI / 180;
					vp.type = "perspective";

				}

				if (_.get(vpXML, "VisualizationInfo.OrthogonalCamera[0]")) {
					vp = {...vp, ...parseViewpointCamera(_.get(vpXML, "VisualizationInfo.OrthogonalCamera[0]"), scale)};
					vp.orthographicSize = parseFloat(_.get(vpXML, "VisualizationInfo.OrthogonalCamera[0].ViewToWorldScale[0]._"));
					vp.type = "orthographic";
				}

				if (_.get(vpXML, "VisualizationInfo.Components")) {
					const groupDbCol = {
						account: account,
						model: model
					};

					const vpComponents = await parseViewpointComponents(groupDbCol, _.get(vpXML, "VisualizationInfo.Components"), settings.federate, issue.name, issue._id, ifcToModelMap);
					vp = {...vp, ...vpComponents};
				}
				issue.viewpoints.push(vp);
			}

			if (viewpoints[vpGuids[0]]?.snapshot) {
				// take the first screenshot as thumbnail
				await utils.resizeAndCropScreenshot(viewpoints[vpGuids[0]].snapshot, 120, 120, true).then((image) => {
					if (image) {
						issue.thumbnail = {
							flag: 1,
							content: image
						};
					}
				}).catch(resizeErr => {
					systemLogger.logError("Resize failed as screenshot is not a valid png, no thumbnail will be generated", {
						account,
						model,
						issueId: utils.uuidToString(issue._id),
						viewpointId: vpGuids[0],
						err: resizeErr
					});
				});
			}

			// System notification of BCF import
			const currentTS = Date.now();
			const bcfImportNotification = {
				guid: utils.generateUUID(),
				created: currentTS,
				action: {property: "bcf_import"},
				owner: requester.user
			};

			issue.comments.push(bcfImportNotification);

			parsePromises.push(issue);
		} catch {
			// throw error if issue cannot be processed
			throw responseCodes.INVALID_ARGUMENTS;
			// alternatively, it could also silently fail
			// and process remainder, maybe only erroring
			// if all fail
		}
	}

	return await Promise.all(parsePromises);
}

bcf.importBCF = function(requester, account, model, dataBuffer, settings) {
	const ifcToModelMapPromises = [];
	const ifcToModelMap = [];

	if (settings.federate) {
		for (let i = 0; settings.subModels && i < settings.subModels.length; i++) {
			const {_id: subModelId} = settings.subModels[i];
			ifcToModelMapPromises.push(
				Meta.getIfcGuids(account, subModelId).then(ifcGuidResults => {
					for (let j = 0; j < ifcGuidResults.length; j++) {
						ifcToModelMap[ifcGuidResults[j].metadata["IFC GUID"]] = subModelId;
					}
				})
			);
		}
	}

	return Promise.all(ifcToModelMapPromises).then(() => {
		return readBCF(account, model, requester, ifcToModelMap, dataBuffer, settings);
	});
};

module.exports = bcf;
