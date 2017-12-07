/**
 *  Copyright (C) 2015 3D Repo Ltd
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

export class DocsService {

	public static $inject: string[] = [
		"$q",

		"ClientConfigService",
		"APIService",
		"TreeService",
	];

	private state: any;
	private docTypeHeight: number;

	constructor(
		private $q: any,

		private ClientConfigService: any,
		private APIService: any,
		private TreeService: any,
	) {
		this.docTypeHeight = 50;
		this.state = {
			disabled: false,
			active: false,
			show: false,
			updated: false,
			docs: false,
			allDocTypesHeight: 0,
		};
	}

	public getDocs(account, model, metadataId) {
		const url = account + "/" + model + "/meta/" + metadataId + ".json";
		return this.APIService.get(url)
			.then((json) => {
				return this.handleDocs(account, model, metadataId, json);
			});
	}

	public updateDocs(account, model, id) {
		this.getDocs(account, model, id)
			.then((data) => {

				console.log("DOCS - ", data)

				if (!data) {
					return;
				}

				this.state.docs = data;
				this.state.allDocTypesHeight = 0;

				// Open all doc types initially
				for (const docType in this.state.docs) {
					if (this.state.docs.hasOwnProperty(docType)) {
						this.state.docs[docType].show = true;
						this.state.allDocTypesHeight += this.docTypeHeight;
					}
				}

				this.state.show = true;
				this.state.updated = true;

			})
			.catch((error) => {
				console.error("Error getting metadata: ", error);
			});
	}

	public handleObjectSelected(event) {

		// Get any documents associated with an object
		const object = event.value;

		this.TreeService.getMap()
			.then((treeMap) => {
				const metadataIds = treeMap.oIdToMetaId[object.id];
				if (metadataIds && metadataIds.length) {

					this.updateDocs(
						object.account,
						object.model,
						metadataIds[0],
					);

				} else {
					this.state.show = false;
				}
		});

	}

	public handleDocs(account, model, metadataId, json) {

		const docsData = {};

		let dataType;
		// Set up the url for each PDF doc
		for (let i = 0; i < json.data.meta.length; i ++) {

			const meta = json.data.meta[i];

			// Get data type
			dataType = meta.hasOwnProperty("mime") ?
				meta.mime :
				"Meta Data";

			if (dataType === "application/pdf") {
				dataType = "PDF";
			}

			// Add data to type group
			if (!docsData.hasOwnProperty(dataType)) {
				docsData[dataType] = {data: []};
			}
			docsData[dataType].data.push(meta);

			// Setup PDF url
			const endpoint = account + "/" + model + "/" + meta._id + ".pdf";
			meta.url = this.ClientConfigService.apiUrl(
				this.ClientConfigService.GET_API,
				endpoint,
			);
		}

		return docsData;

	}

}

export const DocsServiceModule = angular
	.module("3drepo")
	.service("DocsService", DocsService);
