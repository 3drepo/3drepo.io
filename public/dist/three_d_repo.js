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

angular.module('3drepo')
.config([
'$stateProvider',
'parentStates',
function($stateProvider, parentStates) {
	var states = parentStates["account"];

	for(var i = 0; i < states.length; i++) {
		$stateProvider
		.state(states[i] + '.account', {
			url: ':account',
			resolve: {
				auth: function authCheck(Auth) {
					return Auth.init();
				},
				init: function(StateManager, auth, $stateParams) {
					// On the login page the account variable is set to ""
					// we must override this.
					if ($stateParams["account"] === "")
						$stateParams["account"] = null;

					StateManager.setState($stateParams, {});
				}
			},
			views: {
				"@" : {
					template: '<account-dir></account-dir>'
				}
			}
		})
	}
}])
.run(['StateManager', function(StateManager) {
	StateManager.registerPlugin('account', null, function () {
		if (StateManager.state.account) {
			return "account";
		}
		else {
			return null;
		}
	});

	StateManager.setClearStateVars("account", ["account"]);
}]);



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

angular.module('3drepo')
.factory('AccountData', ['$http', '$q', 'serverConfig', 'StateManager', function($http, $q, serverConfig, StateManager){
	var o = {
		username:	null,
		firstName:	null,
		lastName:	null,
		email:		null,
		projects:	null
	};

	o.refresh = function() {
		var self = this;
		var username = StateManager.state.account;

		var deferred = $q.defer();

		if (username !== self.username && !StateManager.state.project)
		{
			self.username  = username;
			self.firstName = "";
			self.lastName  = "";
			self.email     = "";
			self.projects  = [];

			self.avatarURL = serverConfig.apiUrl(username + '.jpg');

			$http.get(serverConfig.apiUrl(username + '.json'))
			.then(function(json) {
				self.username = username;

				if(json.data.firstName)
					self.firstName = json.data.firstName;

				if(json.data.lastName)
					self.lastName  = json.data.lastName;

				if(json.data.email)
					self.email     = json.data.email;

				if(json.data.projects) {
					self.projects  = json.data.projects;
					self.projectsGrouped = {}
					for (var p = 0; p < self.projects.length; p++) {
						var project = self.projects[p];
						if (!(project['account'] in self.projectsGrouped)) {
							self.projectsGrouped[project['account']] = [];
						}
						self.projectsGrouped[project['account']].push(project['project']);
					}
				}

				return $http.get(self.avatarURL);
			}, function(message) {
				self.loadError = "[" + message + "]";
				return $q.reject(message);
			}).then(function(json) {
				self.hasAvatar = true;
				self.loading   = false;
				deferred.resolve();
			}, function(message) {
				self.hasAvatar = false;
				self.loading   = false;
				deferred.resolve();
			});
		} else {
			deferred.resolve();
		}

		return deferred.promise;
	};

	o.updatePassword = function(oldPassword, newPassword)
	{
		var passwords = {
			oldPassword: oldPassword,
			newPassword: newPassword
		};

		return $http.post(serverConfig.apiUrl(this.username), passwords);
	};

	o.updateUser = function()
	{
		var user = {
			email: this.email,
			firstName: this.firstName,
			lastName: this.lastName
		};

		return $http.post(serverConfig.apiUrl(this.username), user);
	};

	return o;
}]);


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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("accountDir", accountDir);

	function accountDir() {
		return {
			restrict: 'EA',
			templateUrl: 'account.html',
			scope: {},
			controller: AccountCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountCtrl.$inject = ["AccountService"];

	function AccountCtrl(AccountService) {
		var vm = this,
			promise;

		/*
		 * Get the account data
		 */
		promise = AccountService.getData();
		promise.then(function (data) {
			if (data.statusText === "OK") {
				vm.username = data.data.username;
				vm.firstName = data.data.firstName;
				vm.lastName = data.data.lastName;
				vm.email = data.data.email;
				vm.projectsGrouped = data.data.projectsGrouped;
			}
		});
	}
}());

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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("accountProfile", accountProfile);

	function accountProfile() {
		return {
			restrict: 'EA',
			templateUrl: 'accountProfile.html',
			scope: {
				username: "=",
				firstName: "=",
				lastName: "=",
				email: "="
			},
			controller: AccountProfileCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountProfileCtrl.$inject = ["AccountService"];

	function AccountProfileCtrl(AccountService) {
		var vm = this,
			promise;

		/**
		 * Update the user info
		 */
		vm.updateInfo = function () {
			promise = AccountService.updateInfo(vm.username, {
				email: vm.email,
				firstName: vm.firstName,
				lastName: vm.lastName
			});
			promise.then(function (response) {
				console.log(response);
				if (response.statusText === "OK") {
					vm.infoSaveInfo = "Info saved";
				} else {
					vm.infoSaveInfo = "Error saving info";
				}
			});
		};

		/**
		 * Update the user password
		 */
		vm.updatePassword = function () {
			promise = AccountService.updatePassword(vm.username, {
				oldPassword: vm.oldPassword,
				newPassword: vm.newPassword
			});
			promise.then(function (response) {
				console.log(response);
				if (response.statusText === "OK") {
					vm.passwordSaveInfo = "Password saved";
				} else {
					vm.passwordSaveInfo = "Error saving password";
				}
			});
		};
	}
}());

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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("accountProjects", accountProjects);

	function accountProjects() {
		return {
			restrict: 'EA',
			templateUrl: 'accountProjects.html',
			scope: {
				projectsGrouped: "="
			},
			controller: AccountProjectsCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountProjectsCtrl.$inject = ["$scope", "$location"];

	function AccountProjectsCtrl($scope, $location) {
		var vm = this;

		/*
		 * Handle changes to the state manager Data
		 * Reformat the grouped projects to enable toggling of projects list
		 */
		$scope.$watch("vm.projectsGrouped", function () {
			vm.accounts = [];
			angular.forEach(vm.projectsGrouped, function(value, key) {
				vm.accounts.push({
					name: key,
					projects: value,
					showProjects: false
				});
			});
		});

		/**
		 * Go to the project viewer
		 *
		 * @param {{String}} project
		 */
		vm.goToProject = function (account, project) {
			$location.path("/" + account + "/" + project, "_self");
		};

		/**
		 * Toggle display of projects for an account
		 *
		 * @param {Number} index
		 */
		vm.toggleProjectsList = function (index) {
			vm.accounts[index].showProjects = !vm.accounts[index].showProjects;
			vm.accounts[index].showProjectsIcon = vm.accounts[index].showProjects ? "fa fa-folder-open-o" : "fa fa-folder-open-o";
		};
	}
}());

/**
 *  Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.factory("AccountService", AccountService);

	AccountService.$inject = ["$http", "$q", "serverConfig", "StateManager"];

	function AccountService($http, $q, serverConfig, StateManager) {
		var obj = {},
			deferred;

		/**
		 * Get account data
		 */
		obj.getData = function () {
			deferred = $q.defer();
			$http.get(serverConfig.apiUrl(StateManager.state.account + '.json'))
				.then(function (response) {
					var i, length,
						project, projectsGrouped;
					console.log(response);

					// Groups projects under accounts
					projectsGrouped = {};
					for (i = 0, length = response.data.projects.length; i < length; i += 1) {
						project = response.data.projects[i];
						if (!(project.account in projectsGrouped)) {
							projectsGrouped[project.account] = [];
						}
						projectsGrouped[project.account].push(project.project);
					}
					response.data.projectsGrouped = projectsGrouped;

					deferred.resolve(response);
				});
			return deferred.promise;
		};

		/**
		 * Update the user info
		 *
		 * @param {String} username
		 * @param {Object} info
		 * @returns {*}
		 */
		obj.updateInfo = function (username, info) {
			deferred = $q.defer();
			$http.post(serverConfig.apiUrl(username), info)
				.then(function (response) {
					console.log(response);
					deferred.resolve(response);
				});

			return deferred.promise;
		};

		/**
		 * Update the user password
		 *
		 * @param {String} username
		 * @param {Object} passwords
		 * @returns {*}
		 */
		obj.updatePassword = function (username, passwords) {
			deferred = $q.defer();
			$http.post(serverConfig.apiUrl(username), passwords)
				.then(function (response) {
					console.log(response);
					deferred.resolve(response);
				});

			return deferred.promise;
		};

		return obj;
	}
}());

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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("logout", logout);

	function logout() {
		return {
			restrict: 'EA',
			templateUrl: 'logout.html',
			scope: {},
			controller: LogoutCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	LogoutCtrl.$inject = ["$scope", "Auth", "StateManager"];

	function LogoutCtrl ($scope, Auth, StateManager) {
		var vm = this;

		vm.logout = function () {
			Auth.logout().then(
				function _logoutCtrlLogoutSuccess () {
					$scope.errorMessage = null;
					StateManager.state.account = null;
					StateManager.updateState();
				},
				function _logoutCtrlLogoutFailure (reason) {
					$scope.errorMessage = reason;
					StateManager.updateState();
				}
			);
		};
	}
}());

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

(function() {
	"use strict";

	angular.module("3drepo")
	.service("Auth", ["$injector", "$q", "$state", "$http", "serverConfig", "StateManager", "$rootScope", "$timeout", function($injector, $q, $state, $http, serverConfig, StateManager, $rootScope, $timeout) {
		this.loggedIn = null;
		this.username = null;
		var self = this;

		this.init = function() {
			var deferred = $q.defer();

			// If we are not logged in, check
			// with the API server whether we
			// are or not
			if(self.loggedIn === null)
			{
				// Initialize
				$http.get(serverConfig.apiUrl("login"))
				.success(function(data) {
					self.loggedIn = true;
					self.username = data.username;
					self.userRoles = data.roles;
					deferred.resolve(self.loggedIn);
				}).error(function(data) {
					self.loggedIn = false;
					self.username = null;
					self.userRoles = null;
					deferred.resolve(self.loggedIn);
				});
			} else {
				deferred.resolve(self.loggedIn);
			}

			return deferred.promise;
		};

		this.loadProjectRoles = function(account, project)
		{
			var deferred = $q.defer();

			$http.get(serverConfig.apiUrl(account + "/" + project + "/roles.json"))
			.success(function(data) {
				self.projectRoles = data;
				deferred.resolve();
			}).error(function() {
				self.projectRoles = null;
				deferred.resolve();
			});

			return deferred.promise;
		};

		this.getUsername = function() { return this.username; };

		this.login = function(username, password) {
			var deferred = $q.defer();

			var postData = {username: username, password: password};
			var http = $injector.get("$http");

			http.post(serverConfig.apiUrl("login"), postData)
			.success(function (data) {
				self.username = username;
				self.userRoles = data.roles;
				self.loggedIn = true;

				$timeout(function() {
					if ($rootScope.requestState && $rootScope.requestParams)
					{
						$state.go($rootScope.requestState, $rootScope.requestParams);
					}
				});

				deferred.resolve(username);
			})
			.error(function(data, status) {
				self.username = null;
				self.userRoles = null;
				self.loggedIn = false;

				if (status === 401)
				{
					deferred.reject("Invalid username/password");
				} else {
					deferred.reject("Unable to connect to the API server");
				}
			});

			return deferred.promise;
		};

		this.logout = function() {
			var deferred = $q.defer();
			var http = $injector.get("$http");

			http.post(serverConfig.apiUrl("logout"))
			.success(function _authLogOutSuccess() {
				self.username = null;
				self.loggedIn = false;

				deferred.resolve();
			})
			.error(function _authLogOutFailure() {
				self.username = null;
				self.loggedIn = false;

				deferred.reject("Unable to logout.");
			});

			return deferred.promise;
		};
	}]);
})();

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

(function() {
	"use strict";

	angular.module("3drepo")
	.config([
	"$stateProvider",
	"$locationProvider",
	function($stateProvider, $locationProvider) {
		$stateProvider.state("base", {
			name : "base",
			resolve: {
				StateManager: "StateManager",
				init : function(StateManager) { StateManager.refresh("base"); }
			}
		});

		// Removes Angular's # at the end of the URL
		$locationProvider.html5Mode(true);
	}])
	.factory("BaseData", ["StateManager", "uiState", function(StateManager, uiState) {
		var o = {};

		o.refresh = function () {
			// In the base we reset all the UI components
			for (var uicomp in o.uiComps) {
				if (StateManager.ui.hasOwnProperty(uicomp)) {
					StateManager.ui[uicomp] = false;
				}
			}

			for (var statevar in StateManager.state) {
				if (StateManager.state.hasOwnProperty(statevar))
				{
					StateManager.state[statevar] = null;
				}
			}
		};

		o.uiComps = [];

		for(var k in uiState)
		{
			if (k.hasOwnProperty(k)) {
				for(var i = 0; i < uiState[k].length; i++)
				{
					var plugin = uiState[k][i];

					if (o.uiComps.indexOf(plugin) === -1)
					{
						o.uiComps.push(plugin);
					}
				}
			}
		}

		return o;
	}])
	.controller("BaseCtrl", ["$scope", "serverConfig", "StateManager", "Auth", "pageConfig", "$window", function($scope, serverConfig, StateManager, Auth, pageConfig, $window)
	{
		$scope.ui		= StateManager.ui;
		$scope.Data		= StateManager.Data;
		$scope.state	= StateManager.state;

		// This is used to update the information in the Auth service
		$scope.$watchGroup(["state.account", "state.project"], function() {
			// If the project has changed then we need to update the list of groups
			if ($scope.state.account && $scope.state.project)
			{
				Auth.loadProjectRoles($scope.state.account, $scope.state.project);
			}
		});

		$window.logoClick = function()
		{
			pageConfig.goDefault();
		};

		$scope.goAccount = function()
		{
			StateManager.setState({ "account" : Auth.username }, {"clearState" : true});
			StateManager.updateState();
		};

		$scope.$on("notAuthorized", function() {
			$scope.goAccount();
		});


		$scope.backgroundImage = serverConfig.backgroundImage;
	}])
	.run(["StateManager", function(StateManager) {
		StateManager.registerPlugin("base", "BaseData", function () {
			return "base"; // Always valid
		});
	}])

	// Inspired by Ben Lesh"s answer - http://stackoverflow.com/a/12936046/782358
	.factory("clickOutsideService", function ($document) {
		return function($scope, expr) {
			var clickCB = function() {
				$scope.$apply(expr);
			};

			$document.on("click", clickCB);

			$scope.$on("$destroy", function(){
				$document.off("click", clickCB);
			});
		};
	})

	.directive("clickOutside", function ($document, clickOutsideService) {
		return {
			restrict: "A",
			link: function(scope, element, attr) {
				var clickCB = function(event) {
					event.stopPropagation();
				};
				element.on("click", clickCB);

				scope.$on("$destroy", function(){
					element.off("click", clickCB);
				});

				clickOutsideService(scope, attr.clickOutside);
			}
		};
	});
}());

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

(function() {
	"use strict";

	angular.module("3drepo")
	.run(["$rootScope", "uiState", "StateManager", function($rootScope, uiState, StateManager) {
		$rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams)
		{
			if (!$rootScope.requestState && !$rootScope.requestParams)
			{
				// Record the request URL so that if something
				// goes wrong we can log back into it.
				$rootScope.requestState = toState;
				$rootScope.requestParams = toParams;
			}
		});

		$rootScope.$on("$stateChangeSuccess",function(event, toState, toParams, fromState, fromParams){
			console.log("$stateChangeSuccess to "+JSON.stringify(toState)+"- fired when the transition finishes. toState,toParams : \n",toState, toParams);

			var uiComps = uiState[toState.name];

			// Split the list of states separated by dots
			var toStates    = toState.name.split(".");
			var fromStates  = fromState.name.split(".");

			var i = 0;

			for(i = 0; i < fromStates.length; i++) {
				// Loop through all the states and clear all the variables of ones,
				// we are not using
				if (toStates.indexOf(fromStates[i]) === -1) {
					StateManager.clearStateVars(fromStates[i]);
				}
			}

			// Turn off all UI components
			for (var uicomp in StateManager.ui) {
				if (StateManager.ui.hasOwnProperty(uicomp)) {
					StateManager.ui[uicomp] = false;
				}
			}

			// Turn on the required UI components
			if (uiComps) {
				for (i = 0; i < uiComps.length; i++) {
					StateManager.ui[uiComps[i]] = true;
				}
			}

			if ($rootScope.requestState.name === toState.name)
			{
				// We have successfully made it, after a number
				// of tries
				$rootScope.requestState = null;
				$rootScope.requestParams = null;
			}
		});
	}])
	.service("StateManager", ["$injector", "$state", "structure", function($injector, $state, structure) {
		var self = this;

		// Stores the Data factories associated with each plugin
		this.Data       = {};

		// Stores the state, required as ui-router does not allow inherited
		// stateParams, and we need to dynamically generate state diagram.
		// One day this might change.
		// https://github.com/angular-ui/ui-router/wiki/URL-Routing
		this.state      = {};

		// Ui components to switch on and off
		this.ui         = {};

		// Link between plugins and data factories
		this.pluginData = {};

		// Link between plugin names and state changes
		this.pluginState = {};

		// Has a state variable changed. Is this necessary ?
		this.changed     = {};

		this.clearChanged = function()
		{
			for(var i in self.changed) {
				if (self.changed.hasOwnProperty(i)) {
					self.changed[i] = false;
				}
			}
		};

		this.destroy = function()  {
			delete this.state;
			this.state = {};

			delete this.ui;
			this.ui = {};

			delete this.Data;
			this.Data = {};
		};

		self.clearChanged();

		this.registerPlugin = function(plugin, dataFactory, stateFunc)
		{
			// Inject the data factory for a plugin
			if (dataFactory) {
				this.Data[dataFactory] = $injector.get(dataFactory);

				if (plugin) {
					if (!(plugin in this.pluginData))
						this.pluginData[plugin] = [];

					this.pluginData[plugin].push(this.Data[dataFactory]);
				}
			}

			console.log(plugin);
			if (stateFunc)
				this.pluginState[plugin] = stateFunc;
		};

		this.stateVars    = {};
		this.setClearStateVars = function(state, stateVars) {
			self.stateVars[state] = stateVars;
		};

		this.clearStateVars = function(state) {
			var myStateVars = self.stateVars[state];

			if (myStateVars) {
				for(var i = 0; i < myStateVars.length; i++) {
					self.state[myStateVars[i]] = null;
				}
			}
		};

		this.refresh = function(plugin)
		{
			var dataFactories = this.pluginData[plugin];

			for(var i = 0; i < dataFactories.length; i++)
				dataFactories[i].refresh();
		};

		this.genStateName = function ()
		{
			var notFinished		= true;
			var currentChildren	= structure.children;
			var childidx 		= 0;
			var stateName 		= "base.";	// Assume that the base state is there.

			while(childidx < currentChildren.length)
			{
				var child  = currentChildren[childidx];
				var plugin = child.plugin;

				var pluginStateName = this.pluginState[plugin](this);

				if (pluginStateName)
				{
					stateName += pluginStateName + ".";

					if (child.children) {
						currentChildren = child.children;
					} else {
						currentChildren = [];
					}

					childidx = -1;
				}

				childidx += 1;
			}

			return stateName.substring(0, stateName.length - 1);
		};

		this.createStateVar = function(varName, value)
		{
			// TODO: Check for duplication
			this.state.varName = value;
		};

		// TODO: Remove this function at some point
		this.setStateVar = function(varName, value)
		{
			if (self.state[varName] !== value) {
				self.changed[varName] = true;
			}

			self.state[varName] = value;
		};

		this.setState = function(stateParams, extraParams)
		{
			var stateObj = $.extend(stateParams, extraParams);

			console.log("Setting state - " + JSON.stringify(stateParams));

			// Copy all state parameters and extra parameters
			// to the state
			for(var i in stateObj)
			{
				var currentStateParams = Object.keys(self.state);
				if (currentStateParams.indexOf(i) === -1) {
					self.createStateVar(i, stateObj[i]);
				}

				self.setStateVar(i, stateObj[i]);
			}

			// Clear out anything that hasn't been set
			if (extraParams.clearState) {
				var objectKeys = Object.keys(stateObj);
				for(var i in self.state) {
					if (objectKeys.indexOf(i) === -1) {
						delete self.state[i];
					}
				}
			}
		};

		this.updateState = function(dontUpdateLocation)
		{
			console.log("Moving to " + self.genStateName() + " ...");

			var updateLocation = !dontUpdateLocation ? true: false; // In case of null
			$state.transitionTo(self.genStateName(), self.state, { location: updateLocation });
		};
	}]);

})();

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

(function() {
	"use strict";

	angular.module("3drepo")
		.directive("autoLogin", autoLogin);

	autoLogin.$inject = ["Auth"];

	function autoLogin(Auth) {
		return {
			restrict: "E",
			link: link,
			scope: { }
		};
		
		function link (scope, element, attrs)
		{			
			Auth.login(attrs.account, attrs.password);
		}
	}
}());

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

(function() {
	"use strict";

	angular.module("3drepo")
		.directive("autoProject", autoProject);

	autoProject.$inject = ["EventService"];

	function autoProject(EventService) {
		return {
			restrict: "E",
			link: link,
			scope: { }
		};
		
		function link (scope, element, attrs)
		{		
			EventService.send(EventService.EVENT.CREATE_VIEWER, {
				name: "default",
				account: attrs.account,
				project: attrs.project,
				branch:  attrs.branch,
				revision: attrs.revision
			});
		}
	}
}());

/**
 **  Copyright (C) 2014 3D Repo Ltd
 **
 **  This program is free software: you can redistribute it and/or modify
 **  it under the terms of the GNU Affero General Public License as
 **  published by the Free Software Foundation, either version 3 of the
 **  License, or (at your option) any later version.
 **
 **  This program is distributed in the hope that it will be useful,
 **  but WITHOUT ANY WARRANTY; without even the implied warranty of
 **  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 **  GNU Affero General Public License for more details.
 **
 **  You should have received a copy of the GNU Affero General Public License
 **  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/

// Exposed methods through the X3DOM nodes.



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

(function () {
    "use strict";

    angular.module("3drepo")
        .directive("home", home)
        .config(function($mdThemingProvider) {
            $mdThemingProvider.theme('default')
                .primaryPalette('indigo', {
                    'default': '500',
                    'hue-1': '400',
                    'hue-2': '200',
                    'hue-3': '50'
                })
                .accentPalette('green', {
                    'default': '600'
                })
                .warnPalette('red');
        });

    function home() {
        return {
            restrict: 'E',
            scope: {},
            controller: HomeCtrl,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    HomeCtrl.$inject = [];

    function HomeCtrl() {
        var vm = this;
    }
}());


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

(function() {
	"use strict";

	angular.module("3drepo")
	.factory("authInterceptor", ["$rootScope", "$q", function($rootScope, $q) {
		return {
			responseError: function(res)
			{
				if (res.status === 401) {
					$rootScope.$broadcast("notAuthorized", null);
				}

				$rootScope.lastURL = res.config.url;

				return $q.reject(res);
			}
		};
	}])
	.config(function ($httpProvider) {
		var checkAuthorization = ["$q", "$location", function($q, $location) {
			var onSuccess = function (res) { return res;};
			var onError = function(res) {
				if (res.status === 401 || res.status === 400) {
					$location.path("/login");

					return $q.reject(res);
				} else {
					return $q.reject(res);
				}
			};

			return function (promise) {
				return promise.then(onSuccess, onError);
			};
		}];

		$httpProvider.interceptors.push(checkAuthorization);
		$httpProvider.defaults.withCredentials = true;
		$httpProvider.interceptors.push("authInterceptor");
	});
})();

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

angular.module('3drepo')
.provider('pageConfig', ['$urlRouterProvider', function pageConfigProvider($urlRouterProvider) {
	var loggedInFunc    = null;
	var notLoggedInFunc = null;

	this.setStateFuncs = function(newLoggedInFunc, newNotLoggedInFunc) {
		loggedInFunc = newLoggedInFunc;
		notLoggedInFunc = newNotLoggedInFunc;
	};

	this.$get = ["Auth", "StateManager", function pageConfig(Auth, StateManager) {
		var obj = {};

		obj.loggedInFunc    = loggedInFunc;
		obj.notLoggedInFunc = notLoggedInFunc;

		// Which state to go to by default
		obj.goDefault = function() {
			if (Auth.loggedIn)
				loggedInFunc(Auth, StateManager);
			else
				notLoggedInFunc(Auth, StateManager);
		}

		$urlRouterProvider.otherwise(obj.goDefault);

		return obj;
	}];
}]);


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

angular.module('3drepo')
.config(["pageConfigProvider", "$urlRouterProvider", function(pageConfigProvider, $urlRouterProvider) {
	pageConfigProvider.setStateFuncs( function(Auth, StateManager) {
		StateManager.clearStateVars("project");
		StateManager.state.account = Auth.username;
		StateManager.updateState();
	}, function(Auth, StateManager) {
		StateManager.updateState();
	});
}]);


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

angular.module('3drepo')
.service('serverConfig', function() {
	this.apiUrl = server_config.apiUrl;

	this.democompany = server_config.democompany;
	this.demoproject = server_config.demoproject;

	this.chatHost    = server_config.chatHost;
	this.chatPath    = server_config.chatPath;

	this.apiVersion  = server_config.apiVersion;

	this.backgroundImage = server_config.backgroundImage;
});



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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("bottomButtons", bottomButtons);

	function bottomButtons () {
		return {
			restrict: 'E',
			templateUrl: 'bottomButtons.html',
			scope: {},
			controller: BottomButtonsCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	BottomButtonsCtrl.$inject = ["EventService"];

	function BottomButtonsCtrl (EventService) {
		var vm = this;
		vm.showButtons = true;
		vm.fullScreen = false;
		vm.showViewingOptionButtons = false;
		console.log(EventService);

		vm.toggleElements = function () {
			EventService.send(EventService.EVENT.TOGGLE_ELEMENTS);
			vm.showButtons = !vm.showButtons;
		};

		var setViewingOption = function (index) {
			if (angular.isDefined(index)) {
				// Set the viewing mode
				
				EventService.send(EventService.EVENT.VIEWER.SET_NAV_MODE,
					{mode: vm.viewingOptions[index].mode});
			
				// Set up the new current selected option button
				vm.selectedViewingOptionIndex = index;
				vm.leftButtons[1] = vm.viewingOptions[index];

				vm.showViewingOptionButtons = false;
			}
			else {
				vm.showViewingOptionButtons = !vm.showViewingOptionButtons;
			}
		};

		var home = function () {
			EventService.send(EventService.VIEWER.GO_HOME);
		};

		var toggleHelp = function () {
			EventService.send(EventService.EVENT.TOGGLE_HELP);
		};

		var enterFullScreen = function () {
			EventService.send(EventService.VIEWER.SWITCH_FULLSCREEN);
			vm.fullScreen = true;
		};

		var exitFullScreen = function() {
			if (!document.webkitIsFullScreen && !document.msFullscreenElement && !document.mozFullScreen && vm.fullScreen) {
				vm.fullScreen = false;
			}
		};
		document.addEventListener('webkitfullscreenchange', exitFullScreen, false);
		document.addEventListener('mozfullscreenchange', exitFullScreen, false);
		document.addEventListener('fullscreenchange', exitFullScreen, false);
		document.addEventListener('MSFullscreenChange', exitFullScreen, false);

		var showQRCodeReader = function () {
			EventService.send(EventService.EVENT.SHOW_QR_CODE_READER);
		};

		var enterOculusDisplay = function () {
			EventService.send(EventService.EVENT.VIEWER.ENTER_VR);
		};

		vm.viewingOptions = [
			{
				mode: VIEWER_NAV_MODES.WALK,
				label: "Walk",
				icon: "fa fa-child",
				click: setViewingOption,
				iconClass: "bottomButtomIconWalk"
			},
			{
				mode: VIEWER_NAV_MODES.HELICOPTER,
				label: "Helicopter",
				icon: "icon icon_helicopter",
				click: setViewingOption,
				iconClass: "bottomButtomIconHelicopter"
			},
			{
				mode: VIEWER_NAV_MODES.TURNTABLE,
				label: "Turntable",
				icon: "icon icon_turntable",
				click: setViewingOption
			}
		];
		vm.selectedViewingOptionIndex = 2;

		vm.leftButtons = [];
		vm.leftButtons.push({
			label: "Home",
			icon: "fa fa-home",
			click: home
		});
		vm.leftButtons.push(vm.viewingOptions[vm.selectedViewingOptionIndex]);

		vm.rightButtons = [];
		//vm.rightButtons.push({label: "Full screen", icon: "fa fa-arrows-alt", click: enterFullScreen});
		vm.rightButtons.push({
			label: "QR code",
			icon: "fa fa-qrcode",
			click: showQRCodeReader
		});
		/*
		vm.rightButtons.push({
			label: "Help",
			icon: "fa fa-question",
			click: toggleHelp
		});
		*/
		vm.rightButtons.push({
			label: "Oculus",
			icon: "icon icon_cardboard",
			click: enterOculusDisplay,
			iconClass: "bottomButtomIconCardboard"
		});
	}
}());

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

var toggleElements;

