/**
*	Copyright (C) 2019 3D Repo Ltd
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

'use strict'
const dateFormat = require('dateformat');
const fs = require('fs');
const concat = require('concat-files');
const Utils = {};
const CryptoJS = require("crypto-js");

Utils.hashCode = function(s){
	return CryptoJS.MD5(s).toString();              
  }

Utils.concat = (files, dest) => {
	return new Promise((resolve, error) => {
		concat(files, dest, (err) => {
			if(err) error(err);
			else resolve();
		});
	});
}

Utils.formatDate = (date) => {
	return date.toISOString()
	// return dateFormat(date, 'dd-mm-yy'); // old format
}

Utils.generateFileName = (prefix) => {
	const date = Utils.formatDate(new Date());
	return `${prefix}_${date}.csv`;
}

Utils.mkdir = (dir) => {
	return new Promise((resolve, error) => {
		fs.mkdir(dir, {recursive: true}, (err) => {
			if(err) error(err);
			else resolve();
		});
	});
}

Utils.skipUser = (username) => {
	return username === 'adminUser' || username === 'nodeUser' || username === 'undefined';
}

Utils.teamspaceIndexPrefix = 'io-teamspace'
Utils.statsIndexPrefix = 'io-stats'

Utils.isUndefined = (value) => {
    // Obtain `undefined` value that's
    // guaranteed to not have been re-assigned
    var undefined = void(0);
    return value === undefined;
}

Utils.clean = (value) => {
	const FALSY_VALUES = ['', 'null', 'false', 'undefined'];
	if (!value || FALSY_VALUES.includes(value)) {
	  return undefined;
	}
	return value;
  }

Utils.createElasticRecord = async ( ElasticClient, Index, elasticBody, id = Utils.hashCode( Object.values(elasticBody).toString() ) ) => {
	try {
		const indexName = Index.toLowerCase() // requirement of elastic that indexs be lowercase
		const configured = await ElasticClient.indices.exists({
			index: indexName
		})
		if (!configured.body) {
				await ElasticClient.indices.create({
						index: indexName
					})
				console.log("[ELASTIC] Created index " + indexName )
		}
		await ElasticClient.index(
			{  
				index: indexName,
				id: id,
				refresh: true,
				body: elasticBody
			})
		console.log("[ELASTIC] created doc " + indexName + " " + Object.values(elasticBody).toString() );
		return Promise.resolve()
	} catch (error) {
			console.log("[ELASTIC] ERROR:" + Index)
			console.log(elasticBody)
			console.log(error)
			console.log(error.body.error)
			Promise.reject()
		}
	}
module.exports = Utils;
