/**
 *	Copyright (C) 2015 3D Repo Ltd
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

class DocsController implements ng.IController {

	public static $inject: string[] = [
		"$scope",
		"$mdDialog",
		"$timeout",
		"$filter",

		"EventService",
		"DocsService",
	];

	private onContentHeightRequest;
	private showDocsGetProgress;
	private docs;
	private allDocTypesHeight;
	private state: any;
	private show;

	constructor(
		private $scope: ng.IScope,
		private $mdDialog: any,
		private $timeout: ng.ITimeoutService,
		private $filter: any,

		private EventService: any,
		private DocsService: any,
	) {}

	public $onInit() {
		this.DocsService.docTypeHeight = 50;
		this.showDocsGetProgress = false;
		this.onContentHeightRequest({height: 80});
		this.state = this.DocsService.state;
		this.watchers();
	}

	public $onDestroy() {
		this.DocsService.state.active = false;
		this.DocsService.state.show = false;
	}

	public watchers() {
		this.$scope.$watch(() => {
			return this.DocsService.state;
		}, () => {

			if (this.DocsService.state.updated === true) {
				this.docs = this.DocsService.state.docs;
				this.allDocTypesHeight = this.DocsService.state.allDocTypesHeight;
				this.DocsService.state.updated = false;
				this.setContentHeight();
			}

			if (this.show !== this.DocsService.state.show) {
				this.show = this.DocsService.state.show;
			}

		}, true);
	}

	public toggleItem(docType: string) {
		this.docs[docType].show = !this.docs[docType].show;
		this.setContentHeight();
	}

	public setContentHeight() {
		let contentHeight = 0;
		let itemsHeight;
		const metaDataItemHeight = 50; // It could be higher for items with long text but ignore that

		for (const key in this.docs) {
			if (key) {
				const value = this.docs[key];
				contentHeight += this.DocsService.docTypeHeight;
				if (value.show) {
					if (key === "Meta Data") {
						const len = Object.keys(value.data[0].metadata).length;
						itemsHeight = len * metaDataItemHeight;
					}
					contentHeight += itemsHeight;
				}
			}
		}

		this.onContentHeightRequest({height: contentHeight});
	}

}

export const DocsComponent: ng.IComponentOptions = {
	bindings: {
		onContentHeightRequest: "&",
		show: "=",
	},
	controller: DocsController,
	controllerAs: "vm",
	templateUrl: "templates/docs.html",
};

export const DocsComponentModule = angular
	.module("3drepo")
	.component("docs", DocsComponent);