(function () {
	"use strict";

	function compassLoaded(event)
	{
		// Zoom in on compass
		$("#Axes")[0].runtime.showAll();
	};

	function compassMove(origEvent, event)
	{
		// Axes should rotate inversely to orientation
		// of camera
		event.orientation[1] = -event.orientation[1];

		// Fix transformation from viewpoint basis
		viewer.transformEvent(event, event.target, false);

		// Set rotation of the overlying group
		$("#AxesTrans")[0].setAttribute("rotation", event.orientation.toString());
	}

	angular.module("3drepo")
		.directive("compass", compass);

	function compass () {
		return {
			restrict: "E",
			templateUrl: "compass.html",
			scope: {},
			controller: CompassCtrl,
			controllerAs: "cc",
			bindToController: true,
		};
	}

	CompassCtrl.$inject = ["EventService"];

	function CompassCtrl (EventService)
	{
		EventService.send(EventService.EVENT.VIEWER.REGISTER_VIEWPOINT_CALLBACK, { callback: compassMove });
	}
}());


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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("clip", clip);

	function clip() {
		return {
			restrict: "EA",
			templateUrl: "clip.html",
			scope: {
				height: "=",
				show: "=",
				visible: "="
			},
			controller: ClipCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	ClipCtrl.$inject = ["$scope", "$timeout", "EventService"];

	function ClipCtrl($scope, $timeout, EventService) {
		var vm = this;

		vm.sliderMin = 0;
		vm.sliderMax = 100;
		vm.sliderStep = 0.1;
		vm.sliderPosition = vm.sliderMin;
		vm.clipPlane = null;
		vm.axes = ["X", "Y", "Z"];
		vm.selectedAxis = vm.axes[0];
		vm.visible = false;

		function initClippingPlane () {
			$timeout(function () {
				var initPosition = (vm.sliderMax - vm.sliderPosition) / vm.sliderMax;
				
				EventService.send(EventService.EVENT.VIEWER.CLEAR_CLIPPING_PLANES);
				EventService.send(EventService.EVENT.VIEWER.ADD_CLIPPING_PLANE, 
				{
					axis: translateAxis(vm.selectedAxis),
					percentage: initPosition
				});
			});
		}

		function moveClippingPlane(sliderPosition) {
			EventService.send(EventService.EVENT.VIEWER.MOVE_CLIPPING_PLANE, 
			{
				percentage: (vm.sliderMax - sliderPosition) / vm.sliderMax
			});
		}

		$scope.$watch("vm.show", function (newValue) {
			if (angular.isDefined(newValue)) {
				if (newValue) {
					if (!vm.clipPlane)
					{
						initClippingPlane();
					}
				}
			}
		});

		function translateAxis(axis)
		{
			if (axis === "Y")
			{
				return "Z";
			} else if (axis === "Z") {
				return "Y";
			} else {
				return "X";
			}
		}

		$scope.$watch("vm.visible", function (newValue, oldValue) {
			if (angular.isDefined(newValue))
			{
				vm.visible = newValue;

				if (newValue)
				{
					initClippingPlane();
				} else {
					EventService.send(EventService.EVENT.VIEWER.CLEAR_CLIPPING_PLANES);
				}
			}
		});

		$scope.$watch("vm.selectedAxis", function (newValue) {
			if ((angular.isDefined(newValue) && vm.clipPlane)) {
				// Swap Y and Z axes
				vm.clipPlane.changeAxis(translateAxis(newValue));
				vm.sliderPosition = vm.sliderMin;
			}
		});

		$scope.$watch("vm.sliderPosition", function (newValue) {
			if (vm.clipPlane) {
				moveClippingPlane(newValue);
			} else {
				vm.visible = (vm.sliderPosition !== 0);
			}
		});

		$scope.$watch(EventService.currentEvent, function (event) {
			if (event.type === EventService.EVENT.VIEWER.SET_CLIPPING_PLANES) {
				vm.clipPlane = null;

				if (event.value.hasOwnProperty("clippingPlanes") && event.value.clippingPlanes.length) {
					vm.selectedAxis   = translateAxis(event.value.clippingPlanes[0].axis);
					vm.sliderPosition = (1.0 - event.value.clippingPlanes[0].percentage) * 100.0;
					initClippingPlane();
					vm.visible = true;
				} else {
					vm.visible = false;
					vm.sliderPosition = 0.0;
				}
			}
		});
	}
}());

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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("docs", docs);

	function docs() {
		return {
			restrict: 'EA',
			templateUrl: 'docs.html',
			scope: {
				show: "=",
				onContentHeightRequest: "&"
			},
			controller: DocsCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	DocsCtrl.$inject = ["$scope", "$mdDialog", "$timeout", "EventService", "DocsService"];

	function DocsCtrl($scope, $mdDialog, $timeout, EventService, DocsService) {
		var vm = this,
			promise,
			docTypeHeight = 50,
			allDocTypesHeight,
			currentOpenDocType = null,
			eventWatch;

		vm.showDocsGetProgress = false;
		vm.showInfo = true;
		vm.info = "No object currently selected";

		/**
		 * Get any documents associated with an object
		 *
		 * @param object
		 */
		function getObjectsDocs (object) {
			var noDocumentsHeight = 140; // Make it large enough for long object names

			vm.docs = [];
			vm.showInfo = false;
			vm.progressInfo = "Loading documents for " + object.name;
			vm.showDocsGetProgress = true;
			currentOpenDocType = null;
			promise = DocsService.getDocs(object.account, object.project, object.id);
			promise.then(function (data) {
				var docType;
				vm.showDocsGetProgress = false;
				vm.docs = data;
				vm.showInfo = (Object.keys(vm.docs).length === 0);
				if (vm.showInfo) {
					vm.info = "No documents exist for object: " + object.name;
					vm.onContentHeightRequest({height: noDocumentsHeight});
				}
				else {
					allDocTypesHeight = 0;
					// Collapse all doc types initially
					for (docType in vm.docs) {
						if (vm.docs.hasOwnProperty(docType)) {
							vm.docs[docType].show = false;
							allDocTypesHeight += docTypeHeight;
						}
					}
					// Set the content height
					vm.onContentHeightRequest({height: allDocTypesHeight});
				}
			});
		}

		/**
		 * Set up event watching
		 */
		function setupEventWatch () {
			var noObjectSelectedHeight = 80;

			eventWatch = $scope.$watch(EventService.currentEvent, function (event) {
				if (event.type === EventService.EVENT.VIEWER.OBJECT_SELECTED) {
					getObjectsDocs(event.value);
				}
				else if (event.type === EventService.EVENT.VIEWER.BACKGROUND_SELECTED) {
					vm.docs = [];
					vm.showInfo = true;
					vm.info = "No object currently selected";
					vm.onContentHeightRequest({height: noObjectSelectedHeight});
					currentOpenDocType = null;
				}
			});
		}

		/*
		 * Only watch for events when shown
		 */
		$scope.$watch("vm.show", function (newValue) {
			if (angular.isDefined(newValue)) {
				if (newValue) {
					setupEventWatch();
				}
				else if (angular.isDefined(eventWatch)) {
					eventWatch(); // Cancel event watching
				}
			}
		});

		/**
		 * Show a document in a dialog
		 *
		 * @param {Object} doc
		 */
		vm.showDoc = function (doc) {
			$scope.pdfUrl = doc.url;
			vm.progressInfo = "Loading document " + doc.name;
			vm.showDocLoadProgress = true;
			$mdDialog.show({
				controller: docsDialogController,
				templateUrl: "docsDialog.html",
				parent: angular.element(document.body),
				targetEvent: event,
				clickOutsideToClose:true,
				fullscreen: true,
				scope: $scope,
				preserveScope: true,
				onRemoving: removeDialog
			});
		};

		/**
		 * Close the dialog
		 */
		$scope.closeDialog = function() {
			$mdDialog.cancel();
		};

		/**
		 * Close the dialog by not clicking the close button
		 */
		function removeDialog () {
			$scope.closeDialog();
		}

		function docsDialogController() {
		}

		/**
		 * Open and close doc types, allowing only one doc type open at a time
		 *
		 * @param docType
		 */
		vm.toggleItem = function (docType) {
			var itemsHeight,
				metaDataItemHeight = 30; // It could be higher for items with long text but ignore that

			if (currentOpenDocType === null) {
				// No doc type is open so open this doc type
				vm.docs[docType].show = true;
				currentOpenDocType = docType;
			}
			else {
				// Close the current doc type
				vm.docs[currentOpenDocType].show = false;
				if (currentOpenDocType === docType) {
					// No doc type currently open
					currentOpenDocType = null;
				}
				else {
					// Open this doc type and set the currently open doc type
					vm.docs[docType].show = true;
					currentOpenDocType = docType;
				}
			}

			// Set the content height
			if (currentOpenDocType === null) {
				// No currently open doc type
				vm.onContentHeightRequest({height: allDocTypesHeight});
			}
			else {
				if (currentOpenDocType === "Meta Data") {
					itemsHeight = Object.keys(vm.docs[currentOpenDocType].data[0].metadata).length * metaDataItemHeight;
				}
				vm.onContentHeightRequest({height: allDocTypesHeight + itemsHeight});
			}
		};
	}
}());

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

(function () {
	"use strict";

	angular.module("3drepo")
		.factory("DocsService", DocsService);

	DocsService.$inject = ["$http", "$q", "StateManager", "serverConfig"];

	function DocsService($http, $q, StateManager, serverConfig) {
		var getDocs = function (account, project, objectId) {
			var i,
				length,
				data = {},
				deferred = $q.defer(),
				url = serverConfig.apiUrl(account + "/" + project + "/meta/" + objectId + ".json");

			$http.get(url)
				.then(
					function(json) {
						console.log(json);
						var dataType;
						// Set up the url for each PDF doc
						for (i = 0, length = json.data.meta.length; i < length; i += 1) {
							// Get data type
							dataType = json.data.meta[i].hasOwnProperty("mime") ? json.data.meta[i].mime : "Meta Data";
							if (dataType === "application/pdf") {
								dataType = "PDF";
							}

							// Add data to type group
							if (!data.hasOwnProperty(dataType)) {
								data[dataType] = {data: []};
							}
							data[dataType].data.push(json.data.meta[i]);

							// Setup PDF url
							json.data.meta[i].url = serverConfig.apiUrl(account + "/" + project + '/' + json.data.meta[i]._id + ".pdf");
						}
						deferred.resolve(data);
					},
					function () {
						deferred.resolve(data);
					}
				);

			return deferred.promise;
		};

		return {
			getDocs: getDocs
		};
	}
}());

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

(function () {
    "use strict";

    angular.module("3drepo")
        .directive("filter", filter);

    function filter() {
        return {
            restrict: 'E',
            templateUrl: 'filter.html',
            scope: {},
            controller: FilterCtrl,
            controllerAs: 'fl',
            bindToController: true
        };
    }

    FilterCtrl.$inject = ["$scope", "$timeout", "EventService"];

    function FilterCtrl($scope, $timeout, EventService) {
        var fl = this;
        fl.filter = null;

        $scope.$watch("fl.filterText", function (newValue) {
            if (angular.isDefined(newValue)) {
                if (fl.filter !== null) {
                    $timeout.cancel(fl.filter);
                }
                fl.filter = $timeout(function() {
                    EventService.send(EventService.EVENT.FILTER, newValue);
                }, 500);
            }
        });
    }
}());

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

(function() {
	"use strict";

	angular.module("3drepo")
		.directive("issue", issue);

	function issue() {
		return {
			restrict: "EA",
			templateUrl: "issue.html",
			scope: {
				data: "=",
				autoSaveComment: "=",
				onCommentAutoSaved: "&",
				onToggleCloseIssue: "&",
				availableRoles: "=",
				projectUserRoles: "=",
				onIssueAssignChange: "&"
			},
			controller: IssueCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	IssueCtrl.$inject = ["$scope", "$timeout", "IssuesService", "EventService"];

	function IssueCtrl($scope, $timeout, IssuesService, EventService) {
		var vm = this,
			promise = null,
			originatorEv = null;

		/*
		 * Initialise view vars
		 */
		vm.showComments = true;
		vm.numNewComments = 0;
		vm.saveCommentDisabled = true;
		vm.backgroundColor = "#FFFFFF";
		vm.autoSaveComment = false;
		vm.showInfo = false;
		vm.editingComment = false;
		vm.assignedRolesColors = [];

		/*
		 * Handle the list of available roles
		 */
		$scope.$watch("vm.availableRoles", function(newValue) {
			var i = 0,
				length = 0;

			if (angular.isDefined(newValue)) {
				// Create a local copy of the available roles
				vm.roles = [];
				for (i = 0, length = newValue.length; i < length; i += 1) {
					vm.roles.push({
						role: newValue[i].role,
						color: newValue[i].color
					});
				}
				setupRolesWatch();
				initAssignedRolesDisplay();
				setupCanModifyIssue();
			}
		});

		/*
		 * Handle a request to do a comment auto save from the issue list
		 */
		$scope.$watch("vm.autoSaveComment", function(newValue) {
			if (angular.isDefined(newValue) && newValue && !vm.editingComment) {
				if (angular.isDefined(vm.comment) && (vm.comment !== "")) {
					vm.autoSaveComment = true;
					vm.saveComment();
				}
			}
		});

		/*
		 * Handle change to comment input
		 */
		$scope.$watch("vm.comment", function(newValue) {
			if (angular.isDefined(newValue)) {
				vm.saveCommentDisabled = (newValue === "");
			}
		});

		/*
		 * Do some initialisation
		 */
		$scope.$watch("vm.data", function(newValue) {
			var i = 0,
				length = 0;

			if (angular.isDefined(newValue)) {
				vm.backgroundColor = "#FFFFFF";
				vm.issueIsOpen = true;
				if (newValue.hasOwnProperty("closed")) {
					vm.backgroundColor = newValue.closed ? "#E0E0E0" : "#FFFFFF";
					vm.issueIsOpen = !newValue.closed;
				}

				if (vm.issueIsOpen && newValue.hasOwnProperty("comments")) {
					for (i = 0, length = newValue.comments.length; i < length; i += 1) {
						newValue.comments[i].canDelete =
							(i === (newValue.comments.length - 1)) && (!newValue.comments[i].set);
					}
				}
				initAssignedRolesDisplay();
			}
		}, true);

		/**
		 * Handle changes to the assigned roles for the issue
		 */
		function setupRolesWatch() {
			$scope.$watch("vm.roles", function(newValue, oldValue) {
				var i = 0,
					length = 0;

				// Ignore initial setup of roles
				if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
					vm.data.assigned_roles = [];
					for (i = 0, length = vm.roles.length; i < length; i += 1) {
						if (vm.roles[i].assigned) {
							vm.data.assigned_roles.push(vm.roles[i].role);
						}
					}

					promise = IssuesService.assignIssue(vm.data);
					promise.then(function () {
						setAssignedRolesColors();
						vm.onIssueAssignChange();
					});
				}
			}, true);
		}

		/**
		 * Get the initial assigned roles for the issue
		 */
		function initAssignedRolesDisplay() {
			var i = 0,
				length = 0;

			if (angular.isDefined(vm.roles) && angular.isDefined(vm.data) && vm.data.hasOwnProperty("assigned_roles")) {
				for (i = 0, length = vm.roles.length; i < length; i += 1) {
					vm.roles[i].assigned = (vm.data.assigned_roles.indexOf(vm.roles[i].role) !== -1);
				}
				setAssignedRolesColors();
			}
		}

		/**
		 * Set up the assigned role colors for the issue
		 */
		function setAssignedRolesColors () {
			var i, length;

			var pinColours = [];

			vm.assignedRolesColors = [];
			for (i = 0, length = vm.roles.length; i < length; i += 1) {
				if (vm.data.assigned_roles.indexOf(vm.roles[i].role) !== -1) {
					var roleColour = IssuesService.getRoleColor(vm.roles[i].role);
					vm.assignedRolesColors.push(roleColour);
					pinColours.push(IssuesService.hexToRgb(roleColour));
				}
			}

			EventService.send(EventService.EVENT.VIEWER.CHANGE_PIN_COLOUR, {
				id: vm.data._id,
				colours: pinColours
			});
		}

		/**
		 * A user with the same role as the issue creator_role or
		 * a role that is one of the roles that the issues has been assigned to can modify the issue
		 */
		function setupCanModifyIssue() {
			var i = 0,
				length = 0;

			vm.canModifyIssue = false;
			if (angular.isDefined(vm.projectUserRoles) && angular.isDefined(vm.data) && vm.data.hasOwnProperty("assigned_roles")) {
				vm.canModifyIssue = (vm.projectUserRoles.indexOf(vm.data.creator_role) !== -1);
				if (!vm.canModifyIssue) {
					for (i = 0, length = vm.projectUserRoles.length; i < length; i += 1) {
						if (vm.data.assigned_roles.indexOf(vm.projectUserRoles[i]) !== -1) {
							vm.canModifyIssue = true;
							break;
						}
					}
				}
			}
		}

		/**
		 * Save a comment
		 */
		vm.saveComment = function() {
			if (angular.isDefined(vm.comment) && (vm.comment !== "")) {
				if (vm.editingComment) {
					promise = IssuesService.editComment(vm.data, vm.comment, vm.editingCommentIndex);
					promise.then(function(data) {
						vm.data.comments[vm.editingCommentIndex].comment = vm.comment;
						vm.data.comments[vm.editingCommentIndex].timeStamp = IssuesService.getPrettyTime(data.created);
						vm.comment = "";
					});
				} else {
					promise = IssuesService.saveComment(vm.data, vm.comment);
					promise.then(function(data) {
						if (!vm.data.hasOwnProperty("comments")) {
							vm.data.comments = [];
						}
						vm.data.comments.push({
							owner: data.owner,
							comment: vm.comment,
							created: data.created,
							timeStamp: IssuesService.getPrettyTime(data.created)
						});
						vm.comment = "";
						vm.numNewComments += 1; // This is used to increase the height of the comments list

						if (vm.autoSaveComment) {
							vm.onCommentAutoSaved(); // Tell the issue list a comment auto save has been done
							vm.autoSaveComment = false;
						}

						// Mark previous comment as 'set' - no longer deletable or editable
						if (vm.data.comments.length > 1) {
							promise = IssuesService.setComment(vm.data, (vm.data.comments.length - 2));
							promise.then(function(data) {
								vm.data.comments[vm.data.comments.length - 2].set = true;
							});
						}
					});
				}
			}
		};

		/**
		 * Delete a comment
		 *
		 * @param index
		 */
		vm.deleteComment = function(index) {
			promise = IssuesService.deleteComment(vm.data, index);
			promise.then(function(data) {
				vm.data.comments.splice(index, 1);
				vm.numNewComments -= 1; // This is used to reduce the height of the comments list
				vm.comment = "";
				vm.editingComment = false;
			});
		};

		/**
		 * Toggle the editing of a comment
		 *
		 * @param index
		 */
		vm.toggleEditComment = function(index) {
			vm.editingComment = !vm.editingComment;
			vm.editingCommentIndex = index;
			if (vm.editingComment) {
				vm.comment = vm.data.comments[vm.data.comments.length - 1].comment;
			} else {
				vm.comment = "";
			}
		};

		/**
		 * Toggle the closed status of an issue
		 */
		vm.toggleCloseIssue = function() {
			vm.onToggleCloseIssue({
				issue: vm.data
			});
		};

		/**
		 * Open the menu to assign roles
		 *
		 * @param $mdOpenMenu
		 * @param event
		 */
		vm.openAssignedRolesMenu = function($mdOpenMenu, event) {
			originatorEv = event;
			$mdOpenMenu(event);
		};
	}

	/*
	 * Below is for setting up the animation to show and hide comments
	 */

	angular.module("3drepo")
		.animation(".issueComments", issueComments);

	function issueComments() {
		var height;
		return {
			addClass: function(element, className, done) {
				if (className === "issueComments") {
					jQuery(element)
						.css({
							height: 0,
							opacity: 0
						})
						.animate({
							height: height,
							opacity: 1
						}, 500, done);
				} else {
					done();
				}
			},
			removeClass: function(element, className, done) {
				height = element[0].children[0].offsetHeight;
				if (className === "issueComments") {
					jQuery(element)
						.css({
							height: height,
							opacity: 1
						})
						.animate({
							height: 0,
							opacity: 0
						}, 500, done);
				} else {
					done();
				}
			}
		};
	}

	angular.module("3drepo")
		.directive("commentsHeight", commentsHeight);

	function commentsHeight() {
		return {
			restrict: "A",
			scope: {
				numNewComments: "="
			},
			link: link
		};

		function link(scope, element, attrs) {
			var commentHeight = 75,
				height = "0";
			scope.$watch("numNewComments", function(newValue, oldValue) {
				if (angular.isDefined(newValue)) {
					if (newValue > oldValue) {
						height = (element[0].offsetHeight + commentHeight).toString();
					} else if (newValue < oldValue) {
						height = (element[0].offsetHeight - commentHeight).toString();
					}
					element.css("height", height + "px");
				}
			});
		}
	}
}());
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("issues", issues);

	function issues() {
		return {
			restrict: 'EA',
			templateUrl: 'issues.html',
			scope: {
				show: "=",
				filterText: "=",
				showAdd: "=",
				selectedMenuOption: "=",
				onContentHeightRequest: "&",
				onShowItem : "&",
				hideItem: "="
			},
			controller: IssuesCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	IssuesCtrl.$inject = ["$scope", "$element", "$timeout", "$mdDialog", "$filter", "IssuesService", "EventService"];

	function IssuesCtrl($scope, $element, $timeout, $mdDialog, $filter, IssuesService, EventService) {
		var vm = this,
			promise,
			rolesPromise,
			projectUserRolesPromise,
			sortedIssuesLength,
			sortOldestFirst = true,
			showClosed = false,
			issue,
			rolesToFilter = [],
			issuesHeight,
			eventWatch,
			selectedObjectId = null,
			pickedPos = null,
			pickedNorm = null;

		vm.saveIssueDisabled = true;
		vm.issues = [];
		vm.issuesToShow = [];
		vm.showProgress = true;
		vm.progressInfo = "Loading issues";
		vm.showIssuesInfo = false;
		vm.showIssueList = false;
		vm.showIssue = false;
		vm.issuesInfo = "There are currently no open issues";
		vm.availableRoles = null;
		vm.projectUserRoles = [];
		vm.selectedIssue = null;
		vm.autoSaveComment = false;

		/*
		 * Get all the Issues
		 */
		promise = IssuesService.getIssues();
		promise.then(function (data) {
			var i, length;
			vm.showProgress = false;
			vm.issues = data;
			vm.showIssuesInfo = (vm.issues.length === 0);
			vm.showIssueList = (vm.issues.length !== 0);
			for (i = 0, length = vm.issues.length; i < length; i += 1) {
				vm.issues[i].showInfo = false;
				vm.issues[i].selected = false;
			}
			setAllIssuesAssignedRolesColors();
			setupIssuesToShow();
			setContentHeight();
			vm.showPins();
		});

		/*
		 * Get all the available roles for the project
		 */
		rolesPromise = IssuesService.getRoles();
		rolesPromise.then(function (data) {
			vm.availableRoles = data;
			setAllIssuesAssignedRolesColors();
		});

		/**
		 * Define the assigned role colors for each issue
		 */
		function setAllIssuesAssignedRolesColors () {
			var i, length;
			if (vm.availableRoles !== null) {
				for (i = 0, length = vm.issues.length; i < length; i += 1) {
					setIssueAssignedRolesColors(vm.issues[i]);
				}
			}
		}

		/**
		 * Define the assigned role colors for an issue
		 * Also set the pin colors
		 *
		 * @param issue
		 */
		function setIssueAssignedRolesColors (issue) {
			var i, length, roleColour, pinColours = [];

			issue.assignedRolesColors = [];
			for (i = 0, length = issue.assigned_roles.length; i < length; i += 1) {
				roleColour = IssuesService.getRoleColor(issue.assigned_roles[i]);
				issue.assignedRolesColors.push(roleColour);
				pinColours.push(IssuesService.hexToRgb(roleColour));
			}

			//IssuesService.changePinColour(issue._id, pinColours);
		}

		/*
		 * Get the user roles for the project
		 */
		projectUserRolesPromise = IssuesService.getUserRolesForProject();
		projectUserRolesPromise.then(function (data) {
			vm.projectUserRoles = data;
		});

		/*
		 * Handle toggle of adding a new issue
		 */
		$scope.$watch("vm.showAdd", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.showIssue = false;
				if (newValue) {
					vm.showIssueList = false;
					vm.showAddIssue = true;
					vm.onShowItem();
				} else {
					vm.showIssueList = true;
					vm.showAddIssue = false;
					removeAddPin();
				}
				setContentHeight();
			}
		});

		/*
		 * Handle input to the title field of a new issue
		 */
		$scope.$watch("vm.title", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.saveIssueDisabled = (newValue.toString() === "");
			}
		});

		/*
		 * Only watch for events when shown
		 */
		$scope.$watch("vm.show", function (newValue) {
			if (angular.isDefined(newValue)) {
				if (newValue) {
					setupEventWatch();
				}
				else if (angular.isDefined(eventWatch)) {
					eventWatch(); // Cancel event watching
				}
			}
		});

		/**
		 * Set up event watching
		 */
		function setupEventWatch () {
			eventWatch = $scope.$watch(EventService.currentEvent, function(event) {
				var i, length,
					position = [], normal = [];

				if ((event.type === EventService.EVENT.VIEWER.PICK_POINT) && vm.showAdd)
				{
					if (event.value.hasOwnProperty("id"))
					{
						// Remove pin from last position if it exists
						removeAddPin();

						selectedObjectId = event.value.id;

						// Convert data to arrays
						angular.forEach(event.value.position, function(value) {
							pickedPos = event.value.position;
							position.push(value);
						});
						angular.forEach(event.value.normal, function(value) {
							pickedNorm = event.value.normal;
							normal.push(value);
						});


						// Add pin
						IssuesService.addPin(
							{
								id: IssuesService.newPinId,
								position: position,
								norm: normal
							},
							IssuesService.hexToRgb(IssuesService.getRoleColor(vm.projectUserRoles[0]))
						);
					} else {
						removeAddPin();
					}
				} else if (event.type === EventService.EVENT.VIEWER.CLICK_PIN) {
					removeAddPin();

					// Show the selected issue
					for (i = 0, length = vm.issuesToShow.length; i < length; i += 1) {
						if (event.value.id === vm.issuesToShow[i]._id) {
							vm.showSelectedIssue(i, true);
							break;
						}
					}
				}
			});
		}

		/**
		 * Remove the temporary pin used for adding an issue
		 */
		function removeAddPin () {
			IssuesService.removePin(IssuesService.newPinId);
			selectedObjectId = null;
			pickedPos = null;
			pickedNorm = null;
		}

		/**
		 * Setup the issues to show
		 */
		function setupIssuesToShow () {
			var i = 0, j = 0, length = 0, roleAssigned;

			if (angular.isDefined(vm.issues)) {
				if (vm.issues.length > 0) {
					// Sort
					vm.issuesToShow = [vm.issues[0]];
					for (i = 1, length = vm.issues.length; i < length; i += 1) {
						for (j = 0, sortedIssuesLength = vm.issuesToShow.length; j < sortedIssuesLength; j += 1) {
							if (((vm.issues[i].created > vm.issuesToShow[j].created) && (sortOldestFirst)) ||
								((vm.issues[i].created < vm.issuesToShow[j].created) && (!sortOldestFirst))) {
								vm.issuesToShow.splice(j, 0, vm.issues[i]);
								break;
							}
							else if (j === (vm.issuesToShow.length - 1)) {
								vm.issuesToShow.push(vm.issues[i]);
							}
						}
					}

					// Filter text
					if (angular.isDefined(vm.filterText) && vm.filterText !== "") {

						// Helper function for searching strings
						var stringSearch = function(superString, subString)
						{
							return (superString.toLowerCase().indexOf(subString.toLowerCase()) !== -1);
						};

						vm.issuesToShow = ($filter('filter')(vm.issuesToShow, function(issue) {
							// Required custom filter due to the fact that Angular
							// does not allow compound OR filters
							var i;

							// Search the title
							var show = stringSearch(issue.title, vm.filterText);
							show = show || stringSearch(issue.timeStamp, vm.filterText);
							show = show || stringSearch(issue.owner, vm.filterText);

							// Search the list of assigned issues
							if (!show && issue.hasOwnProperty("assigned_roles"))
							{
								i = 0;
								while(!show && (i < issue.assigned_roles.length))
								{
									show = show || stringSearch(issue.assigned_roles[i], vm.filterText);
									i += 1;
								}
							}

							// Search the comments
							if (!show && issue.hasOwnProperty("comments"))
							{
								i = 0;

								while(!show && (i < issue.comments.length))
								{
									show = show || stringSearch(issue.comments[i].comment, vm.filterText);
									show = show || stringSearch(issue.comments[i].owner, vm.filterText);
									i += 1;
								}
							}

							return show;
						}));

						//{title : vm.filterText} || {comments: { comment : vm.filterText }} ));
					}

					// Don't show issues assigned to certain roles
					if (rolesToFilter.length > 0) {
						i = 0;
						while(i < vm.issuesToShow.length) {
							roleAssigned = false;

							if (vm.issuesToShow[i].hasOwnProperty("assigned_roles")) {
								for (j = 0, length = vm.issuesToShow[i].assigned_roles.length; j < length; j += 1) {
									if (rolesToFilter.indexOf(vm.issuesToShow[i].assigned_roles[j]) !== -1) {
										roleAssigned = true;
									}
								}
							}

							if (roleAssigned) {
								vm.issuesToShow.splice(i, 1);
							} else {
								i += 1;
							}
						}
					}

					// Closed
					for (i = (vm.issuesToShow.length - 1); i >= 0; i -= 1) {
						if (!showClosed && vm.issuesToShow[i].hasOwnProperty("closed") && vm.issuesToShow[i].closed) {
							vm.issuesToShow.splice(i, 1);
						}
					}
				}
			}
		}

		/**
		 * The roles assigned to the issue have been changed
		 */
		vm.issueAssignChange = function () {
			setIssueAssignedRolesColors(vm.selectedIssue);
			vm.showPins();
		};

		/**
		 * Add issue pins to the viewer
		 */
		vm.showPins = function () {
			var i, j, length, assignedRolesLength,
				pin, pinData, pinColor, pinMaterial,
				roleAssigned;

			for (i = 0, length = vm.issues.length; i < length; i += 1) {
				pin = angular.element(document.getElementById(vm.issues[i]._id));
				if (pin.length > 0) {
					// Existing pin
					pin[0].setAttribute("render", "true");

					// Closed
					if (!showClosed && vm.issues[i].hasOwnProperty("closed") && vm.issues[i].closed) {
						pin[0].setAttribute("render", "false");
					}

					// Role filter
					if (rolesToFilter.length > 0) {
						roleAssigned = false;

						if (vm.issues[i].hasOwnProperty("assigned_roles")) {
							for (j = 0, assignedRolesLength = vm.issues[i].assigned_roles.length; j < assignedRolesLength; j += 1) {
								if (rolesToFilter.indexOf(vm.issues[i].assigned_roles[j]) !== -1) {
									roleAssigned = true;
								}
							}
						}

						if (roleAssigned) {
							pin[0].setAttribute("render", "false");
						}
					}
				}
				else {
					// New pin
					if (!vm.issues[i].hasOwnProperty("closed") ||
						(vm.issues[i].hasOwnProperty("closed") && !vm.issues[i].closed) ||
						(showClosed && vm.issues[i].hasOwnProperty("closed") && vm.issues[i].closed)) {
						pinData =
							{
								id: vm.issues[i]._id,
								position: vm.issues[i].position,
								norm: vm.issues[i].norm
							};

						if (vm.issues[i].hasOwnProperty("assigned_roles") && vm.issues[i].assigned_roles.length > 0) {
							pinColor = IssuesService.hexToRgb(IssuesService.getRoleColor(vm.issues[i].assigned_roles[0]));
						}
						else {
							pinColor = [1.0, 1.0, 1.0];
						}
						
						IssuesService.addPin(pinData, pinColor, vm.issues[i].viewpoint);
					}
				}
			}
		};

		/*
		 * Selecting a menu option
		 */
		$scope.$watch("vm.selectedMenuOption", function (newValue) {
			var role, roleIndex;
			if (angular.isDefined(newValue)) {
				if (newValue.value === "sortByDate") {
					sortOldestFirst = !sortOldestFirst;
				}
				else if (newValue.value === "showClosed") {
					showClosed = !showClosed;
				}
				else if (newValue.value.indexOf("filterRole") !== -1) {
					role = newValue.value.split("_")[1];
					roleIndex = rolesToFilter.indexOf(role);
					if (roleIndex !== -1) {
						rolesToFilter.splice(roleIndex, 1);
					}
					else {
						rolesToFilter.push(role);
					}
				}
				setupIssuesToShow();
				setContentHeight();
				vm.showPins();
			}
		});

		/*
		 * Handle changes to the filter input
		 */
		$scope.$watch("vm.filterText", function (newValue) {
			if (angular.isDefined(newValue)) {
				setupIssuesToShow();

				// Set the height of the content
				if (vm.issuesToShow.length === 0) {
					vm.showIssuesInfo = true;
					vm.issuesInfo = "There are no issues that contain the filter text";
				}
				else {
					vm.showIssuesInfo = false;
					setContentHeight();
				}
			}
		});

		/*
		 * Handle parent notice to hide a selected issue or add issue
		 */
		$scope.$watch("vm.hideItem", function (newValue) {
			if (angular.isDefined(newValue) && newValue) {
				vm.autoSaveComment = true; // Auto save a comment if needed

				$timeout(function () {
					// Hide and show layers
					vm.showIssue = false;
					vm.showIssueList = true;
					vm.showAddIssue = false;
					vm.showAdd = false; // So that showing add works

					// Set the content height
					setContentHeight();

					// Deselect any selected pin
					EventService.send(EventService.EVENT.VIEWER.CLICK_PIN, {id: null});
				});
			}
		});

		/**
		 * Make the selected issue fill the content and notify the parent
		 *
		 * @param {Number} index
		 * @param {Boolean} pinSelect - whether called by a pin selection or not
		 */
		vm.showSelectedIssue = function (index, pinSelect) {
			// Hide and show layers
			vm.showIssueList = false;
			vm.showIssue = true;
			vm.showAddIssue = false;
			vm.showAdd = false; // So that showing add works

			// Selected issue
			if (vm.selectedIssue !== null) {
				vm.selectedIssue.selected = false;
			}
			vm.selectedIssue = vm.issuesToShow[index];
			vm.selectedIssue.selected = true;
			vm.selectedIssue.showInfo = false;

			vm.autoSaveComment = false; // So that the request to auto save a comment will fire

			// Show the issue
			vm.onShowItem();

			// Set the content height
			setContentHeight();

			// Select the pin
			if (!pinSelect) {
				EventService.send(EventService.EVENT.VIEWER.CLICK_PIN, {id: vm.issuesToShow[index]._id});
			}
		};

		/**
		 * Save an issue
		 */
		vm.saveIssue = function () {
			if (vm.projectUserRoles.length === 0) {
				vm.showAlert("You do not have permission to save an issue");
			}
			else {
				if (angular.isDefined(vm.title) && (vm.title !== "")) {
					if (selectedObjectId === null) {
						vm.showAlert("Add a pin before saving");
					}
					else {
						issue = {
							name: vm.title,
							objectId: selectedObjectId,
							pickedPos: pickedPos,
							pickedNorm: pickedNorm,
							creator_role: vm.projectUserRoles[0]
						};
						promise = IssuesService.saveIssue(issue);
						promise.then(function (data) {
							vm.issues.push(data);

							vm.title = "";
							selectedObjectId = null;
							pickedPos = null;
							pickedNorm = null;

							if (angular.isDefined(vm.comment) && (vm.comment !== "")) {
								saveCommentWithIssue(data, vm.comment);
								vm.comment = "";
							}

							setupIssuesToShow();
							setContentHeight();
							vm.showPins();

							//vm.showAddIssue = false;
						});
					}
				}
			}
		};

		/**
		 * Toggle the closed status of an issue
		 *
		 * @param {Object} issue
		 */
		vm.toggleCloseIssue = function (issue) {
			var i = 0,
				length = 0;

			promise = IssuesService.toggleCloseIssue(issue);
			promise.then(function (data) {
				for (i = 0, length = vm.issues.length; i < length; i += 1) {
					if (issue._id === vm.issues[i]._id) {
						vm.issues[i].closed = data.issue.closed;
						//vm.issues[i].closed_time = data.created; // TODO: Shouldn't really use the created value
						break;
					}
				}
				setupIssuesToShow();
				vm.showPins();
				setContentHeight();
			});
		};

		/**
		 * Save a comment at the same time as creating a new issue
		 *
		 * @param {Object} issue
		 * @param {String} comment
		 */
		function saveCommentWithIssue (issue, comment) {
			promise = IssuesService.saveComment(issue, comment);
			promise.then(function (data) {
				vm.issues[vm.issues.length - 1].comments = [
					{
						owner: data.owner,
						comment: comment,
						timeStamp: IssuesService.getPrettyTime(data.created)
					}
				];
			});
		}

		/**
		 * Show an issue alert
		 *
		 * @param {String} title
		 */
		vm.showAlert = function(title) {
			$mdDialog.show(
				$mdDialog.alert()
					.parent(angular.element($element[0].querySelector("#issuesAddContainer")))
					.clickOutsideToClose(true)
					.title(title)
					.ariaLabel("Pin alert")
					.ok("OK")
			);
		};

		/**
		 * A comment has been auto saved
		 */
		vm.commentAutoSaved = function () {
			vm.infoText = "Comment on issue #" + vm.selectedIssue.title + " auto-saved";
			vm.selectedIssue.showInfo = true;
			vm.infoTimeout = $timeout(function() {
				vm.selectedIssue.showInfo = false;
			}, 4000);
		};

		/**
		 * Hide issue info
		 */
		vm.hideInfo = function() {
			vm.selectedIssue.showInfo = false;
			$timeout.cancel(vm.infoTimeout);
		};

		/**
		 * Set the content height.
		 */
		function setContentHeight () {
			var i,
				length,
				issueMinHeight = 56,
				maxStringLength = 32,
				lineHeight = 18,
				footerHeight,
				addHeight = 260,
				commentHeight = 80,
				headerHeight = 53,
				openIssueFooterHeight = 163,
				closedIssueFooterHeight = 48;

			if (vm.showIssueList) {
				issuesHeight = 0;
				for (i = 0, length = vm.issuesToShow.length; (i < length); i += 1) {
					issuesHeight += issueMinHeight;
					if (vm.issuesToShow[i].title.length > maxStringLength) {
						issuesHeight += lineHeight * Math.floor((vm.issuesToShow[i].title.length - maxStringLength) / maxStringLength);
					}
				}
				vm.onContentHeightRequest({height: issuesHeight});
			}
			else if (vm.showIssue) {
				if (vm.selectedIssue.closed) {
					footerHeight = closedIssueFooterHeight;
				}
				else {
					footerHeight = openIssueFooterHeight;
				}
				vm.onContentHeightRequest({height: headerHeight + (vm.selectedIssue.comments.length * commentHeight) + footerHeight});
			}
			else if (vm.showAddIssue) {
				vm.onContentHeightRequest({height: addHeight});
			}
		}
	}
}());

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

