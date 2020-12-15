/**
*	Copyright (C) 2020 3D Repo Ltd
*
*	This program is free software: you can redistribute it and/or modify
*	it under the terms of the GNU Affero General Public License as
*	published by the Free Software Foundation, either version 3 of the
*	License, or (at your option) any later version.
*
*	This program is distributed in the hope that it will be useful,
*	but WITHOUT ANY WARRANTY; without even the implied warranty of
*	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*	GNU Affero General Public License for more details.
*
*	You should have received a copy of the GNU Affero General Public License
*	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

"use strict";
// const { Long } = require("mongodb");
const Utils = require("./utils");
const Elastic = require("./elastic");

const getNumUsers = async (col, user) => {
	const nUsers = await col.find({"roles.db": user.user}).count();
	user.numUsers = nUsers;
	return user;
};

const isUnlimited = async (value) => {
	return (value === "unlimited" ? true : false);
};

const writeQuotaDetails = async (dbConn, col, elasticClient, enterprise) => {
	const type = enterprise ? "enterprise" : "discretionary";
	const now = Date.now();

	const query = enterprise ?
		{"customData.billing.subscriptions.enterprise": {"$exists" : true}} :
		{"customData.billing.subscriptions.discretionary": {"$exists" : true}};

	const sort = enterprise ?
		{"customData.billing.subscriptions.enterprise.expiryDate" : -1} :
		{"customData.billing.subscriptions.discretionary.expiryDate" : -1};

	const ts = await col.find(query, {"customData.billing.subscriptions" : 1, "user" : 1})
		.sort(sort).toArray();

	const licensedTS = [];
	const promises = [];
	ts.forEach((user) => {
		promises.push(getNumUsers(col, user));
	});

	const res = await Promise.all(promises);

	const recordPromise = [];

	res.forEach(async (user) => {
		const sub = enterprise ? user.customData.billing.subscriptions.enterprise :  user.customData.billing.subscriptions.discretionary;
		const expired = sub.expiryDate && sub.expiryDate < now;
		const dateString = sub.expiryDate ? Utils.formatDate(sub.expiryDate) : Date.MinValue;
		const maxUsers = isUnlimited(sub.collaborators) ? -1 : sub.collaborators ;
		const elasticBody =  {
			"Teamspace" : String(user.user),
			"Type" : String(type),
			"User Count" : Number(user.numUsers),
			"Max Users" : Number(maxUsers),
			"Max Data(GB)" : Number(sub.data / 1024),
			"Expiry Date" : dateString,
			"Expired" : Boolean (expired)
		};
		recordPromise.push (
			Elastic.createElasticRecord(elasticClient, Utils.teamspaceIndexPrefix + "-quota", elasticBody).then (()=> {
				!expired && licensedTS.push({teamspace: user.user, type});
			})
		);
	});
	await Promise.all(recordPromise);
	return licensedTS;
};

const reportTeamspaceQuota = async (dbConn, elasticClient) => {
	const col = await dbConn.db("admin").collection("system.users");
	console.log ("[QUOTA] Writing Licenced Teamspaces Quota information");
	const enterpriseTS = await writeQuotaDetails(dbConn, col, elasticClient, true);
	const discretionaryTS = await writeQuotaDetails(dbConn, col, elasticClient, false);
	return [...enterpriseTS, ...discretionaryTS];
};

const TS = {};

TS.createTeamspaceReport = async (dbConn, elasticClient) =>{
	await reportTeamspaceQuota(dbConn, elasticClient)
	console.log("[DB] Generated Teamspace Report");
};

module.exports = TS;