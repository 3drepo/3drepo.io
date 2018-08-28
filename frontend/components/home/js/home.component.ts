/**
 *  Copyright (C) 2014 3D Repo Ltd
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

class HomeController implements ng.IController {

	public static $inject: string[] = [
		"$scope",
		"$http",
		"$templateCache",
		"$element",
		"$interval",
		"$timeout",
		"$compile",
		"$mdDialog",
		"$window",
		"$location",
		"$document",

		"AuthService",
		"StateManager",
		"EventService",
		"APIService",
		"ClientConfigService",
		"SWService",
		"AnalyticService",
		"ViewerService",
		"TemplateService",
		"DialogService"
	];

	private doNotLogout;
	private legalPages;
	private loggedOutPages;
	private loggedIn;
	private loginPage;
	private isLoggedOutPage;
	private functions;
	private pointerEvents;
	private goToAccount;
	private goToUserPage;
	private firstState;
	private state;
	private query;
	private isMobileDevice;
	private legalDisplays;
	private isLegalPage;
	private page;
	private loginMessage;
	private backgroundImage;
	private topLogo;
	private showMemorySelected;
	private isLiteMode;
	private deviceMemory;

	constructor(
		private $scope,
		private $http,
		private $templateCache,
		private $element,
		private $interval,
		private $timeout,
		private $compile,
		private $mdDialog,
		private $window,
		private $location,
		private $document,

		private AuthService,
		private StateManager,
		private EventService,
		private APIService,
		private ClientConfigService,
		private SWService,
		private AnalyticService,
		private ViewerService,
		private TemplateService,
		private DialogService
	) {}

	public $onInit() {

		this.handlePaths();

		this.setLoginPage();

		this.AnalyticService.init();
		this.SWService.init();

		this.precacheTeamspaceTemplate();

		// Pages to not attempt a interval triggered logout from

		this.doNotLogout = this.AuthService.doNotLogout;
		this.legalPages = this.AuthService.legalPages;
		this.loggedOutPages = this.AuthService.loggedOutPages;

		this.loggedIn = false;
		this.loginPage = true;
		this.isLoggedOutPage = false;

		this.functions = this.StateManager.functions;
		this.pointerEvents = "inherit";
		this.goToAccount = false;
		this.goToUserPage = false;

		this.firstState = true;

		// Required for everything to work
		this.state = this.StateManager.state;
		this.query = this.StateManager.query;

		this.legalDisplays = [];
		if (angular.isDefined(this.ClientConfigService.legal)) {
			this.legalDisplays = this.ClientConfigService.legal;
		}
		this.legalDisplays.push({title: "Pricing", page: "http://3drepo.org/pricing"});
		this.legalDisplays.push({title: "Contact", page: "http://3drepo.org/contact/"});

		this.isLiteMode = this.getLiteModeState();
		this.handlePotentialMobile();
		this.showMemorySelected = false;

		this.watchers();

		/**
		 * Close the dialog
		 */
		this.$scope.closeDialog = function() {
			this.$mdDialog.cancel();
		};

	}

	public watchers() {

		this.$scope.$watch(
			() => {
				return this.$location.path();
			}, () => {
				this.handlePaths();
			}
		);

		// TODO: This feels like a bit of a hack. Let's come up with
		// a better way!
		this.$scope.$watch(() => this.AuthService.state.currentData, (currentData) => {
			this.handleLoginStatus(currentData);
		}, true);

		this.$scope.$watch(this.EventService.currentEvent, (event) => {
			if (event && event.type === this.EventService.EVENT.TOGGLE_ISSUE_AREA_DRAWING) {
				this.pointerEvents = event.value.on ? "none" : "inherit";
			}
		});

		/*
		* Watch the state to handle moving to and from the login page
		*/
		this.$scope.$watch("vm.state", (oldState, newState) => {

			const change = JSON.stringify(oldState) !== JSON.stringify(newState);

			this.loggedIn = this.AuthService.isLoggedIn();

			if ( (newState && change) || (newState && this.firstState)) {

				// If it's a legal page
				const legal = this.pageCheck(newState, this.legalPages);
				const loggedOutPage = this.pageCheck(newState, this.loggedOutPages);

				if (legal) {

					this.isLegalPage = true;
					this.isLoggedOutPage = false;

					this.legalPages.forEach((page) => {
						this.setPage(newState, page);
					});

				} else if (loggedOutPage && !newState.loggedIn) {

					// If its a logged out page which isnt login

					this.isLegalPage = false;
					this.isLoggedOutPage = true;
					this.loggedOutPages.forEach((page) => {
						this.setPage(newState, page);
					});

				} else if (
					this.AuthService.getUsername() &&
					newState.account !== this.AuthService.getUsername() &&
					!newState.model
				) {
					// If it's some other random page that doesn't match
					// anything sensible like legal, logged out pages, or account
					this.isLoggedOutPage = false;
					this.page = "";
					this.$location.search({}); // Reset query parameters
					this.$location.path("/" + this.AuthService.getUsername());
				} else if (
					!this.AuthService.getUsername() &&
					!legal &&
					!loggedOutPage
				) {

					// Login page or none existant page

					this.isLoggedOutPage = false;
					this.page = "";
				}

			}
		}, true);

	}

	public handleLoginStatus(currentData) {
		const event = this.AuthService.state.currentEvent;

		if (!angular.isDefined(event)) {
			return;
		}

		switch (event) {
		case this.AuthService.events.USER_LOGGED_IN:

			if (!currentData.error) {
				if (!currentData.initialiser) {

					this.StateManager.updateState(true);

					if (!this.StateManager.state.account) {
						const username = this.AuthService.getUsername();
						if (!username) {
							console.error("Username is not defined for statemanager!");
						}
						this.StateManager.setHomeState({
							account: username
						});
					}

				} else if (!currentData.username) {

					this.StateManager.setHomeState({
						loggedIn: false,
						account: null
					});

					if (this.StateManager.query) {
						this.$location.search("username", this.StateManager.query.username);
						this.$location.search("token", this.StateManager.query.token);
					}

				}

				if (currentData.flags && currentData.flags.termsPrompt) {
					this.DialogService.showDialog(
						"new-terms-dialog.html",
						this.$scope,
						null,
						false,
						null,
						false
					);
				}
			} else {
				this.AuthService.logout();
			}

			break;

		case this.AuthService.events.USER_LOGGED_OUT:
			// TODO: Use state manager
			// Only fire the Logout Event if we're on the home page
			const currentPage = this.$location.path();

			if (this.doNotLogout.indexOf(currentPage) === -1) {
				this.StateManager.setHomeState({
					loggedIn: false,
					account: null
				});
			}
			break;
		}
	}

	public getLiteModeState() {

		const stored = localStorage.getItem("liteMode");
		if (stored !== undefined && stored !== null) {
			if (stored === "false") {
				return false;
			} else if (stored === "true") {
				return true;
			}
		}

		return false; // Default

	}

	public getSubdomain() {
		const host = this.$location.host();
		if (host.indexOf(".") < 0) {
			return "";
		}
		return host.split(".")[0];
	}

	public setLoginPage() {

		if (this.ClientConfigService.customLogins !== undefined) {

			const sub = this.getSubdomain();
			const custom = this.ClientConfigService.customLogins[sub];

			if (sub && custom) {
				if (
					custom.loginMessage
				) {
					this.loginMessage = custom.loginMessage;
				}
				if (
					custom.backgroundImage &&
					typeof custom.backgroundImage === "string"
				) {
					this.backgroundImage = custom.backgroundImage;
				}
				if (
					custom.topLogo &&
					typeof custom.topLogo === "string"
				) {
					this.topLogo = custom.topLogo;
				}
				if (
					custom.css
				) {
					const link = document.createElement("link");
					link.setAttribute("rel", "stylesheet");
					link.setAttribute("type", "text/css");
					link.setAttribute("href", custom.css);
					document.getElementsByTagName("head")[0].appendChild(link);
				}
			}

		}

		if (!this.topLogo) {
			this.topLogo = "/images/3drepo-logo-white.png";
		}
		if (!this.backgroundImage) {
			this.backgroundImage = "/images/viewer_background.png";
		}

	}

	public handlePaths() {

		// TODO: this is a bit of a hack, it would be nice to
		// include this in the StateManager
		if (this.hasTrailingSlash()) {
			this.removeTrailingSlash();
		}

		// If it's a logged in page just redirect to the
		// users teamspace page
		this.AuthService.authDefer.promise.then(() => {
			if (
				this.AuthService.loggedOutPage() &&
				this.AuthService.getUsername()
			) {
				this.$location.path("/" + this.AuthService.getUsername());
			}
		});

	}

	public pageCheck(state, pages) {
		return pages.filter((page) => {
			return state[page] === true;
		}).length;
	}

	public setPage(state, page) {
		if (state[page] === true) {
			this.page = page;
		}
	}

	public precacheTeamspaceTemplate() {

		// The account teamspace template is hefty. If we cache it ASAP
		// we can improve the percieved performance for the user

		const preCacheTemplates = [
			"templates/account-teamspaces.html",
			"templates/account-info.html",
			"templates/sign-up.html",
			"templates/register-request.html"
		];

		this.TemplateService.precache(preCacheTemplates);

	}

	public handlePotentialMobile() {

		// Regex test is as recommended by Mozilla:
		// https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent

		const mobile = screen.width <= 768 || /Mobi/.test(navigator.userAgent);
		const setMemory = localStorage.getItem("deviceMemory");

		console.debug("Memory limit set to: ", setMemory);

		// We're in mobile, with no memory set
		// and it's not already in lite mode
		if (mobile && !setMemory && !this.isLiteMode) {
			this.DialogService.showDialog(
				"lite-dialog.html",
				this.$scope,
				event,
				false,
				null,
				false
			);
			return;
		}

		if (!this.isLiteMode && mobile && setMemory) {
			// We're on mobile/tablet and we have a previous
			// memory setting selected
			this.deviceMemory = parseInt(setMemory, 10);
			return;
		}

	}

	public setLiteMode(onOrOff) {
		this.isLiteMode = onOrOff;
		localStorage.setItem("liteMode", onOrOff);
	}

	public useLiteMode() {
		this.setLiteMode(true);
		this.DialogService.closeDialog();
	}

	public useNormalMode() {
		this.setLiteMode(false);
		this.showMemorySelected = true;
		this.deviceMemory = 2; // Default for mobile/tablet in normal mode
	}

	public memorySelected() {
		this.DialogService.closeDialog();
		if (this.deviceMemory === 0) {
			this.deviceMemory = 2;
		}
		localStorage.setItem("deviceMemory", this.deviceMemory);
		if (this.state.model) {
			location.reload();
		}
	}

	public hasTrailingSlash() {
		// Check if we have a trailing slash in our URL
		const absUrl = this.$location.absUrl();
		const trailingCheck = absUrl.substr(-1);
		if (trailingCheck === "/") {
			return true;
		}
		return false;
	}

	public removeTrailingSlash() {
		// Remove the trailing slash from the URL
		const currentPath = this.$location.path();
		const minusSlash = currentPath.slice(0, -1);
		this.$location.path(minusSlash);
	}

	public logout() {
		this.StateManager.resetServiceStates();
		this.AuthService.logout();
	}

	public home() {
		this.StateManager.resetServiceStates();
		this.StateManager.goHome();
	}

	public legalDisplay(event, display) {
		this.$window.open("/" + display.value);
	}

}

export const HomeComponent: ng.IComponentOptions = {
	bindings: {
		account: "@",
		password: "@",
		loggedInUrl: "@",
		loggedOutUrl: "@"
	},
	controller: HomeController,
	controllerAs: "vm",
	templateUrl: "templates/home.html"
};

export const HomeComponentModule = angular
	.module("3drepo")
	.component("home", HomeComponent);