(function() {
	"use strict";

	angular.module("3drepo")
		.factory("IssuesService", IssuesService);

	IssuesService.$inject = ["$http", "$q", "StateManager", "serverConfig", "EventService", "Auth"];

	function IssuesService($http, $q, StateManager, serverConfig, EventService, Auth) {
		var state = StateManager.state,
			url = "",
			data = {},
			config = {},
			i, j = 0,
			numIssues = 0,
			numComments = 0,
			availableRoles = [],
			userRoles = [],
			obj = {},
			newPinId = "newPinId";

		// TODO: Internationalise and make globally accessible
		obj.getPrettyTime = function(time) {
			var date = new Date(time),
				currentDate = new Date(),
				prettyTime,
				postFix,
				hours,
				monthToText = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

			if ((date.getFullYear() === currentDate.getFullYear()) &&
				(date.getMonth() === currentDate.getMonth()) &&
				(date.getDate() === currentDate.getDate())) {
				hours = date.getHours();
				if (hours > 11) {
					postFix = " PM";
					if (hours > 12) {
						hours -= 12;
					}
				} else {
					postFix = " AM";
					if (hours === 0) {
						hours = 12;
					}
				}

				prettyTime = hours + ":" + ("0" + date.getMinutes()).slice(-2) + postFix;
			} else if (date.getFullYear() === currentDate.getFullYear()) {
				prettyTime = date.getDate() + " " + monthToText[date.getMonth()];
			} else {
				prettyTime = monthToText[date.getMonth()] + " '" + (date.getFullYear()).toString().slice(-2);
			}

			return prettyTime;
		};

		var generateTitle = function(issue) {
			if (issue.typePrefix) {
				return issue.typePrefix + "." + issue.number + " " + issue.name;
			} else {
				return issue.number + " " + issue.name;
			}
		};

		obj.getIssues = function() {
			var self = this,
				deferred = $q.defer();
			url = serverConfig.apiUrl(state.account + '/' + state.project + '/issues.json');

			$http.get(url)
				.then(
					function(data) {
						deferred.resolve(data.data);
						for (i = 0, numIssues = data.data.length; i < numIssues; i += 1) {
							data.data[i].timeStamp = self.getPrettyTime(data.data[i].created);

							if (data.data[i].hasOwnProperty("comments")) {
								for (j = 0, numComments = data.data[i].comments.length; j < numComments; j += 1) {
									if (data.data[i].comments[j].hasOwnProperty("created")) {
										data.data[i].comments[j].timeStamp = self.getPrettyTime(data.data[i].comments[j].created);
									}
								}
							}

							data.data[i].title = generateTitle(data.data[i]);
						}
					},
					function() {
						deferred.resolve([]);
					}
				);

			return deferred.promise;
		};

		obj.saveIssue = function(issue) {
			var self = this,
				dataToSend,
				deferred = $q.defer();

			url = serverConfig.apiUrl(issue.account + "/" + issue.project + "/issues/" + issue.objectId);

			// viewpoint previously was set to ViewerService.defaultViewer.getCurrentViewpointInfo()
			data = {
				name: issue.name,
				viewpoint: null,
				scale: 1.0,
				creator_role: issue.creator_role,
				assigned_roles: userRoles
			};
			config = {
				withCredentials: true
			};

			if (issue.pickedPos !== null) {
				data.position = issue.pickedPos.toGL();
				data.norm = issue.pickedNorm.toGL();
			}

			dataToSend = {
				data: JSON.stringify(data)
			};

			$http.post(url, dataToSend, config)
				.then(function successCallback(response) {
					response.data.issue._id = response.data.issue_id;
					response.data.issue.account = state.account;
					response.data.issue.project = state.project;
					response.data.issue.timeStamp = self.getPrettyTime(response.data.issue.created);
					response.data.issue.creator_role = issue.creator_role;

					response.data.issue.title = generateTitle(response.data.issue);
					self.removePin();
					deferred.resolve(response.data.issue);
				});

			return deferred.promise;
		};

		function doPost(issue, data) {
			var deferred = $q.defer();
			url = serverConfig.apiUrl(issue.account + "/" + issue.project + "/issues/" + issue.parent);
			config = {
				withCredentials: true
			};
			data._id = issue._id;
			$http.post(url, {
					data: JSON.stringify(data)
				}, config)
				.then(function(response) {
					deferred.resolve(response.data);
				});
			return deferred.promise;
		}

		obj.toggleCloseIssue = function(issue) {
			var closed = true;
			if (issue.hasOwnProperty("closed")) {
				closed = !issue.closed;
			}
			return doPost(issue, {
				closed: closed,
				number: issue.number
			});
		};

		obj.assignIssue = function(issue) {
			return doPost(issue, {
				assigned_roles: issue.assigned_roles,
				number: issue.number
			});
		};

		obj.saveComment = function(issue, comment) {
			return doPost(issue, {
				comment: comment,
				number: issue.number
			});
		};

		obj.editComment = function(issue, comment, commentIndex) {
			return doPost(issue, {
				comment: comment,
				number: issue.number,
				edit: true,
				commentIndex: commentIndex
			});
		};

		obj.deleteComment = function(issue, index) {
			return doPost(issue, {
				comment: "",
				number: issue.number,
				delete: true,
				commentCreated: issue.comments[index].created
			});
		};

		obj.setComment = function(issue, commentIndex) {
			return doPost(issue, {
				comment: "",
				number: issue.number,
				set: true,
				commentIndex: commentIndex
			});
		};

		obj.addPin = function (pin, colours, viewpoint) {
			EventService.send(EventService.EVENT.VIEWER.ADD_PIN, {
				id: pin.id,
				account: state.account,
				project: state.project,
				position: pin.position,
				norm: pin.norm,
				colours: colours,
				viewpoint: viewpoint
			});
		};

		obj.removePin = function (id) {
			EventService.send(EventService.EVENT.VIEWER.REMOVE_PIN, {
				id: id
			});
		};

		obj.fixPin = function (pin, colours) {
			var self = this;
			self.removePin();

			EventService.send(EventService.EVENT.VIEWER.ADD_PIN, {
				id: newPinId,
				position: pin.position,
				norm: pin.norm,
				colours: colours
			});
		};

		obj.getRoles = function() {
			var deferred = $q.defer();
			url = serverConfig.apiUrl(state.account + '/' + state.project + '/roles.json');

			$http.get(url)
				.then(
					function(data) {
						availableRoles = data.data;
						deferred.resolve(availableRoles);
					},
					function() {
						deferred.resolve([]);
					}
				);

			return deferred.promise;
		};

		obj.getUserRolesForProject = function() {
			var deferred = $q.defer();
			url = serverConfig.apiUrl(state.account + "/" + state.project + "/" + Auth.username + "/userRolesForProject.json");

			$http.get(url)
				.then(
					function(data) {
						userRoles = data.data;
						deferred.resolve(userRoles);
					},
					function() {
						deferred.resolve([]);
					}
				);

			return deferred.promise;
		};

		obj.hexToRgb = function(hex) {
			// If nothing comes end, then send nothing out.
			if (typeof hex === "undefined") {
				return undefined;
			}

			var hexColours = [];

			if (hex.charAt(0) === "#") {
				hex = hex.substr(1);
			}

			if (hex.length === 6) {
				hexColours.push(hex.substr(0, 2));
				hexColours.push(hex.substr(2, 2));
				hexColours.push(hex.substr(4, 2));
			} else if (hex.length === 3) {
				hexColours.push(hex.substr(0, 1) + hex.substr(0, 1));
				hexColours.push(hex.substr(1, 1) + hex.substr(1, 1));
				hexColours.push(hex.substr(2, 1) + hex.substr(2, 1));
			} else {
				hexColours = ["00", "00", "00"];
			}

			return [(parseInt(hexColours[0], 16) / 255.0), (parseInt(hexColours[1], 16) / 255.0), (parseInt(hexColours[2], 16) / 255.0)];
		};

		obj.getRoleColor = function(role) {
			var i = 0,
				length = 0,
				roleColor;

			if (availableRoles.length > 0) {
				for (i = 0, length = availableRoles.length; i < length; i += 1) {
					if (availableRoles[i].role === role) {
						roleColor = availableRoles[i].color;
						break;
					}
				}
			}
			return roleColor;
		};

		Object.defineProperty(
			obj,
			"newPinId",
			{
				get: function () {return newPinId;}
			}
		);

		return obj;
	}
}());
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

angular.module('3drepo')
.config([
'$stateProvider',
'parentStates',
function($stateProvider, parentStates) {
	var states = parentStates["login"];

	for(var i = 0; i < states.length; i++) {
		$stateProvider
		.state(states[i] + '.login', {
			url: '/',
			views: {
				"@" : {
					template: '<login></login>'
				}
			}
		})
	}
}])
.run(['StateManager', function(StateManager) {
	StateManager.registerPlugin('login', null, function () {
		return "login";
	});
}]);


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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("login", login);

	function login() {
		return {
			restrict: 'EA',
			templateUrl: 'login.html',
			scope: {},
			controller: LoginCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	LoginCtrl.$inject = ["StateManager", "Auth", "serverConfig"];

	function LoginCtrl(StateManager, Auth, serverConfig) {
		var vm = this;

		vm.user = { username: "", password: ""};
		vm.version = serverConfig.apiVersion;
		vm.backgroundImage = serverConfig.backgroundImage;
		vm.logo = "/public/images/3drepo-logo-white.png";

		vm.login = function() {
			Auth.login(vm.user.username, vm.user.password).then(
				function (username) {
					vm.errorMessage = null;
					vm.user.username = null;
					vm.user.password = null;
					StateManager.setStateVar("account", username);
					StateManager.updateState();
				}, function (reason) {
					vm.errorMessage = reason;
					vm.user.password = null;
					StateManager.setStateVar("account", null);
					StateManager.updateState();
				}
			);
		};
	}
}());

/**
 **  Copyright (C) 2014 3D Repo Ltd
 **
 **  This program is free software: you can redistribute it and/or modify
 **  it under the terms of the GNU Affero General Public License as
 **  published by the Free Software Foundation, either version 3 of the
 **  License, or (at your option) any later version.
 **
 **  This program is distributed in the hope that it will be useful,
 **  but WITHOUT ANY WARRANTY; without even the implied warranty of
 **  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 **  GNU Affero General Public License for more details.
 **
 **  You should have received a copy of the GNU Affero General Public License
 **  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/

var Oculus = {};

(function() {
	"use strict";

	Oculus = function(viewer) {
		var self = this;

		this.leftTex	= null;
		this.rightTex	= null;

		this.lastW		= null;
		this.lastH		= null;

		this.vrHMD		= null;
		this.vrSensor	= null;

		this.IPD		= 0.01;

		this.enabled	= false;

		this.oculus		= null;

		this.viewer		= viewer;
		
		this.addInstructions = function() {
			
			var instruction = document.createElement("div");
			instruction.setAttribute("id", "instructionCircle");
			self.viewer.element.appendChild(instruction);
	
			instruction.addEventListener("click", function() {
				self.viewer.switchFullScreen(self.vrHMD);
				instruction.style.display = "none";
			});
			
			var instructionImage = document.createElement("img");
			instructionImage.setAttribute("id", "instructionImage");
			instructionImage.setAttribute("src", "public/plugins/walkthroughVr/instruction_trans.gif");
			instruction.appendChild(instructionImage);
			
			var instructionOK = document.createElement("div");
			instructionOK.setAttribute("id", "instructionOK");
			instructionOK.textContent = "OK";		
			instruction.appendChild(instructionOK);
		};

		this.switchVR = function()
		{
			var scene = self.viewer.scene;

			if (!this.enabled)
			{
				self.addInstructions();
				
				// Add oculus eyes
				var eyeGroup = document.createElement("group");
				eyeGroup.setAttribute("def", "oculus");
				eyeGroup.setAttribute("render", "false");
				this.oculus = eyeGroup;

				var leftEye = document.createElement("group");
				leftEye.setAttribute("def", "left");
				//leftEye.setAttribute("render", "false");
				eyeGroup.appendChild(leftEye);

				var leftShape = document.createElement("shape");
				leftShape.setAttribute("isPickable", "false");
				leftEye.appendChild(leftShape);

				var leftApp = document.createElement("appearance");
				leftShape.appendChild(leftApp);

				self.leftTex = document.createElement("renderedtexture");
				self.leftTex.setAttribute("id", "rtLeft");
				self.leftTex.setAttribute("stereoMode", "LEFT_EYE");
				self.leftTex.setAttribute("update", "ALWAYS");
				self.leftTex.setAttribute("oculusRiftVersion", "2");
				//leftTex.setAttribute("dimensions", "980 1080 3");
				self.leftTex.setAttribute("repeatS", "false");
				self.leftTex.setAttribute("repeatT", "false");
				self.leftTex.setAttribute("interpupillaryDistance", this.IPD);
				leftApp.appendChild(self.leftTex);

				var leftVP = document.createElement("viewpoint");
				if (self.viewer.getCurrentViewpoint() !== null) {
					leftVP.setAttribute("use", self.viewer.getCurrentViewpoint().getAttribute("id"));
				}
				leftVP.setAttribute("containerfield", "viewpoint");
				leftVP.textContent = " ";
				self.leftTex.appendChild(leftVP);

				var leftBground = document.createElement("background");
				leftBground.setAttribute("use", "viewer_bground");
				leftBground.setAttribute("containerfield", "background");
				leftBground.textContent = " ";
				self.leftTex.appendChild(leftBground);

				var leftScene = document.createElement("group");
				leftScene.setAttribute("USE", "root");
				leftScene.setAttribute("containerfield", "scene");
				self.leftTex.appendChild(leftScene);

				var leftPlane = document.createElement("plane");
				leftPlane.setAttribute("solid", "false");
				leftShape.appendChild(leftPlane);

				// Right eye
				var rightEye = document.createElement("group");
				rightEye.setAttribute("def", "right");
				//rightEye.setAttribute("render", "false");
				eyeGroup.appendChild(rightEye);

				var rightShape = document.createElement("shape");
				rightShape.setAttribute("isPickable", "false");
				rightEye.appendChild(rightShape);

				var rightApp = document.createElement("appearance");
				rightShape.appendChild(rightApp);

				self.rightTex = document.createElement("renderedtexture");
				self.rightTex.setAttribute("id", "rtRight");
				self.rightTex.setAttribute("stereoMode", "RIGHT_EYE");
				self.rightTex.setAttribute("update", "ALWAYS");
				self.rightTex.setAttribute("oculusRiftVersion", "2");
				//rightTex.setAttribute("dimensions", "980 1080 3");
				self.rightTex.setAttribute("repeatS", "false");
				self.rightTex.setAttribute("repeatT", "false");
				self.rightTex.setAttribute("interpupillaryDistance", this.IPD);
				rightApp.appendChild(self.rightTex);

				var rightPlane = document.createElement("plane");
				rightPlane.setAttribute("solid", "false");
				rightShape.appendChild(rightPlane);

				var rightVP = document.createElement("viewpoint");
				if (self.viewer.getCurrentViewpoint() !== null) {
					rightVP.setAttribute("use", self.viewer.getCurrentViewpoint().getAttribute("id"));
				}
				rightVP.setAttribute("containerfield", "viewpoint");
				rightVP.textContent = " ";
				self.rightTex.appendChild(rightVP);

				var rightBground = document.createElement("background");
				rightBground.setAttribute("use", "viewer_bground");
				rightBground.setAttribute("containerfield", "background");
				rightBground.textContent = " ";
				self.rightTex.appendChild(rightBground);

				var rightScene = document.createElement("group");
				rightScene.setAttribute("use", "root");
				rightScene.setAttribute("containerfield", "scene");
				rightScene.textContent = " ";
				self.rightTex.appendChild(rightScene);

				scene.appendChild(eyeGroup);

				// Should this be in a setTimeout
				leftShape._x3domNode._graph.needCulling = false;
				rightShape._x3domNode._graph.needCulling = false;
				eyeGroup._x3domNode._graph.needCulling = false;
				//leftPlane._x3domNode._graph.needCulling = false;
				//rightPlane._x3domNode._graph.needCulling = false;

				//self.viewer.setGyroscopeStart();
				self.startVR();

				// Enable EXAMINE mode for compatibility with gyro
				self.oldNavMode = self.viewer.nav.getAttribute("type");
				self.viewer.nav.setAttribute("type", "EXAMINE");
				
				self.viewer.getScene()._x3domNode._nameSpace.doc.canvas.isMulti = true;

				this.oldNavMode = self.viewer.currentNavMode;
				self.viewer.setNavMode(self.viewer.NAV_MODES.FLY);
				
				this.enabled = true;
				
				self.viewer.removeLogo();
			} else {
				this.oculus.parentNode.removeChild(this.oculus);

				this.leftTex	= null;
				this.rightTex	= null;

				this.lastW		= null;
				this.lastH		= null;

				//this.vrHMD		= null;
				//this.vrSensor	= null;

				this.IPD		= 0.0064;

				this.enabled	= false;

				this.oculus		= null;

				this.enabled = false;

				self.viewer.runtime.enterFrame = function () {};
				self.viewer.runtime.exitFrame = function () {};

				self.viewer.getViewArea().skipSceneRender = null;

				self.viewer.nav.setAttribute("type", self.oldNavMode);
				self.oldNavMode = null;
				
				self.viewer.getScene()._x3domNode._nameSpace.doc.canvas.isMulti = false;
				self.viewer.createBackground();
				self.viewer.setNavMode(this.oldNavMode);
				
				self.viewer.addLogo();
			}
		};

		this.startVR = function () {
			self.lastW		= self.viewer.runtime.getWidth();
			self.lastH		= self.viewer.runtime.getHeight();

			self.viewpoint	= self.viewer.viewpoint;

			self.viewer.getViewArea().skipSceneRender = true;

			self.gyroOrientation = null;

			// This code handles gyroscopic sensors on a phone
			if(window.DeviceOrientationEvent){
				window.addEventListener("deviceorientation", function (event) {
					self.gyroOrientation = event;
				}, false);
			}

			self.viewer.runtime.enterFrame = function () {
				if (self.gyroOrientation)
				{
					self.viewer.gyroscope(
						self.gyroOrientation.alpha,
						self.gyroOrientation.beta,
						self.gyroOrientation.gamma
					);

					self.gyroOrientation = null;
				} else if (self.vrSensor) {
					var state = self.vrSensor.getState();
					var h     = state.orientation;

					if (h)
					{
						var vp     = self.viewer.getCurrentViewpoint()._x3domNode;
						var flyMat = vp.getViewMatrix().inverse();
						var q      = new x3dom.fields.Quaternion(h.x, h.y, h.z, h.w);

						flyMat.setRotate(q);
						vp.setView(flyMat.inverse());
					}
				}
			};

			self.viewer.runtime.exitFrame = function ()
			{

				var w = self.viewer.runtime.getWidth() * (window.devicePixelRatio ? window.devicePixelRatio : 1);
				var h = self.viewer.runtime.getHeight() * (window.devicePixelRatio ? window.devicePixelRatio : 1);

				
				// The image should be split across the longest dimension of the screen
				var rotate = (h > w);

				if (rotate)
				{
					self.viewer.runtime.canvas.doc.ctx.stateManager.viewport(0,h / 2.0,w,h);
					self.viewer.viewer.runtime.canvas.doc._scene._fgnd._webgl.render(self.viewer.viewer.runtime.canvas.doc.ctx.ctx3d, self.leftTex._x3domNode._webgl.fbo.tex);

					self.viewer.runtime.canvas.doc.ctx.stateManager.viewport(0,0,w,h / 2.0);
					self.viewer.viewer.runtime.canvas.doc._scene._fgnd._webgl.render(self.viewer.viewer.runtime.canvas.doc.ctx.ctx3d, self.rightTex._x3domNode._webgl.fbo.tex);
				} else {
					self.viewer.runtime.canvas.doc.ctx.stateManager.viewport(0,0,w / 2.0,h);
					self.viewer.viewer.runtime.canvas.doc._scene._fgnd._webgl.render(self.viewer.viewer.runtime.canvas.doc.ctx.ctx3d, self.leftTex._x3domNode._webgl.fbo.tex);

					self.viewer.runtime.canvas.doc.ctx.stateManager.viewport(w / 2,0,w / 2,h);
					self.viewer.viewer.runtime.canvas.doc._scene._fgnd._webgl.render(self.viewer.viewer.runtime.canvas.doc.ctx.ctx3d, self.rightTex._x3domNode._webgl.fbo.tex);
				}
				
				if (w !== self.lastW || h !== self.lastH)
				{
					var half = 0;

					half = Math.round(w / 2);

					self.leftTex.setAttribute("dimensions", half + " " + h + " 4");
					self.rightTex.setAttribute("dimensions", half + " " + h + " 4");

					self.lastW = w;
					self.lastH = h;
				}


				self.viewer.runtime.triggerRedraw();

			};
		};

		this.changeIPD = function(newIPD) {
			self.leftTex.setAttribute("interpupillaryDistance", newIPD);
			self.rightTex.setAttribute("interpupillaryDistance", newIPD);
		};

		this.peturbIPD = function(peturbation) {
			var oldDistance = parseFloat(self.leftTex.getAttribute("interpupillaryDistance"));
			this.changeIPD(oldDistance + peturbation);
		};

		this.exitFullscreen = function() {
			//self.instruction.style.display = "none";			
			/*
			if (!document.webkitIsFullScreen && !document.msFullscreenElement && !document.mozFullScreen && self.enabled) {
				self.switchVR();
			}
			*/
		};

		this.createFullscreenExit = function () {
			document.addEventListener("webkitfullscreenchange", self.exitFullscreen, false);
			document.addEventListener("mozfullscreenchange", self.exitFullscreen, false);
			document.addEventListener("fullscreenchange", self.exitFullscreen, false);
			document.addEventListener("MSFullscreenChange", self.exitFullscreen, false);
		};

		this.init = function(vrdevs) {
			var i;

			// First, find a HMD -- just use the first one we find
			for (i = 0; i < vrdevs.length; ++i) {
				if (vrdevs[i] instanceof HMDVRDevice) {
					self.vrHMD = vrdevs[i];
					break;
				}
			}

			if (!self.vrHMD) {
				return;
			}

			// Then, find that HMD"s position sensor
			for (i = 0; i < vrdevs.length; ++i) {
				if (vrdevs[i] instanceof PositionSensorVRDevice && vrdevs[i].hardwareUnitId === self.vrHMD.hardwareUnitId) {
					self.vrSensor = vrdevs[i];
					break;
				}
			}

			if (!self.vrHMD || !self.vrSensor) {
				console.error("No HMD found");
				return;
			}
		};

		if (navigator.getVRDevices) {
			navigator.getVRDevices().then(this.init);
		}

		this.createFullscreenExit();
		//http://blog.tojicode.com/2014/07/bringing-vr-to-chrome.html
		//http://blog.bitops.com/blog/2014/08/20/updated-firefox-vr-builds/
	};
}());

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

