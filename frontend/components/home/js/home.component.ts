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
	private keysDown;
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
	) {}

	public $onInit() {

		this.handlePaths();
		this.setLoginPage();

		this.AnalyticService.init();
		this.SWService.init();

		this.initKeyWatchers();
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
		this.keysDown = [];
		this.firstState = true;

		// Required for everything to work
		this.state = this.StateManager.state;
		this.query = this.StateManager.query;

		this.isMobileDevice = true;

		this.legalDisplays = [];
		if (this.ClientConfigService.legal !== undefined) {
			this.legalDisplays = this.ClientConfigService.legal;
		}
		this.legalDisplays.push({title: "Pricing", page: "http://3drepo.org/pricing"});
		this.legalDisplays.push({title: "Contact", page: "http://3drepo.org/contact/"});

		this.isMobileDevice = this.isMobile();
		this.watchers();

		/**
		 * Close the dialog
		 */
		this.$scope.closeDialog = () => {
			this.$mdDialog.cancel();
		};

	}

	public watchers() {

		this.$scope.$watch(
			() => {
				return this.$location.path();
			}, () => {
				this.handlePaths();
			},
		);

		/*
		* Watch the state to handle moving to and from the login page
		*/
		this.$scope.$watch("vm.state", (oldState, newState) => {

			const change = JSON.stringify(oldState) !== JSON.stringify(newState);

			this.loggedIn = this.AuthService.isLoggedIn();

			if ( (newState && change) || (newState && this.firstState)) {

				// If it's a legal page
				const legal = this.pageCheck(newState, this.legalPages);
				const loggedOut = this.pageCheck(newState, this.loggedOutPages);

				if (legal) {

					this.isLegalPage = true;
					this.isLoggedOutPage = false;

					this.legalPages.forEach((page) => {
						this.setPage(newState, page);
					});

				} else if (loggedOut && !newState.loggedIn) {

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
					!loggedOut
				) {

					// Login page or none existant page

					this.isLoggedOutPage = false;
					this.page = "";
				}

			}
		}, true);

		this.$scope.$watch(
			() => {
				return this.AuthService.state;
			},
			() => {

				switch (this.AuthService.state.currentEvent) {
				case "USER_LOGGED_IN":
					if (!this.AuthService.state.currentData.error) {
						if (!this.AuthService.state.currentData.initialiser) {

							this.StateManager.updateState(true);

							if (!this.StateManager.state.account) {

								const username = this.AuthService.getUsername();
								if (!username) {
									console.error("Username is not defined for statemanager!");
								}
								this.StateManager.setHomeState({
									account: username,
								});
							}
						}
					} else {
						this.AuthService.setAuthState("USER_LOGGED_OUT", {});
					}
					break;

				case "USER_LOGGED_OUT":
					// TODO: Use state manager
					// Only fire the Logout Event if we're on the home page
					const currentPage = this.$location.path();

					if (this.doNotLogout.indexOf(currentPage) === -1) {
						this.StateManager.setHomeState({ loggedIn: false, account: null });
					}
					break;
				}

			},
			true,
		);

		this.$scope.$watch(this.EventService.currentEvent, (event) => {
			if (event.type === this.EventService.EVENT.TOGGLE_ISSUE_AREA_DRAWING) {
				this.pointerEvents = event.value.on ? "none" : "inherit";
			}
		});
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

	/**
	 * Precache templates for the next pages
	 */
	public precacheTeamspaceTemplate() {

		// The account teamspace template is hefty. If we cache it ASAP
		// we can improve the percieved performance for the user

		const preCacheTemplates = [
			"templates/account-teamspaces.html",
			"templates/account-info.html",
			"templates/sign-up.html",
			"templates/register-request.html",
		];

		this.TemplateService.precache(preCacheTemplates);

	}

	/**
	 * Check if the user is on mobile
	 */
	public isMobile(): boolean {

		const mobile = screen.width <= 768;

		if (mobile) {
			this.handleMobile();
		}

		console.debug("Is mobile? ", mobile);
		return mobile;

	}

	/**
	 * Show a dialog for mobile users
	 */
	public handleMobile() {

		const message = "We have detected you are on a " +
		"mobile device and will show the 3D Repo lite experience for " +
		"smoother performance.";

		this.$mdDialog.show(
			this.$mdDialog.confirm()
				.clickOutsideToClose(true)
				.title("3D Repo Lite")
				.textContent(message)
				.ariaLabel("3D Repo Lite Dialog")
				.ok("OK"),
		);

	}

	/**
	 * Checks if the current URL has a trailing slash
	 */
	public hasTrailingSlash(): boolean {
		// Check if we have a trailing slash in our URL
		const absUrl = this.$location.absUrl();
		const trailingCheck = absUrl.substr(-1);
		if (trailingCheck === "/") {
			return true;
		}
		return false;
	}

	/**
	 * Remove trailing slashes from the URL
	 */
	public removeTrailingSlash() {
		// Remove the trailing slash from the URL
		const currentPath = this.$location.path();
		const minusSlash = currentPath.slice(0, -1);
		this.$location.path(minusSlash);
	}

	/**
	 * Log the user out
	 */
	public logout() {
		this.AuthService.logout();
		this.ViewerService.reset();
	}

	/**
	 * Go to the account page
	 */
	public home() {
		this.ViewerService.reset();
		this.StateManager.goHome();
	}

	/**
	 * Display legal text
	 *
	 * @param event
	 * @param display
	 */
	public legalDisplay(event, display) {
		this.$window.open("/" + display.value);
	}

	public initKeyWatchers() {

		this.$document.bind("keydown", (event) => {
			if (this.keysDown.indexOf(event.which) === -1) {

				this.keysDown.push(event.which);

				// Recreate list so that it changes are registered in components
				this.keysDown = this.keysDown.slice();

			}
		});

		this.$document.bind("keyup", (event) => {
			// Remove all instances of the key (multiple instances can happen if key up wasn't registered)
			for (let i = (this.keysDown.length - 1); i >= 0; i -= 1) {
				if (this.keysDown[i] === event.which) {
					this.keysDown.splice(i, 1);
				}
			}

			// Recreate list so that it changes are registered in components
			this.keysDown = this.keysDown.slice();
		});

	}

}

export const HomeComponent: ng.IComponentOptions = {
	bindings: {
		account: "@",
		password: "@",
		loggedInUrl: "@",
		loggedOutUrl: "@",
	},
	controller: HomeController,
	controllerAs: "vm",
	templateUrl: "templates/home.html",
};

export const HomeComponentModule = angular
	.module("3drepo")
	.component("home", HomeComponent);
