/**
 *	Copyright (C) 2014 3D Repo Ltd
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

class ModelController implements ng.IController {

	public static $inject: string[] = [
		"$window",
		"$timeout",
		"$scope",
		"$element",
		"$location",
		"$compile",
		"$mdDialog",

		"EventService",
		"TreeService",
		"RevisionsService",
		"AuthService",
		"IssuesService",
		"MultiSelectService",
		"StateManager",
		"PanelService",
		"ViewerService",
	];

	private issuesCardIndex;
	private pointerEvents;
	private account;
	private model;
	private modelUI;
	private event;
	private branch;
	private revision;
	private settings;
	private issueId;
	private keysDown;
	private treeMap;
	private selectedObjects;
	private initialSelectedObjects;

	constructor(
		private $window,
		private $timeout,
		private $scope,
		private $element,
		private $location,
		private $compile,
		private $mdDialog,

		private EventService,
		private TreeService,
		private RevisionsService,
		private AuthService,
		private IssuesService,
		private MultiSelectService,
		private StateManager,
		private PanelService,
		private ViewerService,
	) {}

	public $onInit() {

		this.issuesCardIndex = 0;
		this.pointerEvents = "inherit";

		history.pushState(null, null, document.URL);
		const popStateHandler = (event) => {
			this.StateManager.popStateHandler(event, this.account, this.model);
		};

		const refreshHandler = (event) => {
			return this.StateManager.refreshHandler(event);
		};

		// listen for user clicking the back button
		window.addEventListener("popstate", popStateHandler);
		window.addEventListener("beforeunload", refreshHandler);

		this.$scope.$on("$destroy", () => {
			window.removeEventListener("beforeunload", refreshHandler);
			window.removeEventListener("popstate", popStateHandler);
		});

		this.$timeout(() => {
			// Get the model element
			this.modelUI = angular.element(
				this.$element[0].querySelector("#modelUI"),
			);
		});

		this.watchers();
	}

	public watchers() {

		this.$scope.$watchGroup(["vm.account", "vm.model"], () => {
			if (this.account && this.model) {
				angular.element(() => {
					this.setupModelInfo();
				});
			}
		});

		this.$scope.$watch("vm.keysDown", () => {
			this.MultiSelectService.handleKeysDown(this.keysDown);
		});

		this.$scope.$watch("vm.issueId", () => {
			if (this.issueId) {
				// timeout to make sure event is sent after issue panel card is setup
				this.$timeout(() => {
					this.IssuesService.state.displayIssue = this.issueId;
				});
			}
		});

		this.$scope.$watch(this.EventService.currentEvent, (event) => {

			this.event = event;

			if (event.type === this.EventService.EVENT.TOGGLE_ISSUE_AREA_DRAWING) {
				this.pointerEvents = event.value.on ? "none" : "inherit";
			}

		});

	}

	public handleModelError() {

		const message = "The model was either not found, failed to load correctly " +
		"or you are not authorized to view it. " +
		" You will now be redirected to the teamspace page.";

		this.$mdDialog.show(
			this.$mdDialog.alert()
				.clickOutsideToClose(true)
				.title("Model Error")
				.textContent(message)
				.ariaLabel("Model Error")
				.ok("OK"),
		);

		this.$location.path(this.AuthService.getUsername());

	}

	public setupModelInfo() {

		this.IssuesService.init();
		this.RevisionsService.listAll(this.account, this.model);

		if (!this.ViewerService.currentModel.model) {
			console.debug("Initiating Viewer");
			if (this.ViewerService.viewer) {
				this.ViewerService.initViewer()
					.then(() => {
						this.ViewerService.loadViewerModel(
							this.account,
							this.model,
							this.branch,
							this.revision,
						);
					});
			}
		} else {
			// Load the model
			this.ViewerService.loadViewerModel(
				this.account,
				this.model,
				this.branch,
				this.revision,
			);
		}

		this.ViewerService.getModelInfo(this.account, this.model)
			.then((response) => {
				const data = response.data;
				this.settings = data;

				const isFederation = data.federate;
				if (isFederation) {
					this.PanelService.hideSubModels(this.issuesCardIndex, false);
				} else {
					this.PanelService.hideSubModels(this.issuesCardIndex, true);
				}

				this.EventService.send(
					this.EventService.EVENT.MODEL_SETTINGS_READY,
					data,
				);

				this.TreeService.init(this.account, this.model, this.branch, this.revision, data)
					.then((tree) => {
						this.EventService.send(this.EventService.EVENT.TREE_READY, tree);
						// FIXME: I don't know if treeMap is still used. Doc component now uses Tree Service directly.
						this.treeMap = this.TreeService.getMap(tree.nodes);
					});
			})
			.catch((error) => {
				console.error(error);
				// If we are not logged in the
				// session expired popup takes prescedence
				if (error.data.message !== "You are not logged in") {
					this.handleModelError();
				}
			});

	}

	public setSelectedObjects(selectedObjects) {
		this.selectedObjects = selectedObjects;
	}

	public setInitialSelectedObjects(data) {
		this.initialSelectedObjects = data.selectedObjects;
		// Set the value to null so that it will be registered again
		this.$timeout(() => {
			this.initialSelectedObjects = null;
		});
	}

}

export const ModelComponent: ng.IComponentOptions = {
	bindings: {
		account:  "=",
		branch:   "=",
		issueId: "=",
		keysDown: "<",
		model:  "=",
		revision: "=",
		state:    "=",
		isLiteMode: "=",
	},
	controller: ModelController,
	controllerAs: "vm",
	templateUrl: "templates/model.html",
};

export const ModelComponentModule = angular
	.module("3drepo")
	.component("model", ModelComponent);