(function () {
    "use strict";

    angular.module("3drepo")
        .directive("panelCard", panelCard);

    function panelCard() {
        return {
            restrict: 'E',
            templateUrl: 'panelCard.html',
            scope: {
                position: "=",
                contentData: "=",
				onHeightRequest: "&",
				onShowFilter: "&"
            },
            controller: PanelCardCtrl,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    PanelCardCtrl.$inject = ["$scope", "$element", "$compile"];

    function PanelCardCtrl($scope, $element, $compile) {
        var vm = this,
            filter = null,
			contentHeight;

        vm.showHelp = false;
		vm.showFilter = false;
		vm.addStatus = false;
		vm.visibleStatus = false;
		vm.showClearFilterButton = false;

		/*
		 * Watch type on contentData to create content and tool bar options
		 */
		$scope.$watch("vm.contentData.type", function (newValue) {
			if (angular.isDefined(newValue)) {
				createCardContent();
				createToolbarOptions();
				createFilter();
				vm.statusIcon = vm.contentData.icon;
			}
		});

		/**
		 * Create the card content
		 */
		function createCardContent () {
			var i, length,
				content = angular.element($element[0].querySelector('#content')),
				contentItem,
				element;

			element =
				"<" + vm.contentData.type + " " +
				"show='vm.contentData.show' " +
				"on-content-height-request='vm.onContentHeightRequest(height)' " +
				"on-show-item='vm.showItem()' " +
				"hide-item='vm.hideSelectedItem' ";

			// Only add attributes when needed
			for (i = 0, length = vm.contentData.options.length; i < length; i += 1) {
				switch (vm.contentData.options[i]) {
					case "filter":
						element += "filter-text='vm.filterText' ";
						break;
					case "add":
						element += "show-add='vm.showAdd' ";
						break;
					case "visible":
						element += "visible='vm.visible' ";
						break;
					case "menu":
						element += "selected-menu-option='vm.selectedMenuOption' ";
						break;
				}
			}

			element += "></" + vm.contentData.type + ">";

			contentItem = angular.element(element);
			content.append(contentItem);
			$compile(contentItem)($scope);
		}

		/**
		 * Create the tool bar options
		 */
		function createToolbarOptions () {
			var i,
				length,
				options = angular.element($element[0].querySelector('#options')),
				option;

			for (i = 0, length = vm.contentData.options.length; i < length; i += 1) {
				option = null;
				switch (vm.contentData.options[i]) {
					case "filter":
						option = angular.element(
							"<panel-card-option-filter show-filter='vm.showFilter'></panel-card-option-filter>"
						);
						break;

					case "add":
						option = angular.element(
							"<panel-card-option-add show-add='vm.showAdd'></panel-card-option-add>"
						);
						break;

					case "print":
						option = angular.element(
							"<panel-card-option-print></panel-card-option-print>"
						);
						break;

					case "visible":
						option = angular.element(
							"<panel-card-option-visible visible='vm.visible'></panel-card-option-visible>"
						);
						break;

					case "menu":
						option = angular.element(
							"<panel-card-option-menu menu='vm.contentData.menu' selected-menu-option='vm.selectedMenuOption'></panel-card-option-menu>"
						);
						break;
				}

				// Create the element
				if (option !== null) {
					options.append(option);
					$compile(option)($scope);
				}
			}
		}

		/**
		 * Create the filter element
		 */
		function createFilter () {
			var filterContainer = angular.element($element[0].querySelector('#filterContainer')),
				filter;
			if (vm.contentData.options.indexOf("filter") !== -1) {
				filter = angular.element(
					"<panel-card-filter show-filter='vm.showFilter' filter-text='vm.filterText'></panel-card-filter>"
				);
				filterContainer.append(filter);
				$compile(filter)($scope);
			}
		}

		/**
		 * A content item is requesting a height change
		 * @param height
		 */
		vm.onContentHeightRequest = function (height) {
			contentHeight = height;
			vm.onHeightRequest({contentItem: vm.contentData, height: contentHeight});
		};

		/**
		 * Content wants to show an individual item
		 */
		vm.showItem = function () {
			vm.statusIcon = "fa-arrow-left";
			vm.hideSelectedItem = false; // So that a change to this value is propagated
		};

		/**
		 * Content wants to show it's main content
		 */
		vm.hideItem = function () {
			vm.statusIcon = vm.contentData.icon;
			vm.hideSelectedItem = true;
			vm.addStatus = false;
		};
	}
}());

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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("panelCardFilter", panelCardFilter);

	function panelCardFilter() {
		return {
			restrict: 'E',
			templateUrl: 'panelCardFilter.html',
			scope: {
				showFilter: "=",
				filterText: "="
			},
			controller: PanelCardFilterCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	PanelCardFilterCtrl.$inject = ["$scope", "$timeout"];

	function PanelCardFilterCtrl ($scope, $timeout) {
		var vm = this,
			filterTimeout = null;

		vm.clearFilter = function () {
			vm.filterInputText = "";
		};

		$scope.$watch("vm.filterInputText", function (newValue) {
			if (angular.isDefined(newValue)) {
				if (filterTimeout !== null) {
					$timeout.cancel(filterTimeout);
				}
				filterTimeout = $timeout(function() {
					vm.filterText = vm.filterInputText;
					vm.showClearFilterButton = (vm.filterInputText !== "");
				}, 500);
			}
		});

		/*
		$scope.$watch("vm.filterText", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.filterInputText = newValue;
			}
		});
		*/
	}
}());

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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("panelCardOptionAdd", panelCardOptionAdd);

	function panelCardOptionAdd() {
		return {
			restrict: 'E',
			templateUrl: 'panelCardOptionAdd.html',
			scope: {
				showAdd: "="
			},
			controller: PanelCardOptionAddCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	function PanelCardOptionAddCtrl() {
		var vm = this;

		vm.showAddElement = function (event) {
			event.stopPropagation();
			vm.showAdd = true;
		};
	}
}());

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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("panelCardOptionFilter", panelCardOptionFilter);

	function panelCardOptionFilter() {
		return {
			restrict: 'E',
			templateUrl: 'panelCardOptionFilter.html',
			scope: {
				showFilter: "="
			},
			controller: PanelCardOptionFilterCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	function PanelCardOptionFilterCtrl() {
		var vm = this;

		vm.toggleFilter = function (event) {
			event.stopPropagation();
			vm.showFilter = !vm.showFilter;
		};
	}
}());

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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("panelCardOptionMenu", panelCardOptionMenu);

	function panelCardOptionMenu() {
		return {
			restrict: 'E',
			templateUrl: 'panelCardOptionMenu.html',
			scope: {
				menu: "=",
				selectedMenuOption: "="
			},
			controller: PanelCardOptionMenuCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	PanelCardOptionMenuCtrl.$inject = ["$timeout"];

	function PanelCardOptionMenuCtrl ($timeout) {
		var vm = this,
			currentSortIndex;

		vm.menuItemSelected = function (index) {
			if (vm.menu[index].toggle) {
				vm.menu[index].selected = !vm.menu[index].selected;
				vm.selectedMenuOption = vm.menu[index];
			}
			else {
				if (index !== currentSortIndex) {
					if (angular.isDefined(currentSortIndex)) {
						vm.menu[currentSortIndex].selected = false;
						vm.menu[currentSortIndex].firstSelected = false;
						vm.menu[currentSortIndex].secondSelected = false;
					}
					currentSortIndex = index;
					vm.menu[currentSortIndex].selected = true;
					vm.menu[currentSortIndex].firstSelected = true;
				}
				else {
					vm.menu[currentSortIndex].firstSelected = !vm.menu[currentSortIndex].firstSelected;
					vm.menu[currentSortIndex].secondSelected = !vm.menu[currentSortIndex].secondSelected;
				}
				vm.selectedMenuOption = vm.menu[currentSortIndex];
			}

			// 'Reset' vm.selectedMenuOption so that selecting the same option can be registered down the line
			$timeout(function () {
				vm.selectedMenuOption = undefined;
			});
		};
	}
}());

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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("panelCardOptionPrint", panelCardOptionPrint);

	function panelCardOptionPrint() {
		return {
			restrict: 'E',
			templateUrl: 'panelCardOptionPrint.html',
			scope: {},
			controller: PanelCardOptionPrintCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	PanelCardOptionPrintCtrl.$inject = ["$window", "StateManager", "serverConfig"];

	function PanelCardOptionPrintCtrl ($window, StateManager, serverConfig) {
		var vm = this;

		vm.doPrint = function(event) {
			event.stopPropagation();
			$window.open(serverConfig.apiUrl(StateManager.state.account + "/" + StateManager.state.project + "/issues.html"), "_blank");
		};
	}
}());

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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("panelCardOptionVisible", panelCardOptionVisible);

	function panelCardOptionVisible() {
		return {
			restrict: 'E',
			templateUrl: 'panelCardOptionVisible.html',
			scope: {
				visible: "="
			},
			controller: PanelCardOptionVisibleCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	function PanelCardOptionVisibleCtrl() {
		var vm = this;

		vm.toggleVisible = function (event) {
			event.stopPropagation();
			vm.visible = !vm.visible;
		};
	}
}());

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

(function () {
    "use strict";

    angular.module("3drepo")
        .directive("panel", panel);

    function panel () {
        return {
            restrict: 'E',
            templateUrl: 'panel.html',
            scope: {
                position: "@"
            },
            controller: PanelCtrl,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    PanelCtrl.$inject = ["$scope", "$window", "EventService"];

    function PanelCtrl ($scope, $window, EventService) {
        var vm = this,
            i = 0,
            length = 0,
			lastWindowHeight = $window.innerHeight,
			panelTopBottomGap = 40,
			maxHeightAvailable = $window.innerHeight - panelTopBottomGap,
			numPanelsShowing = 0,
			numNonFixedHeightPanelsShowing = 0,
			fixedContentHeightTotal = 0,
			itemGap = 20,
			panelToolbarHeight = 48,
			numFiltersShown = 0,
			filterHeight = 50,
			totalOccupiedHeight = 0;

		vm.contentItems = [];
        vm.showPanel = true;
		vm.window = $window;
		vm.activate = true;

        $scope.$watch(EventService.currentEvent, function (event) {
            if (event.type === EventService.EVENT.PANEL_CONTENT_SETUP) {
				vm.contentItems = (event.value[vm.position]);
				hideLastItemGap();

				for (var i = 0; i < vm.contentItems.length; i += 1) {
					if (vm.contentItems[i].show) {
						numPanelsShowing += 1;
						if (!vm.contentItems[i].fixedHeight) {
							numNonFixedHeightPanelsShowing += 1;
						}
					}
				}
            }
            else if (event.type === EventService.EVENT.TOGGLE_ELEMENTS) {
                vm.showPanel = !vm.showPanel;
            }
        });

		// The last card should not have a gap so that scrolling in resized window works correctly
		function hideLastItemGap () {
			var lastFound = false;
			for (i = (vm.contentItems.length - 1); i >= 0; i -= 1) {
				if (vm.contentItems[i].show) {
					if (!lastFound) {
						vm.contentItems[i].showGap = false;
						lastFound = true;
					} else {
						vm.contentItems[i].showGap = true;
					}
				}
			}
		}

		angular.element(document).bind('mousedown', function (event) {
			// If we have clicked on a canvas, we are probably moving the model around
			if (event.target.tagName === "CANVAS")
			{
				vm.activate = false;
				$scope.$apply();
			}
		});

		angular.element(document).bind('mouseup', function (event) {
			vm.activate = true;
			$scope.$apply();
		});

		/**
		 * Panel toggle button clicked
		 *
		 * @param contentType
		 */
		vm.buttonClick = function (contentType) {
			var contentItem;

			// Get the content item
            for (i = 0, length = vm.contentItems.length; i < length; i += 1) {
                if (contentType === vm.contentItems[i].type) {
					contentItem = vm.contentItems[i];

					// Toggle panel show and update number of panels showing count
                    vm.contentItems[i].show = !vm.contentItems[i].show;

					// Resize any shown panel contents
					if (vm.contentItems[i].show) {
						numPanelsShowing += 1;
						if (vm.contentItems[i].fixedHeight) {
							fixedContentHeightTotal += contentItem.height;
						}
						else {
							numNonFixedHeightPanelsShowing += 1;
						}

						vm.heightRequest(contentItem, contentItem.height);
					}
					else {
						numPanelsShowing -= 1;
						if (vm.contentItems[i].fixedHeight) {
							fixedContentHeightTotal -= contentItem.height;
						}
						else {
							numNonFixedHeightPanelsShowing -= 1;
						}

						vm.contentItems[i].showGap = false;

						resizeShownPanelContents();
					}

					break;
                }
            }
			hideLastItemGap();
        };

		/**
		 * A panel content is requesting a height change
		 * Change the heights of any shown panels if necessary
		 *
		 * @param contentItem
		 * @param height
		 */
		vm.heightRequest = function (contentItem, height) {
			var i, length,
				maxNonFixedContentItemHeight = getMaxNonFixedContentItemHeight();

			// Keep a note of the requested height to use when a panel content is hidden
			contentItem.requestedHeight = height;

			for (i = 0, length = vm.contentItems.length; i < length; i += 1) {
				// Only consider shown items
				if (vm.contentItems[i].show) {
					// Other shown content
					if (vm.contentItems[i].type !== contentItem.type) {
						if (vm.contentItems[i].height > maxNonFixedContentItemHeight) {
							// Reduce height of any other content with a height greater than the average maximum
							vm.contentItems[i].height = maxNonFixedContentItemHeight;
						}
					}
					else {
						// Content requesting
						if (contentItem.fixedHeight) {
							contentItem.height = height;
						}
						else {
							if (height > maxNonFixedContentItemHeight) {
								contentItem.height = maxNonFixedContentItemHeight;
							}
							else {
								contentItem.height = height;
							}
						}
					}
				}
			}
		};

		/**
		 * Resize shown panel contents after a panel content is hidden
		 */
		function resizeShownPanelContents () {
			var i, length,
				maxNonFixedContentItemHeight = getMaxNonFixedContentItemHeight();

			for (i = 0, length = vm.contentItems.length; i < length; i += 1) {
				if (vm.contentItems[i].show && !vm.contentItems[i].fixedHeight) {
					if (vm.contentItems[i].requestedHeight > maxNonFixedContentItemHeight) {
						vm.contentItems[i].height = maxNonFixedContentItemHeight;
					}
					else {
						vm.contentItems[i].height = vm.contentItems[i].requestedHeight;
					}
				}
			}
		}

		/**
		 * Get the maximum height for non fixed height panel content
		 *
		 * maxHeightAvailable - maximum available screen height
		 * numPanelsShowing - total number of panel contents to show
		 * panelToolbarHeight - height of the tool bar of a panel content
		 * itemGap - gap between each panel content
		 * fixedContentHeightTotal - total height of all panel content with fixed height
		 * numNonFixedHeightPanelsShowing  - total number of panel contents with non fixed height
		 *
		 * @returns {number}
		 */
		function getMaxNonFixedContentItemHeight () {
			return (
				maxHeightAvailable -
				(numPanelsShowing * panelToolbarHeight) -
				((numPanelsShowing - 1) * itemGap) -
				fixedContentHeightTotal -
				numFiltersShown * filterHeight
				) /
				numNonFixedHeightPanelsShowing;
		}

		/**
		 * Get the total height occupied by the shown panel contents
		 *
		 * @returns {number}
		 */
		function getTotalOccupiedHeight () {
			var i, length;

			totalOccupiedHeight = 0;

			for (i = 0, length = vm.contentItems.length; i < length; i += 1) {
				if (vm.contentItems[i].show) {
					totalOccupiedHeight += panelToolbarHeight + vm.contentItems[i].height;
					if (i !== 0) {
						totalOccupiedHeight += itemGap;
					}
				}
			}

			return totalOccupiedHeight;
		}

		/*
		 * Handle changes to the browser screen height
	  	 */
		$scope.$watch("vm.window.innerHeight", function (newValue) {
			if (getTotalOccupiedHeight() >= maxHeightAvailable) {
				resizeShownPanelContentsOnWindowResize(newValue - lastWindowHeight);
			}
			lastWindowHeight = newValue;

			maxHeightAvailable = newValue - panelTopBottomGap;
		});

		/**
		 * Resize all shown non fixed height panel contents when the browser height changes
		 *
		 * @param heightChange
		 */
		function resizeShownPanelContentsOnWindowResize (heightChange) {
			var i, length,
				nonFixedHeightPanelContentHeightChange = heightChange / numNonFixedHeightPanelsShowing;

			for (i = 0, length = vm.contentItems.length; i < length; i += 1) {
				if (vm.contentItems[i].show && !vm.contentItems[i].fixedHeight) {
					vm.contentItems[i].height += nonFixedHeightPanelContentHeightChange;

					if (vm.contentItems[i].height > vm.contentItems[i].requestedHeight) {
						vm.contentItems[i].height = vm.contentItems[i].requestedHeight;
					}
				}
			}
		}

		/**
		 * Keep a count of all panel content filters shown
		 *
		 * @param show
		 */
		vm.showFilter = function (show) {
			numFiltersShown += show ? 1 : -1;
			resizeShownPanelContents();
		};
	}
}());

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

angular.module('3drepo')
.factory('ProjectData', ['$http', '$q', 'serverConfig', 'StateManager', function($http, $q, serverConfig, StateManager){
	var o = {
		project:		null,
		name:			"",
		owner:			"",
		description:	"",
		settings:		null
	};

	o.projectTypes = [
		{label: 'Architectural', value : 1},
		{label: 'Aerospace', value: 2},
		{label: 'Automotive', value: 3},
		{label: 'Enginering', value: 4},
		{label: 'Other', value: 5}
	];

	o.loading = false;
	o.loadingPromise = $q.defer();

	o.refresh = function() {
		var self = this;
		var account = StateManager.state.account;
		var project = StateManager.state.project;

		if(!self.loading)
		{
			if (project != self.project)
			{
				self.visibility = 'private';

				self.loading  = true;

				$http.get(serverConfig.apiUrl(account + '/' + project + '.json')).success(function(json, status) {
					self.name				= project;
					self.owner				= json.owner;
					self.description		= json.desc;
					self.type				= json.type;
					self.selected			= self.projectTypes[0];

					self.loading = false;
					self.settings = json.properties;
					self.loadingPromise.resolve();
				});
			} else {
				self.loadingPromise.resolve();
			}
		}

		return self.loadingPromise.promise;
	};

	return o;
}]);


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

(function() {
	"use strict";

	angular.module("3drepo")
	.service("ViewerService", ["$window", "StateManager", "serverConfig", "$http", "$q", function($window, StateManager, serverConfig, $http, $q){
		var self = this;
		var readyQ = $q.defer();

		self.ready = readyQ.promise;

		this.init = function(viewerManager, defaultViewer) {
			// Viewer Manager controls layout of viewer
			self.viewerManager = viewerManager;
			self.defaultViewer = defaultViewer;
			self.defaultViewer.enableClicking();

			$window.viewer = self.defaultViewer;


			self.defaultViewer.whenLoaded(function () {
				readyQ.resolve();
			});
		};

		this.linkFunction = function (callback)
		{
			self.viewerManager.linkFunction(callback);
		};

		this.loadModel = function() {
			var branch		= StateManager.state.branch ? StateManager.state.branch : "master";
			var revision	= StateManager.state.revision ? StateManager.state.revision : "head";

			var url = null;

			if (revision === "head")
			{
				url = serverConfig.apiUrl(StateManager.state.account + "/" + StateManager.state.project + "/revision/" + branch + "/head.x3d.mp");
			} else {
				url = serverConfig.apiUrl(StateManager.state.account + "/" + StateManager.state.project + "/revision/" + revision + ".x3d.mp");
			}

			self.defaultViewer.loadURL(url);
			self.defaultViewer.setCurrentViewpoint("model__" + StateManager.state.account + "_" + StateManager.state.project + "_origin");
		};

		this.pickPoint = function(x,y)
		{
			self.defaultViewer.pickPoint(x,y);
			return self.defaultViewer.pickObject;
		};

		this.switchVR = function()
		{
			if(self.oculus) {
				self.oculus.switchVR();
			}
		};

		this.close = function() {
			// Close down oculus and gamepad support
			delete $window.oculus;
			delete $window.collision;

			// Close down the viewer manager
			self.viewerManager.close();
			delete $window.viewerManager;
			self.defaultViewer = null;
		};
	}]);
})();


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

(function () {
    "use strict";

    angular.module("3drepo")
        .factory("EventService", EventService);

	EventService.$inject = ["$timeout"];

    function EventService ($timeout) {
        var EVENT = {
            FILTER: "EVENT_FILTER",
            FULL_SCREEN_ENTER: "EVENT_FULL_SCREEN_ENTER",
            GLOBAL_CLICK: "EVENT_GLOBAL_CLICK",
			OBJECT_SELECTED: "EVENT_OBJECT_SELECTED",
            PIN_SELECTED: "EVENT_PIN_SELECTED",
            PANEL_CONTENT_CLICK: "EVENT_LEFT_PANEL_CONTENT_CLICK",
            PANEL_CONTENT_SETUP: "EVENT_PANEL_CONTENT_SETUP",
			PANEL_CONTENT_TOGGLED: "EVENT_PANEL_CONTENT_TOGGLED",
			SHOW_QR_CODE_READER: "EVENT_SHOW_QR_CODE_READER",
            TOGGLE_ELEMENTS: "EVENT_TOGGLE_ELEMENTS",
            TOGGLE_HELP: "EVENT_TOGGLE_HELP",
			WINDOW_HEIGHT_CHANGE: "EVENT_WINDOW_HEIGHT_CHANGE",
			SET_CLIPPING_PLANES: "EVENT_SET_CLIPPING_PLANES",
			
			// Events to control the viewer manager
            CREATE_VIEWER: "EVENT_CREATE_VIEWER",
            CLOSE_VIEWER: "EVENT_CLOSE_VIEWER",
			
			// Specific to the javascript viewer
			// populated by the viewer.js script
			VIEWER: VIEWER_EVENTS,
			
			// Ready signals
			PROJECT_SETTINGS_READY: "EVENT_PROJECT_SETTINGS_READY"
        };
		
		console.log(JSON.stringify(EVENT));

		var ERROR = {
			DUPLICATE_VIEWER_NAME: "ERROR_DUPLICATE_VIEWER_NAME"
		};

        var currentEvent = {};
		var currentError = {};

        var send = function (type, value) {
			$timeout(function() {
				if (angular.isUndefined(type))
				{
					console.trace("UNDEFINED EVENT TYPE");			
				} else {
					console.log("SEND: " + type + " : " + JSON.stringify(value));
					currentEvent = {type: type, value: value};
				}
			});
        };
		
		var sendError = function(type, value) {
			if (angular.isUndefined(type))
			{
				console.trace("UNDEFINED ERROR TYPE");			
			} else {
				//console.log(type + " : " + JSON.stringify(value));
            	currentError = {type: type, value: value};
			}
		};

        return {
            EVENT: EVENT,
			ERROR: ERROR,
            currentEvent: function() {return currentEvent;},
			currentError: function() {return currentError;},
            send: send,
			sendError: sendError
        };
    }
}());

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

(function () {
    "use strict";

    angular.module("3drepo")
        .directive("global", global);

    global.$inject = ["EventService"];

    function global(EventService) {
        return {
            restrict: "A",
            link: link
        };

        function link (scope, element) {
			/*
            element.bind('click', function (event){
                EventService.send(EventService.EVENT.GLOBAL_CLICK, event);
            });
			*/
        }
    }
}());


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

(function () {
	"use strict";

	angular.module("3drepo")
	.config([
	'$stateProvider',
	'parentStates',
	function($stateProvider, parentStates) {
		var states = parentStates["project"];

		for(var i = 0; i < states.length; i++) {
			$stateProvider
			.state(states[i] + '.project', {
				url: '/:project',
				resolve: {
					auth: function (Auth) { return Auth.init(); },
					init: function(StateManager, $stateParams) {
						StateManager.setStateVar("branch", "master");
						StateManager.setStateVar("revision", "head");
						StateManager.setState($stateParams, {});
						StateManager.refresh("project");
					}
				},
				views: {
					"@" : {
						templateUrl: 'project.html'
					}
				}
			});
		}
	}])
	.run(['StateManager', function(StateManager) {
		StateManager.registerPlugin('project', 'ProjectData', function () {
			if (StateManager.state.project) {
				return "project";
			}
			else {
				return null;
			}
		});

		StateManager.setClearStateVars("project", ["project"]);
	}])
	.directive("project", project);

    function project() {
        return {
            restrict: 'E',
            scope: {},
            controller: ProjectCtrl
        };
    }

	ProjectCtrl.$inject = ["$timeout", "EventService", "StateManager", "ProjectService"];

	function ProjectCtrl($timeout, EventService, StateManager, ProjectService) {
		var panelCard = {
			left: [],
			right: []
		};

		var promise,
			i, length;

		panelCard.left.push({
			type: "tree",
			title: "Tree",
			show: true,
			help: "Model elements shown in a tree structure",
			icon: "fa-sitemap",
			height: 820,
			fixedHeight: false,
			options: [
				"filter"
			]
		});

		panelCard.right.push({
			type: "issues",
			title: "Issues",
			show: true,
			help: "List current issues",
			icon: "fa-map-marker",
			menu: [
				{
					value: "sortByDate",
					label: "Sort by Date",
					firstSelectedIcon: "fa-sort-amount-desc",
					secondSelectedIcon: "fa-sort-amount-asc",
					toggle: false,
					selected: true,
					firstSelected: true,
					secondSelected: false
				},
				{
					value: "showClosed",
					label: "Show closed issues",
					toggle: true,
					selected: false,
					firstSelected: false,
					secondSelected: false
				}
			],
			height: 820,
			fixedHeight: false,
			options: [
				"print",
				"add",
				"filter",
				"menu"
			]
		});
		panelCard.right.push({
			type: "clip",
			title: "Clip",
			show: false,
			help: "Clipping plane",
			icon: "fa-object-group",
			height: 120,
			fixedHeight: true,
			options: [
				"visible"
			]
		});
		panelCard.right.push({
			type: "docs",
			title: "Docs",
			show: false,
			help: "Documents",
			icon: "fa-clone",
			height: 80,
			fixedHeight: false,
			options: []
		});

		// Add filtering options for the Issues card menu
		promise = ProjectService.getRoles();
		promise.then(function (data) {
			for (i = 0, length = data.length; i < length; i += 1) {
				panelCard.right[0].menu.push(
					{
						value: "filterRole_" + data[i].role,
						label: data[i].role,
						toggle: true,
						selected: true,
						firstSelected: false,
						secondSelected: false
					}
				);
			}
		});

		StateManager.setStateVar("branch", "master");
		StateManager.setStateVar("revision", "head");
		StateManager.updateState();		// Want to preserve URL structure

		StateManager.Data.ProjectData.loadingPromise.promise.then(function() {
			EventService.send(EventService.EVENT.PROJECT_SETTINGS_READY, {
				account: StateManager.state.account,
				project: StateManager.state.project,
				settings: StateManager.Data.ProjectData.settings
			});
		});

		$timeout(function () {
			EventService.send(EventService.EVENT.PANEL_CONTENT_SETUP, panelCard);
			
			// No parameters means load from state variables
			EventService.send(EventService.EVENT.CREATE_VIEWER, {
				name: "default",
				account: StateManager.state.account,
				project: StateManager.state.project,
				branch: StateManager.state.branch,
				revision: StateManager.state.revision
			});
		});
	}
}());

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

(function () {
	"use strict";

	angular.module('3drepo')
		.factory('ProjectService', ProjectService);

	ProjectService.$inject = ["$http", "$q", "StateManager", "serverConfig"];

	function ProjectService($http, $q, StateManager, serverConfig) {
		var state = StateManager.state;

		var getRoles = function () {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(state.account + '/' + state.project + '/roles.json');

			$http.get(url)
				.then(
					function(data) {
						deferred.resolve(data.data);
					},
					function () {
						deferred.resolve([]);
					}
				);

			return deferred.promise;
		};

		return {
			getRoles: getRoles
		};
	}
}());

/**
 **  Copyright (C) 2014 3D Repo Ltd
 **
 **  This program is free software: you can redistribute it and/or modify
 **  it under the terms of the GNU Affero General Public License as
 **  published by the Free Software Foundation, either version 3 of the
 **  License, or (at your option) any later version.
 **
 **  This program is distributed in the hope that it will be useful,
 **  but WITHOUT ANY WARRANTY; without even the implied warranty of
 **  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 **  GNU Affero General Public License for more details.
 **
 **  You should have received a copy of the GNU Affero General Public License
 **  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/

var ClipPlane = {};

(function() {
    "use strict";
    
	/*
	 * Clipping plane constructor and manipulator
	 *
	 * Inspired by the work of Timo on 16.06.2014.
	 *
	 * @constructor
	 * @this {ClipPlane}
	 * @param {number} id - Unique ID for this clipping plane
	 * @param {Viewer} parentViewer - Parent viewer
	 * @param {string} axis - Letter representing the axis: "X", "Y" or "Z"
	 * @param {array} colour - Array representing the color of the slice
	 * @param {number} percentage - Percentage along the bounding box to clip
	 * @param {number} clipDirection - Direction of clipping (-1 or 1)
	 */
	ClipPlane = function(id, viewer, axis, colour, distance, percentage, clipDirection) {
		var self = this;

		// Public properties

		/**
		 * Axis on which the clipping plane is based
		 * @type {string}
		 */
		this.axis = "X";

		/**
		 * Value representing the direction of clipping
		 * @type {number}
		 */
		this.clipDirection = (clipDirection === undefined) ? -1 : clipDirection;

		/**
		 * Value representing the percentage distance from the origin of
		 * the clip plane
		 * @type {number}
		 */
		this.percentage = (percentage === undefined) ? 1.0 : percentage;

		/**
		 * Value representing the distance from the origin of
		 * the clip plane
		 * @type {number}
		 */
		this.distance = distance;

		/**
		 * Volume containing the clipping plane
		 * @type {BoxVolume}
		 */
		var volume = null;

		/**
		 * DOM Element representing the clipping plane
		 * @private
		 * @type {HTMLElement}
		 */
		var clipPlaneElem = document.createElement("ClipPlane");

		/**
		 * Normal vector to the clipping plane
		 * @private
		 * @type {SFVec3f}
		 */
		var normal = new x3dom.fields.SFVec3f(0, 0, 0);

		/**
		 * Coordinate frame for clipping plane
		 * @private
		 * @type {HTMLElement}
		 */
		var coordinateFrame = document.createElement("Transform");

		/**
		 * Outline shape
		 * @private
		 * @type {HTMLElement}
		 */
		var outline = document.createElement("Shape");

		/**
		 * Outline appearance
		 * @private
		 * @type {HTMLElement}
		 */
		var outlineApp = document.createElement("Appearance");

		/**
		 * Outline material
		 * @private
		 * @type {HTMLElement}
		 */
		var outlineMat = document.createElement("Material");

		/**
		 * Outline line set
		 * @private
		 * @type {HTMLElement}
		 */
		var outlineLines = document.createElement("LineSet");

		/**
		 * Outline coordinates
		 * @private
		 * @type {HTMLElement}
		 */
		var outlineCoords = document.createElement("Coordinate");

		/**
		 * Bounding box scale avoids flickering at edges
		 * @private
		 * @type {number}
		 */
		var BBOX_SCALE = 1.0001;

		/**
		 * Get my unique ID
		 */
		this.getID = function() {
			return id;
		};

		/**
		 * Set the coordinates of the clipping plane outline
		 */
		var setOutlineCoordinates = function() {
			var min = volume.min.multiply(BBOX_SCALE).toGL();
			var max = volume.max.multiply(BBOX_SCALE).toGL();

			var axisIDX = "XYZ".indexOf(self.axis);
			var outline = [
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0]
			];

			var minor = (axisIDX + 1) % 3;
			var major = (axisIDX + 2) % 3;

			outline[0][minor] = min[minor];
			outline[0][major] = max[major];

			outline[1][minor] = min[minor];
			outline[1][major] = min[major];

			outline[2][minor] = max[minor];
			outline[2][major] = min[major];

			outline[3][minor] = max[minor];
			outline[3][major] = max[major];

			outline[4][minor] = min[minor];
			outline[4][major] = max[major];

			outlineCoords.setAttribute("point",
				outline.map(function(item) {
					return item.join(" ");
				}).join(",")
			);
		};

		/**
		 * Move the clipping plane
		 * @param {number} percentage - Percentage of entire clip volume to move across
		 */
		this.movePlane = function(percentage) {
			// Update the transform containing the clipping plane
			var axisIDX = "XYZ".indexOf(this.axis);
			var min = volume.min.multiply(BBOX_SCALE).toGL();
			var max = volume.max.multiply(BBOX_SCALE).toGL();

			self.percentage = percentage;
			var distance = 0.0;

			if (self.distance) {
				distance = self.distance;
			} else {
				distance = ((max[axisIDX] - min[axisIDX]) * percentage) + min[axisIDX];
			}

			// Update the clipping element plane equation
			clipPlaneElem.setAttribute("plane", normal.toGL().join(" ") + " " + distance);

			var translation = [0, 0, 0];
			translation[axisIDX] = -distance * this.clipDirection;
			coordinateFrame.setAttribute("translation", translation.join(","));
		};

		/**
		 * Change the clipping axis
		 * @param {string} axis - Axis on which the clipping plane acts
		 */
		this.changeAxis = function(axis) {
			this.axis = axis.toUpperCase();

			// When the axis is change the normal to the plane is changed
			normal.x = (axis === "X") ? this.clipDirection : 0;
			normal.y = (axis === "Y") ? this.clipDirection : 0;
			normal.z = (axis === "Z") ? this.clipDirection : 0;

			// Reset plane to the start
			this.movePlane(1.0);

			setOutlineCoordinates();
		};

		/**
		 * Destroy me and everything connected with me
		 */
		this.destroy = function() {
			if (clipPlaneElem && clipPlaneElem.parentNode) {
				clipPlaneElem.parentNode.removeChild(clipPlaneElem);
			}

			if (coordinateFrame && coordinateFrame.parentNode) {
				coordinateFrame.parentNode.removeChild(coordinateFrame);
			}
		};

		// Construct and connect everything together
		outlineMat.setAttribute("emissiveColor", colour.join(" "));
		outlineLines.setAttribute("vertexCount", 5);
		outlineLines.appendChild(outlineCoords);

		outlineApp.appendChild(outlineMat);
		outline.appendChild(outlineApp);
		outline.appendChild(outlineLines);

		coordinateFrame.appendChild(outline);

		// Attach to the root node of the viewer
		viewer.getScene().appendChild(coordinateFrame);
		volume = viewer.runtime.getBBox(viewer.getScene());

		// Move the plane to finish construction
		this.changeAxis(axis);
		viewer.getScene().appendChild(clipPlaneElem);
		this.movePlane(percentage);

	};


}());
/* global x3dom */
/**
 **  Copyright (C) 2014 3D Repo Ltd
 **
 **  This program is free software: you can redistribute it and/or modify
 **  it under the terms of the GNU Affero General Public License as
 **  published by the Free Software Foundation, either version 3 of the
 **  License, or (at your option) any later version.
 **
 **  This program is distributed in the hope that it will be useful,
 **  but WITHOUT ANY WARRANTY; without even the implied warranty of
 **  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 **  GNU Affero General Public License for more details.
 **
 **  You should have received a copy of the GNU Affero General Public License
 **  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/

var Collision = {};

(function() {
	"use strict";

	Collision = function(viewer) {
		var self = this;

		this._deltaT = 0.1;

		this.deltaX = 0.0;
		this.deltaY = 0.0;

		this.ticking = false;

		this.prevMove = 0.0;

		this.stopped = true;

		this.viewer = viewer;

		this.updateDirections = function(event, gamepad) {
			var speed = self.viewer.nav._x3domNode._vf.speed;
			var userX = self._deltaT * speed * (gamepad.xaxis + gamepad.xoffset);
			var userY = self._deltaT * speed * (gamepad.yaxis + gamepad.yoffset);

			if ((userX === 0) && (userY === 0)) {
				self.stopped = true;
			} else {
				self.stopped = false;
			}

			if (!self.stopped) {
				self.userX = -userX;
				self.userY = -userY;

				if (!self.ticking) {
					self.tick();
				}
			} else {
				self.userX = 0;
				self.userY = 0;
			}
		};

		this.tick = function() {
			self.ticking = true;

			var viewArea = self.viewer.getViewArea();
			var straightDown = new x3dom.fields.SFVec3f(0, -1, 0);
			var straightUp = new x3dom.fields.SFVec3f(0, 1, 0);
			
			var right = new x3dom.fields.SFVec3f(-1, 0, 0);

			var currProjMat = self.viewer.getProjectionMatrix();
			var currViewMat = self.viewer.getViewMatrix();
			var flyMat = currViewMat.inverse();
			var from = flyMat.e3();

			var tmpFlatAt = flyMat.e3();

			var viewDir = currViewMat.inverse().e2().multiply(-1);

			var viewX = viewDir.x;
			var viewZ = viewDir.z;

			self.deltaX = self.userX * viewZ + self.userY * viewX;
			self.deltaZ = -self.userX * viewX + self.userY * viewZ;

			tmpFlatAt.x += self.deltaX;
			tmpFlatAt.z += self.deltaZ;

			var tmpTmpMat = x3dom.fields.SFMatrix4f.lookAt(from, tmpFlatAt, straightUp);
			tmpTmpMat = tmpTmpMat.inverse();

			viewArea._scene._nameSpace.doc.ctx.pickValue(viewArea, viewArea._width / 2, viewArea._height / 2,
				this._lastButton, tmpTmpMat, currProjMat.mult(tmpTmpMat));

			var dist = self.viewer.avatarRadius + 1.0;

			if (viewArea._pickingInfo.pickObj) {
				dist = viewArea._pickingInfo.pickPos.subtract(from).length();
			}

			if (!self.stopped && (dist > self.viewer.avatarRadius)) {

				// Attach to ground
				// ----------------
				// Camera matrix is to look at the ground:
				// FWD is DOWN
				// UP is AHEAD
				// RIGHT is RIGHT

				var tmpUp = tmpFlatAt.subtract(from).normalize();
				right = straightDown.cross(tmpUp);
				tmpUp = right.cross(straightDown);

				//var right = tmpFlatAt
				//var tmpUp = straightAhead.cross(straightRight);

				from.x += self.deltaX;
				from.z += self.deltaZ;

				var tmpDownMat = x3dom.fields.SFMatrix4f.identity();
				tmpDownMat.setValue(right, tmpUp, straightDown.multiply(-1), from);
				tmpDownMat = tmpDownMat.inverse();

				viewArea._pickingInfo.pickObj = null;
				viewArea._scene._nameSpace.doc.ctx.pickValue(viewArea, viewArea._width / 2, viewArea._height / 2,
					this._lastButton, tmpDownMat, currProjMat.mult(tmpDownMat));

				if (viewArea._pickingInfo.pickObj) {
					dist = viewArea._pickingInfo.pickPos.subtract(from).length();
					var movement = 0.5 * ((self.viewer.avatarHeight - dist) + self.prevMove);
					from.y += movement;
					self.prevMove = movement;
				}

				var up = flyMat.e1();
				var tmpMat = x3dom.fields.SFMatrix4f.identity();

				right = up.cross(flyMat.e2());
				tmpMat.setValue(right, up, flyMat.e2(), from);

				viewArea._scene.getViewpoint().setView(tmpMat.inverse());
				//viewArea._scene.getViewpoint().setView(tmpDownMat);
				self.viewer.runtime.triggerRedraw();
			}

			self.nextTick();
		};

		this.nextTick = function() {
			if (window.requestAnimationFrame) {
				window.requestAnimationFrame(this.tick);
			} else if (window.mozRequestAnimationFrame) {
				window.mozRequestAnimationFrame(this.tick);
			} else if (window.webkitRequestAnimationFrame) {
				window.webkitRequestAnimationFrame(this.tick);
			}
		};

		$(document).on("gamepadMove", this.updateDirections);
	};
}());
/**
 **  Copyright (C) 2014 3D Repo Ltd
 **
 **  This program is free software: you can redistribute it and/or modify
 **  it under the terms of the GNU Affero General Public License as
 **  published by the Free Software Foundation, either version 3 of the
 **  License, or (at your option) any later version.
 **
 **  This program is distributed in the hope that it will be useful,
 **  but WITHOUT ANY WARRANTY; without even the implied warranty of
 **  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 **  GNU Affero General Public License for more details.
 **
 **  You should have received a copy of the GNU Affero General Public License
 **  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/

var Gamepad = function(viewer) {

	var self = this;

	this.enabled = false;
	this.gamepad = null;
	this.timestamp = null;

	this.browser = null;
	this.platform = null;

	this.viewer = viewer;

	this.connected = function(event) {
		self.gamepad = event.gamepad;	// Only support one gamepad
		self.startPolling();
	};

	this.disconnected = function(event) {
		self.gamepad = null;
		self.stopPolling();
	};

	this.startPolling = function() {
		if(!self.enabled)
		{
			self.enabled = true;
			self.tick();
		}
	};

	this.oldButton = false;

	this.checkStatus = function() {
		if(!self.gamepad)
			return;

		if(self.gamepad.timestamp &&
			(self.gamepad.timestamp == self.timestamp))
				return;

		self.timestamp = self.gamepad.timestamp;
	};

	this.connected = function(event) {
		self.gamepad = event.gamepad;	// Only support one gamepad
		self.startPolling();
	};

	this.disconnected = function(event) {
		self.gamepad = null;
		self.stopPolling();
	};

	this.startPolling = function() {
		if(!self.enabled)
		{
			self.enabled = true;
			self.tick();
		}
	};

	this.oldButton = false;

	this.checkStatus = function() {
		if(!self.gamepad)
			return;

		if(self.gamepad.timestamp &&
			(self.gamepad.timestamp == self.timestamp))
				return;

		self.timestamp = self.gamepad.timestamp;

		var button_idx = 0;

		/* Chrome Linux */
		if ((self.platform === 'Linux') && (self.browser === 'Chrome'))
		{
			$.event.trigger("gamepadMove",
				{
					xaxis: self.gamepad.axes[0],
					yaxis: self.gamepad.axes[1],
                    xoffset: 0.0,
                    yoffset: 0.0,
					button: self.gamepad.buttons[button_idx]
				}
			);
		}

		/* Chrome Canary Windows */
		else if ((self.platform === 'Win32') && (self.browser === 'Chrome'))
		{
			button_idx = 3;
			$.event.trigger("gamepadMove",
				{
					xaxis: self.gamepad.buttons[15].value - self.gamepad.buttons[14].value,
					yaxis: self.gamepad.buttons[13].value - self.gamepad.buttons[12].value,
                    xoffset: 0.0,
                    yoffset: 0.0,
					button: self.gamepad.buttons[button_idx]
				}
			);
		}

		/* Firefox Windows */
		else if ((self.platform === 'Win32') && (self.browser === 'Firefox'))
		{
			$.event.trigger("gamepadMove",
				{
					xaxis: self.gamepad.axes[0],
					yaxis: self.gamepad.axes[1],
                    xoffset: 0.0,
                    yoffset: 0.15,
					button: self.gamepad.buttons[button_idx]
				}
			);
		}

		if (self.gamepad.buttons[button_idx].pressed)
			if (!self.oldButton) {
				viewer.reset();
				viewer.setNavMode('NONE');
				viewer.setApp(null);
				viewer.disableClicking();
			}

		self.oldButton = self.gamepad.buttons[button_idx].pressed;
	};

	this.tick = function() {
		if(navigator.getGamepads()[0])
			self.gamepad = navigator.getGamepads()[0];

		if(self.gamepad)
			self.checkStatus();

		self.nextTick();
	};

	this.nextTick = function() {
		// Only schedule the next frame if we haven’t decided to stop via
		// stopPolling() before.
		if (this.enabled) {
		  if (window.requestAnimationFrame) {
			window.requestAnimationFrame(self.tick);
		  } else if (window.mozRequestAnimationFrame) {
			window.mozRequestAnimationFrame(self.tick);
		  } else if (window.webkitRequestAnimationFrame) {
			window.webkitRequestAnimationFrame(self.tick);
		  }
		  // Note lack of setTimeout since all the browsers that support
		  // Gamepad API are already supporting requestAnimationFrame().
		}
	};

	this.stopPolling = function() {
		self.enabled = false;
	};

	this.init = function() {
		var gamepadSupportAvailable = navigator.getGamepads ||
			!!navigator.webkitGetGamepads ||
			!!navigator.webkitGamepads;

		if (gamepadSupportAvailable) {
			if (window.navigator.platform.indexOf('Linux') != -1)
				self.platform = 'Linux';
			else if (window.navigator.platform.indexOf('Win32') != -1 || window.navigator.platform.indexOf('Win64') != -1 )
				self.platform = 'Win32';
			else
				console.error('Platform ' + window.navigator.platform + ' is not supported.');

			if (window.navigator.appVersion.indexOf('Chrome') != -1)
				self.browser = 'Chrome';
			else if (window.navigator.appVersion.indexOf('Firefox') != -1)
				self.browser = 'Firefox';
			else if (window.navigator.userAgent.indexOf('Firefox') != -1)
				self.browser = 'Firefox';
			else
				console.error('Browser version ' + window.navigator.appVersion + ' is not supported.');

			if (self.browser && self.platform)
			{
				if ('ongamepadconnected' in window) {
					window.addEventListener('gamepadconnected', self.connected, false);
					window.addEventListener('gamepaddisconnected', self.disconnected, false);
				} else {
					self.startPolling();
				}
			}
		}
	};
};

