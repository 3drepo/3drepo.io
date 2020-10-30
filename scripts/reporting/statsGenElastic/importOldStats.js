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

'use strict'
const MongoClient = require('mongodb').MongoClient;
const Utils = require('./utils');
const fs = require( 'fs' );
const path = require( 'path' );
const csv = require('csv-parser');

var errors = [];

try {
	if ( Utils.clean(process.env.ELASTIC_CLOUD_AUTH === undefined ) ) { errors.push(new Error('ELASTIC_CLOUD_AUTH is not set')); } 
	if ( Utils.clean(process.env.ELASTIC_CLOUD_ID === undefined ) ) { errors.push(new Error('ELASTIC_CLOUD_ID is not set')); }
	if ( errors.length > 0 ) { throw errors }
} catch (e) {
    for (let i=0; i<e.length; i++) {
		console.log(e[i].message);
	  }
	process.exit(-1);
}

try {
	process.env.ELASTIC_CLOUD_AUTH.split(":")
} catch (error) {
	console.log("Error: Failed to split ELASTIC_CLOUD_AUTH, check format " + process.env.ELASTIC_CLOUD_AUTH)
	process.exit(-1);
}

process.on("unhandledRejection", (error) => {
	console.error(error); // This prints error with stack included (as for normal errors)
	throw error; // Following best practices re-throw error and let the process exit with error code
  })

const { Client } = require('@elastic/elasticsearch')
const ELASTIC_CLOUD_AUTH = process.env.ELASTIC_CLOUD_AUTH.split(":")
const ElasticClient = new Client({
	cloud: {
	  id: process.env.ELASTIC_CLOUD_ID
	},
	auth: {
	  username: ELASTIC_CLOUD_AUTH[0],
	  password: ELASTIC_CLOUD_AUTH[1]
	},
	reload_connections: true,
	maxRetries: 5,
	request_timeout: 60
  });
  
ElasticClient.cluster.health({},function(err,resp,status) {  
	console.log("[ELASTIC] -- Client Health --",resp);
});

if(process.argv.length < 5) {
	console.error('Not enough arguments: \n\tUsage: node importOldStats.js <mongo host:port> <username> <password> <import-csv-folder>');
	process.exit(-1);
}

try {
	if ( Utils.clean(process.argv[5] === undefined ) ) { errors.push(new Error('import-csv-folder is not set')); } 
	if ( errors.length > 0 ) { throw errors }
} catch (e) {
    for (let i=0; i<e.length; i++) {
		console.log(e[i].message);
	  }
	process.exit(-1);
}

const url = `mongodb://${process.argv[3]}:${process.argv[4]}@${process.argv[2]}/admin`;
const client = new MongoClient(url, { useUnifiedTopology: true });
const importFolder = process.argv[5]
let opt  = {delimiter: ',', quote: '\'', escape: '\'', relax: true, skip_empty_lines: true};

start();

async function start() {
	console.log(`Trying to connect to ${url}...`);
	try {
		const db = await client.connect();
		console.log('Connected successfully!');

		(async ()=>{
			try {
				// Get the files as an array
				const files = await fs.promises.readdir( importFolder );
				const seen = [] // array to catch previously seen id's

				for( const file of files ) {
					const fullPath = path.join( importFolder, file );
					const stat = await fs.promises.stat( fullPath );
					
					if( stat.isFile() && file.includes(".csv") && !file.includes("com.dropbox.attrs")  ){
						console.log( "'%s' is a csv file.", fullPath );

						fs.createReadStream(fullPath)
						.pipe(csv({
								headers: ["Teamspace","LastLogin"]
								}
							))
						.on('data', (data) => {
							if ( !Utils.isUndefined(data.Teamspace) && !Utils.isUndefined( Utils.clean(data.LastLogin) ) ) {

								const lastLogin = {
									"Teamspace" : String(data.Teamspace),
									"Last Login" : String(data.LastLogin),
									"DateTime" : Utils.formatDate(new Date(data.LastLogin))
								}

								const id = Utils.hashCode( Object.values(lastLogin).toString() )

								if (!seen.includes(id) ) {
									const request = ElasticClient.search({
										index: Utils.teamspaceIndexPrefix + "-login",
										body: {
											query: {
												match: { id: id }
											}
										}
									}, {
										ignore: [404],
										maxRetries: 3
									})
									request
									.then(result => {
										if (result.body.hits.total.value === 0) {
												console.log("creating",seen.length,":::",id)
												Utils.createElasticRecord( ElasticClient, Utils.teamspaceIndexPrefix + "-login", lastLogin, id)
												seen.push(id) // log hash is created to save calls
											} else {
												console.log("created",result.body.hits.total.value,":::",id)
												seen.push(id) // log hash is created to save calls
											} 
										}
									)
									.catch(err => console.log(err)) // RequestAbortedError
								}
								}
							}
						)
						.on('end', () => {
						  console.log("end");
						});
					}
					else if( stat.isDirectory() )
						console.log( "'%s' is a directory.", fromPath );
				} // End for...of
			}
			catch( e ) {
				// Catch anything bad that happens
				console.error( "We've thrown! Whoops!", e );
			}

		})(); // Wrap in parenthesis and call now

		await client.close();
	} catch (err) {
		console.error('Connecting failed', err);
	}
}
