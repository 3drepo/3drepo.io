/**
 *	Copyright (C) 2016 3D Repo Ltd
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

class AccountLicensesController implements ng.IController {

	public static $inject: string[] = [
		"$scope",
		"APIService",
		"StateManager",
		"DialogService",
	];

	private account;
	private promise;
	private job;
	private jobColors;
	private licenses;
	private numLicenses;
	private toShow;
	private jobs;
	private addJobMessage;
	private newJob;
	private deleteJobMessage;
	private models;
	private projects;
	private teamspacePerms;
	private newLicenseAssignee;
	private addMessage;
	private memberList;

	private licenseIndex;

	constructor(
		private $scope: any,
		private APIService: any,
		private StateManager: any,
		private DialogService: any,
	) {}

	public $onInit() {

		this.promise = null;
		this.jobs = [];

		const initPromises = [];

		const quotaInfoPromise = this.APIService.get(this.account + "/quota")
			.then((response) => {
				if (response.data.collaboratorLimit) {
					this.numLicenses = response.data.collaboratorLimit;
				} else {
					this.numLicenses = 0;
				}
			})
			.catch((error) => {
				this.handleError("retrieve", "subscriptions", error);
			});

		const memberListPromise = this.APIService.get(this.account + "/members")
			.then((response) => {
				return this.licenses = response.data.members;
			})
			.catch((error) => {
				this.handleError("retrieve", "members", error);
			});

		initPromises.push(quotaInfoPromise);
		initPromises.push(memberListPromise);

		Promise.all(initPromises).then(() => {
			this.init();
		});

		this.APIService.get(this.account + "/jobs")
			.then((response) => {
				this.jobs = response.data;
			})
			.catch((error) => {
				this.handleError("retrieve", "jobs", error);
			});

		this.jobColors = [
			"#a6cee3",
			"#1f78b4",
			"#213f99",
			"#b2df8a",
			"#33a02c",
			"#fb9a99",
			"#e31a1c",
			"#fdbf6f",
			"#ff7f00",
			"#e3bd1a",
			"#ffff99",
			"#b15928",
			"#cab2d6",
			"#6a3d9a",
		];

		this.watchers();
	}

	public watchers() {
		/*
		* Watch changes to the new license assignee name
		*/
		this.$scope.$watch("vm.newLicenseAssignee", (newValue) => {
			// this.addDisabled = !(angular.isDefined(newValue) && (newValue.toString() !== ""));
		});
	}

	public init() {
		this.toShow = (this.numLicenses > 0) ? "0+" : "0";

		this.licenses.forEach((entry) => {
			entry.showRemove = this.account !== entry.user;
		});

	}

	public updateJob(job) {

		const url = this.account + "/jobs/" + job._id;

		this.APIService.put(url, job)
			.then((response) => {
				if (response.status !== 200) {
					throw(response);
				}
			})
			.catch((error) => {
				this.handleError("update", "job", error);
			});
	}

	public assignJob(index) {
		const licence = this.licenses[index];
		const url = this.account + "/subscriptions/" + licence.id + "/assign";

		this.APIService.put(url, {job: licence.job})
			.then((response) => {
				if (response.status !== 200) {
					throw(response);
				}
			})
			.catch((error) => {
				this.handleError("assign", "job", error);
			});
	}

	public addJob() {

		const job = { _id: this.newJob };
		this.addJobMessage = null;

		this.APIService.post(this.account + "/jobs", job)
			.then((response) => {
				if (response.status !== 200) {
					throw(response);
				} else {
					this.jobs.push(job);
				}
			})
			.catch((error) => {
				this.handleError("add", "job", error);
			});
	}

	public removeJob(index) {

		this.deleteJobMessage = null;
		const url = this.account + "/jobs/" + this.jobs[index]._id;
		this.APIService.delete(url, null)
			.then((response) => {
				if (response.status !== 200) {
					throw(response);
				} else {
					this.jobs.splice(index, 1);
				}
			})
			.catch((error) => {
				this.handleError("remove", "job", error);
			});
	}

	/**
	 * Assign a license to the selected user
	 */
	public assignLicense(event: any) {
		let doSave = false;
		const enterKey = 13;

		if (angular.isDefined(event)) {
			if (event.which === enterKey) {
				doSave = true;
			}
		} else {
			doSave = true;
		}

		if (doSave) {
			this.APIService.post(
				this.account + "/members/" + this.newLicenseAssignee,
			)
				.then((response) => {
					if (response.status === 200) {
						this.addMessage = "User " + this.newLicenseAssignee + " assigned a license";
						this.licenses.push({user: response.data.user, showRemove: true});
						this.newLicenseAssignee = "";
					} else if (response.status === 400) {
						throw(response);
					}
				})
				.catch((error) => {
					this.handleError("assign", "licence", error);
				});
		}
	}

	/**
	 * Remove a license
	 * @param index
	 */
	public removeLicense(index) {
		const removeUrl = `${this.account}/members/` + this.licenses[index].user;
		this.APIService.delete(removeUrl, {})
			.then((response) => {
				if (response.status === 200) {
					this.licenseIndex = index;
					this.licenses.splice(index, 1);
				}
			})
			.catch((error) => {

				if (error.status === 400) {
					const responseCode = this.APIService.getResponseCode("USER_IN_COLLABORATOR_LIST");
					if (error.data.value === responseCode) {
						this.models = error.data.models;
						this.projects = error.data.projects;
						if (error.data.teamspace) {
							this.teamspacePerms = error.data.teamspace.permissions.join(", ");
						}

						this.DialogService.showDialog("remove-license-dialog.html", this.$scope);
					}
				} else {
					this.handleError("remove", "licence", error);
				}

			});
	}

	/**
	 * Capitalize the first letter of a string
	 */
	public capitalizeFirstLetter(str: string) {
		return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
	}

	/**
	 * Handle an error from a request
	 */
	public handleError(action: string, type: string, error: any) {

		let message = "";
		if (error.data && error.data.message) {
			message = error.data.message;
		}

		const content = "Something went wrong trying to " + action + " the " + type + ": <br><br>" +
			"<strong> " + message + "</strong>" +
			"<br><br> If this is unexpected please message support@3drepo.io.";
		const escapable = true;
		const title = "Error";
		this.DialogService.html(title, content, escapable);
		console.error("Something went wrong trying to " + action + " the " + type + ": ", error);
	}

	/**
	 * Remove license from user who is a team member of a model
	 */
	public removeLicenseConfirmed() {
		const removeLicenseUrl = this.account + "/members/"
			+ this.licenses[this.licenseIndex] + "?cascadeRemove=true";
		this.APIService.delete(removeLicenseUrl, {})
			.then((response) => {
				if (response.status === 200) {
					this.licenses.splice(this.licenseIndex, 1);
					this.DialogService.closeDialog();
				}
			})
			.catch((error) => {
				this.handleError("remove", "licence", error);
			});
	}

	/**
	 * Go back to the billing page
	 */
	public goToBillingPage() {
		this.StateManager.setQuery({page: "billing"});
	}

}

export const AccountLicensesComponent: ng.IComponentOptions = {
	bindings: {
		account: "<",
		showPage: "&",
	},
	controller: AccountLicensesController,
	controllerAs: "vm",
	templateUrl: "templates/account-licenses.html",
};

export const AccountLicensesComponentModule = angular
	.module("3drepo")
	.component("accountLicenses", AccountLicensesComponent);