/**
 **  Copyright (C) 2014 3D Repo Ltd
 **
 **  This program is free software: you can redistribute it and/or modify
 **  it under the terms of the GNU Affero General Public License as
 **  published by the Free Software Foundation, either version 3 of the
 **  License, or (at your option) any later version.
 **
 **  This program is distributed in the hope that it will be useful,
 **  but WITHOUT ANY WARRANTY; without even the implied warranty of
 **  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 **  GNU Affero General Public License for more details.
 **
 **  You should have received a copy of the GNU Affero General Public License
 **  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/

var logo_string = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAB0CAMAAACcw5TeAAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAA/SAAAP0gH7iTvJAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAwBQTFRF////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////vy5IYQAAAP90Uk5TAAECAwQF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";

/**
 **  Copyright (C) 2014 3D Repo Ltd
 **
 **  This program is free software: you can redistribute it and/or modify
 **  it under the terms of the GNU Affero General Public License as
 **  published by the Free Software Foundation, either version 3 of the
 **  License, or (at your option) any later version.
 **
 **  This program is distributed in the hope that it will be useful,
 **  but WITHOUT ANY WARRANTY; without even the implied warranty of
 **  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 **  GNU Affero General Public License for more details.
 **
 **  You should have received a copy of the GNU Affero General Public License
 **  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/

var Pin = {};

(function() {
	"use strict";

	// Constants go here
	var ORANGE_HIGHLIGHT = "1.0 0.7 0.0";
	var GREY_PIN = [0.5, 0.5, 0.5];

	var PIN_RADIUS = 0.25;
	var PIN_HEIGHT = 1.0;
	var GHOST_OPACITY = 0.1;
	var OPAQUE_OPACITY = 1.0 - GHOST_OPACITY;

	/*
	 * Pin shape constructor and manipulator
	 *
	 * @constructor
	 * @this {Pin}
	 * @param {number} id - Unique ID for this clipping plane
	 * @param {Viewer} parentViewer - Parent viewer
	 * @param {string} axis - Letter representing the axis: "X", "Y" or "Z"
	 * @param {array} colour - Array representing the color of the slice
	 * @param {number} percentage - Percentage along the bounding box to clip
	 * @param {number} clipDirection - Direction of clipping (-1 or 1)
	 */
	Pin = function(id, element, trans, position, norm, scale, colours, viewpoint) {
		var self = this;
		
		self.id = id;
				
		self.highlighted = false;
		
		self.element = element;
		self.trans = trans;
		self.scale = scale;
		self.viewpoint = viewpoint;

		self.ghostConeIsHighlighted = null;
		self.coneIsHighlighted = null;
		
		self.ghostPinHeadNCol = null;
		self.pinHeadNCol = null;
		
		self.ghostPinHeadColour = null;
		self.pinHeadColour = null;
		
		self.ghostPinHeadIsHighlighted = null;
		self.pinHeadIsHighlighted = null;
		
		self.coneDepth = null;
		self.pinHeadDepth = null;

		// Initialize the colours and numColours that
		// are passed in
		self.numColours = 0;

		if (typeof colours === "undefined") {
			self.numColours = 1;
			colours = [1.0, 0.0, 0.0];
		} else if (typeof colours[0] === "number") {
			self.numColours = 1;
		} else {
			self.numColours = colours.length;
		}

		self.colours = colours;

		var parent = document.createElement("MatrixTransform");
		parent.setAttribute("id", self.id);
		parent.setAttribute("matrix", trans.toGL().toString());
		
		// Transform the normal into the coordinate frame of the parent
		self.modelTransform = document.createElement("Transform");

		var axisAngle = ViewerUtil.rotAxisAngle([0, 1, 0], norm);
		self.modelTransform.setAttribute("rotation", axisAngle.toString());
		self.modelTransform.setAttribute("translation", position.join(" "));

		parent.appendChild(self.modelTransform);

		colours = colours.join(" ");
		this.createBasicPinShape(self.modelTransform, "ALWAYS", GHOST_OPACITY, true);
		this.createBasicPinShape(self.modelTransform, "LESS", OPAQUE_OPACITY, false);

		self.element.appendChild(parent);
	};

	Pin.prototype.remove = function(id) {
		var pinPlacement = document.getElementById(id);
		if (pinPlacement !== null) {
			pinPlacement.parentElement.removeChild(pinPlacement);
		}
	};

	Pin.prototype.changeColour = function(colours) {
		var self = this;
		// Find both the material for the ghosted pin and the opaque pin

		if ((typeof colours === "undefined") || (!colours.length)) {
			colours = GREY_PIN;
		}

		if (typeof colours[0] === "number") {
			self.numColours = 1;
		} else {
			self.numColours = colours.length;
		}
		
		self.colours = colours;

		self.pinHeadNCol.setAttribute("value", self.numColours);
		self.pinHeadColour.setAttribute("value", self.colours.join(" "));

		self.ghostPinHeadNCol.setAttribute("value", self.numColours);
		self.ghostPinHeadColour.setAttribute("value", self.colours.join(" "));
	};
	
	Pin.prototype.highlight = function()
	{
		var self = this;
		
		self.highlighted = !self.highlighted;
		
		var depthMode = self.highlighted ? "ALWAYS" : "LESS" ;
		var highlighted = self.highlighted.toString();
		
		self.pinHeadIsHighlighted.setAttribute("value", highlighted);
		self.ghostPinHeadIsHighlighted.setAttribute("value", highlighted);
		self.coneIsHighlighted.setAttribute("value", highlighted);
		self.ghostConeIsHighlighted.setAttribute("value", highlighted);

		self.pinHeadDepth.setAttribute("depthFunc", depthMode);
		self.coneDepth.setAttribute("depthFunc", depthMode);
	};

	Pin.prototype.createBasicPinShape = function(parent, depthMode, opacity, ghostPin) {
		var self = this;

		var ORANGE_HIGHLIGHT = "1.0000 0.7 0.0";

		var coneHeight = PIN_HEIGHT - 2 * PIN_RADIUS;
		var pinshape = document.createElement("Group");
		pinshape.setAttribute("onclick", "clickPin(event)");

		var pinshapeapp = document.createElement("Appearance");
		//pinshape.appendChild(pinshapeapp);

		var pinshapescale = document.createElement("Transform");
		pinshapescale.setAttribute("scale", self.scale + " " + self.scale + " " + self.scale);
		pinshape.appendChild(pinshapescale);

		var pinshapeconetrans = document.createElement("Transform");
		pinshapeconetrans.setAttribute("translation", "0.0 " + (0.5 * coneHeight) + " 0.0");
		pinshapescale.appendChild(pinshapeconetrans);

		var pinshapeconerot = document.createElement("Transform");

		pinshapeconerot.setAttribute("rotation", "1.0 0.0 0.0 3.1416");
		pinshapeconetrans.appendChild(pinshapeconerot);

		var pinshapeconeshape = document.createElement("Shape");
		pinshapeconerot.appendChild(pinshapeconeshape);

		var pinshapecone = document.createElement("Cone");
		pinshapecone.setAttribute("bottomRadius", (PIN_RADIUS * 0.5).toString());
		pinshapecone.setAttribute("height", coneHeight.toString());

		var coneApp = pinshapeapp.cloneNode(true);

		var coneshader = document.createElement("ComposedShader");
		coneApp.appendChild(coneshader);

		var coneMat = document.createElement("Material");
		coneMat.setAttribute("diffuseColor", "1.0 1.0 1.0");
		coneMat.setAttribute("transparency", opacity);
		coneApp.appendChild(coneMat);

		var conehighlight = document.createElement("field");
		conehighlight.setAttribute("type", "SFVec3f");
		conehighlight.setAttribute("name", "highlightColor");
		conehighlight.setAttribute("value", ORANGE_HIGHLIGHT);
		coneshader.appendChild(conehighlight);

		var coneishighlighted = document.createElement("field");
		//coneishighlighted.setAttribute("id", self.id + "_cone" + (ghostPin ? "_ghost" : "") + "_ishighlighted");
		coneishighlighted.setAttribute("type", "SFBool");
		coneishighlighted.setAttribute("name", "highlightPin");
		coneishighlighted.setAttribute("value", "false");
		coneshader.appendChild(coneishighlighted);
		
		if (ghostPin)
		{
			self.ghostConeIsHighlighted = coneishighlighted;
		} else {
			self.coneIsHighlighted = coneishighlighted;
		}

		var coneuseclipplane = document.createElement("field");
		coneuseclipplane.setAttribute("type", "SFBool");
		coneuseclipplane.setAttribute("name", "useClipPlane");
		coneuseclipplane.setAttribute("value", ghostPin);
		coneshader.appendChild(coneuseclipplane);

		var conevert = document.createElement("ShaderPart");
		conevert.setAttribute("type", "VERTEX");
		conevert.setAttribute("USE", "noShadeVert");
		coneshader.appendChild(conevert);

		var conefrag = document.createElement("ShaderPart");
		conefrag.setAttribute("type", "FRAGMENT");
		conefrag.setAttribute("USE", "noShadeFrag");
		coneshader.appendChild(conefrag);

		var conedepth = document.createElement("DepthMode");

		if (!ghostPin) {
			self.coneDepth = conedepth;
		}

		conedepth.setAttribute("depthFunc", depthMode);
		conedepth.setAttribute("enableDepthTest", (!ghostPin).toString());
		coneApp.appendChild(conedepth);

		pinshapeconeshape.appendChild(coneApp);
		pinshapeconeshape.appendChild(pinshapecone);

		var pinshapeballtrans = document.createElement("Transform");
		pinshapeballtrans.setAttribute("translation", "0.0 " + (1.4 * coneHeight) + " 0.0");
		pinshapescale.appendChild(pinshapeballtrans);

		var pinshapeballshape = document.createElement("Shape");
		pinshapeballtrans.appendChild(pinshapeballshape);

		var pinshapeball = document.createElement("Sphere");
		pinshapeball.setAttribute("radius", PIN_RADIUS.toString());

		var ballApp = pinshapeapp.cloneNode(true);

		pinshapeballshape.appendChild(pinshapeball);
		pinshapeballshape.appendChild(ballApp);

		var pinheadMat = document.createElement("Material");
		pinheadMat.setAttribute("diffuseColor", "1.0 1.0 1.0");
		pinheadMat.setAttribute("transparency", opacity);
		ballApp.appendChild(pinheadMat);

		var pinshader = document.createElement("ComposedShader");
		ballApp.appendChild(pinshader);

		var pinheadradius = document.createElement("field");
		pinheadradius.setAttribute("type", "SFFloat");
		pinheadradius.setAttribute("name", "radius");
		pinheadradius.setAttribute("value", PIN_RADIUS.toString());
		pinshader.appendChild(pinheadradius);

		var pinheadncol = document.createElement("field");
		//self.pinheadncol.setAttribute("id", self.id + (ghostPin ? "_ghost" : "") + "_ncol");
		pinheadncol.setAttribute("type", "SFFloat");
		pinheadncol.setAttribute("name", "numColours");
		pinheadncol.setAttribute("value", self.numColours);
		pinshader.appendChild(pinheadncol);

		if (ghostPin)
		{
			self.ghostPinHeadNCol = pinheadncol;
		} else {
			self.pinHeadNCol = pinheadncol;
		}

		var pinheadcolor = document.createElement("field");
		//self.pinheadcolor.setAttribute("id", self.id + (ghostPin ? "_ghost" : "") + "_col");
		pinheadcolor.setAttribute("type", "MFFloat");
		pinheadcolor.setAttribute("name", "multicolours");
		pinheadcolor.setAttribute("value", self.colours);
		pinshader.appendChild(pinheadcolor);

		if (ghostPin)
		{
			self.ghostPinHeadColour = pinheadcolor;
		} else {
			self.pinHeadColour = pinheadcolor;
		}

		var pinheadhighlight = document.createElement("field");
		pinheadhighlight.setAttribute("type", "SFVec3f");
		pinheadhighlight.setAttribute("name", "highlightColor");
		pinheadhighlight.setAttribute("value", ORANGE_HIGHLIGHT);
		pinshader.appendChild(pinheadhighlight);

		var pinheadishighlighted = document.createElement("field");
		//self.pinheadishighlighted.setAttribute("id", self.id + (ghostPin ? "_ghost" : "") + "_ishighlighted");
		pinheadishighlighted.setAttribute("type", "SFBool");
		pinheadishighlighted.setAttribute("name", "highlightPin");
		pinheadishighlighted.setAttribute("value", "false");
		pinshader.appendChild(pinheadishighlighted);

		if (ghostPin)
		{
			self.ghostPinHeadIsHighlighted = pinheadishighlighted;
		} else {
			self.pinHeadIsHighlighted = pinheadishighlighted;
		}
		
		var pinuseclipplane = document.createElement("field");
		pinuseclipplane.setAttribute("type", "SFBool");
		pinuseclipplane.setAttribute("name", "useClipPlane");
		pinuseclipplane.setAttribute("value", (!ghostPin).toString());
		pinshader.appendChild(pinuseclipplane);

		var pinvert = document.createElement("ShaderPart");
		pinvert.setAttribute("type", "VERTEX");
		pinvert.setAttribute("USE", "multiVert");
		pinshader.appendChild(pinvert);

		var pinfrag = document.createElement("ShaderPart");
		pinfrag.setAttribute("type", "FRAGMENT");
		pinfrag.setAttribute("USE", "multiFrag");
		pinshader.appendChild(pinfrag);

		var pinheaddepth = document.createElement("DepthMode");

		if (!ghostPin) {
			self.pinHeadDepth = pinheaddepth;
			//.setAttribute("id", self.id + "_depth");
		}

		pinheaddepth.setAttribute("depthFunc", depthMode);
		pinheaddepth.setAttribute("enableDepthTest", (!ghostPin).toString());
		ballApp.appendChild(pinheaddepth);

		parent.appendChild(pinshape);
	};

}());
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

var PinShader = null;

(function() {
	"use strict";
	
	PinShader = function(element) {
		var pinheadshader = document.createElement("ComposedShader");
		pinheadshader.setAttribute("ID", "pinHeadShader");

		var pinvert = document.createElement("ShaderPart");
		pinvert.setAttribute("type", "VERTEX");
		pinvert.setAttribute("DEF", "multiVert");
		pinvert.textContent = "attribute vec3 position;" +
			"\nattribute vec3 normal;" +
			"\n" +
			"\nuniform mat4 modelViewMatrix;" +
			"\nuniform mat4 modelViewMatrixInverse;" +
			"\nuniform mat4 modelViewProjectionMatrix;" +
			"\nuniform float radius;" +
			"\n" +
			"\nvarying float fragColourSelect;" +
			"\nvarying vec3 fragNormal;" +
			"\nvarying vec3 fragEyeVector;" +
			"\nvarying vec4 fragPosition;" +
			"\nvarying vec3 pinPosition;" +
			"\nvoid main()" +
			"\n{" +
			"\n\tfragEyeVector = vec3(0.2, 0.2, 0.2);" +
			"\n\tfragNormal = normal;" +
			"\n\tfragColourSelect = 1.0 - ((position.y / radius) + 1.0) / 2.0;" +
			"\n\t" +
			"\n\tpinPosition = position;" +
			"\n\tfragPosition = (modelViewMatrix * vec4(position, 1.0));" +
			"\n\tgl_Position = modelViewProjectionMatrix * vec4(position, 1.0);" +
			"\n}";
		pinheadshader.appendChild(pinvert);

		var pinfrag = document.createElement("ShaderPart");
		pinfrag.setAttribute("type", "FRAGMENT");
		pinfrag.setAttribute("DEF", "multiFrag");
		var fragSource = "#ifdef GL_FRAGMENT_PRECISION_HIGH" +
			"\n\tprecision highp float;" +
			"\n#else" +
			"\n\tprecision mediump float;" +
			"\n#endif" +
			"\n";

		fragSource += "\nuniform float numColours;" +
			"\nuniform float ambientIntensity;" +
			"\nuniform float transparency;" +
			"\nvarying float fragColourSelect;" +
			"\nvarying vec3 fragNormal;" +
			"\nvarying vec3 fragEyeVector;" +
			"\nvarying vec4 fragPosition;" +
			"\nvarying vec3 pinPosition;" +
			"\nuniform vec3 multicolours[20];" +
			"\nuniform mat4 viewMatrixInverse;" +
			"\nuniform bool highlightPin;" +
			"\nuniform vec3 highlightColor;" +
			"\nuniform bool useClipPlane;" +
			"\n";

		fragSource += x3dom.shader.light(1);
		fragSource += x3dom.shader.clipPlanes(1);

		fragSource += "\nvoid main()" +
			"\n{" +
			"\n\tint colourSelected = int(floor(fragColourSelect * numColours));" +
			"\n\tvec3 eye = -pinPosition.xyz;" +
			"\n\tvec3 normal = normalize(fragNormal);" +
			"\n\tvec3 ads = lighting(light0_Type, light0_Location, light0_Direction, light0_Color, light0_Attenuation, light0_Radius, light0_Intensity, light0_AmbientIntensity, light0_BeamWidth, light0_CutOffAngle, normalize(fragNormal), eye, 0.0, ambientIntensity);" +
			"\n\tvec3 ambient = light0_Color * ads.r;" +
			"\n\tvec3 diffuse = light0_Color * ads.g;" +
			"\n\tambient = max(ambient, 0.0);" +
			"\n\tdiffuse = max(diffuse, 0.0);" +
			"\n\tvec3 pinColor = vec3(0.0,0.0,0.0);" +
			"\n\tif(useClipPlane) {" +
			"\n\t\tcalculateClipPlanes();" +
			"\n\t}" +
			"\n\tfor(int colidx = 0; colidx < 20; colidx++) {" +
			"\n\t\tif(colidx == colourSelected) {" +
			"\n\t\t\tpinColor = multicolours[colidx];" + // * max(ambient + diffuse, 0.0);" +
			"\n\t\t\tpinColor = clamp(pinColor, 0.0, 1.0);" +
			"\n\t\t\tif (highlightPin) {" +
			"\n\t\t\t\tpinColor = highlightColor;" +
			"\n\t\t\t}" +
			//"\n\t\t\tpinColor = gammaEncode(pinColor);" +
			"\n\t\t\tgl_FragColor = vec4(pinColor, transparency);" +
			"\n\t\t}" +
			"\n\t}" +
			"\n}\n\n";

		//fragSource += x3dom.shader.gammaCorrectionDecl({});

		pinfrag.textContent = fragSource;
		pinheadshader.appendChild(pinfrag);

		var coneshader = document.createElement("ComposedShader");
		coneshader.setAttribute("id", "coneShader");

		var conevert = document.createElement("ShaderPart");
		conevert.setAttribute("type", "VERTEX");
		conevert.setAttribute("DEF", "noShadeVert");

		var conevertSource = "attribute vec3 position;" +
			"\nattribute vec3 normal;" +
			"\n" +
			"\nuniform mat4 modelViewMatrixInverse;" +
			"\nuniform mat4 modelViewProjectionMatrix;" +
			"\nuniform mat4 modelViewMatrix;" +
			"\n" +
			"\nvarying vec4 fragPosition;" +
			"\nvoid main()" +
			"\n{" +
			"\n\tfragPosition = (modelViewMatrix * vec4(position, 1.0));" +
			"\n\tgl_Position = modelViewProjectionMatrix * vec4(position, 1.0);" +
			"\n}";

		conevert.textContent = conevertSource;
		coneshader.appendChild(conevert);

		var conefrag = document.createElement("ShaderPart");
		conefrag.setAttribute("type", "FRAGMENT");
		conefrag.setAttribute("DEF", "noShadeFrag");

		var coneFragSource = "#ifdef GL_FRAGMENT_PRECISION_HIGH" +
			"\n\tprecision highp float;" +
			"\n#else" +
			"\n\tprecision mediump float;" +
			"\n#endif" +
			"\n" +
			"\nuniform vec3 diffuseColor;" +
			"\nuniform float transparency;" +
			"\nuniform bool highlightPin;" +
			"\nuniform vec3 highlightColor;" +
			"\nuniform mat4 viewMatrixInverse;" +
			"\nuniform bool useClipPlane;" +
			"\nvarying vec4 fragPosition;" +
			"\n";

		coneFragSource += x3dom.shader.clipPlanes(1);

		coneFragSource += "\nvoid main()" +
			"\n{" +
			"\n\tvec3 diffuseColor = clamp(diffuseColor, 0.0, 1.0);" +
			"\n\tif(useClipPlane) {" +
			"\n\t\tcalculateClipPlanes();" +
			"\n\t}" +
			"\n\tif (highlightPin) {" +
			"\n\t\tdiffuseColor = highlightColor;" +
			"\n\t}" +
			"\n\tgl_FragColor = vec4(diffuseColor, transparency);" +
			"\n}";

		conefrag.textContent = coneFragSource;

		coneshader.appendChild(conefrag);

		element.appendChild(pinheadshader);
		element.appendChild(coneshader);
	};
}());
/**
 **  Copyright (C) 2014 3D Repo Ltd
 **
 **  This program is free software: you can redistribute it and/or modify
 **  it under the terms of the GNU Affero General Public License as
 **  published by the Free Software Foundation, either version 3 of the
 **  License, or (at your option) any later version.
 **
 **  This program is distributed in the hope that it will be useful,
 **  but WITHOUT ANY WARRANTY; without even the implied warranty of
 **  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 **  GNU Affero General Public License for more details.
 **
 **  You should have received a copy of the GNU Affero General Public License
 **  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/

// --------------------- Control Interface ---------------------

function bgroundClick(event) {
	$.event.trigger("bgroundClicked", event);
};

function clickObject(event) {
	$.event.trigger("clickObject", event);
};

function clickPin(event) {
	$.event.trigger("pinClick", event);
}

function onMouseOver(event) {
	$.event.trigger("onMouseOver", event);
}

function onMouseDown(event) {
	$.event.trigger("onMouseDown", event);
}

function onMouseUp(event) {
	$.event.trigger("onMouseUp", event);
}

function onMouseMove(event) {
	$.event.trigger("onMouseMove", event);
}

function onViewpointChange(event) {
	$.event.trigger("onViewpointChange", event);
}

function onLoaded(event) {
	$.event.trigger("onLoaded", event);
}

function runtimeReady() {
	$.event.trigger("runtimeReady");
}

x3dom.runtime.ready = runtimeReady;

// ----------------------------------------------------------
var Viewer = {};

(function() {
	"use strict";

	Viewer = function(name, element, manager, callback, errCallback) {
		// Properties
		var self = this;

		if (!name) {
			this.name = "viewer";
		} else {
			this.name = name;
		}

		callback = !callback ? function(type, value) {
			console.log(type + ": " + value);
		} : callback;

		errCallback = !errCallback ? function(type, value) {
			console.error(type + ": " + value);
		} : errCallback;

		// If not given the tag by the manager create here
		this.element = element;

		this.inline = null;
		this.runtime = null;
		this.fullscreen = false;

		this.clickingEnabled = false;

		this.avatarRadius = 0.5;

		this.pinSizeFromSettings = false;
		this.pinSize = 1.0; // Initial size

		this.defaultShowAll = true;

		this.zNear = -1;
		this.zFar = -1;

		this.manager = manager;

		this.initialized = false;

		this.downloadsLeft = 1;

		this.defaultNavMode = this.NAV_MODES.TURNTABLE;

		this.selectionDisabled = false;

		this.account = null;
		this.project = null;
		this.branch = null;
		this.revision = null;
		this.modelString = null;

		this.rootName = "model";
		this.inlineRoots = {};
		this.multipartNodes = [];
		this.multipartNodesByProject = {};

		this.setHandle = function(handle) {
			this.handle = handle;
		};

		this.logos    = [];

		this.addLogo = function() {
			if (!self.logoGroup)
			{
				self.logoGroup = document.createElement("div");
				self.logoGroup.style.width = "100%";
				self.element.appendChild(self.logoGroup);
			}

			var numLogos = this.logos.length + 1;
			var perLogo  = Math.floor(100 / numLogos);
			var widthPercentage = perLogo + "%";

			var logo = document.createElement("div");
			logo.style.position       = "absolute";
			logo.style["z-index"]     = 2;
			logo.style["text-align"]  = "center";
			logo.style.width          = "250px";
			logo.style["top"]  		  = "10px";
			logo.style.left 		  = 0;
			logo.style.right 		  = 0;
			logo.style.margin 		  = "auto";

			var logoImage = document.createElement("img");
			logoImage.setAttribute("src", logo_string);
			logoImage.setAttribute("style", "width: 100%;");
			logoImage.textContent = " ";
			logoImage.setAttribute("onclick", "logoClick()");

			var logoLink = document.createElement("a");

			if (server_config.return_path) {
				logoLink.setAttribute("href", server_config.return_path);
			} else {
				logoLink.setAttribute("href", "https://www.3drepo.io");
			}

			logoLink.appendChild(logoImage);
			logo.appendChild(logoLink);

			self.updateLogoWidth(widthPercentage);

			self.logoGroup.appendChild(logo);
			self.logos.push(logo);
		};

		this.removeLogo = function () {
			var numLogos = this.logos.length - 1;
			var widthPercentage = Math.floor(100 / numLogos) + "%";

			self.logos[numLogos].parentNode.removeChild(self.logos[numLogos]);

			self.logos.splice(numLogos,1);

			self.updateLogoWidth(widthPercentage);
		};

		this.updateLogoWidth = function(widthPercentage) {
			for(var i = 0; i < self.logos.length; i++)
			{

				self.logos[i].style.width = widthPercentage;
			}
		};

		this.init = function() {
			if (!self.initialized) {
				// If we have a viewer manager then it
				// will take care of initializing the runtime
				// else we'll do it ourselves
				x3dom.runtime.ready = self.initRuntime;

				self.addLogo();

				// Set up the DOM elements
				self.viewer = document.createElement("x3d");
				self.viewer.setAttribute("id", self.name);
				self.viewer.setAttribute("xmlns", "http://www.web3d.org/specification/x3d-namespace");
				self.viewer.setAttribute("keysEnabled", "true");
				self.viewer.setAttribute("disableTouch", "true");
				self.viewer.addEventListener("mousedown", onMouseDown);
				self.viewer.addEventListener("mouseup",  onMouseUp);
				self.viewer.style["pointer-events"] = "all";
				self.viewer.className = "viewer";

				self.element.appendChild(self.viewer);

				self.scene = document.createElement("Scene");
				self.scene.setAttribute("onbackgroundclicked", "bgroundClick(event);");
				self.scene.setAttribute("dopickpass", false);
				self.viewer.appendChild(self.scene);

				self.pinShader = new PinShader(self.scene);

				self.bground = null;
				self.currentNavMode = null;

				self.createBackground();

				self.environ = document.createElement("environment");
				self.environ.setAttribute("frustumCulling", "true");
				self.environ.setAttribute("smallFeatureCulling", "true");
				self.environ.setAttribute("smallFeatureThreshold", 5);
				self.environ.setAttribute("occlusionCulling", "true");
				self.environ.setAttribute("sorttrans", "true");
				self.environ.setAttribute("gammaCorrectionDefault", "linear");
				self.scene.appendChild(self.environ);

				self.setAmbientLight();

				self.createViewpoint(self.name + "_default");

				self.nav = document.createElement("navigationInfo");
				self.nav.setAttribute("headlight", "false");
				self.nav.setAttribute("type", self.defaultNavMode);
				self.scene.appendChild(self.nav);

				self.loadViewpoint = self.name + "_default"; // Must be called after creating nav

				self.viewer.addEventListener("keypress", function(e) {
					if (e.charCode === "r".charCodeAt(0)) {
						self.reset();
						self.setApp(null);
						self.setNavMode(self.NAV_MODES.WALK);
						self.disableClicking();
					} else if (e.charCode === "a".charCodeAt(0)) {
						self.showAll();
						self.enableClicking();
					} else if (e.charCode === "u".charCodeAt(0)) {
						self.revealAll();
					}
				});

				self.initialized = true;

				if (manager) {
					manager.registerMe(self);
				}

				self.enableClicking();

				callback(self.EVENT.READY, {
					name: self.name,
					model: self.modelString
				});
			}
		};

		this.close = function() {
			self.viewer.parentNode.removeChild(self.viewer);
			self.viewer = null;
		};

		// This is called when the X3DOM runtime is initialized
		this.initRuntime = function() {
			if (this.doc.id === self.name) {
				self.runtime = this;

				callback(self.EVENT.RUNTIME_READY, {
					name: self.name
				});
			}

			self.runtime.enterFrame = function () {
					if (self.gyroOrientation)
					{
							self.gyroscope(
									self.gyroOrientation.alpha,
									self.gyroOrientation.beta,
									self.gyroOrientation.gamma
							);
					}
			};

			self.showAll = function() {
				self.runtime.fitAll();

				// TODO: This is a hack to get around a bug in X3DOM
				self.getViewArea()._flyMat = null;

				self.setNavMode(self.defaultNavMode);
			};

			self.getCurrentViewpoint().addEventListener("viewpointChanged", self.viewPointChanged);

			$(document).on("onLoaded", function(event, objEvent) {
				if (self.loadViewpoint) {
					self.setCurrentViewpoint(self.loadViewpoint);
				}

				var targetParent = objEvent.target._x3domNode._nameSpace.doc._x3dElem;

				self.loadViewpoints();

				if (targetParent === self.viewer) {
					self.setDiffColors(null);
				}

				if (objEvent.target.tagName.toUpperCase() === "INLINE") {
					self.inlineRoots[objEvent.target.nameSpaceName] = objEvent.target;
				} else if (objEvent.target.tagName.toUpperCase() === "MULTIPART") {
					var nameSpaceName = objEvent.target._x3domNode._nameSpace.name;
					if (!self.multipartNodesByProject.hasOwnProperty(nameSpaceName)) {
						self.multipartNodesByProject[nameSpaceName] = {};
					}

					var multipartName = objEvent.target.getAttribute("id");
					var multipartNameParts = multipartName.split("__");
					var multipartID = multipartNameParts[multipartNameParts.length - 1];

					self.multipartNodesByProject[nameSpaceName][multipartID] = objEvent.target;

					self.multipartNodes.push(objEvent.target);
				}

				self.downloadsLeft += (objEvent.target.querySelectorAll("[load]").length - 1);

				if (!self.pinSizeFromSettings) {
					var sceneBBox = self.getScene()._x3domNode.getVolume();
					var sceneSize = sceneBBox.max.subtract(sceneBBox.min).length();
					self.pinSize = sceneSize / 20;
				}

				self.showAll();

				if (!self.downloadsLeft) {
					callback(self.EVENT.LOADED);
				}
			});
		};

		this.setAmbientLight = function(lightDescription) {
			if (self.light) {
				var i = 0;
				var attributeNames = [];

				for(i = 0; i < self.light.attributes.length; i++)
				{
					attributeNames.push(self.light.attributes[i].name);
				}

				for(i = 0; i < attributeNames.length; i++)
				{
					self.light.removeAttribute(attributeNames[i]);
				}
			} else {
				self.light = document.createElement("directionallight");
				self.scene.appendChild(self.light);
			}

			if (!lightDescription)
			{
				//self.light.setAttribute("intensity", "0.5");
				self.light.setAttribute("color", "0.714, 0.910, 0.953");
				self.light.setAttribute("direction", "0, -0.9323, -0.362");
				self.light.setAttribute("global", "true");
				self.light.setAttribute("ambientIntensity", "0.8");
				self.light.setAttribute("shadowIntensity", 0.0);
			} else {
				for (var attr in lightDescription)
				{
					if (lightDescription.hasOwnProperty(attr))
					{
						self.light.setAttribute(attr, lightDescription[attr]);
					}
				}
			}

		};

		this.createBackground = function(colourDescription) {
			if (self.bground) {
				var i = 0;
				var attributeNames = [];

				for(i = 0; i < self.bground.attributes.length; i++)
				{
					attributeNames.push(self.bground.attributes[i].name);
				}

				for(i = 0; i < attributeNames.length; i++)
				{
					self.bground.removeAttribute(attributeNames[i]);
				}
			} else {
				self.bground = document.createElement("background");
				self.scene.appendChild(self.bground);
			}

			if (!colourDescription)
			{
				self.bground.setAttribute("DEF", self.name + "_bground");
				self.bground.setAttribute("skyangle", "0.9 1.5 1.57");
				self.bground.setAttribute("skycolor", "0.21 0.18 0.66 0.2 0.44 0.85 0.51 0.81 0.95 0.83 0.93 1");
				self.bground.setAttribute("groundangle", "0.9 1.5 1.57");
				self.bground.setAttribute("groundcolor", "0.65 0.65 0.65 0.73 0.73 0.73 0.81 0.81 0.81 0.91 0.91 0.91");
				self.bground.textContent = " ";

			} else {
				self.bground.setAttribute("DEF", self.name + "_bground");

				for (var attr in colourDescription)
				{
					if (colourDescription.hasOwnProperty(attr))
					{
						self.bground.setAttribute(attr, colourDescription[attr]);
					}
				}
			}

		};

		this.gyroscope = function (alpha, beta, gamma) {
			var degToRad = Math.PI / 180.0;

			var b = (alpha ? alpha : 0);
			var a = (beta  ? beta : 0);
			var g = -(gamma ? gamma : 0);

			a *= degToRad; b *= degToRad; g *= degToRad;

			var cA = Math.cos(a / 2.0);
			var cB = Math.cos(b / 2.0);
			var cG = Math.cos(g / 2.0);
			var sA = Math.sin(a / 2.0);
			var sB = Math.sin(b / 2.0);
			var sG = Math.sin(g / 2.0);

			/*
			var w = cB * cG * cA - sB * sG * sA;
			var x = sB * cG * cA - cB * sG * sA;
			var y = cB * sG * cA  sB * cG * sA;
			var z = cB * cG * sA  sB * sG * cA;
			*/

			var x = sA * cB * cG + cA * sB * sG;
			var y = cA * sB * cG - sA * cB * sG;
			var z = cA * cB * sG - sA * sB * cG;
			var w = cA * cB * cG + sA * sB * sG;

			var q           = new x3dom.fields.Quaternion(x,y,z,w);
			var screenAngle = (window.orientation ? window.orientation : 0) * degToRad * -1;
			var screenQuat  = x3dom.fields.Quaternion.axisAngle(new x3dom.fields.SFVec3f(0,0,1),screenAngle);
			var viewQuat    = new x3dom.fields.Quaternion.axisAngle(new x3dom.fields.SFVec3f(1,0,0), -Math.PI * 0.5);

			//q = self.gyroStart.multiply(q);
			q = q.multiply(viewQuat);
			q = q.multiply(screenQuat);

			var flyMat = null;
			var vp     = self.getCurrentViewpoint()._x3domNode;

			if (self.rollerCoasterMatrix)
			{
				var qMat = q.toMatrix();
				flyMat = qMat.transpose().mult(self.rollerCoasterMatrix.inverse());
			} else {

				flyMat = vp.getViewMatrix().inverse();
				flyMat.setRotate(q);
				flyMat = flyMat.inverse();
			}

			vp._viewMatrix.setValues(flyMat);
		};

		this.switchDebug = function() {
			self.getViewArea()._visDbgBuf = !self.getViewArea()._visDbgBuf;
		};

		this.showStats = function() {
			self.runtime.canvas.stateViewer.display();
		};

		this.getViewArea = function() {
			return self.runtime.canvas.doc._viewarea;
		};

		this.getViewMatrix = function() {
			return self.getViewArea().getViewMatrix();
		};

		this.getProjectionMatrix = function() {
			return self.getViewArea().getProjectionMatrix();
		};

		this.onMouseUp = function(functionToBind) {
			$(document).on("onMouseUp", functionToBind);
		};

		this.onMouseDown = function(functionToBind) {
			$(document).on("onMouseDown", functionToBind);
		}

		this.mouseDownPickPoint = function(event, pickEvent)
		{
			var pickingInfo = self.getViewArea()._pickingInfo;

			// Hack until double click problem solved
			self.pickPoint(); // This updates self.pickObject
			if (self.pickObject.pickObj !== null) {
				pickingInfo.pickObj = self.pickObject;
			}

			if (pickingInfo.pickObj)
			{
				var account, project;

				var projectParts = pickingInfo.pickObj._xmlNode ?
					pickingInfo.pickObj._xmlNode.getAttribute("id").split("__") :
					pickingInfo.pickObj.pickObj._xmlNode.getAttribute("id").split("__");

				var objectID = pickingInfo.pickObj.partID ?
					pickingInfo.pickObj.partID :
					projectParts[2];

				account = projectParts[0];
				project = projectParts[1];

				var inlineTransName = ViewerUtil.escapeCSSCharacters(account + "__" + project);
				var projectInline = self.inlineRoots[inlineTransName];
				var trans = projectInline._x3domNode.getCurrentTransform();

				callback(self.EVENT.PICK_POINT, {
					id: objectID,
					position: pickingInfo.pickPos,
					normal: pickingInfo.pickNorm,
					trans: trans
				});
			} else {
				callback(self.EVENT.PICK_POINT, {
					position: pickingInfo.pickPos,
					normal: pickingInfo.pickNorm
				});
			}
		};

		this.onMouseDown(this.mouseDownPickPoint);

		this.onViewpointChanged = function(functionToBind) {
			$(self.viewer).on("myViewpointHasChanged", functionToBind);
		};

		this.offViewpointChanged = function(functionToBind) {
			$(self.viewer).off("myViewpointHasChanged", functionToBind);
		};

		this.viewPointChanged = function(event) {
			var vpInfo = self.getCurrentViewpointInfo();
			var eye = vpInfo.position;
			var viewDir = vpInfo.view_dir;

			if (self.currentNavMode === self.NAV_MODES.HELICOPTER) {
				self.nav._x3domNode._vf.typeParams[0] = Math.asin(viewDir[1]);
				self.nav._x3domNode._vf.typeParams[1] = eye[1];
			}

			$(self.viewer).trigger("myViewpointHasChanged", event);
		};

		this.onBackgroundClicked = function(functionToBind) {
			$(document).on("bgroundClicked", functionToBind);
		};

		this.offBackgroundClicked = function(functionToBind) {
			$(document).off("bgroundClicked", functionToBind);
		};

		this.selectParts = function(part, zoom) {
			if (!Array.isArray(part)) {
				part = [part];
			}

			if (zoom) {
				for (var i = 0; i < part.length; i++) {
					part[i].fit();
				}
			}

			if (self.oldPart) {
				for (var i = 0; i < self.oldPart.length; i++) {
					self.oldPart[i].resetColor();
				}
			}

			self.oldPart = part;

			for (var i = 0; i < part.length; i++) {
				part[i].setEmissiveColor(self.SELECT_COLOUR.EMISSIVE, "front");
			}
		};

		this.clickObject = function(event, objEvent) {
			var account = null;
			var project = null;
			var id = null;

			if ((objEvent.button === 1) && !self.selectionDisabled) {
				if (objEvent.partID) {
					id = objEvent.partID;

					account = objEvent.part.multiPart._nameSpace.name.split("__")[0];
					project = objEvent.part.multiPart._nameSpace.name.split("__")[1];

				}
			}

			callback(self.EVENT.OBJECT_SELECTED, {
				account: account,
				project: project,
				id: id,
				source: "viewer"
			});
		};

		this.highlightObjects = function(account, project, id, ids, zoom) {
			var nameSpaceName = null;

			/*
			if (account && project) {
				nameSpaceName = account + "__" + project;
			}
			*/

			if (!ids) {
				ids = [];
			}

			// Is this a multipart project
			if (!nameSpaceName || self.multipartNodesByProject.hasOwnProperty(nameSpaceName)) {
				var fullPartsList = [];
				var nsMultipartNodes;

				// If account and project have been specified
				// this helps narrow the search
				if (nameSpaceName) {
					nsMultipartNodes = self.multipartNodesByProject[nameSpaceName];
				} else {
					// Otherwise iterate over everything
					nsMultipartNodes = self.multipartNodes;
				}

				for (var multipartNodeName in nsMultipartNodes) {
					if (nsMultipartNodes.hasOwnProperty(multipartNodeName)) {
						var parts = nsMultipartNodes[multipartNodeName].getParts(ids);

						if (parts && parts.ids.length > 0) {
							fullPartsList.push(parts);
						}
					}
				}

				self.selectParts(fullPartsList, zoom);
			}

			var object = $("[id$=" + id + "]");

			if (object[0]) {
				self.setApp(object[0]);
			}
		};

		this.switchedOldParts = [];
		this.switchedObjects = [];

		this.switchObjectVisibility = function(account, project, id, ids, state) {
			var nameSpaceName = null;
			var i;

			if (account && project) {
				nameSpaceName = account + "__" + project;
			}

			if (!ids) {
				ids = [];
			}

			// Is this a multipart project
			if (!nameSpaceName || self.multipartNodesByProject.hasOwnProperty(nameSpaceName)) {
				var fullPartsList = [];
				var nsMultipartNodes;

				// If account and project have been specified
				// this helps narrow the search
				if (nameSpaceName) {
					nsMultipartNodes = self.multipartNodesByProject[nameSpaceName];
				} else {
					// Otherwise iterate over everything
					nsMultipartNodes = self.multipartNodes;
				}

				for (i = 0; i < self.switchedOldParts.length; i++) {
					if (ids.indexOf(self.switchedOldParts[i]) > -1) {
						self.switchedOldParts[i].setVisibility(state);
						delete self.switchOldParts[i];
						i--;
					}
				}

				for (var multipartNodeName in nsMultipartNodes) {
					if (nsMultipartNodes.hasOwnProperty(multipartNodeName)) {
						var parts = nsMultipartNodes[multipartNodeName].getParts(ids);

						if (parts && parts.ids.length > 0) {
							self.switchedOldParts = self.switchedOldParts.concat(parts.ids);
							parts.setVisibility(state);
						}
					}
				}
			}

			for (i = 0; i < self.switchedObjects.length; i++) {
				if (ids.indexOf(self.switchedObjects[i]) > -1) {
					self.switchedObjects[i].setAttribute("render", state.toString());
					delete self.switchOldParts[i];
					i--;
				}
			}

			var object = $("[id$=" + id + "]");

			if (object[0]) {
				object[0].setAttribute("render", state.toString());
				self.switchedObjects.push(id);
			}
		};


		/*
		$(document).on("partSelected", function(event, part, zoom) {
			self.selectParts(part, zoom);

			var obj = {};
			obj.multipart = true;
			obj.id = part.multiPart._nameSpace.name + "__" + part.partID;


			callback(self.EVENT.OBJECT_SELECTED, {
				account: ,
				project:
			})


			$(document).trigger("objectSelected", obj);
		});

		$(document).on("objectSelected", function(event, object, zoom) {
			if (object !== undefined) {
				if (!object.hasOwnProperty("multipart")) {
					if (zoom) {
						if (object.getAttribute("render") !== "false") {
							self.lookAtObject(object);
						}
					}
				}
			} else {
				self.selectParts([], false);
			}

			self.setApp(object);
		});
		*/

		$(document).on("pinClick", function(event, clickInfo) {
			var pinID = clickInfo.target.parentElement.parentElement.parentElement.parentElement.parentElement.id;
			callback(self.EVENT.CLICK_PIN,
			{
				id : pinID
			});
		});

		$(document).on("onMouseDown", function(event, mouseEvent) {
			$("body")[0].style["pointer-events"] = "none";
		});

		$(document).on("onMouseUp", function(event, mouseEvent) {
			$("body")[0].style["pointer-events"] = "all";
		});

		this.onClickObject = function(functionToBind) {
			$(document).on("clickObject", functionToBind);
		};

		this.offClickObject = function(functionToBind) {
			$(document).off("clickObject", functionToBind);
		};

		if (0) {
			this.moveScale = 1.0;

			self.element.addEventListener("keypress", function(e) {
				var mapPos = $("#model__mapPosition")[0];
				var oldTrans = mapPos.getAttribute("translation").split(",").map(
					function(res) {
						return parseFloat(res);
					});

				if (e.charCode === "q".charCodeAt(0)) {
					oldTrans[0] = oldTrans[0] + 0.5 * self.moveScale;
					mapPos.setAttribute("translation", oldTrans.join(","));
				}

				if (e.charCode === "w".charCodeAt(0)) {
					oldTrans[0] = oldTrans[0] - 0.5 * self.moveScale;
					mapPos.setAttribute("translation", oldTrans.join(","));
				}

				if (e.charCode === "e".charCodeAt(0)) {
					oldTrans[2] = oldTrans[2] + 0.5 * self.moveScale;
					mapPos.setAttribute("translation", oldTrans.join(","));
				}

				if (e.charCode === "f".charCodeAt(0)) {
					oldTrans[2] = oldTrans[2] - 0.5 * self.moveScale;
					mapPos.setAttribute("translation", oldTrans.join(","));
				}

				var mapRotation = $("#model__mapRotation")[0];
				var oldRotation = mapRotation.getAttribute("rotation").split(",").map(
					function(res) {
						return parseFloat(res);
					});

				if (e.charCode === "g".charCodeAt(0)) {
					oldRotation[3] = oldRotation[3] + 0.01 * self.moveScale;
					mapRotation.setAttribute("rotation", oldRotation.join(","));
				}

				if (e.charCode === "h".charCodeAt(0)) {
					oldRotation[3] = oldRotation[3] - 0.01 * self.moveScale;
					mapRotation.setAttribute("rotation", oldRotation.join(","));
				}

				var oldScale = mapPos.getAttribute("scale").split(",").map(
					function(res) {
						return parseFloat(res);
					});

				if (e.charCode === "j".charCodeAt(0)) {
					oldScale[0] = oldScale[0] + 0.01 * self.moveScale;
					oldScale[2] = oldScale[2] + 0.01 * self.moveScale;

					mapPos.setAttribute("scale", oldScale.join(","));
				}

				if (e.charCode === "k".charCodeAt(0)) {
					oldScale[0] = oldScale[0] - 0.01 * self.moveScale;
					oldScale[2] = oldScale[2] - 0.01 * self.moveScale;

					mapPos.setAttribute("scale", oldScale.join(","));
				}
			});
		}

		this.viewpoints = {};
		this.viewpointsNames = {};

		this.selectedViewpointIdx = 0;
		this.selectedViewpoint = null;

		this.isFlyingThrough = false;
		this.flyThroughTime = 1000;

		this.flyThrough = function() {
			if (!self.isFlyingThrough) {
				self.isFlyingThrough = true;
				setTimeout(self.flyThroughTick, self.flyThroughTime);
			} else {
				self.isFlyingThrough = false;
			}
		};

		this.flyThroughTick = function() {
			var newViewpoint = self.selectedViewpointIdx + 1;

			if (newViewpoint === self.viewpoints.length) {
				newViewpoint = 0;
			}

			self.setCurrentViewpoint(self.viewpoints[newViewpoint]);

			if (self.isFlyingThrough) {
				setTimeout(self.flyThroughTick, self.flyThroughTime);
			}
		};

		this.getViewpointGroupAndName = function(id) {
			var splitID = id.trim().split("__");
			var name, group;

			if (splitID.length > 1) {
				group = splitID[0].trim();
				name = splitID[1].trim();
			} else {
				name = splitID[0].trim();
				group = "uncategorized";
			}

			return {
				group: group,
				name: name
			};
		};

		this.loadViewpoints = function() {
			var viewpointList = $("Viewpoint");

			for (var v = 0; v < viewpointList.length; v++) {
				if (viewpointList[v].hasAttribute("id")) {
					var id = viewpointList[v].id.trim();
					viewpointList[v].DEF = id;

					var groupName = self.getViewpointGroupAndName(id);

					if (!self.viewpoints[groupName.group]) {
						self.viewpoints[groupName.group] = {};
					}

					self.viewpoints[groupName.group][groupName.name] = id;
					self.viewpointsNames[id] = viewpointList[v];
				}
			}
		};

		this.loadViewpoint = null;

		this.createViewpoint = function(name, from, at, up) {
			var groupName = self.getViewpointGroupAndName(name);

			if (!(self.viewpoints[groupName.group] && self.viewpoints[groupName.group][groupName.name])) {
				var newViewPoint = document.createElement("viewpoint");
				newViewPoint.setAttribute("id", name);
				newViewPoint.setAttribute("def", name);
				self.scene.appendChild(newViewPoint);

				if (from && at && up) {
					var q = self.getAxisAngle(from, at, up);
					newViewPoint.setAttribute("orientation", q.join(","));
				}

				if (!self.viewpoints[groupName.group]) {
					self.viewpoints[groupName.group] = {};
				}

				self.viewpoints[groupName.group][groupName.name] = name;
				self.viewpointsNames[name] = newViewPoint;

			} else {
				console.error("Tried to create viewpoint with duplicate name: " + name);
			}
		};

		this.setCurrentViewpointIdx = function(idx) {
			var viewpointNames = Object.keys(self.viewpointsNames);
			self.setCurrentViewpoint(viewpointNames[idx]);
		};

		this.setCurrentViewpoint = function(id) {
			if (Object.keys(self.viewpointsNames).indexOf(id) !== -1) {
				var viewpoint = self.viewpointsNames[id];

				// Remove event listener from viewpoint
				if (self.currentViewpoint) {
					self.currentViewpoint._xmlNode.removeEventListener("viewpointChanged", self.viewPointChanged);
				}

				self.currentViewpoint = viewpoint._x3domNode;

				viewpoint.setAttribute("bind", true);
				self.getViewArea().resetView();

				// TODO: This is a hack to get around a bug in X3DOM
				self.getViewArea()._flyMat = null;

				viewpoint.addEventListener("viewpointChanged", self.viewPointChanged);
				self.loadViewpoint = null;
				viewpoint.appendChild(self.nav);

				self.runtime.resetExamin();

				self.applySettings();

				if (id === (self.name + "_default")) {
					if (self.defaultShowAll) {
						self.runtime.fitAll();
					} else {
						self.reset();
					}
				}

				return;
			}

			self.loadViewpoint = id;
		};

		this.updateSettings = function(settings) {
			if (settings) {
				self.settings = settings;
				self.applySettings();
			}
		};

		this.applySettings = function() {
			if (self.settings) {
				if (self.settings.hasOwnProperty("start_all")) {
					self.defaultShowAll = self.settings.start_all;
				}

				if (self.settings.hasOwnProperty("speed")) {
					self.setSpeed(self.settings.speed);
				}

				if (self.settings.hasOwnProperty("avatarHeight")) {
					self.changeAvatarHeight(self.settings.avatarHeight);
				}

				if (self.settings.hasOwnProperty("defaultNavMode")) {
					self.defaultNavMode = self.settings.defaultNavMode;
				}

				if (self.settings.hasOwnProperty("pinSize")) {
					self.pinSize = self.settings.pinSize;
					self.pinSizeFromSettings = true; // Stop the auto-calculation
				}

				if (self.settings.hasOwnProperty("visibilityLimit")) {
					self.nav.setAttribute("visibilityLimit", self.settings.visibilityLimit);
				}

				if (self.settings.hasOwnProperty("zFar")) {
					self.currentViewpoint._xmlNode.setAttribute("zFar", self.settings.zFar);
				}

				if (self.settings.hasOwnProperty("zNear")) {
					self.currentViewpoint._xmlNode.setAttribute("zNear", self.settings.zNear);
				}

				if (self.settings.hasOwnProperty("background")) {
					self.createBackground(self.settings.background);
				}

				if (self.settings.hasOwnProperty("ambientLight")) {
					self.setAmbientLight(self.settings.ambientLight);
				}
			}
		};

		this.lookAtObject = function(obj) {
			self.runtime.fitObject(obj, true);
		};

		this.applyApp = function(nodes, factor, emiss, otherSide) {
			var m_idx, origDiff, origAmb;

			if (!otherSide) {
				for (m_idx = 0; m_idx < nodes.length; m_idx++) {
					if (nodes[m_idx]._x3domNode) {
						origDiff = nodes[m_idx]._x3domNode._vf.diffuseColor;
						nodes[m_idx]._x3domNode._vf.diffuseColor.setValues(origDiff.multiply(factor));

						origAmb = nodes[m_idx]._x3domNode._vf.ambientIntensity;
						nodes[m_idx]._x3domNode._vf.ambientIntensity = origAmb * factor;

						nodes[m_idx]._x3domNode._vf.emissiveColor.setValueByStr(emiss);
					}
				}
			} else {
				for (m_idx = 0; m_idx < nodes.length; m_idx++) {
					if (nodes[m_idx]._x3domNode) {
						origDiff = nodes[m_idx]._x3domNode._vf.backDiffuseColor;
						nodes[m_idx]._x3domNode._vf.backDiffuseColor.setValues(origDiff.multiply(factor));

						origAmb = nodes[m_idx]._x3domNode._vf.backAmbientIntensity;
						nodes[m_idx]._x3domNode._vf.backAmbientIntensity = origAmb * factor;

						nodes[m_idx]._x3domNode._vf.backEmissiveColor.setValueByStr(emiss);
					}
				}
			}
		};

		this.pickObject = {};

		this.pickPoint = function(x, y) {
			var viewArea = self.getViewArea();
			var scene = viewArea._scene;

			var oldPickMode = scene._vf.pickMode.toLowerCase();
			scene._vf.pickMode = "idbuf";
			scene._vf.pickMode = oldPickMode;

			self.pickObject.pickPos = viewArea._pickingInfo.pickPos;
			self.pickObject.pickNorm = viewArea._pickingInfo.pickNorm;
			self.pickObject.pickObj = viewArea._pickingInfo.pickObj;
			self.pickObject.part = null;
			self.pickObject.partID = null;

			var objId = viewArea._pickingInfo.shadowObjectId;

			if (scene._multiPartMap) {
				for (var mpi = 0; mpi < scene._multiPartMap.multiParts.length; mpi++) {
					var mp = scene._multiPartMap.multiParts[mpi];

					if (objId > mp._minId && objId <= mp._maxId) {
						var colorMap = mp._inlineNamespace.defMap.MultiMaterial_ColorMap;
						var emissiveMap = mp._inlineNamespace.defMap.MultiMaterial_EmissiveMap;
						var specularMap = mp._inlineNamespace.defMap.MultiMaterial_SpecularMap;
						var visibilityMap = mp._inlineNamespace.defMap.MultiMaterial_VisibilityMap;

						self.pickObject.part = new x3dom.Parts(mp, [objId - mp._minId], colorMap, emissiveMap, specularMap, visibilityMap);
						self.pickObject.partID = mp._idMap.mapping[objId - mp._minId].name;
						self.pickObject.pickObj = self.pickObject.part.multiPart;
					}
				}
			}
		};

		this.oneGrpNodes = [];
		this.twoGrpNodes = [];

		this.setApp = function(group, app) {
			if (!group || !group.multipart) {
				if (app === undefined) {
					app = self.SELECT_COLOUR.EMISSIVE;
				}

				self.applyApp(self.oneGrpNodes, 2.0, "0.0 0.0 0.0", false);
				self.applyApp(self.twoGrpNodes, 2.0, "0.0 0.0 0.0", false);
				self.applyApp(self.twoGrpNodes, 2.0, "0.0 0.0 0.0", true);

				// TODO: Make this more efficient
				self.applyApp(self.diffColorAdded, 0.5, "0.0 1.0 0.0");
				self.applyApp(self.diffColorDeleted, 0.5, "1.0 0.0 0.0");

				if (group) {
					self.twoGrpNodes = group.getElementsByTagName("TwoSidedMaterial");
					self.oneGrpNodes = group.getElementsByTagName("Material");
				} else {
					self.oneGrpNodes = [];
					self.twoGrpNodes = [];
				}

				self.applyApp(self.oneGrpNodes, 0.5, app, false);
				self.applyApp(self.twoGrpNodes, 0.5, app, false);
				self.applyApp(self.twoGrpNodes, 0.5, app, true);

				self.viewer.render();
			}
		};

		this.setNavMode = function(mode) {
			if (self.currentNavMode !== mode) {
				// If the navigation mode has changed

				if (mode === self.NAV_MODES.WAYFINDER) { // If we are entering wayfinder navigation
					waypoint.init();
				}

				if (self.currentNavMode === self.NAV_MODES.WAYFINDER) { // Exiting the wayfinding mode
					waypoint.close();
				}

				if (mode === self.NAV_MODES.HELICOPTER) {
					var vpInfo = self.getCurrentViewpointInfo();
					var eye = vpInfo.position;
					var viewDir = vpInfo.view_dir;

					self.nav._x3domNode._vf.typeParams[0] = Math.asin(viewDir[1]);
					self.nav._x3domNode._vf.typeParams[1] = eye[1];
				}

				self.currentNavMode = mode;
				self.nav.setAttribute("type", mode);

				if (mode === self.NAV_MODES.WALK) {
					self.disableClicking();
					self.setApp(null);
				}
				/*else if (mode == "HELICOPTER") {
					self.disableSelecting();
				} */
				else {
					self.enableClicking();
				}

				if ((mode === self.NAV_MODES.WAYFINDER) && waypoint) {
					waypoint.resetViewer();
				}

				if (mode === self.NAV_MODES.TURNTABLE) {
					self.nav.setAttribute("typeParams", "-0.4 60.0 0 3.14 0.00001");
				}
			}
		};

		this.reload = function() {
			x3dom.reload();
		};

		this.startingPoint = [0.0, 0.0, 0.0];
		this.setStartingPoint = function(x, y, z) {
			self.startingPoint[0] = x;
			self.startingPoint[1] = y;
			self.startingPoint[2] = z;
		};

		this.defaultOrientation = [0.0, 0.0, 1.0];
		this.setStartingOrientation = function(x, y, z) {
			self.defaultOrientation[0] = x;
			self.defaultOrientation[1] = y;
			self.defaultOrientation[2] = z;
		};

		this.setCameraPosition = function(pos) {
			var vpInfo = self.getCurrentViewpointInfo();

			var viewDir = vpInfo.view_dir;
			var up = vpInfo.up;

			self.updateCamera(pos, up, viewDir);
		};

		this.moveCamera = function(dV) {
			var currentPos = self.getCurrentViewpointInfo().position;
			currentPos[0] += dV[0];
			currentPos[1] += dV[1];
			currentPos[2] += dV[2];

			self.setCameraPosition(currentPos);
		};

		this.setCameraViewDir = function(viewDir, upDir) {
			var currentPos = self.getCurrentViewpointInfo().position;
			self.updateCamera(currentPos, upDir, viewDir);
		};

		this.setCamera = function(pos, viewDir, upDir, animate, rollerCoasterMode) {
			self.updateCamera(pos, upDir, viewDir, animate, rollerCoasterMode);
		};

		this.updateCamera = function(pos, up, viewDir, animate, rollerCoasterMode) {
			if (!viewDir)
			{
				viewDir = self.getCurrentViewpointInfo().view_dir;
			}

			if (!up)
			{
				up = self.getCurrentViewpointInfo().up;
			}
			up = ViewerUtil.normalize(up);

			var x3domView = new x3dom.fields.SFVec3f(viewDir[0], viewDir[1], viewDir[2]);
			var x3domUp   = new x3dom.fields.SFVec3f(up[0], up[1], up[2]);
			var x3domFrom = new x3dom.fields.SFVec3f(pos[0], pos[1], pos[2]);
			var x3domAt   = x3domFrom.add(x3domView);

			var viewMatrix = x3dom.fields.SFMatrix4f.lookAt(x3domFrom, x3domAt, x3domUp);

			var currViewpoint = self.getCurrentViewpoint()._x3domNode;

			if (self.currentNavMode === self.NAV_MODES.HELICOPTER) {
				self.nav._x3domNode._vf.typeParams[0] = Math.asin(x3domView.y);
				self.nav._x3domNode._vf.typeParams[1] = x3domFrom.y;
			}

			if (animate)
			{
				self.getViewArea().animateTo(viewMatrix.inverse(), currViewpoint);
			} else {
				if (rollerCoasterMode)
				{
					self.rollerCoasterMatrix = viewMatrix;
				} else {
					self.getCurrentViewpoint()._x3domNode._viewMatrix.setValues(viewMatrix.inverse());
					self.getViewArea()._doc.needRender = true;
				}
			}

			if (self.linked) {
				self.manager.switchMaster(self.handle);
			}
		};

		this.linked = false;
		this.linkMe = function() {
			// Need to be attached to the viewer master
			if (!self.manager) {
				return;
			}

			self.manager.linkMe(self.handle);
			self.onViewpointChanged(self.manager.viewpointLinkFunction);

			self.viewer.addEventListener("mousedown", function() {
				self.manager.switchMaster(self.handle);
			});

			self.linked = true;
		};


		this.collDistance = 0.1;
		this.changeCollisionDistance = function(collDistance) {
			self.collDistance = collDistance;
			self.nav._x3domNode._vf.avatarSize[0] = collDistance;
		};

		this.avatarHeight = 1.83;
		this.changeAvatarHeight = function(height) {
			self.avatarHeight = height;
			self.nav._x3domNode._vf.avatarSize[1] = height;
		};

		this.stepHeight = 0.4;
		this.changeStepHeight = function(stepHeight) {
			self.stepHeight = stepHeight;
			self.nav._x3domNode._vf.avatarSize[2] = stepHeight;
		};

		this.reset = function() {
			self.setCurrentViewpoint("model__start");

			self.changeCollisionDistance(self.collDistance);
			self.changeAvatarHeight(self.avatarHeight);
			self.changeStepHeight(self.stepHeight);
		};

		this.loadModel = function(account, project, branch, revision) {
			var url = "";

			if (revision === "head") {
				url = server_config.apiUrl(account + "/" + project + "/revision/" + branch + "/head.x3d.mp");
			} else {
				url = server_config.apiUrl(account + "/" + project + "/revision/" + revision + ".x3d.mp");
			}

			self.account = account;
			self.project = project;
			self.branch = branch;
			self.revision = revision;

			self.modelString = account + "_" + project + "_" + branch + "_" + revision;

			self.loadURL(url);
		};

		this.loadURL = function(url) {
			if (self.inline) {
				self.inline.parentNode.removeChild(self.inline);
				self.inline = null; // Garbage collect
			}

			self.inline = document.createElement("inline");
			self.scene.appendChild(self.inline);

			if (self.account && self.project) {
				self.rootName = self.account + "__" + self.project;
			} else {
				self.rootName = "model";
			}

			self.inline.setAttribute("namespacename", self.rootName);
			self.inline.setAttribute("onload", "onLoaded(event);");
			self.inline.setAttribute("url", url);
			self.reload();

			self.url = url;

			callback(self.EVENT.START_LOADING, {
				name: self.name
			});
		};

		this.getRoot = function() {
			return self.inline;
		};

		this.getScene = function() {
			return self.scene;
		};

		this.getCurrentViewpoint = function() {
			return self.getViewArea()._scene.getViewpoint()._xmlNode;
		};

		this.getCurrentViewpointInfo = function() {
			var viewPoint = {};

			var origViewTrans = self.getViewArea()._scene.getViewpoint().getCurrentTransform();
			var viewMat = self.getViewMatrix().inverse();

			var viewRight = viewMat.e0();
			var viewUp = viewMat.e1();
			var viewDir = viewMat.e2().multiply(-1); // Because OpenGL points out of screen
			var viewPos = viewMat.e3();

			var center = self.getViewArea()._scene.getViewpoint().getCenterOfRotation();

			var lookAt = null;

			if (center) {
				lookAt = center.subtract(viewPos);
			} else {
				lookAt = viewPos.add(viewDir);
			}

			var projMat = self.getProjectionMatrix();

			// More viewing direction than lookAt to sync with Assimp
			viewPoint.up = [viewUp.x, viewUp.y, viewUp.z];
			viewPoint.position = [viewPos.x, viewPos.y, viewPos.z];
			viewPoint.look_at = [lookAt.x, lookAt.y, lookAt.z];
			viewPoint.view_dir = [viewDir.x, viewDir.y, viewDir.z];
			viewPoint.right = [viewRight.x, viewRight.y, viewRight.z];
			viewPoint.unityHeight = 2.0 / projMat._00;
			viewPoint.fov = Math.atan((1 / projMat._00)) * 2.0;
			viewPoint.aspect_ratio = viewPoint.fov / projMat._11;

			var f = projMat._23 / (projMat._22 + 1);
			var n = (f * projMat._23) / (projMat._23 - 2 * f);

			viewPoint.far = f;
			viewPoint.near = n;

			viewPoint.clippingPlanes = self.clippingPlanes;

			return viewPoint;
		};

		this.speed = 2.0;
		this.setSpeed = function(speed) {
			self.speed = speed;
			self.nav.speed = speed;
		};

		this.bgroundClick = function(event) {
			callback(self.EVENT.BACKGROUND_SELECTED);
		};

		this.hiddenParts = [];

		this.addHiddenPart = function(part) {
			this.hiddenParts.push(part);
		};

		this.revealAll = function(event, objEvent) {
			for (var part in self.hiddenParts) {
				if (self.hiddenParts.hasOwnProperty(part)) {
					self.hiddenParts[part].setVisibility(true);
				}
			}

			self.hiddenParts = [];
		};

		this.disableClicking = function() {
			if (self.clickingEnabled) {
				self.offBackgroundClicked(self.bgroundClick);
				self.offClickObject(self.clickObject);
				self.viewer.setAttribute("disableDoubleClick", true);
				self.clickingEnabled = false;
			}
		};

		this.disableSelecting = function() {
			self.selectionDisabled = true;
		};

		this.enableClicking = function() {
			if (!self.clickingEnabled) {
				// When the user clicks on the background the select nothing.
				self.onBackgroundClicked(self.bgroundClick);
				self.onClickObject(self.clickObject);
				self.viewer.setAttribute("disableDoubleClick", false);
				self.clickingEnabled = true;
			}
		};

		this.switchFullScreen = function(vrDisplay) {
			vrDisplay = vrDisplay || {};

			if (!self.fullscreen) {
				if (self.viewer.mozRequestFullScreen) {
					self.viewer.mozRequestFullScreen({
						vrDisplay: vrDisplay
					});
				} else if (self.viewer.webkitRequestFullscreen) {
					self.viewer.webkitRequestFullscreen({
						vrDisplay: vrDisplay,
					});
				}

				self.fullscreen = true;
			} else {
				if (document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
				} else if (document.webkitCancelFullScreen) {
					document.webkitCancelFullScreen();
				}

				self.fullscreen = false;
			}
		};

		this.diffColorDeleted = [];
		this.diffColorAdded = [];

		this.setDiffColors = function(diffColors) {
			if (diffColors) {
				self.diffColors = diffColors;
			}

			var i, mat, obj;

			self.applyApp(self.diffColorAdded, 2.0, "0.0 0.0 0.0", false);
			self.applyApp(self.diffColorDeleted, 2.0, "0.0 0.0 0.0", false);

			self.diffColorAdded = [];
			self.diffColorDeleted = [];

			if (self.diffColors) {
				if (self.inline.childNodes.length) {
					var defMapSearch = self.inline.childNodes[0]._x3domNode._nameSpace.defMap;

					if (self.diffColors.added) {
						for (i = 0; i < self.diffColors.added.length; i++) {
							// TODO: Improve, with graph, to use appearance under  _cf rather than DOM.
							obj = defMapSearch[self.diffColors.added[i]];
							if (obj) {
								mat = $(obj._xmlNode).find("Material");

								if (mat.length) {
									self.applyApp(mat, 0.5, "0.0 1.0 0.0", false);
									self.diffColorAdded.push(mat[0]);
								} else {
									mat = $(obj._xmlNode).find("TwoSidedMaterial");
									self.applyApp(mat, 0.5, "0.0 1.0 0.0", false);

									self.diffColorAdded.push(mat[0]);
								}

							}
						}
					}

					if (self.diffColors.deleted) {
						for (i = 0; i < self.diffColors.deleted.length; i++) {
							// TODO: Improve, with graph, to use appearance under  _cf rather than DOM.
							obj = defMapSearch[self.diffColors.deleted[i]];
							if (obj) {
								mat = $(obj._xmlNode).find("Material");

								if (mat.length) {
									self.applyApp(mat, 0.5, "1.0 0.0 0.0", false);
									self.diffColorDeleted.push(mat[0]);
								} else {
									mat = $(obj._xmlNode).find("TwoSidedMaterial");
									self.applyApp(mat, 0.5, "1.0 0.0 0.0", false);

									self.diffColorDeleted.push(mat[0]);
								}
							}
						}
					}
				}
			}
		};

		this.transformEvent = function(event, viewpoint, inverse) {
			var transformation;

			if (inverse) {
				transformation = viewpoint._x3domNode.getTransformation().inverse();
			} else {
				transformation = viewpoint._x3domNode.getTransformation();
			}

			var newPos = transformation.multMatrixVec(event.position);
			var newOrientMat = ViewerUtil.axisAngleToMatrix(event.orientation[0], event.orientation[1]);
			newOrientMat = transformation.mult(newOrientMat);

			var newOrient = new x3dom.fields.Quaternion();
			newOrient.setValue(newOrientMat);
			newOrient = newOrient.toAxisAngle();

			event.position = newPos;
			event.orientation = newOrient;
		};

		/****************************************************************************
		 * Clipping planes
		 ****************************************************************************/

		var clippingPlaneID = -1;
		this.clippingPlanes = [];

		this.setClippingPlanes = function(clippingPlanes) {
			self.clearClippingPlanes();

			for (var clipidx = 0; clipidx < clippingPlanes.length; clipidx++) {
				var clipPlaneIDX = self.addClippingPlane(
					clippingPlanes[clipidx].axis,
					clippingPlanes[clipidx].distance,
					clippingPlanes[clipidx].percentage,
					clippingPlanes[clipidx].clipDirection
				);
			}
		};

		/**
		 * Adds a clipping plane to the viewer
		 * @param {string} axis - Axis through which the plane clips
		 * @param {number} distance - Distance along the bounding box to clip
		 * @param {number} percentage - Percentage along the bounding box to clip (overrides distance)
		 * @param {number} clipDirection - Direction of clipping (-1 or 1)
		 */
		this.addClippingPlane = function(axis, distance, percentage, clipDirection) {
			clippingPlaneID += 1;

			var newClipPlane = new ClipPlane(clippingPlaneID, self, axis, [1, 1, 1], distance, percentage, clipDirection);
			self.clippingPlanes.push(newClipPlane);

			return clippingPlaneID;
		};

		this.moveClippingPlane = function(percentage) {
			// Only supports a single clipping plane at the moment.
			self.clippingPlanes[0].movePlane(percentage);
		};

		/**
		 * Clear out all clipping planes
		 */
		this.clearClippingPlanes = function() {
			self.clippingPlanes.forEach(function(clipPlane) {
				clipPlane.destroy();

			});

			self.clippingPlanes = [];
		};

		/**
		 * Clear out all clipping planes
		 * @param {number} id - Get the clipping plane with matching unique ID
		 */
		this.getClippingPlane = function(id) {
			// If the clipping plane no longer exists this
			// will return undefined
			return self.clippingPlanes.filter(function(clipPlane) {
				return (clipPlane.getID() === id);
			})[0];
		};

		/****************************************************************************
		 * Pins
		 ****************************************************************************/
		self.pins = {};

		this.addPin = function(account, project, id, position, norm, colours, viewpoint) {
			if (self.pins.hasOwnProperty(id)) {
				errCallback(self.ERROR.PIN_ID_TAKEN);
			} else {

				var trans = null;
				var projectNameSpace = account + "__" + project;

				if (self.inlineRoots.hasOwnProperty(projectNameSpace))
				{
					var projectInline = self.inlineRoots[account + "__" + project];
					trans = projectInline._x3domNode.getCurrentTransform();
				}

				self.pins[id] = new Pin(id, self.getScene(), trans, position, norm, self.pinSize, colours, viewpoint);
			}
		};

		this.clickPin = function(id) {
			if (self.pins.hasOwnProperty(id)) {
				var pin = self.pins[id];

				self.highlightPin(id);

				callback(self.EVENT.SET_CAMERA, {
					position : pin.viewpoint.position,
					view_dir : pin.viewpoint.view_dir,
					up: pin.viewpoint.up
				});

				callback(self.EVENT.SET_CLIPPING_PLANES, {
					clippingPlanes: pin.viewpoint.clippingPlanes
				});
			}
		};

		this.setPinVisibility = function(id, visibility)
		{
			if (self.pins.hasOwnProperty(id)) {
				var pin = self.pins[id];

				pin.setAttribute("render", visibility.toString());
			}
		};

		this.removePin = function(id) {
			if (self.pins.hasOwnProperty(id)) {
				self.pins[id].remove(id);
				delete self.pins[id];
			}
		};

		this.previousHighLightedPin = null;
		this.highlightPin = function(id) {
			// If a pin was previously highlighted
			// switch it off
			if (self.previousHighLightedPin) {
				self.previousHighLightedPin.highlight();
				self.previousHighLightedPin = null;
			}

			// If the pin exists switch it on
			if (id && self.pins.hasOwnProperty(id)) {
				self.pins[id].highlight();
				self.previousHighLightedPin = self.pins[id];
			}
		};

		this.changePinColours = function(id, colours) {
			if (self.pins.hasOwnProperty(id)) {
				self.pins[id].changeColour(colours);
			}
		};
	};

	Viewer.prototype.SELECT_COLOUR = {
		EMISSIVE: "1.0 0.5 0.0"
	};

	Viewer.prototype.ERROR = {
		PIN_ID_TAKEN: "VIEWER_PIN_ID_TAKEN"
	};
}());

// Constants and enums
var VIEWER_NAV_MODES = Viewer.prototype.NAV_MODES = {
	HELICOPTER: "HELICOPTER",
	WALK: "WALK",
	TURNTABLE: "TURNTABLE",
	WAYFINDER: "WAYFINDER",
	FLY: "FLY"
};

var VIEWER_EVENTS = Viewer.prototype.EVENT = {
	// States of the viewer
	READY: "VIEWER_EVENT_READY",
	START_LOADING: "VIEWING_START_LOADING",
	LOADED: "VIEWER_EVENT_LOADED",
	RUNTIME_READY: "VIEWING_RUNTIME_READY",

	ENTER_VR: "VIEWER_EVENT_ENTER_VR",
	VR_READY: "VIEWER_EVENT_VR_READY",
	SET_NAV_MODE: "VIEWER_SET_NAV_MODE",
	GO_HOME: "VIEWER_GO_HOME",
	SWITCH_FULLSCREEN: "VIEWER_SWITCH_FULLSCREEN",
	REGISTER_VIEWPOINT_CALLBACK: "VIEWER_REGISTER_VIEWPOINT_CALLBACK",
	OBJECT_SELECTED: "VIEWER_OBJECT_SELECTED",
	BACKGROUND_SELECTED: "VIEWER_BACKGROUND_SELECTED",
	SWITCH_OBJECT_VISIBILITY: "VIEWER_SWITCH_OBJECT_VISIBILITY",
	SET_PIN_VISIBILITY: "VIEWER_SET_PIN_VISIBILITY",

	PICK_POINT: "VIEWER_PICK_POINT",
	SET_CAMERA: "VIEWER_SET_CAMERA",

	// Clipping plane events
	CLEAR_CLIPPING_PLANES: "VIEWER_CLEAR_CLIPPING_PLANES",
	ADD_CLIPPING_PLANE: "VIEWER_ADD_CLIPPING_PLANE",
	MOVE_CLIPPING_PLANE: "VIEWER_MOVE_CLIPPING_PLANE",
	CLIPPING_PLANE_READY: "VIEWER_CLIPPING_PLANE_READY",
	SET_CLIPPING_PLANES: "VIEWER_SET_CLIPPING_PLANES",

	// Pin events
	CLICK_PIN: "VIEWER_CLICK_PIN",
	CHANGE_PIN_COLOUR: "VIEWER_CHANGE_PIN_COLOUR",
	REMOVE_PIN: "VIEWER_REMOVE_PIN",
	ADD_PIN: "VIEWER_ADD_PIN",
	MOVE_PIN: "VIEWER_MOVE_PIN"
};

/**
 **  Copyright (C) 2014 3D Repo Ltd
 **
 **  This program is free software: you can redistribute it and/or modify
 **  it under the terms of the GNU Affero General Public License as
 **  published by the Free Software Foundation, either version 3 of the
 **  License, or (at your option) any later version.
 **
 **  This program is distributed in the hope that it will be useful,
 **  but WITHOUT ANY WARRANTY; without even the implied warranty of
 **  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 **  GNU Affero General Public License for more details.
 **
 **  You should have received a copy of the GNU Affero General Public License
 **  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/

var ViewerManager = {};

(function() {
	"use strict";

	ViewerManager = function() {
		this.currentViewerName = "";
		this.currentViewer = null;
		this.linkedViewers = [];
		this.linkedFunctions = [];
		
		this.viewers = {};
		
		this.selectDefaultCurrentViewer = function()
		{
			var viewerNames = Object.keys(this.viewers);
			
			if (viewerNames.length)
			{
				this.currentViewer = this.viewers[viewerNames[0]];
			} else {
				this.currentViewer = null;
			}
		};
		
		x3dom.runtime.ready = this.initRuntime;
	};
	
	ViewerManager.prototype.isValidViewerName = function(name) {
		return this.viewers.hasOwnProperty(name);
	};

	ViewerManager.prototype.reshape = function() {
		// TODO: Only splits horizontally at the moment
		var viewerSize = (100 / Object.keys(this.viewers).length);
		var i = 0;

		for (var name in this.viewers) {
			if (this.viewers.hasOwnProperty(name)) {
				this.viewers[name].viewer.style.width = viewerSize + "%";
				this.viewers[name].viewer.style.left = (i * viewerSize) + "%";

				i++;
			}
		}
	};

	ViewerManager.prototype.removeViewer = function(name) {
		if (this.isValidHandle(name)) {
			// Can't be left with nothing
			if (Object.keys(this.viewers).length === 1) {
				return;
			}

			if (this.viewers[name] === this.currentViewer) {
				this.selectDefaultCurrentViewer();
			}

			this.linkedViewers = this.linkedViewers.filter(function(linkedName) {
				return (linkedName !== name);
			});

			this.viewers[name].close();
			delete this.viewers[name];

			if (this.currentViewerName === name) {
				this.defaultViewerHandle = Object.keys(this.viewers)[0];
			}

			this.reshape();
		}
	};

	ViewerManager.prototype.close = function() {
		for (var name in this.viewers) {
			if (this.viewers.hasOwnProperty(name)) {
				this.removeViewer(name);
			}
		}
	};

	ViewerManager.prototype.registerMe = function(viewer) {
		this.viewers[viewer.name] = viewer;
		
		if (Object.keys(this.viewers).length === 1)
		{
			this.selectDefaultCurrentViewer();
		}
		
		this.reshape();
	};

	ViewerManager.prototype.linkMe = function(handle) {
		this.addMe(this.linkedViewers, handle);
	};

	ViewerManager.prototype.switchCurrent = function(name) {
		if (this.isValidHandle(name)) {
			this.viewMaster = this.viewers[name];
		}
	};

	ViewerManager.prototype.getCurrentViewer = function() {
		if (this.currentViewer) {
			return this.currentViewer;
		}
	};

	ViewerManager.prototype.linkFunction = function(callback) {
		this.linkedFunctions.push(callback);
	};

	ViewerManager.prototype.viewpointLinkFunction = function(newEvent, event) {
		if (!this.linkedViewers.length || !this.currentViewer) {
			return;
		}

		// Only updates to the master should do anything
		if (event.target !== this.currentViewer.getCurrentViewpoint()) {
			return;
		}

		event.orientation[1] = event.orientation[1] * -1;
		this.currentViewer.transformEvent(event, event.target, false);

		var i;

		for (i = 0; i < this.linkedViewers.length; i++) {
			var name = this.linkedViewers[i];

			if (this.currentViewer.handle === name) { // Don't need to update the master
				continue;
			}

			if (this.isValidName(name)) {
				//self.viewers[handle].transformEvent(event, self.viewers[handle].getCurrentViewpoint(), false);
				this.viewers[name].getCurrentViewpoint().setAttribute("position", event.position.toString());
				this.viewers[name].getCurrentViewpoint().setAttribute("orientation", event.orientation.toString());
				//self.viewers[handle].transformEvent(event, self.viewers[handle].getCurrentViewpoint(), true);
			}
		}

		for (i = 0; i < this.linkedFunctions.length; i++) {
			this.linkedFunctions[i](event);
		}
	};

	ViewerManager.prototype.initRuntime = function() {
		for (var name in this.viewers) {
			if (this.viewers.hasOwnProperty(name)) {
				if (!this.viewers[name].runtime) {
					this.viewers[name].initRuntime();
				}
			}
		}
	};

	/*
	this.diffHandle = null;
	this.diffView = function(enable) {
		if (enable) {
			if (!self.isValidHandle(self.diffHandle)) {
				self.diffHandle = self.addViewer("diffView");

				self.getDiffViewer().linkMe();
				self.getDefaultViewer().linkMe();
			}
		} else {
			if (self.isValidHandle(self.diffHandle)) {
				self.removeViewer(self.diffHandle);
			}
		}
	};

	this.setDiffColors = function(diffColors) {
		self.getDefaultViewer().setDiffColors(diffColors);
		self.getDiffViewer().setDiffColors(diffColors);
	};
	*/
}());
/**
 **  Copyright (C) 2014 3D Repo Ltd
 **
 **  This program is free software: you can redistribute it and/or modify
 **  it under the terms of the GNU Affero General Public License as
 **  published by the Free Software Foundation, either version 3 of the
 **  License, or (at your option) any later version.
 **
 **  This program is distributed in the hope that it will be useful,
 **  but WITHOUT ANY WARRANTY; without even the implied warranty of
 **  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 **  GNU Affero General Public License for more details.
 **
 **  You should have received a copy of the GNU Affero General Public License
 **  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/

var ViewerUtil = {};

(function() {
	"use strict";

	ViewerUtil = function() {};

	ViewerUtil.prototype.getAxisAngle = function(from, at, up) {
		var x3dfrom = new x3dom.fields.SFVec3f(from[0], from[1], from[2]);
		var x3dat = new x3dom.fields.SFVec3f(at[0], at[1], at[2]);
		var x3dup = new x3dom.fields.SFVec3f(up[0], up[1], up[2]);

		var viewMat = x3dom.fields.SFMatrix4f.lookAt(x3dfrom, x3dat, x3dup).inverse();

		var q = new x3dom.fields.Quaternion(0.0, 0.0, 0.0, 1.0);
		q.setValue(viewMat);

		q = q.toAxisAngle();

		return Array.prototype.concat(q[0].toGL(), q[1]);
	};
	
	ViewerUtil.prototype.quatLookAt = function (up, forward)
	{
		forward.normalize();
		up.normalize();

		var right = forward.cross(up);
		up = right.cross(forward);

		var w = Math.sqrt(1 + right.x + up.y + forward.z) * 0.5;
		var recip = 1 / (4 * w);
		var x = (forward.y - up.z) * recip;
		var y = (right.z - forward.y) * recip;
		var z = (up.x - right.y) * recip;

		return new x3dom.fields.Quarternion(x,y,z,w);
	};

	ViewerUtil.prototype.rotationBetween = function(prevUp, prevView, currUp, currView)
	{
		/*
		prevView = this.normalize(prevView);
		currView = this.normalize(currView);
		
		var prevRight = this.normalize(this.crossProduct(prevUp, prevView));
		var currRight = this.normalize(this.crossProduct(currUp, currView));
		
		prevUp = this.normalize(this.crossProduct(prevRight, prevView));
		currUp = this.crossProduct(currRight, currView);

		var prevMat = new x3dom.fields.SFMatrix4f();
		*/

		var x3domPrevView = new x3dom.fields.SFVec3f(prevView[0], prevView[1], prevView[2]);
		var x3domPrevUp   = new x3dom.fields.SFVec3f(prevUp[0], prevUp[1], prevUp[2]);
		var x3domPrevFrom = new x3dom.fields.SFVec3f(0, 0, 0);
		var x3domPrevAt   = x3domPrevFrom.add(x3domPrevView);

		var prevMat    = x3dom.fields.SFMatrix4f.lookAt(x3domPrevFrom, x3domPrevAt, x3domPrevUp);
		/*
		prevMat.setFromArray([
				prevRight[0], prevUp[0], prevView[0], 0,
				prevRight[1], prevUp[1], prevView[1], 0,
				prevRight[2], prevUp[2], prevView[2], 0,
				0, 0, 0, 1]);

		
		var currMat = new x3dom.fields.SFMatrix4f();

		currMat.setFromArray([
				currRight[0], currUp[0], currView[0], 0,
				currRight[1], currUp[1], currView[1], 0,
				currRight[2], currUp[2], currView[2], 0,
				0, 0, 0, 1]);
		*/

		var x3domCurrView = new x3dom.fields.SFVec3f(currView[0], currView[1], currView[2]);
		var x3domCurrUp   = new x3dom.fields.SFVec3f(currUp[0], currUp[1], currUp[2]);
		var x3domCurrFrom = new x3dom.fields.SFVec3f(0, 0, 0);
		var x3domCurrAt   = x3domCurrFrom.add(x3domCurrView);
		
		var currMat    = x3dom.fields.SFMatrix4f.lookAt(x3domCurrFrom, x3domCurrAt, x3domCurrUp);
		
		return currMat.mult(prevMat.inverse());
	};

	// TODO: Should move this to somewhere more general (utils ? )
	ViewerUtil.prototype.axisAngleToMatrix = function(axis, angle) {
		var mat = new x3dom.fields.SFMatrix4f();

		var cosAngle = Math.cos(angle);
		var sinAngle = Math.sin(angle);
		var t = 1 - cosAngle;

		var v = axis.normalize();

		// As always, should be right hand coordinate system
		/*
		mat.setFromArray( [
			t * v.x * v.x + cosAngle, t * v.x * v.y - v.z * sinAngle, t * v.x * v.z + v.y * sinAngle, 0,
			t * v.x * v.y + v.z * sinAngle, t * v.y * v.y + cosAngle, t * v.y * v.z - v.x * sinAngle, 0,
			t * v.x * v.z - v.y * sinAngle, t * v.y * v.z + v.x * sinAngle, t * v.z * v.z + cosAngle, 0,
			0, 0, 0, 1]);
		*/

		mat.setFromArray([t * v.x * v.x + cosAngle, t * v.x * v.y + v.z * sinAngle, t * v.x * v.z - v.y * sinAngle, 0,
			t * v.x * v.y - v.z * sinAngle, t * v.y * v.y + cosAngle, t * v.y * v.z + v.x * sinAngle, 0,
			t * v.x * v.z + v.y * sinAngle, t * v.y * v.z - v.x * sinAngle, t * v.z * v.z + cosAngle, 0,
			0, 0, 0, 1
		]);

		return mat;
	};

	ViewerUtil.prototype.evDist = function(evt, posA) {
		return Math.sqrt(Math.pow(posA[0] - evt.position.x, 2) +
			Math.pow(posA[1] - evt.position.y, 2) +
			Math.pow(posA[2] - evt.position.z, 2));
	};

	ViewerUtil.prototype.dist = function(posA, posB) {
		return Math.sqrt(Math.pow(posA[0] - posB[0], 2) +
			Math.pow(posA[1] - posB[1], 2) +
			Math.pow(posA[2] - posB[2], 2));
	};

	ViewerUtil.prototype.rotToRotation = function(from, to) {
		var vecFrom = new x3dom.fields.SFVec3f(from[0], from[1], from[2]);
		var vecTo = new x3dom.fields.SFVec3f(to[0], to[1], to[2]);

		var dot = vecFrom.dot(vecTo);

		var crossVec = vecFrom.cross(vecTo);

		return crossVec.x + " " + crossVec.y + " " + crossVec.z + " " + Math.acos(dot);
	};

	ViewerUtil.prototype.rotAxisAngle = function(from, to) {
		var vecFrom = new x3dom.fields.SFVec3f(from[0], from[1], from[2]);
		var vecTo = new x3dom.fields.SFVec3f(to[0], to[1], to[2]);

		var dot = vecFrom.dot(vecTo);

		var crossVec = vecFrom.cross(vecTo);
		var qt = new x3dom.fields.Quaternion(crossVec.x, crossVec.y, crossVec.z, 1);

		qt.w = vecFrom.length() * vecTo.length() + dot;

		return qt.normalize(qt).toAxisAngle();
	};

	// TODO: Shift these to some sort of Matrix/Vec library
	ViewerUtil.prototype.scale = function(v, s) {
		return [v[0] * s, v[1] * s, v[2] * s];
	};

	ViewerUtil.prototype.normalize = function(v) {
		var sz = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
		return this.scale(v, 1 / sz);
	};

	ViewerUtil.prototype.dotProduct = function(a, b) {
		return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	};

	ViewerUtil.prototype.crossProduct = function(a, b) {
		var x = a[1] * b[2] - a[2] * b[1];
		var y = a[2] * b[0] - a[0] * b[2];
		var z = a[0] * b[1] - a[1] * b[0];

		return [x, y, z];
	};

	ViewerUtil.prototype.vecAdd = function(a, b) {
		return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
	};

	ViewerUtil.prototype.vecSub = function(a, b) {
		return this.vecAdd(a, this.scale(b, -1));
	};
	
	/**
	 * Escape CSS characters in string
	 *
		* @param string
		* @returns {*}
		*/
	ViewerUtil.prototype.escapeCSSCharacters = function(string)
	{
		// Taken from http://stackoverflow.com/questions/2786538/need-to-escape-a-special-character-in-a-jquery-selector-string
		return string.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\$&");
	};
		
	ViewerUtil = new ViewerUtil();
}());
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("viewer", viewer);

	viewer.$inject = ["EventService"];

	function viewer(EventService) {
		return {
			restrict: "E",
			scope: {
				manager: "=",
				account: "=",
				project: "=",
				branch: "=",
				revision: "=",
				name: "@",
				autoInit: "@",
				vrMode: "@",
				eventService: "="
			},
			controller: ViewerCtrl,
			controllerAs: "v",
			bindToController: true
		};
	}

	ViewerCtrl.$inject = ["$scope", "$q", "$http", "$element", "serverConfig", "EventService"];

	function ViewerCtrl ($scope, $q, $http, $element, serverConfig, EventService)
	{
		var v = this;

		v.initialised = $q.defer();
		v.loaded      = $q.defer();

		if (!angular.isDefined(v.eventService))
		{
			v.EventService = EventService;
		}

		function errCallback(errorType, errorValue)
		{
			v.eventService.sendError(errorType, errorValue);
		}

		function eventCallback(type, value)
		{
			v.eventService.send(type, value);
		}

		$scope.reload = function() {
			v.viewer.loadModel(v.account, v.project, v.branch, v.revision);
		};

		$scope.init = function() {
			v.viewer = new Viewer(v.name, $element[0], v.manager, eventCallback, errCallback);

			// TODO: Move this so that the attachment is contained
			// within the plugins themselves.
			// Comes free with oculus support and gamepad support
			v.oculus     = new Oculus(v.viewer);
			v.gamepad    = new Gamepad(v.viewer);

			v.gamepad.init();

			v.collision  = new Collision(v.viewer);

			v.viewer.init();

			$http.get(serverConfig.apiUrl(v.account + "/" + v.project + ".json")).success(
				function(json, status) {
					EventService.send(EventService.EVENT.PROJECT_SETTINGS_READY, {
						account: v.account,
						project: v.project,
						settings: json.properties
					});
				});

			$scope.reload();

			v.loaded.promise.then(function() {
				// TODO: Move this so that the attachment is contained
				// within the plugins themselves.
				// Comes free with oculus support and gamepad support
				v.oculus     = new Oculus(v.viewer);
				v.gamepad    = new Gamepad(v.viewer);

				v.gamepad.init();

				v.collision  = new Collision(v.viewer);

			});

		};

		$scope.enterVR = function() {
			v.loaded.promise.then(function() {
				v.oculus.switchVR();
			});
		};

		$scope.$watch(v.eventService.currentEvent, function(event) {
			if (angular.isDefined(event) && angular.isDefined(event.type)) {
				if (event.type === EventService.EVENT.VIEWER.START_LOADING) {
					v.initialised.resolve();
				} else if (event.type === EventService.EVENT.VIEWER.LOADED) {
					v.loaded.resolve();
				} else {
					v.initialised.promise.then(function() {
						if (event.type === EventService.EVENT.VIEWER.GO_HOME) {
							v.viewer.showAll();
						} else if (event.type === EventService.EVENT.VIEWER.SWITCH_FULLSCREEN) {
							v.viewer.switchFullScreen(null);
						} else if (event.type === EventService.EVENT.VIEWER.ENTER_VR) {
							v.viewer.switchVR();
						} else if (event.type === EventService.EVENT.VIEWER.REGISTER_VIEWPOINT_CALLBACK) {
							v.viewer.onViewpointChanged(event.value.callback);
						} else if (event.type === EventService.EVENT.PROJECT_SETTINGS_READY) {
							if (event.value.account === v.account && event.value.project === v.project)
							{
								v.viewer.updateSettings(event.value.settings);
							}
						}
					});

					v.loaded.promise.then(function() {
						if (event.type === EventService.EVENT.VIEWER.ADD_PIN) {
							v.viewer.addPin(
								event.value.account,
								event.value.project,
								event.value.id,
								event.value.position,
								event.value.norm,
								event.value.colours,
								event.value.viewpoint);
						} else if (event.type === EventService.EVENT.VIEWER.REMOVE_PIN) {
							v.viewer.removePin(
								event.value.id
							);
						} else if (event.type === EventService.EVENT.VIEWER.CHANGE_PIN_COLOUR) {
							v.viewer.changePinColours(
								event.value.id,
								event.value.colours
							);
						} else if (event.type === EventService.EVENT.VIEWER.CLICK_PIN) {
							v.viewer.clickPin(event.value.id);
						} else if (event.type === EventService.EVENT.VIEWER.SET_PIN_VISIBILITY) {
							v.viewer.setPinVisibility(event.value.id, event.value.visibility);
						} else if (event.type === EventService.EVENT.VIEWER.CLEAR_CLIPPING_PLANES) {
							v.viewer.clearClippingPlanes();
						} else if (event.type === EventService.EVENT.VIEWER.ADD_CLIPPING_PLANE) {
							v.viewer.addClippingPlane(
								event.value.axis,
								event.value.distance ? event.value.distance : 0,
								event.value.percentage ? event.value.percentage : 0,
								event.value.clipDirection ? event.value.clipDirection : -1);
						} else if (event.type === EventService.EVENT.VIEWER.MOVE_CLIPPING_PLANE) {
							v.viewer.moveClippingPlane(event.value.percentage);
						} else if (event.type === EventService.EVENT.VIEWER.OBJECT_SELECTED) {
							v.viewer.highlightObjects(
								event.value.account,
								event.value.project,
								event.value.id,
								event.value.ids ? event.value.ids : [event.value.id]
							);
						} else if (event.type === EventService.EVENT.VIEWER.BACKGROUND_SELECTED) {
							v.viewer.highlightObjects();
						} else if (event.type === EventService.EVENT.VIEWER.SWITCH_OBJECT_VISIBILITY) {
							v.viewer.switchObjectVisibility(
								event.value.account,
								event.value.project,
								event.value.id,
								event.value.ids ? event.value.ids : [event.value.id],
								event.value.state
							);
						} else if (event.type === EventService.EVENT.VIEWER.SET_CAMERA) {
							v.viewer.setCamera(
								event.value.position,
								event.value.view_dir,
								event.value.up,
								angular.isDefined(event.value.animate) ? event.value.animate : true,
								event.value.rollerCoasterMode
							);
						} else if (event.type === EventService.EVENT.VIEWER.SET_NAV_MODE) {
							vm.manager.getCurrentViewer().setNavMode(event.value.mode);
						}
					});
				}
			}
		});

		$scope.init();

		if (angular.isDefined(v.vrMode))
		{
				$scope.enterVR();
		}
	}
}());

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

(function() {
	"use strict";

	angular.module("3drepo")
		.directive("viewermanager", viewerManager);

	function viewerManager() {
		return {
			restrict: "E",
			controller: ViewerManagerCtrl,
			scope: true,
			templateUrl: "viewermanager.html",
			controllerAs: "vm",
			bindToController: true
		};
	}

	function ViewerManagerService(nextEventService) {
		var currentEvent = {};
		var currentError = {};

		var sendInternal = function(type, value) {
			currentEvent = {type:type, value: value};
		};

		var send = function (type, value) {
			sendInternal(type, value);
			nextEventService.send(type, value);
		};

		var sendErrorInternal = function(type, value) {
			currentError = {type: type, value: value};
		};

		var sendError = function(type, value) {
			sendErrorInternal(type, value);
			nextEventService.sendError(type, value);
		};

		return {
			currentEvent: function() {return currentEvent;},
			currentError: function() {return currentError;},
			send: send,
			sendInternal: sendInternal,
			sendError: sendError,
			sendErrorInternal: sendErrorInternal
		};
	}

	ViewerManagerCtrl.$inject = ["$scope", "$q", "$element", "EventService"];

	function ViewerManagerCtrl($scope, $q, $element, EventService) {
		var vm = this;

		vm.manager = new ViewerManager($element[0]);
		vm.vmservice = ViewerManagerService(EventService);

		vm.viewers = {};

		$scope.manager = vm.manager;

		vm.viewerInit = $q.defer();
		vm.viewerLoaded = $q.defer();

		$scope.$watch(EventService.currentEvent, function(event) {
			console.log(event);
			if (angular.isDefined(event.type) && angular.isDefined(event.type)) {
				if (event.type === EventService.EVENT.CREATE_VIEWER) {
					// If a viewer with the same name exists already then
					// throw an error, otherwise add it
					if (vm.viewers.hasOwnProperty(event.value.name)) {
						EventService.sendError(EventService.ERROR.DUPLICATE_VIEWER_NAME, {
							name: event.value.name
						});
					}

					vm.viewers[event.value.name] = event.value;
				} else if (event.type === EventService.EVENT.CLOSE_VIEWER) {
					// If the viewer exists in the list then delete it
					if (vm.viewers.hasOwnProperty(event.value.name)) {
						delete vm.viewers[event.value.name];
					}
				} else if (event.type === EventService.EVENT.VIEWER.READY) {
					window.viewer = vm.manager.getCurrentViewer();
				} else {
					vm.vmservice.sendInternal(event.type, event.value);
				}
			}
		});
	}
}());

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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("qrCodeReader", qrCodeReader)
		.directive('qrCodeCameraSwitch', qrCodeCameraSwitch);

	function qrCodeReader() {
		return {
			restrict: "EA",
			scope: {},
			controller: QrCodeReaderCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	QrCodeReaderCtrl.$inject = ["$scope", "$mdDialog", "EventService", "QrCodeReaderService"];

	function QrCodeReaderCtrl($scope, $mdDialog, EventService, QrCodeReaderService) {
		var vm = this;
		$scope.captureQRCode = QrCodeReaderService.captureQRCode;
		$scope.cameraOn = QrCodeReaderService.cameraOn;

		$scope.$watch(EventService.currentEvent, function (event) {
			if (event.type === EventService.EVENT.SHOW_QR_CODE_READER) {
				$scope.cameraOn.status = true;
				$mdDialog.show({
					controller: qrCodeReaderDialogController,
					templateUrl: 'qrCodeReaderDialog.html',
					parent: angular.element(document.body),
					targetEvent: event,
					clickOutsideToClose:true,
					fullscreen: true,
					scope: $scope,
					preserveScope: true,
					onRemoving: removeDialog
				});
			}
		});

		$scope.closeDialog = function() {
			$scope.cameraOn.status = false;
			$mdDialog.cancel();
		};

		function removeDialog () {
			$scope.closeDialog();
		}

		function qrCodeReaderDialogController($scope) {
		}
	}

	function qrCodeCameraSwitch () {
		return {
			restrict: 'A',
			scope: {
				capture: '='
			},
			link: function link(scope, element, attrs) {
				if (attrs.qrCodeCameraSwitch === "true") {
					scope.capture(scope, element[0], function(err, res) {
						if(!err) {
							window.location.replace(res);
						}
						else {
							console.log("QRCode error: " + err);
						}
					});
				}
			}
		};
	}
}());
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

(function () {
	"use strict";

	angular.module('3drepo')
		.factory('QrCodeReaderService', QrCodeReaderService);

	QrCodeReaderService.$inject = ["$window", "$timeout"];

	function QrCodeReaderService($window, $timeout) {
		var cameraOn = {
				status: false
			},
			source = null,
			videoStream = null;

		if ($window.MediaStreamTrack.getSources)
		{
			$window.MediaStreamTrack.getSources(function (srcs) {
				var videoSRCS = srcs.filter(function(item) { return item.kind === 'video'; });
				source = null;

				if (videoSRCS.length > 1)
				{
					videoSRCS = videoSRCS.filter(function(item) { return (item.facing === 'environment'); });
				}

				if (!videoSRCS.length)
				{
					callback("No valid cameras found");
				}

				source = videoSRCS[0];
			});
		}

		function decodeCanvas (scope, element, callback)
		{
			var width  = element.videoWidth;
			var height = element.videoHeight;

			if (width && height) {
				if(!scope.canvas) {
					scope.canvas				= document.createElement('canvas');
					scope.canvas.id				= 'qr-canvas';
					scope.canvas.width			= width;
					scope.canvas.style.width	= width + "px";
					scope.canvas.height			= height;
					scope.canvas.style.height	= height + "px";

					element.appendChild(scope.canvas);
				}

				var ctx = scope.canvas.getContext("2d");
				ctx.clearRect(0,0, width, height);
				ctx.drawImage(element, 0, 0, width, height);

				try {
					return callback(null, qrcode.decode());
				} catch (err) {
					if (!cameraOn.status)
					{
						if (videoStream) {
							videoStream.stop();
						}

						return callback(err);
					}

					callback(err);
				}
			}

			$timeout(function() {decodeCanvas(scope, element, callback);}, 200);
		}

		var captureQRCode = function(scope, element, callback)
		{
			$window.navigator.getUserMedia = $window.navigator.getUserMedia || $window.navigator.webkitGetUserMedia || $window.navigator.mozGetUserMedia;

			var constraints = {
				video: {
					optional: [{
						sourceId: source.id
					}]
				}
			};

			// Initialize camera
			$window.navigator.getUserMedia(constraints, function (mediaVideoStream) {
				element.src = $window.URL.createObjectURL(mediaVideoStream);

				videoStream = mediaVideoStream;
				$timeout(function() {decodeCanvas(scope, element, callback); }, 200);
			}, function(err) {
				callback(err);
			});
		};

		return {
			cameraOn: cameraOn,
			captureQRCode: captureQRCode
		};
	}
}());
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("tree", tree);

	function tree() {
		return {
			restrict: "EA",
			templateUrl: "tree.html",
			scope: {
				filterText: "=",
				onContentHeightRequest: "&"
			},
			controller: TreeCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	TreeCtrl.$inject = ["$scope", "$timeout", "TreeService", "EventService"];

	function TreeCtrl($scope, $timeout, TreeService, EventService) {
		var vm = this,
			promise = null,
			i = 0,
			length = 0;

		vm.nodes = [];
		vm.showTree = true;
		vm.showFilterList = false;
		vm.currentFilterItemSelected = null;
		vm.viewerSelectedObject = null;
		vm.showProgress = true;
		vm.progressInfo = "Loading full tree structure";

		promise = TreeService.init();
		promise.then(function (data) {
			vm.allNodes = [];
			vm.allNodes.push(data.nodes);
			vm.nodes = vm.allNodes;
			vm.showTree = true;
			vm.showProgress = false;

			vm.idToPath = data.idToPath;
			initNodesToShow();
			setupInfiniteScroll();
			setContentHeight(vm.nodesToShow);
		});

		/**
		 * Set the content height.
		 * The height of a node is dependent on its name length and its level.
		 */
		function setContentHeight (nodesToShow) {
			var i, length, height = 0, maxNumNodes = 20, nodeMinHeight = 36,
				maxStringLength = 35, maxStringLengthForLevel = 0, lineHeight = 18, levelOffset = 2;
			for (i = 0, length = nodesToShow.length; ((i < length) && (i < maxNumNodes)); i += 1) {
				maxStringLengthForLevel = maxStringLength - (nodesToShow[i].level * levelOffset);
				height += nodeMinHeight + (lineHeight * Math.floor(nodesToShow[i].name.length / maxStringLengthForLevel));
			}
			vm.onContentHeightRequest({height: height});
		}

		/**
		 * Initialise the tree nodes to show to the first node
		 */
		function initNodesToShow () {
			vm.nodesToShow = [vm.allNodes[0]];
			vm.nodesToShow[0].level = 0;
			vm.nodesToShow[0].expanded = false;
			vm.nodesToShow[0].hasChildren = true;
			vm.nodesToShow[0].selected = false;
			vm.nodesToShow[0].toggleState = "visible";
		}

		/**
		 * Expand a node to show its children.
		 * @param _id
		 */
		vm.expand = function (_id) {
			var i, numChildren = 0, index = -1, length, endOfSplice = false;

			for (i = 0, length = vm.nodesToShow.length; i < length; i += 1) {
				if (vm.nodesToShow[i]._id === _id) {
					index = i;
					break;
				}
			}
			if (index !== -1) {
				if (vm.nodesToShow[index].hasChildren) {
					if (vm.nodesToShow[index].expanded) {
						while (!endOfSplice) {
							if (angular.isDefined(vm.nodesToShow[index + 1]) && vm.nodesToShow[index + 1].path.indexOf(_id) !== -1) {
								vm.nodesToShow.splice(index + 1, 1);
							} else {
								endOfSplice = true;
							}
						}
					} else {
						numChildren = vm.nodesToShow[index].children.length;
						for (i = 0; i < numChildren; i += 1) {
							vm.nodesToShow[index].children[i].expanded = false;
							if (!vm.nodesToShow[index].children[i].hasOwnProperty("toggleState")) {
								vm.nodesToShow[index].children[i].toggleState = vm.nodesToShow[index].toggleState;
							}
							vm.nodesToShow[index].children[i].level = vm.nodesToShow[index].level + 1;
							vm.nodesToShow[index].children[i].hasChildren = vm.nodesToShow[index].children[i].children.length > 0;
							vm.nodesToShow.splice(index + i + 1, 0, vm.nodesToShow[index].children[i]);
						}
					}
					vm.nodesToShow[index].expanded = !vm.nodesToShow[index].expanded;
				}
			}

			setContentHeight(vm.nodesToShow);
		};

		/**
		 * Expand the tree and highlight the node corresponding to the object selected in the viewer.
		 * @param path
		 * @param level
		 */
		function expandToSelection(path, level) {
			var i, j, length, childrenLength, selectedId = path[path.length - 1], selectedIndex = 0, selectionFound = false;

			for (i = 0, length = vm.nodesToShow.length; i < length; i += 1) {
				if (vm.nodesToShow[i]._id === path[level]) {
					vm.nodesToShow[i].expanded = true;
					vm.nodesToShow[i].selected = false;
					childrenLength = vm.nodesToShow[i].children.length;

					if (level === (path.length - 2)) {
						selectedIndex = i;
					}

					for (j = 0; j < childrenLength; j += 1) {
						vm.nodesToShow[i].children[j].selected = (vm.nodesToShow[i].children[j]._id === selectedId);
						vm.nodesToShow[i].children[j].toggleState = "visible";
						vm.nodesToShow[i].children[j].hasChildren = vm.nodesToShow[i].children[j].children.length > 0;
						if (vm.nodesToShow[i].children[j].selected) {
							selectionFound = true;
						}
						if ((level === (path.length - 2)) && !selectionFound) {
							selectedIndex += 1;
						}
						vm.nodesToShow[i].children[j].level = level + 1;
						vm.nodesToShow.splice(i + j + 1, 0, vm.nodesToShow[i].children[j]);
					}
				}
			}
			if (level < (path.length - 2)) {
				expandToSelection(path, (level + 1));
			} else if (level === (path.length - 2)) {
				vm.topIndex = selectedIndex - 2;
				setContentHeight(vm.nodesToShow);
			}
		}

		$scope.$watch(EventService.currentEvent, function(event) {
			if (event.type === EventService.EVENT.VIEWER.OBJECT_SELECTED) {
				if (event.value.source !== "tree")
				{
					var objectID = event.value.id;
					var path = vm.idToPath[objectID].split("__");
					
					initNodesToShow();
					expandToSelection(path, 0);
				}
			}
		});

		vm.toggleTreeNode = function (node) {
			var i = 0, j = 0, k = 0, nodesLength, path, parent = null, nodeToggleState = "visible", numInvisible = 0;

			vm.toggledNode = node;

			path = node.path.split("__");
			path.splice(path.length - 1, 1);

			for (i = 0, nodesLength = vm.nodesToShow.length; i < nodesLength; i += 1) {
				// Set node toggle state
				if (vm.nodesToShow[i]._id === node._id) {
					vm.nodesToShow[i].toggleState = (vm.nodesToShow[i].toggleState === "visible") ? "invisible" : "visible";
					nodeToggleState = vm.nodesToShow[i].toggleState;
				}
				// Set children to node toggle state
				else if (vm.nodesToShow[i].path.indexOf(node._id) !== -1) {
					vm.nodesToShow[i].toggleState = nodeToggleState;
				}
				// Get node parent
				if (vm.nodesToShow[i]._id === path[path.length - 1]) {
					parent = vm.nodesToShow[i];
				}
			}

			// Set the toggle state of the nodes above
			if (parent !== null) {
				for (i = (path.length - 1); i >= 0; i -= 1) {
					for (j = 0, nodesLength = vm.nodesToShow.length; j < nodesLength; j += 1) {
						if (vm.nodesToShow[j]._id === path[i]) {
							vm.nodesToShow[j].toggleState = "visible";
							numInvisible = 0;
							for (k = 0; k < vm.nodesToShow[j].children.length; k += 1) {
								if (vm.nodesToShow[j].children[k].toggleState === "invisible") {
									numInvisible += 1;
									vm.nodesToShow[j].toggleState = "parentOfInvisible";
								} else if (vm.nodesToShow[j].children[k].toggleState === "parentOfInvisible") {
									vm.nodesToShow[j].toggleState = "parentOfInvisible";
								}
							}
							if (numInvisible === vm.nodesToShow[j].children.length) {
								vm.nodesToShow[j].toggleState = "invisible";
							}
						}
					}
				}
			}
			toggleNode(node);
		};

		var toggleNode = function (node) {
			var map = [];
			var pathArr = [];
			for (var obj in vm.idToPath) {
				if (vm.idToPath.hasOwnProperty(obj) && (vm.idToPath[obj].indexOf(node.path) !== -1)) {
					pathArr = vm.idToPath[obj].split("__");
					map.push(pathArr[pathArr.length - 1]);
				}
			}

			EventService.send(EventService.EVENT.VIEWER.SWITCH_OBJECT_VISIBILITY, {
				source: "tree",
				account: node.account,
				project: node.project, 
				state: (node.toggleState === "visible"),
				id: node._id, 
				name: node.name, 
				ids : map 
			});
		};

		function setupInfiniteScroll() {
			// Infinite items
			vm.infiniteItemsTree = {
				numLoaded_: 0,
				toLoad_: 0,

				getItemAtIndex: function (index) {
					if (index > this.numLoaded_) {
						this.fetchMoreItems_(index);
						return null;
					}

					if (index < vm.nodesToShow.length) {
						return vm.nodesToShow[index];
					} else {
						return null;
					}
				},

				getLength: function () {
					return this.numLoaded_ + 5;
				},

				fetchMoreItems_: function (index) {
					if (this.toLoad_ < index) {
						this.toLoad_ += 500;
						$timeout(angular.noop, 300).then(angular.bind(this, function () {
							this.numLoaded_ = this.toLoad_;
						}));
					}
				}
			};
		}

		$scope.$watch("vm.filterText", function (newValue) {
			if (angular.isDefined(newValue)) {
				if (newValue.toString() === "") {
					vm.showTree = true;
					vm.showFilterList = false;
					vm.nodes = vm.allNodes;
				} else {
					vm.showTree = false;
					vm.showFilterList = false;
					vm.showProgress = true;
					vm.progressInfo = "Filtering tree for objects";

					promise = TreeService.search(newValue);
					promise.then(function (json) {
						vm.showFilterList = true;
						vm.showProgress = false;
						vm.nodes = json.data;
						for (i = 0, length = vm.nodes.length; i < length; i += 1) {
							vm.nodes[i].index = i;
							vm.nodes[i].toggleState = "visible";
							vm.nodes[i].class = "unselectedFilterItem";
							vm.nodes[i].level = 0;
						}
						setupInfiniteItemsFilter();
						setContentHeight(vm.nodes);
					});
				}
			}
		});

		vm.selectNode = function (node) {
			var map = [];
			var pathArr = [];
			for (var obj in vm.idToPath) {
				if (vm.idToPath.hasOwnProperty(obj) && (vm.idToPath[obj].indexOf(node._id) !== -1)) {
					pathArr = vm.idToPath[obj].split("__");
					map.push(pathArr[pathArr.length - 1]);
				}
			}
			
			EventService.send(EventService.EVENT.VIEWER.OBJECT_SELECTED, {
				source: "tree",
				account: node.account,
				project: node.project, 
				id: node._id, 
				name: node.name, 
				ids : map 
			});
		};
		
		vm.filterItemSelected = function (item) {
			if (vm.currentFilterItemSelected === null) {
				vm.nodes[item.index].class = "selectedFilterItem";
				vm.currentFilterItemSelected = item;
			} else if (item.index === vm.currentFilterItemSelected.index) {
				vm.nodes[item.index].class = "unselectedFilterItem";
				vm.currentFilterItemSelected = null;
			} else {
				vm.nodes[vm.currentFilterItemSelected.index].class = "unselectedFilterItem";
				vm.nodes[item.index].class = "selectedFilterItem";
				vm.currentFilterItemSelected = item;
			}
			
			var selectedNode = vm.nodes[item.index];
			
			vm.selectNode(selectedNode);
		};

		vm.toggleFilterNode = function (item) {
			item.toggleState = (item.toggleState === "visible") ? "invisible" : "visible";
			item.path = item._id;
			toggleNode(item);
		};

		function setupInfiniteItemsFilter() {
			vm.infiniteItemsFilter = {
				numLoaded_: 0,
				toLoad_: 0,
				getItemAtIndex: function (index) {
					if (index > this.numLoaded_) {
						this.fetchMoreItems_(index);
						return null;
					}

					if (index < vm.nodes.length) {
						return vm.nodes[index];
					} else {
						return null;
					}
				},
				getLength: function () {
					return this.numLoaded_ + 5;
				},
				fetchMoreItems_: function (index) {
					if (this.toLoad_ < index) {
						this.toLoad_ += 20;
						$timeout(angular.noop, 300).then(angular.bind(this, function () {
							this.numLoaded_ = this.toLoad_;
						}));
					}
				}
			};
		}
	}
}());
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

(function() {
	"use strict";

	angular.module('3drepo')
		.factory('TreeService', TreeService);

	TreeService.$inject = ["$http", "$q", "StateManager", "EventService", "serverConfig"];

	function TreeService($http, $q, StateManager, EventService, serverConfig) {
		var state = StateManager.state;

		var init = function() {
			var deferred = $q.defer(),
				url = "/" + state.account + "/" + state.project + "/revision/" + state.branch + "/head/fulltree.json";

			$http.get(serverConfig.apiUrl(url))
				.then(function(json) {
					deferred.resolve(json.data);
				});

			return deferred.promise;
		};

		var search = function(searchString) {
			var deferred = $q.defer(),
				url = "/" + state.account + "/" + state.project + "/revision/" + state.branch + "/head/" + searchString + "/searchtree.json";

			$http.get(serverConfig.apiUrl(url))
				.then(function(json) {
					deferred.resolve(json);
				});

			return deferred.promise;
		};

		return {
			init: init,
			search: search
		};
	}
}());
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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("tdrProgress", tdrProgress);

	function tdrProgress() {
		return {
			restrict: "EA",
			templateUrl: "tdrProgress.html",
			scope: {
				info: "="
			},
			controller: TdrProgressCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	TdrProgressCtrl.$inject = ["$scope"];

	function TdrProgressCtrl($scope) {
		var vm = this;
	}

}());
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

(function () {
    "use strict";

    angular.module("3drepo")
        .directive("viewpoints", viewpoints);

    function viewpoints() {
        return {
            restrict: 'EA',
            templateUrl: 'viewpoints.html',
            scope: {
                filterText: "=",
                height: "="
            },
            controller: ViewpointsCtrl,
            controllerAs: 'vp',
            bindToController: true
        };
    }

    ViewpointsCtrl.$inject = ["$scope"];

    function ViewpointsCtrl($scope) {
        var vp = this,
            defaultViewer = null, //ViewerService.defaultViewer,
            currentViewpointInfo = {};
        vp.viewpoints = [];
        vp.inputState = false;
        vp.clearInput = false;

        $scope.$watch("vp.filterText", function (newValue) {
            if (angular.isDefined(newValue)) {
                vp.filterText = newValue;
            }
        });

        vp.toggleInputState = function () {
            vp.inputState = !vp.inputState;
        };

        vp.saveViewpoint = function (text) {
            console.log(text);
            vp.clearInput = true;
            /*
            currentViewpointInfo = defaultViewer.getCurrentViewpointInfo();
            console.log(currentViewpointInfo);
            defaultViewer.createViewpoint(
                "test__" + text,
                currentViewpointInfo.position,
                currentViewpointInfo.look_at,
                currentViewpointInfo.up
            );
            console.log(defaultViewer.viewpoints);
            vp.viewpoints.push(text);
            */
        };

        vp.selectViewpoint = function (index) {
            console.log("test__" + vp.viewpoints[index]);
            defaultViewer.setCurrentViewpoint("test__" + vp.viewpoints[index]);
        };
    }
}());

//# sourceMappingURL=three_d_repo.js.map