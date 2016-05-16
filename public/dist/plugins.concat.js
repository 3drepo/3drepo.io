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
.service('Auth', ['$injector', '$q', '$state', 'serverConfig', function($injector, $q, $state, serverConfig) {
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
			var http = $injector.get('$http');

			// Initialize
			http.get(serverConfig.apiUrl('login'))
			.success(function(data, status) {
				self.loggedIn = true;
				self.username = data.username;
				deferred.resolve(self.loggedIn);
			}).error(function(data, status) {
				self.loggedIn = false;
				self.username = null;
				deferred.resolve(self.loggedIn);
			});
		} else {
			deferred.resolve(self.loggedIn);
		}

		return deferred.promise;
	}

	this.getUsername = function() { return this.username; }

	this.login = function(username, password) {
		var deferred = $q.defer();

		var postData = {username: username, password: password};
		var http = $injector.get('$http');

		http.post(serverConfig.apiUrl('login'), postData)
		.success(function () {
			self.username = username;
			self.loggedIn = true;
			deferred.resolve(username);
		})
		.error(function(data, status) {
			self.username = null;
			self.loggedIn = false;

			if (status === 401)
			{
				deferred.reject("Invalid username/password");
			} else {
				deferred.reject("Unable to connect to the API server");
			}
		});

		return deferred.promise;
	}

	this.logout = function() {
		var deferred = $q.defer();
		var http = $injector.get('$http');

		http.post(serverConfig.apiUrl('logout'))
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
	}
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
.config([
'$stateProvider',
'$locationProvider',
function($stateProvider, $locationProvider) {
	$stateProvider.state('base', {
		name : 'base',
		resolve: {
			StateManager: 'StateManager',
			init : function(StateManager) { StateManager.refresh("base"); }
		}
	});

	// Removes Angular's # at the end of the URL
	$locationProvider.html5Mode(true);
}])
.factory('BaseData', ['StateManager', 'uiState', function(StateManager, uiState) {
	var o = {};

	o.refresh = function () {
		// In the base we reset all the UI components
		for (uicomp in o.uiComps)
			if (uicomp in StateManager.ui)
				StateManager.ui[uicomp] = false;

		for (statevar in StateManager.state)
			StateManager.state[statevar] = null;
	};

	o.uiComps = [];

	for(k in uiState)
	{
		for(var i = 0; i < uiState[k].length; i++)
		{
			var plugin = uiState[k][i];

			if (o.uiComps.indexOf(plugin) == -1)
				o.uiComps.push(plugin);
		}
	}

	return o;
}])
.controller('BaseCtrl', ['$scope', 'StateManager', function($scope, StateManager)
{
	$scope.ui		= StateManager.ui;
	$scope.Data		= StateManager.Data;
	$scope.state	= StateManager.state;
}])
.run(['StateManager', function(StateManager) {
	StateManager.registerPlugin('base', 'BaseData', function () {
		return "base"; // Always valid
	});
}])

// Inspired by Ben Lesh's answer - http://stackoverflow.com/a/12936046/782358
.factory('clickOutsideService', function ($document) {
    return function($scope, expr) {
        var clickCB = function() {
            $scope.$apply(expr);
        };

        $document.on('click', clickCB);

        $scope.$on('$destroy', function(){
            $document.off('click', clickCB);
        });
    };
})

.directive('clickOutside', function ($document, clickOutsideService) {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            var clickCB = function(event) {
                event.stopPropagation();
            };
            element.on('click', clickCB);

            scope.$on('$destroy', function(){
                element.off('click', clickCB);
            });

            clickOutsideService(scope, attr.clickOutside);
        }
    };
});

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
.controller('DialogCtrl', function ($scope, $modalInstance, params) {
	$scope.params = params;

	$scope.ok = function () {
		$modalInstance.close($scope.params);
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

});

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
.service('CameraService', ['$window', '$timeout', function($window, $timeout) {
	var self = this;
	self.cameraSwitch	= false;
	self.source			= null;

	// TODO: Fix this

	if ($window.MediaStreamTrack.getSources)
	{
		$window.MediaStreamTrack.getSources(function (srcs) {
			var videoSRCS = srcs.filter(function(item) { return item.kind == 'video'; });
			var source = null;

			if (videoSRCS.length > 1)
			{
				videoSRCS = videoSRCS.filter(function(item) { return (item.facing == 'environment'); });
			}

			if (!videoSRCS.length)
			{
				callback("No valid cameras found");
			}

			self.source = videoSRCS[0];
		});
	}

	this.decodeCanvas = function(scope, element, callback)
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
				if (!self.cameraSwitch)
				{
					if (self.videoStream)
						self.videoStream.stop();

					return callback(err);
				}

				callback(err);
			}
		}

		$timeout(function() { self.decodeCanvas(scope, element, callback); }, 200);
	}

	this.captureQRCode = function(scope, element, callback)
	{
		$window.navigator.getUserMedia = $window.navigator.getUserMedia || $window.navigator.webkitGetUserMedia || $window.navigator.mozGetUserMedia;

		var constraints = {
			video: {
				optional: [{
					sourceId: self.source.id
				}]
			}
		};

		// Initialize camera
		$window.navigator.getUserMedia(constraints, function (videoStream) {
			element.src = $window.URL.createObjectURL(videoStream);

			self.videoStream = videoStream;
			$timeout(function() { self.decodeCanvas(scope, element, callback); }, 200);
		}, function(err) {
			callback(err);
		});
	}
}])
.controller('HeaderCtrl', ['$scope', 'Auth', '$modal', 'CameraService', 'StateManager', function($scope, Auth, $modal, CameraService, StateManager){
	$scope.Auth = Auth;
	$scope.user = { username: "", password: ""};
	$scope.CameraService = CameraService;
	$scope.captureQRCode = $scope.CameraService.captureQRCode;

	$scope.logOut = function()
	{
		Auth.logout().then(function _logoutCtrlLogoutSuccess() {
			$scope.errorMessage = null;
			StateManager.state.account = null;
			StateManager.updateState();
		}, function _logoutCtrlLogoutFailure(reason) {
			$scope.errorMessage = reason;
			StateManager.updateState();
		});
	}

	$scope.goAccount = function()
	{
		StateManager.setState({ "account" : Auth.username }, {"clearState" : true});
		StateManager.updateState();
	}

	$scope.$on("notAuthorized", function(event, message) {
		$scope.goAccount();
	});

	$scope.whereAmI = function()
	{
		$scope.CameraService.cameraSwitch = true;

		var modalInstance = $modal.open({
			templateUrl: "cameramodal.html",
			controller: "DialogCtrl",
			backdrop: false,
			resolve: {
				params: {}
			}
		});

		modalInstance.result.then(function(params) {},
		function() {
			$scope.CameraService.cameraSwitch = false;
		});
	}

}])
.directive('cameraSwitch', function () {
	return {
		restrict: 'A',
		scope: {
			capture: '='
		},
		link: function link(scope, element, attrs) {
			if (attrs["cameraSwitch"] == "true") {
				scope.capture(scope, element[0], function(err, res) {
					if(!err)
						window.location.replace(res);
					else
						console.log("QRCode error: " + err);
				});
			}
		}
	}
});

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
.run(['$rootScope', 'uiState', 'StateManager', function($rootScope, uiState, StateManager) {
	$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams)
	{
		console.log('$stateChangeStart to '+JSON.stringify(toState)+'- fired when the transition begins. toState,toParams : \n',toState, toParams);
	});

	$rootScope.$on('$stateChangeError',function(event, toState, toParams, fromState, fromParams, error){
	  console.log('$stateChangeError - fired when an error occurs during transition.');
	  console.log(arguments);
	});

	$rootScope.$on('$stateChangeSuccess',function(event, toState, toParams, fromState, fromParams){
		var uiComps = uiState[toState.name];

		var toStates 	= toState.name.split(".");
		var fromStates 	= fromState.name.split(".");

		for(var i = 0; i < fromStates.length; i++)
			if (toStates.indexOf(fromStates[i]) == -1)
				StateManager.clearStateVars(fromStates[i]);

		for (uicomp in StateManager.ui)
			StateManager.ui[uicomp] = false;

		if (uiComps)
			for (var i = 0; i < uiComps.length; i++)
				StateManager.ui[uiComps[i]] = true;
	});

	$rootScope.$on('$viewContentLoaded',function(event){
	  console.log('$viewContentLoaded - fired after dom rendered',event);
	});

	$rootScope.$on('$stateNotFound',function(event, unfoundState, fromState, fromParams){
	  console.log('$stateNotFound '+unfoundState.to+'  - fired when a state cannot be found by its name.');
	  console.log(unfoundState, fromState, fromParams);
	});
}])
.service('StateManager', ['$injector', '$state', 'structure', function($injector, $state, structure) {
	var self = this;

	// Stores the Data factories associated with each plugin
	this.Data 		= {};

	// Stores the state, required as ui-router does not allow inherited
	// stateParams, and we need to dynamically generate state diagram.
	// One day this might change.
	// https://github.com/angular-ui/ui-router/wiki/URL-Routing
	this.state		= {};

	// Ui components to switch on and off
	this.ui 		= {};

	// Link between plugins and data factories
	this.pluginData	= {};

	// Link between plugin names and state changes
	this.pluginState = {};

	// Has a state variable changed. Is this necessary ?
	this.changed 	= {};

	this.clearChanged = function()
	{
		for(var i in self.changed)
			self.changed[i] = false;
	}

	this.destroy = function()  {
		delete this.state;
		this.state = {};

		delete this.ui;
		this.ui = {};

		delete this.Data;
		this.Data = {};
	}

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

		if (stateFunc)
			this.pluginState[plugin] = stateFunc;
	}

	this.stateVars    = {};
	this.setClearStateVars = function(state, stateVars) {
		self.stateVars[state] = stateVars;
	}

	this.clearStateVars = function(state) {
		var myStateVars = self.stateVars[state];

		if (myStateVars)
			for(var i = 0; i < myStateVars.length; i++)
				self.state[myStateVars[i]] = null;
	}

	this.refresh = function(plugin)
	{
		var dataFactories = this.pluginData[plugin];

		for(var i = 0; i < dataFactories.length; i++)
			dataFactories[i].refresh();
	}

	this.genStateName = function ()
	{
		var notFinished		= true;
		var currentChildren	= structure["children"];
		var childidx 		= 0;
		var stateName 		= "base.";	// Assume that the base state is there.

		while(childidx < currentChildren.length)
		{
			var child  = currentChildren[childidx];
			var plugin = child["plugin"];

			var pluginStateName = this.pluginState[plugin](this);

			if (pluginStateName)
			{
				stateName += pluginStateName + ".";

				if (child["children"])
					currentChildren = child["children"];
				else
					currentChildren = [];

				childidx = -1;
			}

			childidx += 1;
		}

		return stateName.substring(0, stateName.length - 1);
	}

	this.createStateVar = function(varName, value)
	{
		// TODO: Check for duplication
		this.state.varName = value;
	}

	// TODO: Remove this function at some point
	this.setStateVar = function(varName, value)
	{
		if (!(self.state[varName] == value))
			self.changed[varName] = true;

		self.state[varName] = value;
	}

	this.setState = function(stateParams, extraParams)
	{
		var stateObj = $.extend(stateParams, extraParams);

		console.log('Setting state - ' + JSON.stringify(stateParams));

		// Copy all state parameters and extra parameters
		// to the state
		for(var i in stateObj)
		{
			var currentStateParams = Object.keys(self.state);
			if (currentStateParams.indexOf(i) == -1)
				self.createStateVar(i, stateObj[i]);

			self.setStateVar(i, stateObj[i]);
		}

		// Clear out anything that hasn't been set
		if (extraParams["clearState"]) {
			var objectKeys = Object.keys(stateObj);
			for(var i in self.state) {
				if (objectKeys.indexOf(i) == -1)
					delete self.state[i];
			}
		}
	}

	this.updateState = function(dontUpdateLocation)
	{
		console.log('Moving to ' + self.genStateName() + ' ...');

		var updateLocation = !dontUpdateLocation ? true: false; // In case of null
		$state.transitionTo(self.genStateName(), self.state, { location: updateLocation });
	}
}]);


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

angular.module('3drepo')
.factory('authInterceptor', ['$rootScope', '$q', function($rootScope, $q) {
	return {
		responseError: function(res)
		{
			if (res.status == 401) {
				$rootScope.$broadcast("notAuthorized", null);
			}

			return $q.reject(res);
		}
	};
}])
.config(function ($httpProvider) {
	var checkAuthorization = ['$q', '$location', function($q, $location) {
		var onSuccess = function (res) { return res;}
		var onError = function(res) {
			if (res.status == 401 || res.status == 400) {
				$location.path('/login');

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
	$httpProvider.interceptors.push('authInterceptor');
});



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
});



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
					templateUrl: 'login.html'
				}
			}
		})
	}
}])
.run(['StateManager', 'Auth', function(StateManager, Auth) {
	StateManager.registerPlugin('login', null, function () {
		return "login";
	});
}])
.controller('LoginCtrl', ['$scope', 'StateManager', 'Auth', function($scope, StateManager, Auth)
{
	$scope.user = { username: "", password: ""};

	$scope.login = function() {
		Auth.login($scope.user.username, $scope.user.password).then(
			function _loginCtrlLoginSuccess(username) {
				$scope.errorMessage = null;
				$scope.user.username = null;
				$scope.user.password = null;
				StateManager.setStateVar("account", username);
				StateManager.updateState();
			}, function _loginCtrlLoginFailure(reason) {
				$scope.errorMessage = reason;
				$scope.user.password = null;
				StateManager.setStateVar("account", null);
				StateManager.updateState();
			}
		);
	};
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
.config([
'$stateProvider',
'parentStates',
function($stateProvider, parentStates) {
	var states = parentStates["account"];

	for(var i = 0; i < states.length; i++) {
		$stateProvider
		.state(states[i] + '.account', {
			url: ':account',
			templateUrl: 'account.html',
			resolve: {
				auth: function authCheck(Auth) {
					return Auth.init();
				},
				init: function(StateManager, auth, $stateParams) {
					// On the login page the account variable is set to ""
					// we must override this.
					if ($stateParams["account"] == "")
						$stateParams["account"] = null;

					StateManager.setState($stateParams, {});
					StateManager.refresh("account");
				}
			},
			views: {
				"@" : {
					templateUrl: 'account.html',
					controller: 'AccountCtrl'
				}
			}
		})
	}
}])
.run(['StateManager', function(StateManager) {
	StateManager.registerPlugin('account', 'AccountData', function () {
		if(StateManager.state.account)
			return "account";
		else
			return null;
	});

	StateManager.setClearStateVars("account", ["account"]);
}])
.controller('AccountCtrl', ['$scope', 'StateManager', function($scope, StateManager)
{
	$scope.defaultView = "projects";
	$scope.view = $scope.defaultView;

	$scope.setView = function(view){
		$scope.view = view;
	}

	$scope.goProject = function(account, project){
		StateManager.setStateVar("account", account);
		StateManager.setStateVar("project", project);
		StateManager.updateState();
	}

	$scope.isView = function(view){
		return $scope.view == view;
	}

	$scope.passwords = {};
	$scope.passwords.updateUserError = "";
	$scope.passwords.changePasswordError = "";

	$scope.errors = {};
	$scope.errors.oldPassword = "";
	$scope.errors.newPassword = "";

	$scope.updateUser = function() {
		$scope.Data.UserData.updateUser()
		.success(function(data, status) {
			$scope.setView($scope.defaultView);
		}).error(function(message, status) {
			$scope.updateUserError = "[" + message.message + "]";
		});
	};

	$scope.changePassword = function() {
		$scope.Data.AccountData.updatePassword($scope.passwords.oldPassword, $scope.passwords.newPassword)
		.success(function(data, status) {
			$scope.setView($scope.defaultView);
		}).error(function(message, status) {
			$scope.errors.changePasswordError = "[" + message.message + "]";
		});
	};

	$scope.projectsShowList = true;
	$scope.toggleProjectsView = function() {
		$scope.projectsShowList = !$scope.projectsShowList;
	};

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

		if (username !== self.username && StateManager.state.project === undefined)
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

angular.module('3drepo')
.service('ViewerService', ['$window', 'StateManager', 'serverConfig', '$http', '$q', function($window, StateManager, serverConfig, $http, $q){
	var self = this;
	var readyQ = $q.defer();

	self.ready = readyQ.promise;

	this.init = function(viewerManager, defaultViewer) {
		// Viewer Manager controls layout of viewer
		self.viewerManager = viewerManager;
		self.defaultViewer = defaultViewer;
		self.defaultViewer.enableClicking();

		$window.viewer = self.defaultViewer;

		// TODO: Move this so that the attachment is contained
		// within the plugins themselves.
		// Comes free with oculus support and gamepad support
		self.oculus		= new Oculus(self.defaultViewer);
		self.gamepad	= new Gamepad(self.defaultViewer);
		self.gamepad.init();

		self.collision  = new Collision(self.defaultViewer);

		self.defaultViewer.whenLoaded(function () {
			readyQ.resolve();
		});
	}

	this.linkFunction = function (callback)
	{
		self.viewerManager.linkFunction(callback);
	}

	this.loadModel = function() {
		var branch		= StateManager.state.branch ? StateManager.state.branch : "master";
		var revision	= StateManager.state.revision ? StateManager.state.revision : "head";

		var url = null;

		if (revision == "head")
		{
			url = serverConfig.apiUrl(StateManager.state.account + '/' + StateManager.state.project + '/revision/' + branch + '/head.x3d.mp');
		} else {
			url = serverConfig.apiUrl(StateManager.state.account + '/' + StateManager.state.project + '/revision/' + revision + '.x3d.mp');
		}

		self.defaultViewer.loadURL(url);
		self.defaultViewer.setCurrentViewpoint("model__" + StateManager.state.account + "_" + StateManager.state.project + "_origin");
	}

	this.pickPoint = function(x,y)
	{
		self.defaultViewer.pickPoint(x,y);
		return self.defaultViewer.pickObject;
	}

	this.switchVR = function()
	{
		if(self.oculus)
			self.oculus.switchVR();
	}

	this.close = function() {
		// Close down oculus and gamepad support
		delete $window.oculus;
		delete $window.collision;

		// Close down the viewer manager
		self.viewerManager.close();
		delete $window.viewerManager;
		self.defaultViewer = null;
	}

}]);


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

var Collision = function(viewer) {
	var self = this;

	this._deltaT = 0.1;

	this.deltaX = 0.0;
	this.deltaY = 0.0;

	this.ticking = false;

	this.prevMove = 0.0;

	this.stopped = true;

	this.viewer  = viewer;

	this.updateDirections = function(event, gamepad)
	{
		var speed = self.viewer.nav._x3domNode._vf.speed;
		var userX = self._deltaT * speed * (gamepad.xaxis + gamepad.xoffset);
		var userY = self._deltaT * speed * (gamepad.yaxis + gamepad.yoffset);

		if ((userX == 0) && (userY == 0))
			self.stopped = true;
		else
			self.stopped = false;

		if(!self.stopped)
		{
			var currViewMat = self.viewer.getViewMatrix();

			self.userX = -userX;
			self.userY = -userY;

			if(!self.ticking)
				self.tick();
		} else {
			self.userX = 0;
			self.userY = 0;
		}
	}

	this.tick = function()
	{
		self.ticking = true;

		var viewArea = self.viewer.getViewArea();
		var straightDown = new x3dom.fields.SFVec3f(0, -1, 0);
		var straightUp = new x3dom.fields.SFVec3f(0, 1, 0);
		var straightAhead = new x3dom.fields.SFVec3f(0, 0, -1);
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

		viewArea._scene._nameSpace.doc.ctx.pickValue(viewArea, viewArea._width/2, viewArea._height/2,
					this._lastButton, tmpTmpMat, currProjMat.mult(tmpTmpMat));

		var dist = self.viewer.avatarRadius + 1.0;

		if (viewArea._pickingInfo.pickObj)
		{
			dist = viewArea._pickingInfo.pickPos.subtract(from).length();
		}

		if (!self.stopped && (dist > self.viewer.avatarRadius))
		{

			// Attach to ground
			// ----------------
			// Camera matrix is to look at the ground:
			// FWD is DOWN
			// UP is AHEAD
			// RIGHT is RIGHT

			var tmpUp = tmpFlatAt.subtract(from).normalize();
			var right = straightDown.cross(tmpUp);
			tmpUp = right.cross(straightDown);

			//var right = tmpFlatAt
			//var tmpUp = straightAhead.cross(straightRight);

			from.x += self.deltaX;
			from.z += self.deltaZ;

			var tmpDownMat = x3dom.fields.SFMatrix4f.identity();
			tmpDownMat.setValue(right, tmpUp, straightDown.multiply(-1), from);
			tmpDownMat = tmpDownMat.inverse();

			viewArea._pickingInfo.pickObj = null;
			viewArea._scene._nameSpace.doc.ctx.pickValue(viewArea, viewArea._width/2, viewArea._height/2,
						this._lastButton, tmpDownMat, currProjMat.mult(tmpDownMat));

			if (viewArea._pickingInfo.pickObj)
			{
				var dist = viewArea._pickingInfo.pickPos.subtract(from).length();
				var movement = 0.5 * ((self.viewer.avatarHeight - dist) + self.prevMove);
				from.y += movement;
				self.prevMove = movement;
			}

			var at	 = from.subtract(flyMat.e2());
			var up	 = flyMat.e1();
			var tmpMat = x3dom.fields.SFMatrix4f.identity();

			var right = up.cross(flyMat.e2());
			tmpMat.setValue(right, up, flyMat.e2(), from);

			viewArea._scene.getViewpoint().setView(tmpMat.inverse());
			//viewArea._scene.getViewpoint().setView(tmpDownMat);
			self.viewer.runtime.triggerRedraw();
		}

		self.nextTick();
	}

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
        .factory('EventService', EventService);

    function EventService () {
        var EVENT = {
            FILTER: "EVENT_FILTER",
            FULL_SCREEN_ENTER: "EVENT_FULL_SCREEN_ENTER",
            GLOBAL_CLICK: "EVENT_GLOBAL_CLICK",
            PANEL_CONTENT_CLICK: "EVENT_LEFT_PANEL_CONTENT_CLICK",
            PANEL_CONTENT_SETUP: "EVENT_PANEL_CONTENT_SETUP",
            TOGGLE_ELEMENTS: "EVENT_TOGGLE_ELEMENTS",
            TOGGLE_HELP: "EVENT_TOGGLE_HELP"
        };

        var currentEvent = "";

        var send = function (type, value) {
            currentEvent = {type: type, value: value};
        };

        return {
            EVENT: EVENT,
            currentEvent: function() {return currentEvent;},
            send: send
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
            element.bind('click', function (event){
                EventService.send(EventService.EVENT.GLOBAL_CLICK, event);
            });
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
            templateUrl: 'home.html',
            scope: {},
            controller: HomeCtrl,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    HomeCtrl.$inject = ["$scope", "Auth", "StateManager"];

    function HomeCtrl($scope, Auth, StateManager) {
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
					auth: function authCheck(Auth) { return Auth.init(); },
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
			})
		}
	}])
	.run(['StateManager', function(StateManager) {
		StateManager.registerPlugin('project', 'ProjectData', function () {
			if (StateManager.state.project)
				return "project";
			else
				return null;
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

	ProjectCtrl.$inject = ["EventService", "ViewerService", "StateManager"];

	function ProjectCtrl(EventService, ViewerService, StateManager) {
		var panelContent = {
			left: [],
			right: []
		};

		var state = StateManager.state;

		/*
		panelContent.left.push({
			type: "filter",
			title: "",
			show: true,
			help: "Filter content"
		});
		*/
		panelContent.left.push({
			type: "tree",
			title: "Tree",
			show: true,
			help: "Model elements shown in a tree structure",
			icon: "fa-sitemap",
			hasFilter: true
		});
		/*
		 panelContent.left.push({
		 type: "viewpoints",
		 title: "Viewpoints",
		 show: false,
		 help: "Show a list of saved viewpoints",
		 icon: "fa-street-view"
		 });
		 panelContent.left.push({
		 type: "meta",
		 title: "Meta data",
		 show: false,
		 help: "Show all the Meta data",
		 icon: "fa-map-o"
		 });
		 panelContent.left.push({
		 type: "pdf",
		 title: "PDF",
		 show: false,
		 help: "List associated PDF files",
		 icon: "fa-file-pdf-o"
		 });
		 */

		panelContent.right.push({
			type: "issues",
			title: "Issues",
			show: true,
			help: "List current issues",
			icon: "fa-map-marker",
			hasFilter: true,
			canAdd: true,
			options: [
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
			]
		});
		panelContent.right.push({
			type: "clip",
			title: "Clip",
			show: false,
			help: "Clipping plane",
			icon: "fa-object-group"
		});

		StateManager.setStateVar("branch", "master");
		StateManager.setStateVar("revision", "head");
		StateManager.updateState();		// Want to preserve URL structure

		StateManager.Data.ProjectData.loadingPromise.promise.then(function() {
			ViewerService.defaultViewer.updateSettings(StateManager.Data.ProjectData.settings);
		});

		EventService.send(EventService.EVENT.PANEL_CONTENT_SETUP, panelContent);
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

var logo_string = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAB0CAMAAACcw5TeAAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAA/SAAAP0gH7iTvJAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAwBQTFRF////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////vy5IYQAAAP90Uk5TAAECAwQF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";

// --------------------- Control Interface ---------------------

function bgroundClick(event){
	$.event.trigger("bgroundClicked", event);
};

function clickObject(event) {
	$.event.trigger("clickObject", event);
};

function clickPin(event) {
	var pinGroupObject = event.hitObject.parentElement.parentElement.parentElement;
	$.event.trigger("pinClick", {
			changeView: true,
			object: pinGroupObject
		});
}

function onMouseOver(event){
	$.event.trigger("onMouseOver", event);
}

function onMouseDown(event){
	$.event.trigger("onMouseDown", event);
}

function onMouseUp(event){
	$.event.trigger("onMouseUp", event);
}

function onMouseMove(event){
	$.event.trigger("onMouseMove", event);
}

function onMouseOver(event){
	$.event.trigger("onMouseOver", event);
}

function onViewpointChange(event){
	$.event.trigger("onViewpointChange", event);
}

function onLoaded(event){
	$.event.trigger("onLoaded", event);
}

function runtimeReady() {
	$.event.trigger("runtimeReady");
}

x3dom.runtime.ready = runtimeReady;

// ----------------------------------------------------------

var Viewer = function(name, handle, x3ddiv, manager) {
	// Properties
	var self = this;

	if(!name)
		this.name = 'viewer';
	else
		this.name = name;

	if(handle)
		this.handle = handle;

	// If not given the tag by the manager
	// create here
	if (!x3ddiv)
		this.x3ddiv = $('#x3d')[0];
	else
		this.x3ddiv = x3ddiv;

	this.inline = null;
	this.runtime = null;
	this.fullscreen = false;

	this.clickingEnabled = false;

	this.avatarRadius = 0.5;

	this.defaultShowAll = true;

	this.zNear = -1;
	this.zFar  = -1;

	this.manager = null;

	this.initialized = false;
	this.loadedPromise = $.Deferred();

	this.downloadsLeft = 1;

	this.defaultNavMode = "TURNTABLE";

	this.pinSize = null;

	this.selectionDisabled = false;

	this.init = function() {
		if (!self.initialized)
		{
			// If we have a viewer manager then it
			// will take care of initializing the runtime
			// else we'll do it ourselves
			if(manager) {
				self.manager = manager;
			} else {
				x3dom.runtime.ready = self.initRuntime;
			}

			if (self.manager) {
				self.displayMessage = self.manager.displayMessage;
			} else {
				self.displayMessage = function(text, textColor, timeout)
				{
					//TODO: Should we replicate the displayMessage stuff here ?
				}
			}

			self.logo = document.createElement('div');
			self.logo.setAttribute('id', 'viewer_logo');
			self.logo.setAttribute('style', 'top: 0px; left: 60px; position: absolute; z-index:2;');

			self.logoImage = document.createElement('img');
			self.logoImage.setAttribute('src', logo_string);
			self.logoImage.setAttribute('style', 'width: 150px;')
			self.logoImage.textContent = ' ';

			self.logoLink = document.createElement('a');

			if (server_config.return_path)
			{
				self.logoLink.setAttribute('href', server_config.return_path);
			} else {
				self.logoLink.setAttribute('href', 'https://3drepo.io');
			}

			self.logoLink.setAttribute('style', 'top: 0px; left: 0px; padding: 10px; position: absolute;')
			self.logoLink.appendChild(self.logoImage);

			self.logo.appendChild(self.logoLink);

			//self.logo.setAttribute('style', 'top: 0px; left: 0px; padding: 10px; position: absolute; z-index:10000;')
			self.x3ddiv.appendChild(self.logo);

			// Set up the DOM elements
			self.viewer = document.createElement('x3d');
			self.viewer.setAttribute('id', self.name);
			self.viewer.setAttribute('xmlns', 'http://www.web3d.org/specification/x3d-namespace');
			self.viewer.setAttribute('keysEnabled', false);
			self.viewer.addEventListener("mousedown", onMouseDown);
			self.viewer.addEventListener("mouseup", onMouseUp);
			self.viewer.style["pointer-events"] = "all";
			self.viewer.className = 'viewer';

			self.x3ddiv.appendChild(self.viewer);

			self.scene = document.createElement('Scene');
			self.scene.setAttribute('onbackgroundclicked', 'bgroundClick(event);');
			self.scene.setAttribute('dopickpass', false);
			self.viewer.appendChild(self.scene);

			self.bground = null;
			self.currentNavMode = null;

			self.createBackground();

			self.environ = document.createElement('environment');
			self.environ.setAttribute('frustumCulling', 'true');
			self.environ.setAttribute('smallFeatureCulling', 'true');
			self.environ.setAttribute('smallFeatureThreshold', 5);
			self.environ.setAttribute('occlusionCulling', 'true');
			self.environ.setAttribute('sorttrans', 'false');
			self.scene.appendChild(self.environ);

			self.light = document.createElement('directionallight');
			//self.light.setAttribute('intensity', '0.5');
			self.light.setAttribute('color', '0.714, 0.910, 0.953');
			self.light.setAttribute('direction', '0, -0.9323, -0.362');
			self.light.setAttribute('global', 'true');
			self.light.setAttribute('ambientIntensity', '0.8');
			self.light.setAttribute('shadowIntensity', 0.0);
			self.scene.appendChild(self.light);

			self.createViewpoint(self.name + "_default");

			self.nav = document.createElement('navigationInfo');
			self.nav.setAttribute('headlight', 'false');
			self.nav.setAttribute('type', self.defaultNavMode);
			self.scene.appendChild(self.nav);

			self.loadViewpoint = self.name + "_default"; // Must be called after creating nav

			self.viewer.addEventListener("keypress", function(e) {
				if (e.charCode == 'r'.charCodeAt(0))
				{
					self.reset();
					self.setApp(null);
					self.setNavMode("WALK");
					self.disableClicking();
				} else if (e.charCode == 'a'.charCodeAt(0)) {
					self.showAll();
					self.enableClicking();
				} else if (e.charCode == 'u'.charCodeAt(0)) {
					self.revealAll();
				}
			});

			self.addAxes();
			self.initialized = true;
		}
	}

	this.close = function() {
		self.viewer.parentNode.removeChild(self.viewer);
		self.viewer = null;
	}

	// This is called when the X3DOM runtime is initialized
	this.initRuntime = function (x3domruntime) {
		// If no manager, the calling object is the X3DOM runtime (this)
		// otherwise we reference the one attached to the manager.

		if (!self.manager) {
			if (this.doc.id === "viewer") {
				self.runtime = this;
			}
		} else {
			self.runtime = self.viewer.runtime;
		}

		self.showAll = function() {
			self.runtime.fitAll();

			// TODO: This is a hack to get around a bug in X3DOM
			self.getViewArea()._flyMat = null;

			self.setNavMode(self.defaultNavMode);
		}

		self.getCurrentViewpoint().addEventListener('viewpointChanged', self.viewPointChanged);

		$(document).on("onLoaded", function(event, objEvent) {
			if (self.loadViewpoint)
				self.setCurrentViewpoint(self.loadViewpoint);

			var targetParent = $(objEvent.target)[0]._x3domNode._nameSpace.doc._x3dElem;

			self.loadViewpoints();

			if(targetParent == self.viewer)
				self.setDiffColors(null);

			// TODO: Clean this up.
			if ($("#model__mapPosition")[0])
				$("#model__mapPosition")[0].parentNode._x3domNode._graph.needCulling = false;

			self.downloadsLeft += (objEvent.target.querySelectorAll("[load]").length - 1);

			self.showAll();

			if (!self.downloadsLeft)
				self.loadedPromise.resolve();
		});
	};

	this.whenLoaded = function( callback ) {
		self.loadedPromise.done(callback);
	};

	this.createBackground = function() {
		if (self.bground)
			self.bground.parentNode.removeChild(self.bground);

		self.bground = document.createElement('background');

		self.bground.setAttribute('DEF', name + '_bground');
		self.bground.setAttribute('skyangle', '0.9 1.5 1.57');
		self.bground.setAttribute('skycolor', '0.21 0.18 0.66 0.2 0.44 0.85 0.51 0.81 0.95 0.83 0.93 1');
		self.bground.setAttribute('groundangle', '0.9 1.5 1.57');
		self.bground.setAttribute('groundcolor', '0.65 0.65 0.65 0.73 0.73 0.73 0.81 0.81 0.81 0.91 0.91 0.91');
		self.bground.textContent = ' ';

		self.scene.appendChild(self.bground);
	};

	/*
	this.displayMessage = function(text, textColor, timeout) {
		self.messageBoxMessage.innerHTML = text;
		self.messageBox.style["display"] = "";

		// Construct RGBA string
		var rgbstr = "RGB(" + textColor[0] + ", " + textColor[1] + ", " + textColor[2] + ")";
		self.messageBoxMessage.style["text-color"] = rgbstr;

		setTimeout( function() {
			self.messageBox.style["display"] = "none";
		}, timeout);
	}
	*/

	this.switchDebug = function () {
		self.getViewArea()._visDbgBuf = !self.getViewArea()._visDbgBuf;
	}

	this.showStats = function () {
		self.runtime.canvas.stateViewer.display()
	}

	this.getViewArea = function() {
		return self.runtime.canvas.doc._viewarea;
	}

	this.getViewMatrix = function() {
		return self.getViewArea().getViewMatrix();
	}

	this.getProjectionMatrix = function()
	{
		return self.getViewArea().getProjectionMatrix();
	}

	this.onMouseUp = function(functionToBind)
	{
		$(self.viewer).on("onMouseUp", functionToBind);
	}

	this.onMouseDown = function(functionToBind)
	{
		$(self.viewer).on("onMouseDown", functionToBind);
	}

	this.onViewpointChanged = function(functionToBind)
	{
		$(self.viewer).on("myViewpointHasChanged", functionToBind);
	}

	this.offViewpointChanged = function(functionToBind)
	{
		$(self.viewer).off("myViewpointHasChanged", functionToBind);
	}

	this.viewPointChanged = function(event)
	{
		var vpInfo  = self.getCurrentViewpointInfo();
		var eye     = vpInfo["position"];
		var viewDir = vpInfo["view_dir"];

		if (self.currentNavMode == 'HELICOPTER')
		{
			self.nav._x3domNode._vf.typeParams[0] = Math.asin(viewDir[1]);
			self.nav._x3domNode._vf.typeParams[1] = eye[1];
		}

		$(self.viewer).trigger("myViewpointHasChanged", event);
	}

	this.onBackgroundClicked = function(functionToBind)
	{
		$(document).on("bgroundClicked", functionToBind);
	}

	this.offBackgroundClicked = function(functionToBind)
	{
		$(document).off("bgroundClicked", functionToBind);
	}

	this.triggerSelected = function(node)
	{
		$.event.trigger("objectSelected", node);
	}

	this.triggerPartSelected = function(part)
	{
		$.event.trigger("partSelected", part);
	}

	$(document).on("partSelected", function(event, part, zoom) {
		if(zoom)
			part.fit();

		if (self.oldPart)
			self.oldPart.resetColor();

		self.oldPart = part;
		part.setEmissiveColor("1.0 0.5 0.0", "front");

		var obj          = {};
		obj["multipart"] = true;
		obj["id"]        = part.multiPart._nameSpace.name + "__" + part.partID;

		$(document).trigger("objectSelected", obj);
	});

	$(document).on("objectSelected", function(event, object, zoom) {
		if (object !== undefined)
		{
			if (!object.hasOwnProperty("multipart")) {
				if(zoom)
					if (!(object.getAttribute("render") == "false"))
						self.lookAtObject(object);
			}
		}

		self.setApp(object);
	});

	$(document).on("pinClick", function(event, clickInfo) {
		self.setApp(clickInfo.object, "0.5 0.5 1.0");
	});

	$(document).on("onMouseDown", function(event, mouseEvent) {
		$("body")[0].style["pointer-events"] = "none";
	});

	$(document).on("onMouseUp", function(event, mouseEvent) {
		$("body")[0].style["pointer-events"] = "all";
	});

	this.onClickObject = function(functionToBind)
	{
		$(document).on("clickObject", functionToBind);
	}

	this.offClickObject = function(functionToBind)
	{
		$(document).off("clickObject", functionToBind);
	}

	if(0)
	{
		this.moveScale = 1.0;

		self.x3ddiv.addEventListener("keypress", function(e) {
			var mapPos = $("#model__mapPosition")[0];
			var oldTrans = mapPos.getAttribute("translation").split(",").map(
				function(res) { return parseFloat(res); });

			if(e.charCode == 'q'.charCodeAt(0))
			{
				oldTrans[0] = oldTrans[0] + 0.5 * self.moveScale;
				mapPos.setAttribute("translation", oldTrans.join(","));
			}

			if(e.charCode == 'w'.charCodeAt(0))
			{
				oldTrans[0] = oldTrans[0] - 0.5 * self.moveScale;
				mapPos.setAttribute("translation", oldTrans.join(","));
			}

			if(e.charCode == 'e'.charCodeAt(0))
			{
				oldTrans[2] = oldTrans[2] + 0.5 * self.moveScale;
				mapPos.setAttribute("translation", oldTrans.join(","));
			}

			if(e.charCode == 'f'.charCodeAt(0))
			{
				oldTrans[2] = oldTrans[2] - 0.5 * self.moveScale;
				mapPos.setAttribute("translation", oldTrans.join(","));
			}

			var mapRotation = $("#model__mapRotation")[0];
			var oldRotation = mapRotation.getAttribute("rotation").split(",").map(
				function(res) { return parseFloat(res); });

			if(e.charCode == 'g'.charCodeAt(0))
			{
				oldRotation[3] = oldRotation[3] + 0.01 * self.moveScale;
				mapRotation.setAttribute("rotation", oldRotation.join(","));
			}

			if(e.charCode == 'h'.charCodeAt(0))
			{
				oldRotation[3] = oldRotation[3] - 0.01 * self.moveScale;
				mapRotation.setAttribute("rotation", oldRotation.join(","));
			}

			var oldScale = mapPos.getAttribute("scale").split(",").map(
				function(res) { return parseFloat(res); });

			if(e.charCode == 'j'.charCodeAt(0))
			{
				oldScale[0] = oldScale[0] + 0.01 * self.moveScale;
				oldScale[2] = oldScale[2] + 0.01 * self.moveScale;

				mapPos.setAttribute("scale", oldScale.join(","));
			}

			if(e.charCode == 'k'.charCodeAt(0))
			{
				oldScale[0] = oldScale[0] - 0.01 * self.moveScale;
				oldScale[2] = oldScale[2] - 0.01 * self.moveScale;

				mapPos.setAttribute("scale", oldScale.join(","));
			}
		});
	}

	this.viewpoints = {};
	this.viewpointsNames = {};

	this.selectedViewpointIdx = 0;
	this.selectedViewpoint    = null;

	this.isFlyingThrough = false;
	this.flyThroughTime = 1000;

	this.flyThrough = function()
	{
		if (!self.isFlyingThrough)
		{
			self.isFlyingThrough = true;
			setTimeout(self.flyThroughTick, self.flyThroughTime);
		} else {
			self.isFlyingThrough = false;
		}
	}

	this.flyThroughTick = function()
	{
		var newViewpoint = self.selectedViewpointIdx + 1;

		if (newViewpoint == self.viewpoints.length)
			newViewpoint = 0;

		self.setCurrentViewpoint(self.viewpoints[newViewpoint]);

		if (self.isFlyingThrough)
			setTimeout(self.flyThroughTick, self.flyThroughTime);
	}

	this.getViewpointGroupAndName = function(id)
	{
		var splitID = id.trim().split("__");

		if (splitID.length > 1)
		{
			var group	= splitID[0].trim();
			var name	= splitID[1].trim();
		} else {
			var name	= splitID[0].trim();
			var group	= 'uncategorized';
		}

		return {group: group, name: name};
	}

	this.loadViewpoints = function()
	{
		var viewpointList = $("viewpoint");

		for(var v = 0; v < viewpointList.length; v++)
		{
			if (viewpointList[v].hasAttribute("id")) {
				var id		= viewpointList[v]["id"].trim();
				viewpointList[v]["def"] = id;

				var groupName = self.getViewpointGroupAndName(id);

				if (!self.viewpoints[groupName.group])
					self.viewpoints[groupName.group] = {};

				self.viewpoints[groupName.group][groupName.name] = id;
				self.viewpointsNames[id] = viewpointList[v];
			}
		}
	}

	this.loadViewpoint = null;

	this.getAxisAngle = function(from, at, up)
	{
		var x3dfrom	= new x3dom.fields.SFVec3f(from[0], from[1], from[2]);
		var x3dat	= new x3dom.fields.SFVec3f(at[0], at[1], at[2]);
		var x3dup	= new x3dom.fields.SFVec3f(up[0], up[1], up[2]);

		var viewMat = new x3dom.fields.SFMatrix4f.lookAt(x3dfrom, x3dat, x3dup).inverse();

		var q = new x3dom.fields.Quaternion(0.0,0.0,0.0,1.0);
		q.setValue(viewMat);

		q = q.toAxisAngle();

		return Array.prototype.concat(q[0].toGL(), q[1]);
	}

	// TODO: Should move this to somewhere more general (utils ? )
	this.axisAngleToMatrix = function(axis, angle)
	{
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

		mat.setFromArray([ t * v.x * v.x + cosAngle, t * v.x * v.y + v.z * sinAngle, t * v.x * v.z - v.y * sinAngle, 0,
			t * v.x * v.y - v.z * sinAngle, t * v.y * v.y + cosAngle, t * v.y * v.z + v.x * sinAngle, 0,
			t * v.x * v.z + v.y * sinAngle, t * v.y * v.z - v.x * sinAngle, t * v.z * v.z + cosAngle, 0,
			0, 0, 0, 1]);

		return mat;
	}

	this.createViewpoint = function(name, from, at, up)
	{
		var groupName = self.getViewpointGroupAndName(name);

		if (!(self.viewpoints[groupName.group] && self.viewpoints[groupName.group][groupName.name]))
		{
			var newViewPoint = document.createElement('viewpoint');
			newViewPoint.setAttribute('id', name);
			newViewPoint.setAttribute('def', name);
			self.scene.appendChild(newViewPoint);

			if (from && at && up)
			{
				var q = self.getAxisAngle(from, at, up);
				newViewPoint.setAttribute('orientation', q.join(','));
			}

			if (!self.viewpoints[groupName.group])
				self.viewpoints[groupName.group] = {};

			self.viewpoints[groupName.group][groupName.name] = name;
			self.viewpointsNames[name] = newViewPoint;

		} else {
			console.error('Tried to create viewpoint with duplicate name: ' + name);
		}
	}

	this.setCurrentViewpointIdx = function(idx)
	{
		var viewpointNames = Object.keys(self.viewpointsNames);
		self.setCurrentViewpoint(viewpointNames[idx]);
	}

	this.setCurrentViewpoint = function(id)
	{
		if (Object.keys(self.viewpointsNames).indexOf(id) != -1)
		{
			var viewpoint = self.viewpointsNames[id];

			// Remove event listener from viewpoint
			if (self.currentViewpoint)
				self.currentViewpoint._xmlNode.removeEventListener('viewpointChanged', self.viewPointChanged);

			self.currentViewpoint = viewpoint._x3domNode;

			viewpoint.setAttribute("bind", true);
			self.getViewArea().resetView();

			// TODO: This is a hack to get around a bug in X3DOM
			self.getViewArea()._flyMat = null;

			viewpoint.addEventListener('viewpointChanged', self.viewPointChanged);
			self.loadViewpoint = null;
			viewpoint.appendChild(self.nav);

			self.runtime.resetExamin();

			self.applySettings();


			if (id === (self.name + "_default"))
			{
				if(self.defaultShowAll)
					self.runtime.fitAll();
				else
					self.reset();
			}

			return;
		}

		self.loadViewpoint = id;
	}

	this.updateSettings = function(settings)
	{
		if (settings)
			self.settings = settings;
	}

	this.applySettings = function()
	{
		if (self.settings)
		{
			if ('start_all' in self.settings)
				self.defaultShowAll = self.settings['start_all'];

			if ('speed' in self.settings)
				self.setSpeed(self.settings['speed']);

			if ('avatarHeight' in self.settings)
				self.changeAvatarHeight(self.settings['avatarHeight']);

			if ('defaultNavMode' in self.settings)
			{
				self.defaultNavMode = self.settings['defaultNavMode'];
			}

			if ('pinSize' in self.settings)
			{
				self.pinSize = self.settings['pinSize'];
			}

			if ('visibilityLimit' in self.settings)
				self.nav.setAttribute('visibilityLimit', self.settings['visibilityLimit']);

			if ('zFar' in self.settings)
				self.currentViewpoint._xmlNode.setAttribute('zFar', self.settings['zFar']);

			if ('zNear' in self.settings)
				self.currentViewpoint._xmlNode.setAttribute('zNear', self.settings['zNear']);

		}
	}

	this.lookAtObject = function(obj)
	{
		self.runtime.fitObject(obj, true);
	};

	this.applyApp = function(nodes, factor, emiss, otherSide)
	{
		if(!otherSide)
		{
			for(var m_idx = 0; m_idx < nodes.length; m_idx++)
			{
				if (nodes[m_idx]._x3domNode)
				{
					var origDiff = nodes[m_idx]._x3domNode._vf.diffuseColor;
					nodes[m_idx]._x3domNode._vf.diffuseColor.setValues(origDiff.multiply(factor));

					var origAmb = nodes[m_idx]._x3domNode._vf.ambientIntensity;
					nodes[m_idx]._x3domNode._vf.ambientIntensity = origAmb * factor;

					nodes[m_idx]._x3domNode._vf.emissiveColor.setValueByStr(emiss);
				}
			}
		} else {
			for(var m_idx = 0; m_idx < nodes.length; m_idx++)
			{
				if (nodes[m_idx]._x3domNode)
				{
					var origDiff = nodes[m_idx]._x3domNode._vf.backDiffuseColor;
					nodes[m_idx]._x3domNode._vf.backDiffuseColor.setValues(origDiff.multiply(factor));

					var origAmb = nodes[m_idx]._x3domNode._vf.backAmbientIntensity;
					nodes[m_idx]._x3domNode._vf.backAmbientIntensity = origAmb * factor;

					nodes[m_idx]._x3domNode._vf.backEmissiveColor.setValueByStr(emiss);
				}
			}
		}
	}

	this.pickObject = {};

	this.pickPoint = function(x,y)
	{
		var viewArea = self.getViewArea();
		var scene	 = viewArea._scene;

		var oldPickMode = scene._vf.pickMode.toLowerCase();
		scene._vf.pickMode = "idbuf";
		var success = scene._nameSpace.doc.ctx.pickValue(viewArea, x, y);
		scene._vf.pickMode = oldPickMode;

		self.pickObject.pickPos		= viewArea._pickingInfo.pickPos;
		self.pickObject.pickNorm	= viewArea._pickingInfo.pickNorm;
		self.pickObject.pickObj		= viewArea._pickingInfo.pickObj;
		self.pickObject.part        = null;
		self.pickObject.partID      = null;

		var objId = viewArea._pickingInfo.shadowObjectId;

		if (scene._multiPartMap)
		{
			for(var mpi = 0; mpi < scene._multiPartMap.multiParts.length; mpi++)
			{
				var mp = scene._multiPartMap.multiParts[mpi];

				if (objId > mp._minId && objId <= mp._maxId)
				{
					var colorMap 		= mp._inlineNamespace.defMap["MultiMaterial_ColorMap"];
					var emissiveMap 	= mp._inlineNamespace.defMap["MultiMaterial_EmissiveMap"];
					var specularMap 	= mp._inlineNamespace.defMap["MultiMaterial_SpecularMap"];
					var visibilityMap 	= mp._inlineNamespace.defMap["MultiMaterial_VisibilityMap"];

                    self.pickObject.part = new x3dom.Parts(mp, [objId - mp._minId], colorMap, emissiveMap, specularMap, visibilityMap);
                    self.pickObject.partID = mp._idMap.mapping[objId - mp._minId].name;
                    self.pickObject.pickObj = self.pickObject.part.multiPart;
				}
			}
		}

	}

	this.oneGrpNodes = [];
	this.twoGrpNodes = [];

	this.setApp = function(group, app)
	{
		if (!group || !group.multipart) {
			if (app === undefined)
				app = "1.0 0.5 0.0";

			self.applyApp(self.oneGrpNodes, 2.0, "0.0 0.0 0.0", false);
			self.applyApp(self.twoGrpNodes, 2.0, "0.0 0.0 0.0", false);
			self.applyApp(self.twoGrpNodes, 2.0, "0.0 0.0 0.0", true);

			// TODO: Make this more efficient
			self.applyApp(self.diffColorAdded, 0.5, "0.0 1.0 0.0");
			self.applyApp(self.diffColorDeleted, 0.5, "1.0 0.0 0.0");

			if (group)
			{
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
	}

	this.evDist = function(evt, posA)
	{
		return Math.sqrt(Math.pow(posA[0] - evt.position.x, 2) +
				Math.pow(posA[1] - evt.position.y, 2) +
				Math.pow(posA[2] - evt.position.z, 2));
	}

	this.dist = function(posA, posB)
	{
		return Math.sqrt(Math.pow(posA[0] - posB[0], 2) +
				Math.pow(posA[1] - posB[1], 2) +
				Math.pow(posA[2] - posB[2], 2));
	}

	this.rotToRotation = function(from, to)
	{
		var vecFrom = new x3dom.fields.SFVec3f(from[0], from[1], from[2]);
		var vecTo   = new x3dom.fields.SFVec3f(to[0], to[1], to[2]);

		var dot = vecFrom.dot(vecTo);

		var crossVec = vecFrom.cross(vecTo);

		return crossVec.x + " " + crossVec.y + " " + crossVec.z + " " + Math.acos(dot);
	}

	this.rotAxisAngle = function(from, to)
	{
		var vecFrom = new x3dom.fields.SFVec3f(from[0], from[1], from[2]);
		var vecTo   = new x3dom.fields.SFVec3f(to[0], to[1], to[2]);

		var dot = vecFrom.dot(vecTo);

		var crossVec = vecFrom.cross(vecTo);
		var qt = new x3dom.fields.Quaternion(crossVec.x, crossVec.y, crossVec.z, 1);

		qt.w = vecFrom.length() * vecTo.length() + dot;

		return qt.normalize(qt).toAxisAngle();
	}

	/*
	this.quatLookAt = function (up, forward)
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
	}
	*/

	function scale(v, s)
	{
		return [v[0] * s, v[1] * s, v[2] * s];
	}

	function normalize(v)
	{
		var sz =  Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
		return scale(v, 1 / sz);
	}

	function dotProduct(a,b)
	{
		return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	}

	function crossProduct(a,b)
	{
		var x = a[1] * b[2] - a[2] * b[1];
		var y = a[2] * b[0] - a[0] * b[2];
		var z = a[0] * b[1] - a[1] * b[0];

		return [x,y,z];
	}

	function vecAdd(a,b)
	{
		return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
	}

	function vecSub(a,b)
	{
		return vecAdd(a, scale(b,-1));
	}

	this.setNavMode = function(mode) {
		if (self.currentNavMode != mode)
		{
			// If the navigation mode has changed

			if (mode == 'WAYFINDER') // If we are entering wayfinder navigation
				waypoint.init();

			if (self.currentNavMode == 'WAYFINDER') // Exiting the wayfinding mode
				waypoint.close();

			if (mode == 'HELICOPTER')
			{
				var vpInfo  = self.getCurrentViewpointInfo();
				var eye     = vpInfo["position"];
				var viewDir = vpInfo["view_dir"];

				self.nav._x3domNode._vf.typeParams[0] = Math.asin(viewDir[1]);
				self.nav._x3domNode._vf.typeParams[1] = eye[1];
			}

			self.currentNavMode = mode;
			self.nav.setAttribute('type', mode);

			if (mode == 'WALK')
			{
				self.disableClicking();
				self.setApp(null);
			} 
			/*else if (mode == 'HELICOPTER') {
				self.disableSelecting();
			} */ else {
				self.enableClicking();
			}

			if ((mode == 'WAYFINDER') && waypoint) {
				waypoint.resetViewer();
			}

			if ((mode == 'TURNTABLE')) {
				self.nav.setAttribute('typeParams', '-0.4 60.0 0 3.14 0.00001');
			}
		}
	}

	this.reload = function() {
		x3dom.reload();
	}

	this.startingPoint = [0.0,0.0,0.0];
	this.setStartingPoint = function(x,y,z)
	{
		self.startingPoint[0] = x;
		self.startingPoint[1] = y;
		self.startingPoint[2] = z;
	}

	this.defaultOrientation = [0.0, 0.0, 1.0];
	this.setStartingOrientation = function(x,y,z)
	{
		self.defaultOrientation[0] = x;
		self.defaultOrientation[1] = y;
		self.defaultOrientation[2] = z;
	}

	this.setCameraPosition = function(pos)
	{
		var vpInfo		= self.getCurrentViewpointInfo();

		var viewDir		= vpInfo["view_dir"];
		var up			= vpInfo["up"];

		self.updateCamera(pos, up, viewDir);
	}

	this.moveCamera = function(dV)
	{
		var currentPos = self.getCurrentViewpointInfo()["position"];
		currentPos[0] += dV[0];
		currentPos[1] += dV[1];
		currentPos[2] += dV[2];

		self.setCameraPosition(currentPos);
	}

	this.setCameraViewDir = function(viewDir, upDir)
	{
		var currentPos = self.getCurrentViewpointInfo()["position"];
		self.updateCamera(currentPos, upDir, viewDir);
	}

	this.setCamera = function(pos, viewDir, upDir)
	{
		self.updateCamera(pos, upDir, viewDir);
	}

	this.updateCamera = function(pos, up, viewDir)
	{
		var x3domView = new x3dom.fields.SFVec3f();
		x3domView.setValueByStr(viewDir.join(","));

		var x3domUp   = new x3dom.fields.SFVec3f();
		x3domUp.setValueByStr(normalize(up).join(","));

		var x3domFrom = new x3dom.fields.SFVec3f();
		x3domFrom.setValueByStr(pos.join(","));

		var x3domAt = x3domFrom.add(x3domView);

		var viewMatrix = x3dom.fields.SFMatrix4f.lookAt(x3domFrom, x3domAt, x3domUp).inverse();
		var currMatrix = self.getCurrentViewpoint()._x3domNode;

		if (self.currentNavMode == 'HELICOPTER')
		{
			self.nav._x3domNode._vf.typeParams[0] = Math.asin(x3domView.y);
			self.nav._x3domNode._vf.typeParams[1] = x3domFrom.y;
		}

		self.getViewArea().animateTo(viewMatrix, currMatrix);

		if(self.linked)
			self.manager.switchMaster(self.handle);
	}

	this.linked = false;
	this.linkMe = function()
	{
		// Need to be attached to the viewer master
		if (!self.manager)
			return;

		self.manager.linkMe(self.handle);
		self.onViewpointChanged(self.manager.viewpointLinkFunction);

		self.viewer.addEventListener('mousedown', function () {
			self.manager.switchMaster(self.handle);
		});

		self.linked = true;
	}


	this.collDistance = 0.1;
	this.changeCollisionDistance = function(collDistance)
	{
		self.collDistance = collDistance;
		self.nav._x3domNode._vf.avatarSize[0] = collDistance;
	}

	this.avatarHeight = 1.83;
	this.changeAvatarHeight = function(height)
	{
		self.avatarHeight = height;
		self.nav._x3domNode._vf.avatarSize[1] = height;
	}

	this.stepHeight = 0.4;
	this.changeStepHeight = function(stepHeight)
	{
		self.stepHeight = stepHeight;
		self.nav._x3domNode._vf.avatarSize[2] = stepHeight;
	}

	this.reset = function()
	{
		self.setCurrentViewpoint('model__start');

		self.changeCollisionDistance(self.collDistance);
		self.changeAvatarHeight(self.avatarHeight);
		self.changeStepHeight(self.stepHeight);
	}

	this.loadURL = function(url)
	{
		if(self.inline)
		{
			self.inline.parentNode.removeChild(self.inline);
			self.inline = null;		// Garbage collect
		}

		self.inline = document.createElement('inline');
		self.scene.appendChild(self.inline);
		self.inline.setAttribute('namespacename', 'model');
		self.inline.setAttribute('onload', 'onLoaded(event);');
		self.inline.setAttribute('url', url);
		self.reload();

		self.url = url;
	}

	this.getRoot = function() {
		return self.inline;
	}

	this.getScene = function() {
		return self.scene;
	}

	this.getCurrentViewpoint = function()
	{
		return self.getViewArea()._scene.getViewpoint()._xmlNode;
	}

	this.getCurrentViewpointInfo = function()
	{
		var viewPoint = {};

		var origViewTrans = self.getViewArea()._scene.getViewpoint().getCurrentTransform();
		var viewMat	  = self.getViewMatrix().inverse();

		var viewRight	  = viewMat.e0();
		var viewUp	  = viewMat.e1();
		var viewDir	  = viewMat.e2().multiply(-1); // Because OpenGL points out of screen
		var viewPos	  = viewMat.e3();

		var center        = self.getViewArea()._scene.getViewpoint().getCenterOfRotation();

		if (center)	{
			var lookAt = center.subtract(viewPos);
		} else {
			var lookAt  = viewPos.add(viewDir);
		}

		var projMat = self.getProjectionMatrix();

		// More viewing direction than lookAt to sync with Assimp
		viewPoint["up"]           = [viewUp.x, viewUp.y, viewUp.z];
		viewPoint["position"]     = [viewPos.x, viewPos.y, viewPos.z];
		viewPoint["look_at"]      = [lookAt.x, lookAt.y, lookAt.z];
		viewPoint["view_dir"]     = [viewDir.x, viewDir.y, viewDir.z];
		viewPoint["right"]        = [viewRight.x, viewRight.y, viewRight.z];
		viewPoint["unityHeight"]  = 2.0 / projMat._00;
		viewPoint["fov"]	      = Math.atan((1 / projMat._00)) * 2.0;
		viewPoint["aspect_ratio"] = viewPoint["fov"] / projMat._11;

		var f = projMat._23 / (projMat._22 + 1);
		var n = (f * projMat._23) / (projMat._23 - 2 * f);

		viewPoint["far"]	= f;
		viewPoint["near"]	= n;

		viewPoint["clippingPlanes"] = self.clippingPlanes;

		return viewPoint;
	}


	this.speed = 2.0;
	this.setSpeed = function(speed)
	{
		self.speed = speed;
		self.nav.speed = speed;
	}

	this.bgroundClick = function(event) {
		self.triggerSelected(null);
	}

	this.hiddenParts = [];

	this.addHiddenPart = function(part)
	{
		this.hiddenParts.push(part);
	}

	this.clickObject = function(event, objEvent) {
		if ((objEvent.button == 1) && !self.selectionDisabled)
		{
			if (objEvent.partID)
			{
				objEvent.part.partID = objEvent.partID;
				self.triggerPartSelected(objEvent.part);
			} else {
				self.triggerSelected(objEvent.target);
			}
		} 
	}

	this.revealAll = function(event, objEvent)
	{
		for(var part in self.hiddenParts)
		{
			self.hiddenParts[part].setVisibility(true);
		}

		self.hiddenParts = [];
	}

	this.disableClicking = function() {
		if(self.clickingEnabled)
		{
			self.offBackgroundClicked(self.bgroundClick);
			self.offClickObject(self.clickObject);
			self.viewer.setAttribute("disableDoubleClick", true);
			self.clickingEnabled = false;
		}
	}

	this.disableSelecting = function() {
		self.selectionDisabled = true;
	}

	this.enableClicking = function() {
		if(!self.clickingEnabled)
		{
			// When the user clicks on the background the select nothing.
			self.onBackgroundClicked(self.bgroundClick);
			self.onClickObject(self.clickObject);
			self.viewer.setAttribute("disableDoubleClick", false);
			self.clickingEnabled = true;
		}
	}

	this.switchFullScreen = function(vrDisplay) {
		vrDisplay = vrDisplay || {};

		if (!self.fullscreen)
		{
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
	this.diffColorAdded   = [];

	this.setDiffColors = function(diffColors) {
		if(diffColors)
			self.diffColors = diffColors;

		self.applyApp(self.diffColorAdded, 2.0, "0.0 0.0 0.0", false);
		self.applyApp(self.diffColorDeleted, 2.0, "0.0 0.0 0.0", false);

		self.diffColorAdded   = [];
		self.diffColorDeleted = [];

		if (self.diffColors)
		{
			if (self.inline.childNodes.length)
			{
				var defMapSearch = self.inline.childNodes[0]._x3domNode._nameSpace.defMap;

				if(self.diffColors["added"])
				{
					for(var i = 0; i < self.diffColors["added"].length; i++)
					{
						// TODO: Improve, with graph, to use appearance under  _cf rather than DOM.
						var obj = defMapSearch[self.diffColors["added"][i]];
						if(obj)
						{
							var mat = $(obj._xmlNode).find("Material");

							if (mat.length)
							{
								self.applyApp(mat, 0.5, "0.0 1.0 0.0", false);
								self.diffColorAdded.push(mat[0]);
							} else {
								var mat = $(obj._xmlNode).find("TwoSidedMaterial");
								self.applyApp(mat, 0.5, "0.0 1.0 0.0", false);

								self.diffColorAdded.push(mat[0]);
							}

						}
					}
				}

				if(self.diffColors["deleted"])
				{
					for(var i = 0; i < self.diffColors["deleted"].length; i++)
					{
						// TODO: Improve, with graph, to use appearance under  _cf rather than DOM.
						var obj = defMapSearch[self.diffColors["deleted"][i]];
						if(obj)
						{
							var mat = $(obj._xmlNode).find("Material");

							if (mat.length)
							{
								self.applyApp(mat, 0.5, "1.0 0.0 0.0", false);
								self.diffColorDeleted.push(mat[0]);
							} else {
								var mat = $(obj._xmlNode).find("TwoSidedMaterial");
								self.applyApp(mat, 0.5, "1.0 0.0 0.0", false);

								self.diffColorDeleted.push(mat[0]);
							}
						}
					}
				}
			}
		}
	};

	this.transformEvent = function(event, viewpoint, inverse)
	{
		if (inverse)
			var transformation = viewpoint._x3domNode.getTransformation().inverse();
		else
			var transformation = viewpoint._x3domNode.getTransformation();

		var newPos       = transformation.multMatrixVec(event.position);
		var newOrientMat = self.axisAngleToMatrix(event.orientation[0], event.orientation[1]);
		newOrientMat     = transformation.mult(newOrientMat);

		var newOrient    = new x3dom.fields.Quaternion();
		newOrient.setValue(newOrientMat);
		newOrient = newOrient.toAxisAngle();

		event.position    = newPos;
		event.orientation = newOrient;
	}

	// TODO: Merge this function with the Viewer Manager
	this.axesMove = function(origEvent, event) {
		// Axes should rotate inversely to orientation
		// of camera
		event.orientation[1] = event.orientation[1] * -1;

		// Fix transformation from viewpoint basis
		self.transformEvent(event, event.target, false);

		// Set rotation of the overlying group
		self.axesGroup.setAttribute('rotation', event.orientation.toString());
	}

	this.linkAxes = function()
	{
		self.onViewpointChanged(self.axesMove);
	}

	this.addAxes = function() {
		var axesDiffColor = ['0.1 0.6 0.1', '0.7 0.1 0.1', '0.3 0.3 1.0'];
		var axesEmissiveColor = ['0.05 0.2 0.05', '0.33 0.0 0.0', '0.1 0.1 0.33'];
		var rotation = ['0.0 0.0 1.0 0.0', '0.0 0.0 1.0 -1.57079', '1.0 0.0 0.0 1.57079'];
		var axisName = ['Y', 'X', 'Z'];

		var coord = document.createElement('X3D');
		coord.setAttribute('id', 'Axes');
		coord.setAttribute('showStat', 'false');
		coord.setAttribute('showLog', 'false');

		self.x3ddiv.appendChild(coord);

		var scene = document.createElement('scene');
		coord.appendChild(scene);

		var vp = document.createElement('Viewpoint');
		vp.setAttribute('position', '0.76500 0.765 5.0');
		scene.appendChild(vp);

		self.axesScene = scene;

		self.axesNav = document.createElement('navigationInfo');
		self.axesNav.setAttribute('type', 'NONE');
		scene.appendChild(self.axesNav);

		self.axesGroup = document.createElement('Transform');
		scene.appendChild(self.axesGroup);

		var x3dFile = document.createElement('inline');
		x3dFile.setAttribute('url', 'public/box.x3d');
		self.axesGroup.appendChild(x3dFile);

		self.reload();
		self.linkAxes();
	}

	var clippingPlaneID = -1;
	this.clippingPlanes  = [];

	this.setClippingPlanes = function(clippingPlanes)
	{
		self.clearClippingPlanes();

		for(var clipidx = 0; clipidx < clippingPlanes.length; clipidx++)
		{
			var clipPlaneIDX = self.addClippingPlane(
					clippingPlanes[clipidx]["axis"],
					clippingPlanes[clipidx]["distance"],
					clippingPlanes[clipidx]["percentage"],
					clippingPlanes[clipidx]["clipDirection"]
				);
		}
	}

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
	}

	/**
	* Clear out all clipping planes
	*/
	this.clearClippingPlanes = function() {
		self.clippingPlanes.forEach(function(clipPlane) {
			clipPlane.destroy();
			delete clipPlane;
		});

		self.clippingPlanes = [];
	}

	/**
	* Clear out all clipping planes
	* @param {number} id - Get the clipping plane with matching unique ID
	*/
	this.getClippingPlane = function(id) {
		// If the clipping plane no longer exists this
		// will return undefined
		return self.clippingPlanes.filter(function (clipPlane) {
			return (clipPlane.getID() === id);
		})[0];
	}
};

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
var ClipPlane = function(id, viewer, axis, colour, distance, percentage, clipDirection)
{
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
	this.percentage = (percentage === undefined) ? 1.0 : percentage

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
	var outline      = document.createElement("Shape");

	/**
	* Outline appearance
	* @private
	* @type {HTMLElement}
	*/
	var outlineApp   = document.createElement("Appearance");

	/**
	* Outline material
	* @private
	* @type {HTMLElement}
	*/
	var outlineMat   = document.createElement("Material");

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
	* Get my unique ID
	*/
	this.getID = function()
	{
		return id;
	}

	/**
	* Set the coordinates of the clipping plane outline
	*/
	var setOutlineCoordinates = function()
	{
		var min = volume.min.toGL();
		var max = volume.max.toGL();

		var axisIDX = "XYZ".indexOf(self.axis);
		var outline = [[0,0,0], [0,0,0], [0,0,0], [0,0,0], [0,0,0]];

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
	}

	/**
	* Move the clipping plane
	* @param {number} percentage - Percentage of entire clip volume to move across
	*/
	this.movePlane = function(percentage)
	{
		// Update the transform containing the clipping plane
		var axisIDX = "XYZ".indexOf(this.axis);
		var min = volume.min.toGL();
		var max = volume.max.toGL();

		self.percentage = percentage;
		var distance = 0.0;

		if (self.distance)
		{
			distance = self.distance;
		} else {
			distance = ((max[axisIDX] - min[axisIDX]) * percentage) + min[axisIDX];
		}

		// Update the clipping element plane equation
		clipPlaneElem.setAttribute("plane", normal.toGL().join(" ") + " " + distance);

		var translation = [0,0,0];
		translation[axisIDX] = -distance * this.clipDirection;
		coordinateFrame.setAttribute("translation", translation.join(","));
	}

	/**
	* Change the clipping axis
	* @param {string} axis - Axis on which the clipping plane acts
	*/
	this.changeAxis = function(axis)
	{
		this.axis = axis.toUpperCase();

		// When the axis is change the normal to the plane is changed
		normal.x = (axis === "X") ? this.clipDirection : 0;
		normal.y = (axis === "Y") ? this.clipDirection : 0;
		normal.z = (axis === "Z") ? this.clipDirection : 0;

		// Reset plane to the start
		this.movePlane(1.0);

		setOutlineCoordinates();
	}

	/**
	* Destroy me and everything connected with me
	*/
	this.destroy = function()
	{
		if (clipPlaneElem && clipPlaneElem.parentNode) {
			clipPlaneElem.parentNode.removeChild(clipPlaneElem);
		}

		if (coordinateFrame && coordinateFrame.parentNode) {
			coordinateFrame.parentNode.removeChild(coordinateFrame);
		}
	}

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

	viewer.$inject = ["$compile", "StateManager"];

	function viewer($compile, StateManager) {
		return {
			restrict: "E",
			scope: { 
				manager: "=",
				handle:  "@"
			},
			link: link,
			controller: ViewerCtrl,
			controllerAs: 'v',
			bindToController: true
		};

		function link (scope, element, attrs)
		{

			scope.account = angular.isUndefined(attrs.account) ? 
							StateManager.state.account :
							attrs.account;

			scope.project = angular.isUndefined(attrs.project) ? 
							StateManager.state.project :
							attrs.project;

			scope.branch  = angular.isUndefined(attrs.branch) ? 
							StateManager.state.branch :
							attrs.branch;

			scope.revision = angular.isUndefined(attrs.revision) ? 
							StateManager.state.revision :
							attrs.revision;

			scope.name     = angular.isUndefined(attrs.name) ?
							"viewer" : attrs.name;

		}
	}

	ViewerCtrl.$inject = ["$scope", "$element", "StateManager", "ViewerService"];

	function ViewerCtrl ($scope, $element, StateManager, ViewerService)
	{
		var v = this;
		var state = StateManager.state;

		$scope.viewer = v.manager.getDefaultViewer();
		ViewerService.init(v.manager, $scope.viewer);

		$scope.$watchGroup(["state.branch", "state.revision"], function() {
			ViewerService.loadModel();
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

(function () {
	"use strict";

	angular.module("3drepo")
	.directive("viewermanager", viewerManager);

	function viewerManager() {
		return {
			restrict: 'E',
			controller : ViewerManagerCtrl,
			template: '<viewer class="project-viewport viewport" handle="{{vm.defaultHandle}}" manager="vm.manager" />',
			controllerAs: 'vm'
		};
	}

	ViewerManagerCtrl.$inject = ["$element"];

	function ViewerManagerCtrl ($element)
	{
		var vm = this;
		vm.manager = new ViewerManager($element[0]);
		vm.defaultHandle = vm.manager.defaultViewerHandle;
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

var ViewerManager = function(element) {
	var self = this;

	this.defaultViewerHandle = null;
	this.viewers = {};

	this.x3ddiv = element;

	this.newIdx = 0;

	this.reshape = function() {
		// TODO: Only splits horizontally at the moment
		var viewerSize = (100 / Object.keys(self.viewers).length);
		var idxes = Object.keys(self.viewers);

		for(var i = 0; i < idxes.length; i++)
		{
			var idx = idxes[i];

			self.viewers[idx].viewer.style.width = viewerSize + "%";
			self.viewers[idx].viewer.style.left = (i * viewerSize) + "%";
		}
	};

	this.close = function() {
		var idxes = Object.keys(self.viewers).slice(0);

		for(var i = 0; i < idxes.length; i++)
		{
			var handle = parseInt(idxes[i]);

			self.removeViewer(handle);
		}
	};

	this.addViewer = function(name) {
		// TODO: Check for unique ID
		// TODO: Auto-generate ID for viewer
		self.newIdx += 1;
		self.viewers[self.newIdx] = new Viewer(name, self.newIdx, self.x3ddiv, self);
		self.viewers[self.newIdx].init();

		self.reshape();

		return self.newIdx;
	};

	this.isValidHandle = function(handle) {
		if(!handle) { 
			return false;
		}

		// TODO: Too much, optimize to avoid calling this all the time
		// And also the function below this.
		var idx = Object.keys(self.viewers).map(function(v) { return parseInt(v); }).indexOf(handle);

		if (idx === -1) {
			console.log('INVALID HANDLE ' + handle);
		}

		return (idx > -1);
	};

	this.getHandleByName = function(name) {
		var match = Object.keys(self.viewers).filter(function(v) { return self.viewers[v].name === name; });

		if (match.length) {
			return parseInt(match[0]);
		} else {
			return null;
		}
	};

	this.getViewerByName = function(name) {
		var handle = self.getHandleByName(name);

		if (handle) {
			return self.viewers[handle];
		} else {
			return null;
		}
	};

	this.getViewer = function(handle) {
		if (self.isValidHandle(handle)) {
			return self.viewers[handle];
		} else {
			return null;
		}
	};

	this.removeViewer = function(handle) {
		if (self.isValidHandle(handle))
		{
			// Can't be left with nothing
			if (Object.keys(self.viewers).length === 1) {
				return;
			}

			if (self.viewers[handle] === self.viewMaster) {
				self.viewMaster = null;
			}

			if (self.defaultViewerHandle === handle) {
				self.defaultViewerHandle = parseInt(Object.keys(self.viewers)[0]);
			}
 
			if (self.diffHandle === handle) {
				self.diffHandle = null;
			}

			self.linkedViewers = self.linkedViewers.filter(function(idx) { return (idx !== handle); });

			self.viewers[handle].close();
			delete self.viewers[handle];

			self.reshape();
		}
	};

	this.linkedViewers = [];
	this.linkedFunctions = [];
	this.linkMe = function(handle) { self.addMe(self.linkedViewers, handle); };

	this.viewMaster = null;
	this.switchMaster = function(handle) {
		if (self.isValidHandle(handle)) {
			self.viewMaster = self.viewers[handle];
		}
	};

	this.linkFunction = function(callback)
	{
		this.linkedFunctions.push(callback);
	};

	this.addMe = function(array, handle)
	{
		if (self.isValidHandle(handle))
		{
			if (array.indexOf(handle) === -1) {
				array.push(handle);
			}
		}
	};

	this.viewpointLinkFunction = function (newEvent, event) {
		if (!self.linkedViewers.length || !self.viewMaster) {
			return;
		}

		// Only updates to the master should do anything
		if (event.target !== self.viewMaster.getCurrentViewpoint()) {
			return;
		}

		event.orientation[1] = event.orientation[1] * -1;
		self.viewMaster.transformEvent(event, event.target, false);

		for(var i = 0; i < self.linkedViewers.length; i++)
		{
			var handle = self.linkedViewers[i];

			if (self.viewMaster.handle === handle)  {// Don't need to update the master
				continue;
			}

			if (self.isValidHandle(handle))
			{
				//self.viewers[handle].transformEvent(event, self.viewers[handle].getCurrentViewpoint(), false);
				self.viewers[handle].getCurrentViewpoint().setAttribute("position", event.position.toString());
				self.viewers[handle].getCurrentViewpoint().setAttribute("orientation", event.orientation.toString());
				//self.viewers[handle].transformEvent(event, self.viewers[handle].getCurrentViewpoint(), true);
			}
		}

		for (var i = 0; i < self.linkedFunctions.length; i++) {
			self.linkedFunctions[i](event);
		}
	};


	this.initRuntime = function () {
		for(handle in self.viewers) {
			if(self.viewers[handle]) {
				if(!self.viewers[handle].runtime) {
					self.viewers[handle].initRuntime();
				}
			}
		}
	};

	x3dom.runtime.ready = this.initRuntime;

	this.diffHandle = null;
	this.diffView = function(enable) {
		if (enable)
		{
			if (!self.isValidHandle(self.diffHandle))
			{
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

	this.getDiffViewer = function() {
		if(self.diffHandle) {
			return self.viewers[self.diffHandle];
		}
	};

	this.getDefaultViewer = function() {
		if(self.defaultViewerHandle) {
			return self.viewers[self.defaultViewerHandle];
		}
	};

	// Helper function to load scene in viewers
	this.loadURL = function(handle, url)
	{
		if (self.isValidHandle(handle))
		{
			var viewer = self.viewers[handle];
			viewer.loadURL(url);
		}
	};

/*
	this.messageBox = document.createElement('div');
	this.messageBox.setAttribute('id', 'viewerMessageBox');
	this.messageBox.className = "panel panel-default";
	this.messageBox.style["display"] = "none";
	this.messageBoxMessage = document.createElement('p');
	this.messageBoxMessage.innerHTML = "";
	this.messageBox.appendChild(this.messageBoxMessage);
	this.x3ddiv.appendChild(this.messageBox);

	this.displayMessage = function(text, textColor, timeout) {
		self.messageBoxMessage.innerHTML = text;
		self.messageBox.style["display"] = "";

		// Construct RGBA string
		var rgbstr = "RGB(" + textColor[0] + ", " + textColor[1] + ", " + textColor[2] + ")";
		self.messageBox.style["color"] = rgbstr;

		setTimeout( function() {
			self.messageBox.style["display"] = "none";
		}, timeout);
	}
	*/

	// Create the default viewer
	self.defaultViewerHandle = self.addViewer("viewer");
};



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
.controller('OculusCtrl', ['$scope', 'StateManager', 'ViewerService', function($scope, StateManager, ViewerService)
{
	$scope.defaultViewer = ViewerService.defaultViewer;

	$scope.switchVR = function(mode)
	{
		ViewerService.switchVR();
	}
}]);


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

var Oculus = function(viewer) {
	var self = this;

	this.rtLeft		= null;
	this.rtRight	= null;

	this.lastW		= null;
	this.lastH		= null;

	this.vrHMD		= null;
	this.vrSensor	= null;

	this.IPD		= 0.0064;

	this.enabled	= false;

	this.oculus		= null;

	this.viewer		= viewer;

	this.switchVR = function()
	{
		var scene = self.viewer.scene;

		if (!this.enabled)
		{
			// Add oculus eyes
			var eyeGroup = document.createElement('group');
			eyeGroup.setAttribute('def', 'oculus');
			eyeGroup.setAttribute('render', 'true');
			this.oculus = eyeGroup;

			var leftEye = document.createElement('group');
			leftEye.setAttribute('def', 'left');
			leftEye.setAttribute('render', 'false');
			eyeGroup.appendChild(leftEye);

			var leftShape = document.createElement('shape');
			leftShape.setAttribute('isPickable', 'false');
			leftEye.appendChild(leftShape);

			var leftApp = document.createElement('appearance');
			leftShape.appendChild(leftApp);

			var leftTex = document.createElement('renderedtexture');
			leftTex.setAttribute('id', 'rtLeft');
			leftTex.setAttribute('stereoMode', 'LEFT_EYE');
			leftTex.setAttribute('update', 'ALWAYS');
			leftTex.setAttribute('oculusRiftVersion', '2');
			leftTex.setAttribute('dimensions', '980 1080 3');
			leftTex.setAttribute('repeatS', 'false');
			leftTex.setAttribute('repeatT', 'false');
			leftTex.setAttribute('interpupillaryDistance', this.IPD);
			leftApp.appendChild(leftTex);

			var leftVP = document.createElement('viewpoint');
			leftVP.setAttribute('use', self.viewer.getCurrentViewpoint().getAttribute('id'));
			leftVP.setAttribute('containerfield', 'viewpoint');
			leftVP.textContent = ' ';
			leftTex.appendChild(leftVP);

			var leftBground = document.createElement('background');
			leftBground.setAttribute('use', 'viewer_bground');
			leftBground.setAttribute('containerfield', 'background');
			leftBground.textContent = ' ';
			leftTex.appendChild(leftBground);

			var leftScene = document.createElement('group');
			leftScene.setAttribute('use', 'model__root');
			leftScene.setAttribute('containerfield', 'scene');
			leftTex.appendChild(leftScene);

			var leftPlane = document.createElement('plane');
			leftPlane.setAttribute('solid', 'false');
			leftShape.appendChild(leftPlane);

			// Right eye
			var rightEye = document.createElement('group');
			rightEye.setAttribute('def', 'right');
			rightEye.setAttribute('render', 'false');
			eyeGroup.appendChild(rightEye);

			var rightShape = document.createElement('shape');
			rightShape.setAttribute('isPickable', 'false');
			rightEye.appendChild(rightShape);

			var rightApp = document.createElement('appearance');
			rightShape.appendChild(rightApp);

			var rightTex = document.createElement('renderedtexture');
			rightTex.setAttribute('id', 'rtRight');
			rightTex.setAttribute('stereoMode', 'RIGHT_EYE');
			rightTex.setAttribute('update', 'ALWAYS');
			rightTex.setAttribute('oculusRiftVersion', '2');
			rightTex.setAttribute('dimensions', '980 1080 3');
			rightTex.setAttribute('repeatS', 'false');
			rightTex.setAttribute('repeatT', 'false');
			rightTex.setAttribute('interpupillaryDistance', this.IPD);
			rightApp.appendChild(rightTex);

			var rightPlane = document.createElement('plane');
			rightPlane.setAttribute('solid', 'false');
			rightShape.appendChild(rightPlane);

			var rightVP = document.createElement('viewpoint');
			rightVP.setAttribute('use', self.viewer.getCurrentViewpoint().getAttribute('id'));
			rightVP.setAttribute('containerfield', 'viewpoint');
			rightVP.textContent = ' ';
			rightTex.appendChild(rightVP);

			var rightBground = document.createElement('background');
			rightBground.setAttribute('use', 'viewer_bground');
			rightBground.setAttribute('containerfield', 'background');
			rightBground.textContent = ' ';
			rightTex.appendChild(rightBground);

			var rightScene = document.createElement('group');
			rightScene.setAttribute('use', 'model__root');
			rightScene.setAttribute('containerfield', 'scene');
			rightScene.textContent = ' ';
			rightTex.appendChild(rightScene);

			scene.appendChild(eyeGroup);

			// Should this be in a setTimeout
			leftShape._x3domNode._graph.needCulling = false;
			rightShape._x3domNode._graph.needCulling = false;
			eyeGroup._x3domNode._graph.needCulling = false;
			//leftPlane._x3domNode._graph.needCulling = false;
			//rightPlane._x3domNode._graph.needCulling = false;

			this.startVR();

			self.viewer.switchFullScreen(self.vrHMD);

			this.enabled = true;
		} else {
			this.oculus.parentNode.removeChild(this.oculus);

			this.rtLeft		= null;
			this.rtRight	= null;

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

			self.viewer.switchFullScreen(self.vrHMD);

			self.viewer.createBackground();
		}
	}

	this.startVR = function () {
		self.rtLeft		= $("#rtLeft")[0];
		self.rtRight	= $("#rtRight")[0];

		self.lastW		= self.viewer.runtime.getWidth();
		self.lastH		= self.viewer.runtime.getHeight();

		self.viewpoint	= self.viewer.viewpoint;

		self.viewer.getViewArea().skipSceneRender = true;

		self.viewer.runtime.enterFrame = function () {
			if (!self.vrSensor)
				return;

			var state	= self.vrSensor.getState();
			var h		= state.orientation;

			if (h)
			{
				var vp = self.viewer.getCurrentViewpoint()._x3domNode;
				var flyMat	= vp.getViewMatrix().inverse();
				var q	= new x3dom.fields.Quaternion(h.x, h.y, h.z, h.w);

				flyMat.setRotate(q);
				vp.setView(flyMat.inverse());
			}
		};

		self.viewer.runtime.exitFrame = function ()
		{
			var w = self.viewer.runtime.getWidth();
			var h = self.viewer.runtime.getHeight();

			self.viewer.runtime.canvas.doc.ctx.stateManager.viewport(0,0,w / 2,h);
			self.viewer.viewer.runtime.canvas.doc._scene._fgnd._webgl.render(self.viewer.viewer.runtime.canvas.doc.ctx.ctx3d, self.rtLeft._x3domNode._webgl.fbo.tex);

			self.viewer.runtime.canvas.doc.ctx.stateManager.viewport(w / 2,0,w / 2,h);
			self.viewer.viewer.runtime.canvas.doc._scene._fgnd._webgl.render(self.viewer.viewer.runtime.canvas.doc.ctx.ctx3d, self.rtRight._x3domNode._webgl.fbo.tex);

			if (w != self.lastW || h != self.lastH)
			{
				var half = Math.round(w / 2);
				self.rtLeft.setAttribute('dimensions',  half + ' ' + h + ' 4');
				self.rtRight.setAttribute('dimensions', half + ' ' + h + ' 4');

				self.lastW = w;
				self.lastH = h;
			}

			self.viewer.runtime.triggerRedraw();
		};
	}

	this.changeIPD = function(newIPD) {
		self.rtLeft.setAttribute("interpupillaryDistance", newIPD);
		self.rtRight.setAttribute("interpupillaryDistance", newIPD);
	}

	this.peturbIPD = function(perturbation) {
		var oldDistance = parseFloat(self.rtLeft.getAttribute("interpupillaryDistance"));
		this.changeIPD(oldDistance + peturbation);
	}

	this.exitFullscreen = function() {
		if (!document.webkitIsFullScreen && !document.msFullscreenElement && !document.mozFullScreen && self.enabled) {
            self.switchVR();
        }
	}

	this.createFullscreenExit = function () {
		document.addEventListener('webkitfullscreenchange', self.exitFullscreen, false);
		document.addEventListener('mozfullscreenchange', self.exitFullscreen, false);
		document.addEventListener('fullscreenchange', self.exitFullscreen, false);
		document.addEventListener('MSFullscreenChange', self.exitFullscreen, false);
	}

	this.init = function(vrdevs) {
		var i;

		// First, find a HMD -- just use the first one we find
		for (i = 0; i < vrdevs.length; ++i) {
			if (vrdevs[i] instanceof HMDVRDevice) {
				self.vrHMD = vrdevs[i];
				break;
			}
		}

		if (!self.vrHMD)
			return;

		// Then, find that HMD's position sensor
		for (i = 0; i < vrdevs.length; ++i) {
			if (vrdevs[i] instanceof PositionSensorVRDevice &&
				vrdevs[i].hardwareUnitId == self.vrHMD.hardwareUnitId) {
				self.vrSensor = vrdevs[i];
				break;
			}
		}

		if (!self.vrHMD || !self.vrSensor) {
			alert("Didn't find a HMD and sensor!");
			return;
		}

	}

	if (navigator.getVRDevices)
		navigator.getVRDevices().then(this.init);

	this.createFullscreenExit();
	//http://blog.tojicode.com/2014/07/bringing-vr-to-chrome.html
	//http://blog.bitops.com/blog/2014/08/20/updated-firefox-vr-builds/
};

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
.controller('NavigationCtrl', ['$scope', 'StateManager', 'ViewerService', function($scope, StateManager, ViewerService)
{
	$scope.defaultViewer = ViewerService.defaultViewer;

	$scope.setViewerMode = function(mode)
	{
		$scope.defaultViewer.setNavMode(mode);
	}
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

    ViewpointsCtrl.$inject = ["$scope", "ViewerService", "StateManager", "serverConfig"];

    function ViewpointsCtrl($scope, ViewerService, StateManager, serverConfig) {
        var vp = this,
            defaultViewer = ViewerService.defaultViewer,
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
'$locationProvider',
'parentStates',
function($stateProvider, $locationProvider, parentStates) {
	var states = parentStates["inspect"];

	for(var i = 0; i < states.length; i++) {
		$stateProvider.state(states[i] + '.inspect', {
			url: '/inspect',
			resolve: {
				init : function(StateManager) { StateManager.refresh("inspect"); }
			}
		});
	}
}])
.controller('InspectCtrl', ['$scope', 'StateManager', 'ViewerService', '$window', '$modal', '$timeout', function($scope, StateManager, ViewerService, $window, $modal, $timeout)
{
	$scope.defaultViewer = ViewerService.defaultViewer;
	$scope.cameraSwitch  = false;

	$scope.startInspect = function()
	{
		StateManager.setStateVar('inspect', true);
		StateManager.updateState();
	}

	$scope.whereAmI = function()
	{
		$modal.open({
			templateUrl: "cameramodal.html",
			backdrop: false
		});

		cameraSwitch = true;
	}
}])
.factory('InspectData', function() {
	var o = {
		captureCamera : false
	};

	o.refresh = function () {
	};

	return o;
})
.run(['StateManager', function(StateManager) {
	StateManager.registerPlugin('inspect', 'InspectData', function () {
		if (StateManager.state.inspect)
			return "inspect";
		else
			return null;
	});

	StateManager.setClearStateVars("inspect", ["inspect"]);
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
.factory('CurrentBranch', ['$http', '$q', 'serverConfig', 'StateManager', function($http, $q, serverConfig, StateManager){
	var o = {
		name:			"",
		revisions:		[],
		n_revisions:	0
	};

	o.refresh = function() {
		var self = this;
		var account = StateManager.state.account;
		var project = StateManager.state.project;
		var branch  = StateManager.state.branch;

		var deferred = $q.defer();

		$http.get(serverConfig.apiUrl(account + '/' + project + '/revisions/' + branch + '.json'))
		.then(function(json) {
			self.name		 = branch;
			self.revisions	 = json.data;
			self.n_revisions = self.revisions.length;

			deferred.resolve();
		}, function(message) {
			deferred.resolve();
		});

		return deferred.promise;
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

angular.module('3drepo')
.factory('CurrentRevision', ['$http', '$q', 'serverConfig', 'StateManager', function($http, $q, serverConfig, StateManager){
	var o = {
		revision:	"",
		shortName:	"",
		author:		"",
		date:		"",
		message:	"",
		branch:		""
	};

	o.refresh = function() {
		var self = this;
		var deferred = $q.defer();

		var account		= StateManager.state.account;
		var project		= StateManager.state.project;
		var branch		= StateManager.state.branch;
		var revision	= StateManager.state.revision;

		var baseUrl = "";

		if (revision == self.revision)
		{
			deferred.resolve();
		} else {
			if (revision && (revision != 'head'))
				baseUrl = serverConfig.apiUrl(account + '/' + project + '/revision/' + revision);
			else
				baseUrl = serverConfig.apiUrl(account + '/' + project + '/revision/' + branch + '/head');

			$http.get(baseUrl + '.json')
			.then(function(json) {
				self.revision	= json.data.revision;
				self.shortName	= json.data.revision.substr(0,20) + "...";
				self.author		= json.data.author;
				self.date		= json.data.date;
				self.message	= json.data.message;
				self.branch		= json.data.branch;

				deferred.resolve();
			}, function(message) {
				deferred.resolve();
			});
		}

		return deferred.promise;
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

angular.module('3drepo')
.config([
'$stateProvider',
'parentStates',
function($stateProvider, parentStates) {
	var states = parentStates["revision"];

	for(var i = 0; i < states.length; i++) {
		$stateProvider
		.state(states[i] + '.branch', {
			url: '/revision/:branch/head',
			resolve: {
				init: function(StateManager, $stateParams) {
					StateManager.setState($stateParams, {});
					StateManager.state.revision = 'head';
					StateManager.refresh('revision');
				}
			}
		})
		.state(states[i] + '.revision', {
			url: '/revision/:revision',
			resolve: {
				init: function(StateManager, $stateParams) {
					StateManager.setState($stateParams, {});
					StateManager.refresh('revision');
				}
			}
		});
	}
}])
.run(['StateManager', function(StateManager) {
	StateManager.registerPlugin('revision', 'RevisionData', function () {
		if (StateManager.state.branch && (StateManager.state.revision == 'head'))
			return "branch";
		else if (StateManager.state.revision)
			return "revision";
		else
			return null;
	});

	StateManager.setClearStateVars("revision", ["revision"]);
	StateManager.setClearStateVars("branch", ["branch"]);
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
.factory('RevisionData', ['$http', '$q', 'serverConfig', 'StateManager', 'Branches', 'CurrentBranch', 'CurrentRevision', function($http, $q, serverConfig, StateManager, Branches, CurrentBranch, CurrentRevision){
	var o = {
		CurrentBranch:		CurrentBranch,
		CurrentRevision:	CurrentRevision,
	};

	o.genStateName = function () {
		if (StateManager.state.branch && (StateManager.state.revision == 'head'))
			return "branch";
		else if (StateManager.state.revision)
			return "revision";
		else
			return null;
	}

	o.refresh = function() {
		var self = this;

		return $q.all([
			self.CurrentBranch.refresh(),
			self.CurrentRevision.refresh()
		]);
	}

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
                height: "="
            },
            controller: TreeCtrl,
            controllerAs: "vm",
            bindToController: true
        };
    }

    TreeCtrl.$inject = ["$scope", "$timeout", "$filter", "TreeService", "ViewerService"];

    function TreeCtrl($scope, $timeout, $filter, TreeService, ViewerService) {
        var vm = this,
            promise = null,
            item = {},
            i = 0,
            length = 0;
        vm.nodes = [];
        vm.showTree = false;
        vm.showFilterList = true;
        vm.currentFilterItemSelected = null;
        vm.viewerSelectedObject = null;

        promise = TreeService.init();
        promise.then(function(data) {
            vm.showChildren = true;
            vm.allNodes = [];
            vm.allNodes.push(data.nodes);
            vm.nodes = vm.allNodes;
            vm.showTree = true;
            vm.idToName = data.idToName;
        });

        $scope.$watch("vm.filterText", function (newValue) {
            if (angular.isDefined(newValue)) {
                if (newValue === "") {
                    vm.showTree = true;
                    vm.showFilterList = false;
                    vm.showChildren = true;
                    vm.nodes = vm.allNodes;
                }
                else {
                    vm.showTree = false;
                    vm.showFilterList = true;
                    vm.showChildren = true;

                    if (vm.filterText.indexOf("###") === 0)
                    {
                        vm.showChildren = false;

                        $timeout(angular.noop, 300).then(angular.bind(this, function() {
                            vm.nodes = [{}];
                            vm.nodes[0]._id = vm.origID;
                            vm.nodes[0].name = vm.objectName;
                            vm.nodes[0].index = 0;
                            vm.nodes[0].toggleState = true;
                            vm.nodes[0].class = "unselectedFilterItem";

                            setupInfiniteItems();
                        }));

                    } else {
                        promise = TreeService.search(newValue);
                        promise.then(function(json) {
                            vm.showChildren = false;
                            vm.nodes = json.data;
                            // If an object has been selected in the viewer to prompt this filter, only show the node
                            // with the exact name of the selected object (this needs rethinking as showing the selected
                            // object shouldn't trigger the filter)
                            if (vm.viewerSelectedObject !== null) {
                                for (i = (vm.nodes.length - 1); i >= 0; i -= 1) {
                                    if (vm.nodes[i].name !== vm.viewerSelectedObject.name) {
                                        vm.nodes.splice(i, 1);
                                    }
                                }
                            }
                            for (i = 0, length = vm.nodes.length; i < length; i += 1) {
                                vm.nodes[i].index = i;
                                vm.nodes[i].toggleState = true;
                                vm.nodes[i].class = "unselectedFilterItem";
                            }
                            setupInfiniteItems();
                        });
                    }
                }
            }
        });

        vm.nodeSelected = function (nodeId) {
            vm.selectedNode = nodeId;
            TreeService.selectNode(nodeId);
        };

        vm.nodeToggled = function (nodeId, state) {
            vm.toggledNode = nodeId;
            TreeService.toggleNode(nodeId, state);
        };

        vm.filterItemSelected = function (item) {
            if (vm.currentFilterItemSelected === null) {
                vm.nodes[item.index].class = "selectedFilterItem";
                vm.currentFilterItemSelected = item;
            }
            else if (item.index === vm.currentFilterItemSelected.index) {
                vm.nodes[item.index].class = "unselectedFilterItem";
                vm.currentFilterItemSelected = null;
            }
            else {
                vm.nodes[vm.currentFilterItemSelected.index].class = "unselectedFilterItem";
                vm.nodes[item.index].class = "selectedFilterItem";
                vm.currentFilterItemSelected = item;
            }
            TreeService.selectNode(vm.nodes[item.index]._id);
        };

        vm.filterItemToggled = function (item) {
            TreeService.toggleNode(item._id);
        };

        function setupInfiniteItems () {
            vm.infiniteItems = {
                numLoaded_: 0,
                toLoad_: 0,
                getItemAtIndex: function(index) {
                    if (index > this.numLoaded_) {
                        this.fetchMoreItems_(index);
                        return null;
                    }

                    if (index < vm.nodes.length) {
                        return vm.nodes[index];
                    }
                    else {
                        return null;
                    }
                },
                getLength: function() {
                    return this.numLoaded_ + 5;
                },
                fetchMoreItems_: function(index) {
                    if (this.toLoad_ < index) {
                        this.toLoad_ += 20;
                        $timeout(angular.noop, 300).then(angular.bind(this, function() {
                            this.numLoaded_ = this.toLoad_;
                        }));
                    }
                }
            };
        }

        $(document).on("objectSelected", function(event, object, zoom) {
            $timeout(function () {
                if (angular.isUndefined(object)) {
                    vm.viewerSelectedObject = null;
                    vm.filterText = "";
                } else {
                    var objectID = null;
                    var idParts  = null;

                    if (object["multipart"])
                    {
                        idParts = object.id.split("__");
                    } else {
                        idParts = object.getAttribute("id").split("__");
                    }

                    objectID = idParts[idParts.length - 1];

                    if (objectID === vm.idToName[objectID])
                    {
                        vm.filterText = "###" + vm.idToName[objectID];

                        vm.objectName    = objectID;
                        vm.origID        = "###" + object.id;
                    } else {
                        vm.filterText    = vm.idToName[objectID];
                    }
                }
            });
        });

        $(document).on("partSelected", function(event, part, zoom) {
            $scope.IssuesService.mapPromise.then(function () {
                vm.viewerSelectedObject = $filter('filter')(vm.idToName, {_id: $scope.IssuesService.IDMap[part.partID]})[0];
                vm.filterText = vm.viewSelectedObject;
            });
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

(function () {
    "use strict";

    angular.module("3drepo")
        .directive("treeNode", treeNode);

    function treeNode ($compile) {
        return {
            restrict: 'E',
            templateUrl: 'treeNode.html',
            link: link,
            scope: {
                node: "=",
                showChildren: "=",
                onNodeSelected: "&onNodeSelected",
                onNodeToggled: "&onNodeToggled",
                selectedNode: "=",
                toggledNode: "="
            },
            controller: TreeNodeCtrl,
            controllerAs: 'tn',
            bindToController: true
        };

        function link (scope, element) {
            if (angular.isArray(scope.tn.node.children)) {
                var node =
                    "<tree-nodes " +
                        "nodes='tn.node.children' " +
                        "show-children='tn.showChildren' " +
                        "ng-if='tn.expanded' " +
                        "on-node-selected='tn.onNodeSelected({nodeId: nodeId})' " +
                        "on-node-toggled='tn.onNodeToggled({nodeId: nodeId, state: state})' " +
                        "selected-node='tn.selectedNode' " +
                        "toggled-node='tn.toggledNode'>" +
                    "</tree-nodes>";
                $compile(node)(scope, function(cloned){
                    element.append(cloned);
                });
            }
        }
    }

    TreeNodeCtrl.$inject = ['$scope', "$filter"];

    function TreeNodeCtrl ($scope, $filter) {
        var tn = this;
        tn.expanded = false;
        tn.canExpand = false;
        tn.toggleState = true;
        tn.selected = false;
        tn.selectedClass = "tree-node-unselected";

        $scope.$watchGroup(["tn.node", "tn.showChildren"], function (newValues) {
            if (angular.isDefined(newValues[0]) && angular.isDefined(newValues[1])) {
                tn.canExpand = (newValues[0].children && (newValues[0].children.length > 0) && newValues[1]);
            }
        });

        $scope.$watch("tn.selectedNode", function (newValue) {
            if (angular.isDefined(newValue) && (newValue !== tn.node._id)) {
                tn.selectedClass = "tree-node-unselected";
                tn.selected = false;
            }
        });

        /*
        $scope.$watch("tn.toggledNode", function (newValue) {
            if (angular.isDefined(newValue) && (newValue !== tn.node._id)) {
                tn.toggleState = true;
            }
        });
        */

        tn.expand = function () {
            tn.expanded = !tn.expanded;
        };

        tn.nodeSelected = function (nodeId) {
            tn.selected = !tn.selected;
            tn.selectedClass = tn.selected ? "tree-node-selected" : "tree-node-unselected";
            tn.onNodeSelected({nodeId: nodeId});
        };

        tn.nodeToggled = function (nodeId, state) {
            tn.onNodeToggled({nodeId: nodeId, state: tn.toggleState});
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
        .directive("treeNodes", treeNodes);

    function treeNodes() {
        return {
            restrict: 'E',
            templateUrl: 'treeNodes.html',
            scope: {
                nodes: "=",
                showChildren: "=",
                onNodeSelected: "&onNodeSelected",
                onNodeToggled: "&onNodeToggled",
                selectedNode: "=",
                toggledNode: "=",
                filterText: "="
            },
            controller: TreeNodesCtrl,
            controllerAs: 'tns',
            bindToController: true
        };
    }

    TreeNodesCtrl.$inject = ["$scope", "$filter"];

    function TreeNodesCtrl ($scope, $filter) {
        var tns = this;
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

    angular.module('3drepo')
        .factory('TreeService', TreeService);

    TreeService.$inject = ["$http", "$q", "StateManager", "ViewerService", "serverConfig"];

    function TreeService($http, $q, StateManager, ViewerService, serverConfig) {
        var state = StateManager.state,
            currentSelectedNodeId = null;

        var init = function () {
            var deferred = $q.defer(),
                url = "/" + state.account + "/" + state.project + "/revision/" + state.branch + "/head/fulltree.json";

            $http.get(serverConfig.apiUrl(url))
                .then(function(json) {
                    deferred.resolve(json.data);
                });

            return deferred.promise;
        };

        var search = function (searchString) {
            var deferred = $q.defer(),
                url = "/" + state.account + "/" + state.project + "/revision/" + state.branch + "/head/" + searchString + "/searchtree.json";

            $http.get(serverConfig.apiUrl(url))
                .then(function(json) {
                    deferred.resolve(json);
                });

            return deferred.promise;
        };

        var selectNode = function (nodeId) {
            if (nodeId === currentSelectedNodeId) {
                currentSelectedNodeId = null;
                $(document).trigger("objectSelected", [undefined, true]);
            }
            else {
                var rootObj = document.getElementById("model__" + nodeId);
                currentSelectedNodeId = nodeId;
                $(document).trigger("objectSelected", [rootObj, true]);
            }
        };

        var toggleNode = function (nodeId, state) {
            if (nodeId.indexOf("###") === 0)
            {
                var actualID = nodeId.slice(3);

                var idParts = actualID.split("__");
                var mpnodes = $("multipart[id^=" + idParts[0] + "__" + idParts[1] + "]");
                var objectID = idParts[idParts.length - 1];

                for(var i = 0; i < mpnodes.length; i++)
                {
                    var parts = mpnodes[i].getParts([objectID]);

                    if (parts && parts.ids.length > 0)
                    {
                        parts.setVisibility(state);
                        ViewerService.defaultViewer.addHiddenPart(parts);
                    }
                }
            } else {
                var rootObj = document.getElementById("model__" + nodeId);
                rootObj.setAttribute("render", state.toString());
            }
        };

        return {
            init: init,
            search: search,
            selectNode: selectNode,
            toggleNode: toggleNode
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
.controller('MetaCtrl', ['$scope', 'MetaService', '$modal', function($scope, MetaService, $modal)
{
	$scope.MetaService = MetaService;
	$scope.pdf = {};

	$(document).on("objectSelected", function(event, object, zoom) {
		if (object)
			MetaService.getObjectMetaData(object);
	});

	$scope.openPDF = function(pdfURL) {
		$scope.pdfURL = pdfURL;

		var modalInstance = $modal.open({
			templateUrl: 'pdfviewer.html',
			controller: 'DialogCtrl',
			backdrop: false,
			size: 'lg',
			resolve: {
				params: function() {
					return {
						pdfURL: $scope.pdfURL
					};
				}
			}
		});
	}
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
.service('MetaService', ['StateManager', 'serverConfig', '$http', '$q', function(StateManager, serverConfig, $http, $q){
	var self			= this;

	self.rootElement		= null;
	self.metadocs			= {};
	self.loadingPromise		= null;
	self.loading			= false;
	self.currentLoadingID	= null;

	this.getObjectMetaData = function(object)
	{
		// TODO: Will break when the account is not same, as part
		// of a federation.
		var account = StateManager.state.account;

		var objectIDParts = object["id"].split("__");
		var numIDParts    = objectIDParts.length;

		var project = objectIDParts[numIDParts - 2];

		if (project == "model")
			project = StateManager.state.project;

		var uid = objectIDParts[numIDParts - 1];
		var baseUrl = serverConfig.apiUrl(account + '/' + project + '/meta/' + uid + '.json');

		if (!self.loading)
		{
			self.loading = true;
			self.currentLoadingID = uid;
			var deferred = $q.defer();

			self.loadingPromise = deferred.promise;

			self.metadocs = {};

			$http.get(baseUrl)
			.then(function(json) {
				var meta = json.data.meta;

				for(var i = 0; i < meta.length; i++)
				{
					var subtype = meta[i]["mime"] ? meta[i]["mime"] : "metadata";

					if (!self.metadocs[subtype])
						self.metadocs[subtype] = [];

					var baseUrl = serverConfig.apiUrl(account + '/' + project + '/' + meta[i]["_id"] + '.pdf');

					meta[i].url = baseUrl;

					self.metadocs[subtype].push(meta[i]);
				}

				self.loading = false;
				self.currentLoadingID = null;
				deferred.resolve();
			}, function(message) {
				self.loading = false;
				self.currentLoadingID = null;
				deferred.resolve();
			});
		} else {
			if (uid != self.currentLoadingID)
			{
				self.loadingPromise.then(function (res) {
					self.getObjectMetaData(object);
				});
			}
		}
	}
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

angular.module("3drepo")
.controller("IssuesCtrl", ["$scope", "$modal", "StateManager", "IssuesService", "$rootScope", "$http", "$q", "serverConfig", "ViewerService", function($scope, $modal, StateManager, IssuesService, $rootScope, $http, $q, serverConfig, ViewerService)
{
	"use strict";

	$scope.objectIsSelected = false;
	$scope.currentSelected  = null;
	$scope.mapPromise       = null;
	$scope.map              = {};

	$scope.IssuesService    = IssuesService;
	$scope.chat_updated     = $scope.IssuesService.updated;

	// Has to be a sub-object to tie in with Angular ng-model
	$scope.newComment       = {};
	$scope.newComment.text  = "";

	$scope.pickedPos        = null;
	$scope.pickedNorm       = null;

	$scope.selectedProject  = null;
	$scope.selectedAccount  = null;

	$scope.expanded         = $scope.IssuesService.expanded;

	$scope.StateManager     = StateManager;

	$(document).on("objectSelected", function(event, object, zoom) {
		$scope.objectIsSelected = !(object === undefined);

		if (object !== undefined) {
			if (!object.hasOwnProperty("multipart")) {
				var idParts = object.getAttribute("id").split("__");
				var objID = idParts[idParts.length - 1];

				$scope.selectedID  		= objID;
			}
		} else {
			$scope.selectedID = undefined;
		}
	});

	$(document).on("partSelected", function(event, part, zoom) {
		$scope.objectIsSelected = !(part === undefined);

		$scope.IssuesService.mapPromise.then(function () {
			$scope.selectedID       = part.partID;
		});
	});

	$scope.openIssue = function(issue)
	{
		// Tell the chat server that we want updates
		$scope.IssuesService.getIssue(issue["account"], issue["project"], issue["_id"]);
		$scope.newComment.text = "";

		var newPos = issue["viewpoint"]["position"];
		var newViewDir = issue["viewpoint"]["view_dir"];
		var newUpDir = issue["viewpoint"]["up"];

		ViewerService.defaultViewer.setCamera(newPos, newViewDir, newUpDir);

		if (issue["viewpoint"]["clippingPlanes"]) {
			if (issue["viewpoint"]["clippingPlanes"].length) {
				ViewerService.defaultViewer.setClippingPlanes(issue["viewpoint"]["clippingPlanes"]);
			} else {
				ViewerService.defaultViewer.clearClippingPlanes();
			}
		}

		if (!$scope.expanded[issue["_id"]]) {
			$(document).trigger("pinClick", { changeView : true, object: $("#" + issue["_id"])[0] });
		} else {
			$(document).trigger("pinClick", { changeView : true, object: null } );
		}
	}

	$scope.addNewComment = function(issue)
	{
		$scope.IssuesService.postComment(issue["account"], issue["project"], issue["_id"], issue["parent"], $scope.newComment.text).then(function () {
			setTimeout(function() {
				$scope.$apply();
			},0);
		});

		$scope.newComment.text = "";
	};

	$scope.complete = function(issue)
	{
		var issueObject = {
			_id: issue.id,
			complete: true
		};

		$scope.postComment(issueObject);
	};

	$scope.drawPin = function()
	{
		if ($scope.currentSelected) {
			$scope.IssuesService.drawPin($scope.pickedPos, $scope.pickedNorm, $scope.currentSelected._xmlNode);
		}
	};

	$scope.newIssue = function()
	{
		if ($scope.selectedID)
		{
			var modalInstance = $modal.open({
				templateUrl: "newissuemodal.html",
				controller: "DialogCtrl",
				backdrop: false,
				resolve: {
					params: {
						name: "",
						pickedObj: $scope.pickedObj
					}
				}
			});

			modalInstance.result.then(function (params) {
				var account = StateManager.state.account;
				var project = StateManager.state.project;

				if ( $scope.selectedAccount )
				{
					account = $scope.selectedAccount;
				}

				if ( $scope.selectedProject )
				{
					project = $scope.selectedProject;
				}

				var id 	    = $scope.selectedID;
				var position = $scope.pickedPos;

				// For a normal, transpose is the inverse of the inverse transpose :)
				var norm = $scope.pickedNorm;

				$scope.IssuesService.newIssue(account, project, params.name, id, position, norm);
			}, function () {
				// TODO: Error here
			});
		}
	};

	$scope.$watchGroup(["StateManager.state.branch", "StateManager.state.revision"], function () {
		var account		= StateManager.state.account;
		var project		= StateManager.state.project;

		if (account !== undefined && project !== undefined) {
			return $scope.IssuesService.getIssueStubs();
		} else {
			return(Promise.resolve("Undefined Account and Project"));
		}
	});
}])
.directive("simpleDraggable", ["ViewerService", function (ViewerService) {
	return {
		restrict: "A",
		link: function link(scope, element, attrs) {
			angular.element(element).attr("draggable", "true");

			/*
			element.bind("dragstart", function (event) {
				scope.viewArea = ViewerService.defaultViewer.getViewArea();
				scope.scene    = scope.viewArea._scene;
				scope.ctx      = scope.scene._nameSpace.doc.ctx;

				var gl = scope.ctx.ctx3d;
				var mat_view      = scope.viewArea._last_mat_view;
				var mat_scene     = scope.viewArea._last_mat_scene;

				scope.ps = scope.scene._webgl.pickScale;

				// Already scale by pickScale
				scope.sceneWidth  = scope.scene._webgl.fboPick.width;
				scope.sceneHeight = scope.scene._webgl.fboPick.height;

				// remember correct scene bbox
				var min = x3dom.fields.SFVec3f.copy(scope.scene._lastMin);
				var max = x3dom.fields.SFVec3f.copy(scope.scene._lastMax);
				// get current camera position
				var from = mat_view.inverse().e3();

				// get bbox of scene bbox and camera position
				var _min = x3dom.fields.SFVec3f.copy(from);
				var _max = x3dom.fields.SFVec3f.copy(from);

				if (_min.x > min.x) { _min.x = min.x; }
				if (_min.y > min.y) { _min.y = min.y; }
				if (_min.z > min.z) { _min.z = min.z; }

				if (_max.x < max.x) { _max.x = max.x; }
				if (_max.y < max.y) { _max.y = max.y; }
				if (_max.z < max.z) { _max.z = max.z; }

				// temporarily set scene size to include camera
				scope.scene._lastMin.setValues(_min);
				scope.scene._lastMax.setValues(_max);

				// get scalar scene size and adapted projection matrix
				scope.sceneSize = scope.scene._lastMax.subtract(scope.scene._lastMin).length();
				scope.cctowc = scope.viewArea.getCCtoWCMatrix();

				// restore correct scene bbox
				scope.scene._lastMin.setValues(min);
				scope.scene._lastMax.setValues(max);

				//scope.ctx.renderPickingPass(gl, scope.scene, mat_view, mat_scene, from, scope.sceneSize, 0, 0, 0, scope.sceneWidth, scope.sceneHeight);

				var t = scope.ctx.pickRect(scope.viewArea, 0, 0, scope.sceneWidth / scope.ps, scope.sceneHeight / scope.ps);

				console.log(mat_view);
				console.log(mat_scene);

				scope.pixelData = scope.scene._webgl.fboPick.pixelData.slice(0);
			}),

			element.bind("drag", function (event) {
				var dragEndX = event.clientX;
				var dragEndY = event.clientY;

				//console.log("DX: " + dragEndX + " DY: " + dragEndY);

	            var pickPos = new x3dom.fields.SFVec3f(0, 0, 0);
		        var pickNorm = new x3dom.fields.SFVec3f(0, 0, 1);

				var index = 0;
				var pixelOffset = 1.0 / scope.scene._webgl.pickScale;
				var denom = 1.0 / 256.0;
				var dist, line, lineoff, right, up;

				var pixelIndex = (dragEndY * scope.sceneWidth + dragEndX) * scope.ps;
				var rightPixel = pixelIndex + 1;
				var topPixel   = pixelIndex + scope.sceneWidth;

				var pixelData      = scope.pixelData.slice(pixelIndex * 4, (pixelIndex + 1) * 4);
				var rightPixelData = scope.pixelData.slice(rightPixel * 4, (rightPixel + 1) * 4);
				var topPixelData   = scope.pixelData.slice(topPixel * 4, (topPixel + 1) * 4);

				//console.log(pixelData.toString());
				//console.log(rightPixelData.toString());
				//console.log(topPixelData.toString());

				var objId = pixelData[index + 3] + 256 * pixelData[index + 2];

				dist = (pixelData[index    ] / 255.0) * denom +
				       (pixelData[index + 1] / 255.0);

				line = scope.viewArea.calcViewRay(dragEndX, dragEndY, scope.cctowc);

				console.log("DIST: " + dist + " LINE: " + line);

				pickPos = line.pos.add(line.dir.multiply(dist * scope.sceneSize));

				// get right pixel
				dist = (rightPixelData[index    ] / 255.0) * denom +
				       (rightPixelData[index + 1] / 255.0);

				lineoff = scope.viewArea.calcViewRay(dragEndX + pixelOffset, dragEndY, scope.cctowc);

				right = lineoff.pos.add(lineoff.dir.multiply(dist * scope.sceneSize));
				right = right.subtract(pickPos).normalize();

				// get top pixel
				dist = (topPixelData[index    ] / 255.0) * denom +
				       (topPixelData[index + 1] / 255.0);

				lineoff = scope.viewArea.calcViewRay(dragEndX, dragEndY - pixelOffset, scope.ctowc);

				up = lineoff.pos.add(lineoff.dir.multiply(dist * scope.sceneSize));
				up = up.subtract(pickPos).normalize();

				pickNorm = right.cross(up).normalize();
				var pickObj = x3dom.nodeTypes.Shape.idMap.nodeID[objId];

				console.log("PN: " + pickNorm.toGL());
				console.log("PP: " + pickPos.toGL());

				scope.currentSelected = pickObj;
				scope.pickedPos       = pickPos;
				scope.pickedNorm      = pickNorm;

				scope.drawPin();
			}),
			*/

			element.bind("dragend", function (event) {
				// For some reason event.clientX is offset by the
				// width of other screens for a multi-screen set-up.
				// This only affects the dragend event.
				var dragEndX = event.clientX - screen.availLeft;
				var dragEndY = event.clientY - screen.availTop;

				var pickObj = ViewerService.pickPoint(dragEndX, dragEndY);

				if (!pickObj.partID) {
					var idParts = pickObj.pickObj._xmlNode.getAttribute("id").split("__");
					var objID = idParts[idParts.length - 1];

					scope.selectedID 		= objID;

					trans = $("#model__root")[0]._x3domNode.getCurrentTransform();
				} else {
					var projectParts = pickObj.part.multiPart._xmlNode.id.split("__");
					var trans = null;

					if (projectParts[0] === "model")
					{
						scope.selectedAccount   = scope.StateManager.state.account;
						scope.selectedProject   = scope.StateManager.state.project;
						trans = $("#model__root")[0]._x3domNode.getCurrentTransform();
					} else {
						scope.selectedAccount   = projectParts[0];
						scope.selectedProject   = projectParts[1];
						trans = $("#" + scope.selectedAccount + "__" + scope.selectedProject + "__root")[0]._x3domNode.getCurrentTransform();
					}

					scope.selectedID        = pickObj.partID;
				}

				scope.pickedPos       	= trans.inverse().multMatrixVec(pickObj.pickPos);
				scope.pickedNorm      	= trans.transpose().multMatrixVec(pickObj.pickNorm);

				scope.newIssue();
			});
		}
	};
}]);
/*
.directive("floating", ["ViewerService", function (ViewerService) {
	return {
		restrict: "AE",
		scope: true,
		link: function link(scope, elem, attrs) {
			scope.viewerWidth = $(ViewerService.defaultViewer.viewer).width();
			scope.viewerHeight = $(ViewerService.defaultViewer.viewer).height();
			scope.halfWidth = scope.viewerWidth / 2;

			scope.pinPosition = attrs["position"].split(",").map(function(item) { return parseFloat(item); });
			scope.divWidth  = $(elem).width();
			scope.divHeight = $(elem).height();

			scope.element = elem[0];

			ViewerService.ready.then(function () {
				ViewerService.defaultViewer.onViewpointChanged(
					function (origEvent, event) {
						var pinPosition2D = ViewerService.defaultViewer.runtime.calcPagePos(scope.pinPosition[0], scope.pinPosition[1], scope.pinPosition[2]);
						var leftCoord = (pinPosition2D[0] - (scope.divWidth / 2));

						scope.element.style.left = leftCoord + "px";
						scope.element.style.top  = (pinPosition2D[1] - (scope.divHeight / 2)) + "px";
					}
				);

				ViewerService.defaultViewer.onMouseDown( function () {
					scope.element.style["pointer-events"] = "none";
				});

				ViewerService.defaultViewer.onMouseUp( function () {
					scope.element.style["pointer-events"] = "auto";
				});
			});
		}
	};
}]);
*/


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
        .directive("issue", issue);

    function issue() {
        return {
            restrict: "EA",
            templateUrl: "issue.html",
            scope: {
                data: "=",
                onCommentsToggled: "&",
                commentsToggledIssueId: "=",
                onCloseIssue : "&",
                issueClosed: "="
            },
            controller: IssueCtrl,
            controllerAs: "vm",
            bindToController: true
        };
    }

    IssueCtrl.$inject = ["$scope", "$timeout", "NewIssuesService", "ViewerService"];

    function IssueCtrl($scope, $timeout, NewIssuesService, ViewerService) {
        var vm = this,
            i = 0,
            length = 0,
            promise = null;

        vm.showComments = false;
        vm.numNewComments = 0;
        vm.saveCommentDisabled = true;
        vm.backgroundClass = "issueClosedBackground";
        vm.autoSaveComment = false;
        vm.showInfo        = false;
        vm.editingComment  = false;

        NewIssuesService.fixPin({
            id: vm.data._id,
            account: vm.data.account,
            project: vm.data.project,
            position: vm.data.position,
            norm: vm.data.norm
        });

        $scope.$watch("vm.commentsToggledIssueId", function (newValue) {
            // If the comments is toggled on another comment, then close this one.
            if (angular.isDefined(newValue)) {
                if (newValue !== vm.data._id) {
                    vm.showComments = false;

                    // If we are editing the comment, then clear it.
                    if (vm.editingComment) {
                        vm.comment = "";
                    } else {
                        // Auto-save a comment
                        if (angular.isDefined(vm.comment) && (vm.comment !== "")) {
                            vm.autoSaveComment = true;
                            vm.saveComment();
                        }
                    }
                } else {
                    vm.showComments = !vm.showComments;

                    if (vm.showComments) 
                    {
                        var pinGroup = $("#" + vm.data._id)[0].getElementsByTagName("group");
                        $(document).trigger("pinClick", { object: pinGroup[0] } );

                        // Set the camera position
                        ViewerService.defaultViewer.setCamera(
                            vm.data.viewpoint.position,
                            vm.data.viewpoint.view_dir,
                            vm.data.viewpoint.up
                        );
                    }
                }
            }
        });

        $scope.$watch("vm.comment", function (newValue) {
            if (angular.isDefined(newValue)) {
                vm.saveCommentDisabled = (newValue === "");
            }
        });

        $scope.$watch("vm.data", function (newValue) {
            if (angular.isDefined(newValue)) {
                vm.backgroundClass = newValue.hasOwnProperty("closed") ? "issueClosedBackground" : "issueOpenBackground";
                vm.issueIsOpen = !newValue.hasOwnProperty("closed");
                if (vm.issueIsOpen && newValue.hasOwnProperty("comments")) {
                    for (i = 0, length = newValue.comments.length; i < length; i += 1) {
                        newValue.comments[i].canDelete =
                            (i === (newValue.comments.length - 1)) && (!newValue.comments[i].set);
                    }
                }
            }
        }, true);

        vm.toggleComments = function () {
            vm.onCommentsToggled({issueId: vm.data._id});
        };

        vm.saveComment = function () {
            if (angular.isDefined(vm.comment) && (vm.comment !== "")) {
                if (vm.editingComment) {
                    promise = NewIssuesService.editComment(vm.data, vm.comment, vm.editingCommentIndex);
                    promise.then(function (data) {
                        vm.data.comments[vm.editingCommentIndex].comment = vm.comment;
                        vm.data.comments[vm.editingCommentIndex].timeStamp = NewIssuesService.prettyTime(data.created);
                        vm.comment = "";
                    });
                }
                else {
                    promise = NewIssuesService.saveComment(vm.data, vm.comment);
                    promise.then(function (data) {
                        if (!vm.data.hasOwnProperty("comments")) {
                            vm.data.comments = [];
                        }
                        vm.data.comments.push({
                            owner: data.owner,
                            comment: vm.comment,
                            created: data.created,
                            timeStamp: NewIssuesService.prettyTime(data.created)
                        });
                        vm.comment = "";
                        vm.numNewComments += 1; // This is used to increase the height of the comments list

                        if (vm.autoSaveComment) {
                            vm.autoSaveComment = false;
                            vm.showInfo = true;
                            vm.infoText = "Comment on issue #" + vm.data.number + " auto-saved";
                            vm.infoTimeout = $timeout(function () {
                                vm.showInfo = false;
                            }, 4000);
                        }

                        // Mark previous comment as 'set' - no longer deletable or editable
                        if (vm.data.comments.length > 1) {
                            promise = NewIssuesService.setComment(vm.data, (vm.data.comments.length - 2));
                            promise.then(function (data) {
                                vm.data.comments[vm.data.comments.length - 2].set = true;
                            });
                        }
                    });
                }
            }
        };

        vm.deleteComment = function (index) {
            promise = NewIssuesService.deleteComment(vm.data, index);
            promise.then(function (data) {
                vm.data.comments.splice(index, 1);
                vm.numNewComments -= 1; // This is used to reduce the height of the comments list
                vm.comment = "";
                vm.editingComment = false;
            });
        };

        vm.toggleEditComment = function (index) {
            vm.editingComment = !vm.editingComment;
            vm.editingCommentIndex = index;
            if (vm.editingComment) {
                vm.comment = vm.data.comments[vm.data.comments.length - 1].comment;
            }
            else {
                vm.comment = "";
            }
        };

        vm.closeIssue = function () {
            vm.onCloseIssue({issue: vm.data});
        };

        vm.hideInfo = function () {
            vm.showInfo = false;
            $timeout.cancel(vm.infoTimeout);
        };
    }

    angular.module("3drepo")
        .animation(".issueComments", issueComments);

    function issueComments () {
        var height;
        return {
            addClass: function (element, className, done) {
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
            removeClass: function (element, className, done) {
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

        function link (scope, element, attrs) {
            var commentHeight = 75,
                height = "0";
            scope.$watch("numNewComments", function (newValue, oldValue) {
                if (angular.isDefined(newValue)) {
                    if (newValue > oldValue) {
                        height = (element[0].offsetHeight + commentHeight).toString();
                    }
                    else if (newValue < oldValue) {
                        height = (element[0].offsetHeight - commentHeight).toString();
                    }
                    element.css("height", height + "px");
                }
            });
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

(function () {
    "use strict";

    angular.module("3drepo")
        .directive("issues", issues);

    function issues() {
        return {
            restrict: 'EA',
            templateUrl: 'issues.html',
            scope: {
                filterText: "=",
                height: "=",
                showAdd: "=",
                options: "=",
                selectedOption: "="
            },
            controller: IssuesCtrl,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    IssuesCtrl.$inject = ["$scope", "$rootScope", "$element", "$timeout", "$mdDialog", "$filter", "EventService", "NewIssuesService", "ViewerService"];

    function IssuesCtrl($scope, $rootScope, $element, $timeout, $mdDialog, $filter, EventService, NewIssuesService, ViewerService) {
        var vm = this,
            promise = null,
            i = 0,
            j = 0,
            length = 0,
            sortedIssuesLength,
            sortOldestFirst = true,
            showClosed = false;

        vm.pickedAccount = null;
        vm.pickedProject = null;
        vm.pickedPos = null;
        vm.pickedNorm = null;
        vm.pickedTrans = null;
        vm.selectedObjectId = null;
        vm.globalClickWatch = null;
        vm.saveIssueDisabled = true;
        vm.issues = [];

        promise = NewIssuesService.getIssues();
        promise.then(function (data) {
            vm.issues = data;
            setupIssuesToShow();
        });

        $scope.$watch("vm.showAdd", function (newValue) {
            if (newValue) {
                setupGlobalClickWatch();
            }
            else {
                cancelGlobalClickWatch();
                NewIssuesService.removePin();
            }
        });

        $scope.$watch("vm.title", function (newValue) {
            if (angular.isDefined(newValue)) {
                vm.saveIssueDisabled = (newValue === "");
            }
        });

        function setupIssuesToShow () {
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

                    // Filter
                    if (vm.filterText !== "") {
                        vm.issuesToShow = ($filter('filter')(vm.issuesToShow, {name: vm.filterText}));
                    }

                    // Closed
                    for (i = (vm.issuesToShow.length - 1); i >= 0; i -= 1) {
                        var pin = angular.element(document.getElementById(vm.issuesToShow[i]._id));
                        if (pin.length > 0) {
                            pin[0].setAttribute("render", "true");
                            if (!showClosed && vm.issuesToShow[i].hasOwnProperty("closed")) {
                                pin[0].setAttribute("render", "false");
                                vm.issuesToShow.splice(i, 1);
                            }
                        }
                    }
                }
            }
        }

        $scope.$watch("vm.selectedOption", function (newValue) {
            if (angular.isDefined(newValue)) {
                if (newValue.value === "sortByDate") {
                    sortOldestFirst = !sortOldestFirst;
                }
                else if (newValue.value === "showClosed") {
                    showClosed = !showClosed;
                }
                setupIssuesToShow();
            }
        });

        $scope.$watch("vm.filterText", function (newValue) {
            if (angular.isDefined(newValue)) {
                setupIssuesToShow();
            }
        });

        vm.commentsToggled = function (issueId) {
            vm.commentsToggledIssueId = issueId;
        };

        vm.saveIssue = function () {
            if (angular.isDefined(vm.title) && (vm.title !== "")) {
                if (vm.pickedPos === null) {
                    vm.showAlert();
                }
                else {
                    promise = NewIssuesService.saveIssue(vm.pickedAccount, vm.pickedProject, vm.title, vm.selectedObjectId, vm.pickedPos, vm.pickedNorm);
                    promise.then(function (data) {
                        vm.issues.push(data);
                        vm.title = "";
                        vm.pickedAccount = null;
                        vm.pickedProject = null;
                        vm.pickedTrans   = null;
                        vm.pickedPos = null;
                        vm.pickedNorm = null;
                        if (angular.isDefined(vm.comment) && (vm.comment !== "")) {
                            vm.saveCommentWithIssue(data, vm.comment);
                            vm.comment = "";
                        }

                        setupIssuesToShow();
                    });
                }
            }
        };

        vm.closeIssue = function (issue) {
            promise = NewIssuesService.closeIssue(issue);
            promise.then(function (data) {
                for (i = 0, length = vm.issues.length; i < length; i += 1) {
                    if (issue._id === vm.issues[i]._id) {
                        vm.issues[i].closed = data.closed;
                        vm.issues[i].closed_time = data.created; // TODO: Shouldn't really use the created value
                        break;
                    }
                }
                setupIssuesToShow();
            });
        };

        vm.saveCommentWithIssue = function (issue, comment) {
            promise = NewIssuesService.saveComment(issue, comment);
            promise.then(function (data) {
                vm.issues[vm.issues.length - 1].comments = [
                    {
                        owner: data.owner,
                        comment: comment,
                        timeStamp: NewIssuesService.prettyTime(data.created)
                    }
                ];
            });
        };

        function setupGlobalClickWatch () {
            if (vm.globalClickWatch === null) {
                vm.globalClickWatch = $scope.$watch(EventService.currentEvent, function (event, oldEvent) {
                    if ((event.type === EventService.EVENT.GLOBAL_CLICK) &&
                        (event.value.target.className === "x3dom-canvas") &&
                        (!((event.value.clientX === oldEvent.value.clientX) &&
                           (event.value.clientY === oldEvent.value.clientY)))) {

                        var dragEndX = event.value.clientX;
                        var dragEndY = event.value.clientY;
                        var pickObj = ViewerService.pickPoint(dragEndX, dragEndY);

                        if (pickObj.pickObj !== null) {
                            vm.showInput = true;
                            vm.selectedObjectId = pickObj.partID ? pickObj.partID : pickObj.pickObj._xmlNode.getAttribute("DEF");

                            var projectParts = pickObj.pickObj._xmlNode.getAttribute("id").split("__");

                            if (projectParts[0] === "model")
                            {
                                vm.pickedAccount = NewIssuesService.state.account;
                                vm.pickedProject = NewIssuesService.state.project;
                                vm.pickedTrans   = $("#model__root")[0]._x3domNode.getCurrentTransform();
                            } else {
                                vm.pickedAccount = projectParts[0];
                                vm.pickedProject = projectParts[1];
                                vm.pickedTrans   = $("#" + vm.pickedAccount + "__" + vm.pickedProject + "__root")[0]._x3domNode.getCurrentTransform();
                            }

                            vm.pickedNorm = vm.pickedTrans.transpose().multMatrixVec(pickObj.pickNorm);
                            vm.pickedPos = vm.pickedTrans.inverse().multMatrixVec(pickObj.pickPos);

                            NewIssuesService.addPin({
                                id: undefined,
                                account: vm.pickedAccount,
                                project: vm.pickedProject,
                                position: vm.pickedPos.toGL(),
                                norm: vm.pickedNorm.toGL()
                            });
                        }
                        else {
                            NewIssuesService.removePin();
                        }
                    }
                });
            }
        }

        function cancelGlobalClickWatch () {
            if (typeof vm.globalClickWatch === "function") {
                vm.globalClickWatch();
                vm.globalClickWatch = null;
            }
        }

        /*
        $(document).on("objectSelected", function(event, object, zoom) {
            if (angular.isUndefined(object)) {
                vm.selectedObjectId = null;
                vm.pickedPos = null;
                vm.pickedNorm = null;
                NewIssuesService.removePin();
            }
            else {
                if (object["multipart"])
                {
                    var projectParts = object.id.split("__");

                    if (projectParts[0] === "model")
                    {
                        vm.pickedAccount = NewIssuesService.state.account;
                        vm.pickedProject = NewIssuesService.state.project;
                        vm.pickedTrans   = $("#model__root")[0]._x3domNode.getCurrentTransform();
                    } else {
                        vm.pickedAccount = projectParts[0];
                        vm.pickedProject = projectParts[1];
                        vm.pickedTrans   = $("#" + vm.pickedAccount + "__" + vm.pickedProject + "__root")[0]._x3domNode.getCurrentTransform();
                    }

                    vm.selectedObjectId = projectParts[projectParts.length - 1];
                } else {
                    vm.selectedObjectId = object.getAttribute("DEF");
                }
            }
        });
        */

        $(document).on("partSelected", function(event, part, zoom) {
            $scope.IssuesService.mapPromise.then(function () {
                var projectParts = part.part.multiPart._xmlNode.id.split("__");

                if (projectParts[0] === "model")
                {
                    vm.pickedAccount = $scope.IssuesService.state.account;
                    vm.pickedProject = $scope.IssuesService.state.project;
                    vm.pickedTrans   = $("#model__root")[0]._x3domNode.getCurrentTransform();
                } else {
                    vm.pickedAccount = projectParts[0];
                    vm.pickedProject = projectParts[1];
                    vm.pickedTrans   = $("#" + scope.pickedAccount + "__" + scope.pickedProject + "__root")[0]._x3domNode.getCurrentTransform();
                }

                vm.selectedObjectId = projectParts[projectParts.length - 1];
            });
        });

        /*
         * When a pin is clicked that make sure the issue sidebar
         * also reflects the updated state
         * @listens pinClick
         * @param {event} event - Originating event
         * @param {object} clickInfo - Contains object and information about the source of the click
         */
        $(document).on("pinClick", function (event, clickInfo) {
            // If there has been a pin selected then switch
            // that issue
            var issueId = clickInfo.object ? clickInfo.object.parentElement.parentElement.getAttribute("id") : null;


            vm.commentsToggled(issueId);

            $timeout(function() {
                $rootScope.$apply()
            });
        });

        vm.showAlert = function() {
            $mdDialog.show(
                $mdDialog.alert()
                    .parent(angular.element($element[0].querySelector("#issuesAddContainer")))
                    .clickOutsideToClose(true)
                    .title("Add a pin before saving")
                    .ariaLabel("Pin alert")
                    .ok("OK")
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

(function () {
    "use strict";

    angular.module('3drepo')
        .factory('NewIssuesService', NewIssuesService);

    NewIssuesService.$inject = ["$http", "$q", "StateManager", "serverConfig", "ViewerService"];

    function NewIssuesService($http, $q, StateManager, serverConfig, ViewerService) {
        var state = StateManager.state,
            url = "",
            data = {},
            config = {},
            i, j = 0,
            numIssues = 0,
            numComments = 0,
            pinCoverage = 15.0,
            pinRadius = 0.25,
            pinHeight = 1.0;

        var prettyTime = function(time) {
            var date = new Date(time);
            return (
                date.getFullYear() + "-" +
                (date.getMonth() + 1) + "-" +
                date.getDate()
            );
        };

        var getIssues = function () {
            var deferred = $q.defer();
            url = serverConfig.apiUrl(state.account + '/' + state.project + '/issues.json');

            $http.get(url)
                .then(function(data) {
                    deferred.resolve(data.data);
                    // Convert created field to displayable time stamp
                    // Issue
                    for (i = 0, numIssues = data.data.length; i < numIssues; i += 1) {
                        data.data[i].timeStamp = prettyTime(data.data[i].created);
                        // Comments
                        if (data.data[i].hasOwnProperty("comments")) {
                            for (j = 0, numComments = data.data[i].comments.length; j < numComments; j += 1) {
                                if (data.data[i].comments[j].hasOwnProperty("created")) {
                                    data.data[i].comments[j].timeStamp = prettyTime(data.data[i].comments[j].created);
                                }
                            }
                        }
                    }
                });

            return deferred.promise;
        };

        var saveIssue = function (account, project, name, objectId, pickedPos, pickedNorm) {
            var currentVP = ViewerService.defaultViewer.getCurrentViewpointInfo(),
                dataToSend = {},
                deferred = $q.defer();

            url = serverConfig.apiUrl(account + "/" + project + "/issues/" + objectId);

            data = {
                name: name,
                viewpoint: ViewerService.defaultViewer.getCurrentViewpointInfo(),
                scale: 1.0
            };
            config = {
                withCredentials: true
            };

            if (pickedPos !== null) {
                data.position = pickedPos.toGL();
                data.norm = pickedNorm.toGL();
            }

            dataToSend = {data: JSON.stringify(data)};

            $http.post(url, dataToSend, config)
                .then(function successCallback(response) {
                    console.log(response);
                    response.data.issue._id     = response.data.issue_id;
                    response.data.issue.account = account;
                    response.data.issue.project = project;
                    response.data.issue.timeStamp = prettyTime(response.data.issue.created);

                    removePin();

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
            $http.post(url, {data: JSON.stringify(data)}, config)
                .then(function (response) {
                    deferred.resolve(response.data);
                });
            return deferred.promise;
        }

        var closeIssue = function (issue) {
            return doPost(issue, {closed: true, number: issue.number});
        };

        function doPost(issue, data) {
            var deferred = $q.defer();
            url = serverConfig.apiUrl(issue.account + "/" + issue.project + "/issues/" + issue.parent);
            config = {
                withCredentials: true
            };
            data._id = issue._id;
            $http.post(url, {data: JSON.stringify(data)}, config)
                .then(function (response) {
                    deferred.resolve(response.data);
                });
            return deferred.promise;
        }

        var closeIssue = function (issue) {
            return doPost(issue, {closed: true, number: issue.number});
        };

        var saveComment = function (issue, comment) {
            return doPost(issue, {comment: comment, number: issue.number});
        };

        var editComment = function (issue, comment, commentIndex) {
            return doPost(issue, {comment: comment, number: issue.number, edit: true, commentIndex: commentIndex});
        };

        var deleteComment = function (issue, index) {
            return doPost(issue, {comment: "", number: issue.number, delete: true, commentCreated: issue.comments[index].created});
        };

        var setComment = function (issue, commentIndex) {
            return doPost(issue, {comment: "", number: issue.number, set: true, commentIndex: commentIndex});
        };

        function addPin (pin) {
            removePin();

            createPinShape("pinPlacement", pin, pinRadius, pinHeight);
         }

        function removePin () {
            var pinPlacement = document.getElementById("pinPlacement");
            if (pinPlacement !== null) {
               pinPlacement.parentElement.removeChild(pinPlacement)
            }
        }

        function fixPin (pin) {
            createPinShape(pin.id, pin, pinRadius, pinHeight);
        }

        function createPinShape (id, pin, radius, height, scale)
        {
            var sceneBBox = ViewerService.defaultViewer.scene._x3domNode.getVolume();
            var sceneSize = sceneBBox.max.subtract(sceneBBox.min).length();
            var scale     = sceneSize / 20;

            if (ViewerService.defaultViewer.pinSize)
            {
                scale = ViewerService.defaultViewer.pinSize;
            }

            var parent = document.createElement("MatrixTransform");
            parent.setAttribute("id", id);

            var inlines = $("inline");
            var trans = null;

            for (var i = 0; i < inlines.length; i++)
            {
                if (inlines[i].getAttribute("nameSpaceName") === (pin.account + "__" + pin.project))
                {
                    trans = inlines[i]._x3domNode.getCurrentTransform();
                    break
                }
            }

            parent.setAttribute("matrix", trans.toGL());

            var norm = new x3dom.fields.SFVec3f(pin.norm[0], pin.norm[1], pin.norm[2]);

            // Transform the normal into the coordinate frame of the parent
            var axisAngle = ViewerService.defaultViewer.rotAxisAngle([0,1,0], norm.toGL());

            var modelTransform = document.createElement("Transform");
            modelTransform.setAttribute("rotation", axisAngle.toString());

            var position = new x3dom.fields.SFVec3f(pin.position[0], pin.position[1], pin.position[2]);

            // Transform the pin into the coordinate frame of the parent
            modelTransform.setAttribute("translation", position.toString());

            parent.appendChild(modelTransform);

            var coneHeight = height - radius;
            var pinshape = document.createElement("Group");
            pinshape.setAttribute('onclick', 'clickPin(event)');

            var pinshapeapp = document.createElement("Appearance");
            pinshape.appendChild(pinshapeapp);

            var pinshapedepth = document.createElement("DepthMode");
            pinshapedepth.setAttribute("depthFunc", "ALWAYS");
            pinshapedepth.setAttribute("enableDepthTest", "false");
            pinshapeapp.appendChild(pinshapedepth);

            var pinshapemat = document.createElement("Material");
            pinshapemat.setAttribute("diffuseColor", "1.0 0.0 0.0");
            pinshapeapp.appendChild(pinshapemat);

            var pinshapescale = document.createElement("Transform");
            pinshapescale.setAttribute("scale", scale + " " + scale + " " + scale);
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
            pinshapecone.setAttribute("bottomRadius", (radius * 0.5).toString());
            pinshapecone.setAttribute("height", coneHeight.toString());

            var coneApp = pinshapeapp.cloneNode(true);

            pinshapeconeshape.appendChild(pinshapecone);
            pinshapeconeshape.appendChild(coneApp);

            var pinshapeballtrans = document.createElement("Transform");
            pinshapeballtrans.setAttribute("translation", "0.0 " + coneHeight + " 0.0");
            pinshapescale.appendChild(pinshapeballtrans);

            var pinshapeballshape = document.createElement("Shape");
            pinshapeballtrans.appendChild(pinshapeballshape);

            var pinshapeball = document.createElement("Sphere");
            pinshapeball.setAttribute("radius", radius);

            var ballApp = pinshapeapp.cloneNode(true);

            pinshapeballshape.appendChild(pinshapeball);
            pinshapeballshape.appendChild(ballApp);

            modelTransform.appendChild(pinshape);

            $("#model__root")[0].appendChild(parent);
        }

        return {
            prettyTime: prettyTime,
            getIssues: getIssues,
            saveIssue: saveIssue,
            closeIssue: closeIssue,
            saveComment: saveComment,
            editComment: editComment,
            deleteComment: deleteComment,
            setComment: setComment,
            addPin: addPin,
            fixPin: fixPin,
            removePin: removePin
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
.factory('Branches', ['$http', '$q', 'serverConfig', 'StateManager', function($http, $q, serverConfig, StateManager){
	var o = {};

	o.refresh = function() {
		var self = this;
		var account = StateManager.state.account;
		var project = StateManager.state.project;

		self.branches = [];

		var deferred = $q.defer();

		$http.get(serverConfig.apiUrl(account + '/' + project + '/branches.json'))
		.then(function(json) {
			self.branches = json.data.map(function (item) {
				if (item.name == "00000000-0000-0000-0000-000000000000")
					return "master";
				else
					return item.name;
			});

			deferred.resolve();
		}, function(message) {
			deferred.resolve();
		});

		return deferred.promise;
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

angular.module('3drepo')
.run(['StateManager', function(StateManager) {
	StateManager.registerPlugin('revision', 'SelectorData');
}])
.controller('SelectorCtrl', ['$scope', 'StateManager', 'serverConfig', '$q', '$http', function($scope,  StateManager, serverConfig, $q, $http){

	$scope.setBranch = function(branch) {
		StateManager.setStateVar("branch", branch);
		StateManager.updateState();
	}

	$scope.setRevision = function(rev) {
		StateManager.setStateVar("revision", rev.name);
		StateManager.updateState();
	}
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
.factory('SelectorData', ['$http', '$q', 'serverConfig', 'StateManager', 'Branches', function($http, $q, serverConfig, StateManager, Branches){
	var o = {
		Branches:			Branches
	};

	o.genStateName = function() {
		return null;
	}

	o.refresh = function() {
		var self = this;

		self.Branches.refresh();
	}

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

angular.module('3drepo')
.controller('DiffSelectorCtrl', ['$scope', 'StateManager', 'DiffViewerService', function($scope,  StateManager, DiffViewerService){
	$scope.diffEnabled = false;

	$scope.setDiffBranch = function(branch) {
		StateManager.setStateVar("diffbranch", branch);
		StateManager.updateState();

		$scope.diffEnabled = true;
	}

	$scope.setDiffRevision = function(rev) {
		StateManager.setStateVar("diffrevision", rev.name);
		StateManager.updateState();

		$scope.diffEnabled = true;
	}

	$scope.toggleDiff = function() {
		if (!$scope.diffEnabled)
		{
			$scope.diffEnabled = true;
			StateManager.setStateVar("diffbranch", "master");
			StateManager.setStateVar("diffrevision", "head");
			StateManager.updateState();
		} else {
			$scope.diffEnabled = false;
			StateManager.setStateVar("diffbranch", null);
			StateManager.setStateVar("diffrevision", null);
			StateManager.updateState();
		}
	}

	$scope.$watchGroup(['state.project'], function () {
		// If the project is changed then we need to reset
		// the diff viewer
		if (!StateManager.state.diffbranch) {
			$scope.diffEnabled = false;
		} else {
			$scope.diffEnabled = true;
		}

		DiffViewerService.switchDiff($scope.diffEnabled);
	});

	$scope.$watchGroup(['state.diffbranch', 'state.diffrevision'], function() {
		DiffViewerService.switchDiff($scope.diffEnabled);

		if ($scope.diffEnabled)
		{
			DiffViewerService.loadModel();
			DiffViewerService.diffViewer.setNavMode("TURNTABLE");
		}
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
.service('DiffViewerService', ['StateManager', 'serverConfig', 'ViewerService', function(StateManager, serverConfig, ViewerService){
	var self = this;
	self.diffViewer = null;

	this.switchDiff = function (enable) {
		ViewerService.viewerManager.diffView(enable);

		self.diffViewer = ViewerService.viewerManager.getDiffViewer();
	}

	this.loadModel = function() {
		var branch		= StateManager.state.diffbranch ? StateManager.state.diffbranch : "master";
		var revision	= StateManager.state.diffrevision ? StateManager.state.diffrevision : "head";
		var url = null;

		if (revision == "head")
		{
			url = serverConfig.apiUrl(StateManager.state.account + '/' + StateManager.state.project + '/revision/' + branch + '/head.x3d.src');
		} else {
			url = serverConfig.apiUrl(StateManager.state.account + '/' + StateManager.state.project + '/revision/' + revision + '.x3d.src');
		}

		self.diffViewer.loadURL(url);
	}
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

(function () {
    "use strict";

    angular.module("3drepo")
        .directive("clip", clip);

    function clip() {
        return {
            restrict: 'EA',
            templateUrl: 'clip.html',
            scope: {
                height: "=",
                show: "="
            },
            controller: ClipCtrl,
            controllerAs: 'cl',
            bindToController: true
        };
    }

    ClipCtrl.$inject = ["$scope", "$timeout", "ViewerService"];

    function ClipCtrl($scope, $timeout, ViewerService) {
        var cl = this,
            clipPlane = null;
        cl.sliderMin = 0;
        cl.sliderMax = 100;
        cl.sliderStep = 0.1;
        cl.sliderPosition = cl.sliderMin;
        cl.clipPlane = null;
        cl.axes = ["X", "Y", "Z"];
        cl.selectedAxis = cl.axes[0];

        function initClippingPlane () {
            $timeout(function () {
                cl.clipPlaneID = ViewerService.defaultViewer.addClippingPlane(cl.selectedAxis);
                clipPlane = ViewerService.defaultViewer.getClippingPlane(cl.clipPlaneID);
                moveClippingPlane(cl.sliderPosition);
            });
        }

        function moveClippingPlane(sliderPosition) {
            clipPlane.movePlane((cl.sliderMax - sliderPosition) / cl.sliderMax);
        }

        $scope.$watch("cl.show", function (newValue) {
            if (angular.isDefined(newValue)) {
                if (newValue) {
                    initClippingPlane();
                }
                else {
                    cl.clipPlane = null;
                    ViewerService.defaultViewer.clearClippingPlanes();
                }
            }
        });

        $scope.$watch("cl.selectedAxis", function (newValue) {
            if ((angular.isDefined(newValue) && clipPlane)) {
                // Swap Y and Z axes
                if (newValue === "Y") {
                    clipPlane.changeAxis("Z");
                }
                else if (newValue === "Z") {
                    clipPlane.changeAxis("Y");
                }
                else {
                    clipPlane.changeAxis(newValue);
                }
                cl.sliderPosition = cl.sliderMin;
            }
        });

        $scope.$watch("cl.sliderPosition", function (newValue) {
            if (clipPlane) {
                moveClippingPlane(newValue);
            }
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

angular.module('3drepo')
.factory('CurrentDiffBranch', ['$http', '$q', 'serverConfig', 'StateManager', function($http, $q, serverConfig, StateManager){
	var o = {
		name: "",
		revision: [],
		n_revision: 0
	};

	o.refresh = function(account, project, branch) {
		var self = this;
		var account = StateManager.state.account;
		var project = StateManager.state.project;
		var branch  = StateManager.state.branch;

		var deferred = $q.defer();

		$http.get(serverConfig.apiUrl(account + '/' + project + '/revisions/' + branch + '.json'))
		.then(function(json) {
			self.name		 = branch;
			self.revisions	 = json.data;
			self.n_revisions = self.revisions.length;

			deferred.resolve();
		}, function(message) {
			deferred.resolve();
		});

		return deferred.promise;
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

angular.module('3drepo')
.factory('CurrentDiffRevision', ['$http', '$q', 'serverConfig', 'StateManager', function($http, $q, serverConfig, StateManager){
	var o = {
		name:		"",
		shortName:	"",
		author:		"",
		date:		"",
		message:	"",
		branch:		""
	};

	o.refresh = function(account, project, branch, revision) {
		var self = this;
		var account		= StateManager.state.account;
		var project		= StateManager.state.project;
		var branch		= StateManager.state.diffbranch;
		var revision	= StateManager.state.diffrevision;

		var deferred = $q.defer();
		var baseUrl = "";

		if (revision == 'head')
			baseUrl = serverConfig.apiUrl(account + '/' + project + '/revision/' + branch + '/' + revision);
		else
			baseUrl = serverConfig.apiUrl(account + '/' + project + '/revision/' + revision);

		$http.get(baseUrl + '.json')
		.then(function(json) {
			self.revision	= json.data.revision;
			self.shortName	= json.data.revision.substr(0,20) + "...";
			self.author		= json.data.author;
			self.data		= json.data.date;
			self.message	= json.data.message;
			self.branch		= json.data.branch;

			deferred.resolve();
		}, function(message) {
			deferred.resolve();
		});

		return deferred.promise;
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

angular.module('3drepo')
.config([
'$stateProvider',
'parentStates',
function($stateProvider, parentStates) {
	var states = parentStates["diff"];

	for(var i = 0; i < states.length; i++) {
		$stateProvider
		.state(states[i] + '.diffbranch', {
			url: '/diff/branch/:diffbranch/head',
			resolve: {
				init: function(StateManager, $stateParams) {
					StateManager.setState($stateParams, {});
					StateManager.refresh('diff');
				}
			}
		})
		.state(states[i] + '.diffrevision', {
			url: '/diff/revision/:diffrevision',
			resolve: {
				init: function(StateManager, $stateParams) {
					StateManager.setState($stateParams, {});
					StateManager.refresh('diff');
				}
			}
		});
	}
}])
.run(['StateManager', function(StateManager) {
	StateManager.registerPlugin('diff', 'DiffData', function () {
		if (!StateManager.state.diffrevision && StateManager.state.diffbranch)
			StateManager.state.diffrevision = 'head';

		if (StateManager.state.diffbranch && (StateManager.state.diffrevision == 'head'))
			return "diffbranch";
		else if (StateManager.state.diffrevision)
			return "diffrevision";
		else
			return null;
	});

	StateManager.setClearStateVars("diffrevision", ["diffrevision"]);
	StateManager.setClearStateVars("diffbranch", ["diffbranch"]);
}]);

/*
.controller('DiffCtrl', ['$scope', 'StateManager', 'serverConfig', '$q', '$http', 'Branches', 'CurrentBranch', 'CurrentRevision', 'ViewerService', function($scope,  StateManager, serverConfig, $q, $http, Branches, CurrentDiffBranch, CurrentDiffRevision, ViewerService){
	// Initialize to true so we load at least
	// once at the start
	$scope.refreshDiffView	= true;

	$scope.setDiffBranch = function(branch) {
		StateManager.setStateVar("diffBranch", branch);
		StateManager.updateState();
	}

	$scope.setDiff = function (rev) {
		StateManager.setStateVar("diffRevision", rev.name);
		if(StateManager.changed.diffRevision)
			$scope.refreshDiffView = false;

		StateManager.updateState();
	}

	$scope.toggleDiff = function() {
		if (StateManager.state.diff) {
			StateManager.setStateVar("diffBranch", null);
			StateManager.setStateVar("diffRevision", null);
			StateManager.setStateVar("diffEnabled", false);
			StateManager.refresh();
			StateManager.updateState();
		} else {
			StateManager.setStateVar("diffBranch", Data.state.branch);
			StateManager.setStateVar("diffRevision", Data.state.revision);
			StateManager.setStateVar("diffEnabled", true);
			StateManager.refresh();
			StateManager.updateState();
		}
	}

	$scope.$watchGroup(['Data.state.diffEnabled', 'Data.state.diffBranch', 'Data.state.diffRevision'], function () {
		viewerManager.diffView(Data.state.diffEnabled);

		if (StateManager.state.diff)
		{
			if($scope.refreshDiffView)
			{
				viewerManager.loadModel();

				$scope.refreshDiffView = false;
			}

			var baseUrl = serverConfig.apiUrl(Data.state.account + '/' + Data.state.project + '/revision/' + Data.state.revision + '/diff/' + Data.state.diffRevision + '.json');

			$http.get(baseUrl, { withCredentials : true})
			.then(function(json) {
				var diffColors = {
					added:		json.data["added"],
					modified:	json.data["modified"],
					deleted:	json.data["deleted"]
				};

				viewerManager.setDiffColors(diffColors);
			});
		} else {
			$scope.refreshDiffView = true; // Ready for when it's re-enabled
		}
	});

}]);

*/

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
.factory('DiffData', ['$q', '$http', 'serverConfig', 'StateManager', 'ViewerService', 'CurrentDiffBranch', 'CurrentDiffRevision', function($q, $http, serverConfig, StateManager, ViewerService, CurrentDiffBranch, CurrentDiffRevision){
	var o = {
		CurrentDiffBranch:		CurrentDiffBranch,
		CurrentDiffRevision:	CurrentDiffRevision,
	};

	o.refresh = function() {
		var self = this;

		return $q.all([
			self.CurrentDiffBranch.refresh(),
			self.CurrentDiffRevision.refresh()
		]).then(function()
			{
				var baseUrl = serverConfig.apiUrl(StateManager.state.account + '/' + StateManager.state.project + '/revision/' + StateManager.Data.RevisionData.CurrentRevision.revision + '/diff/' + self.CurrentDiffRevision.revision + '.json');

				$http.get(baseUrl, { withCredentials : true})
				.then(function(json) {
					var diffColors = {
						added:		json.data["added"],
						modified:	json.data["modified"],
						deleted:	json.data["deleted"]
					};

					ViewerService.viewerManager.setDiffColors(diffColors);
				})
		});
	}

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

angular.module('3drepo')
.factory('Comments', ['$http', '$q', 'serverConfig', function($http, $q, serverConfig){
	var o = {};

	o.getNumberOfComments = function(account, project) {
		var self = this;

		self.n_comments = 0;

		var deferred = $q.defer();

		$http.get(serverConfig.apiUrl(account + '/' + project + '/comments.json?mode=number'))
		.then(function(json) {
			self.n_comments = json.data.n_comments;
			deferred.resolve(self.n_comments);
		}, function(json) {
			deferred.resolve(0);
		});

		return deferred.promise();
	}

	o.refresh = function(account, project, first, last) {
		var self = this;

		self.comments = [];
		self.loading  = true;

		var deferred = $q.defer();

		$http.get(serverConfig.apiUrl(account + '/' + project + '/comments.json?start=' + first + '&end=' + last + '&full=true'))
		.then(function(json) {
			self.comments = json.data;
			self.n_comments = self.comments.length;
			self.loading = false;

			deferred.resolve();
		}, function(json) {
			deferred.resolve();
		});

		return deferred.promise;
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

angular.module('3drepo')
.factory('Log', ['$http', '$q', 'serverConfig', function($http, $q, serverConfig){
	var o = {};

	o.getNumberOfLogEntries = function(account, project) {
		var self = this;

		self.n_logentries = 0;
		self.loading = true;

		var deferred = $q.defer();

		$http.get(serverConfig.apiUrl(account + '/' + project + '/log.json?mode=number'))
		.then(function(json) {
			self.n_logentries = json.data.n_logentries;
			self.loading = false;
			deferred.resolve(self.n_logentries);
		}, function(json) {
			deferred.resolve(0);
		});

		return deferred.promise;
	}

	o.refresh = function(account, project, first, last) {
		var self = this;

		self.log = [];
		self.n_log = 0;

		var deferred = $q.defer();

		$http.get(serverConfig.apiUrl(account + '/' + project + '/log.json?first=' + first + '&last=' + last))
		.then(function(json) {
			self.log = json.data;
			self.loading = false;
			deferred.resolve();
		}, function(message) {
			self.loading = false;
			deferred.resolve();
		});

		return deferred.promise;
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

angular.module('3drepo')
.factory('Readme', ['$http', '$q', 'serverConfig', function($http, $q, serverConfig){
	var o = {};

	o.defaultReadme = "[Missing Readme]";

	o.refresh = function(account, project, branch, revision) {
		var self = this;

		self.text		= "";

		var deferred = $q.defer();

		var newURL = "";

		if (branch)
		{
			newURL += account + '/' + project + '/revision/' + branch + '/head';
		} else {
			newURL += account + '/' + project + '/revision/' + revision;
		}

		$http.get(serverConfig.apiUrl(newURL + '/readme.json'))
		.then(function(json) {
			self.text = json.data.readme;

			deferred.resolve();
		}, function(json) {
			self.text	= self.defaultReadme;
			deferred.resolve();
		});

		return deferred.promise;
	};

	return o;
}])
.directive('markdown', function () {
	/**
	 * This directive allows us to convert markdown syntax into
	 * formatted text
	 */

	var converter = new Showdown.converter();
	return {
	  restrict: 'A',
	  link: function (scope, element, attrs) {
		  function renderMarkdown() {
			  var htmlText = converter.makeHtml(scope.$eval(attrs.markdown)  || '');
			  element.html(htmlText);
		  }
		  scope.$watch(attrs.markdown, renderMarkdown);
		  renderMarkdown();
	  }
  };
});


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
.factory('RevisionsByDay', ['$http', '$q', 'serverConfig', function($http, $q, serverConfig){
	var o = {};

	o.month = function(month) {
		var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August",
			"September", "October", "November", "December"];

		return monthNames[month];
	};

	o.getNumberOfRevisions = function(account, project, branch) {
		var self = this;

		self.n_revisions = 0;

		var deferred = $q.defer();

		$http.get(serverConfig.apiUrl(account + '/' + project + '/revisions/' + branch + '.json?mode=number'))
		.then(function(json) {
			self.n_revisions = json.data.n_revisions;
			deferred.resolve(self.n_revisions);
		}, function(json) {
			deferred.resolve(0);
		});

		return deferred.promise;
	}

	o.refresh = function(account, project, branch, first, last) {
		var self = this;

		self.revisionsByDay = {};
		self.loading = true;

		var deferred = $q.defer();

		$http.get(serverConfig.apiUrl(account + '/' + project + '/revisions/' + branch + '.json?start=' + first + '&end=' + last + '&full=true'))
		.then(function(json) {
			for(var rev in json.data)
			{
				var dt = new Date(json.data[rev].timestamp);

				var day = dt.getDate();
				var month = self.month(dt.getMonth());
				var year  = dt.getFullYear();

				var dtStr = day + " " + month + " " + year;

				if (!(dtStr in res))
					res[dtStr] = [];

				json.data[rev].date = dtStr;
				self.revisionsByDay[dtStr].push(json.data[rev]);
			}

			self.loading = false;
			deferred.resolve(res);
		}, function(json) {
			self.loading = false;
			deferred.resolve();
		});

		return deferred.promise;
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

angular.module('3drepo')
.factory('Users', ['$http', '$q', 'serverConfig', function($http, $q, serverConfig){
	var o = {};

	o.userRoles = [
		{label: 'Owner', value: 1},
		{label: 'Admin', value: 2},
		{label: 'Viewer', value: 3}
	];

	o.refresh = function(account, project) {
		var self = this;

		self.users		= [];

		var deferred = $q.defer();

		$http.get(serverConfig.apiUrl(account + '/' + project + '/users.json'))
		.then(function(json) {
			self.users = json.data;
			deferred.resolve();
		});

		return deferred.promise;
	};

	o.updateUsers = function()
	{
		return null;
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

/*
var viewUrl = function ($stateParams)
{
	// Each view is associated with a template
	// However only a few views are possible
	// Check that we have a view that exists otherwise redirects to info
	var possible_views = ["info", "comments", "revisions", "log", "settings", "cobie"];
	var view = $stateParams.view;

	if( possible_views.indexOf(view) == -1 ){
		view = "info";
	}

	return view + '.html';
}
*/

var possible_views = ["info", "comments", "revisions", "log", "settings", "cobie"];

angular.module('3drepo')
.config([
'$stateProvider',
'parentStates',
function($stateProvider, parentStates) {
	var states = parentStates["view"];

	for(var i = 0; i < states.length; i++) {
		for(var v = 0; v < possible_views.length; v++)
		{
			var viewName = possible_views[v];

			var stateObj = {
				url: '/' + possible_views[v],
				resolve: {
					auth: function authCheck(Auth) { return Auth.init(); },
					init: function(StateManager, $stateParams) {
						var splitURL = this.url.source.split('/');
						var view = splitURL[splitURL.length - 1];

						StateManager.setState($stateParams, {});
						StateManager.setStateVar(view);
						StateManager.refresh("view");
					}
				},
				// TODO: This shouldn't be hard coded, need to
				// work out position of footer from plugin list
				views: { 'footer@base.login.account.project' : {
					templateUrl : possible_views[v] + '.html'
					}
				}
			};

			$stateProvider.state(states[i] + '.' + possible_views[v], stateObj);
		}
	}
}])
.run(['$rootScope', 'parentStates', 'StateManager', function($rootScope, parentStates, StateManager) {
	StateManager.registerPlugin('view', 'ViewData',  function () {
		if (possible_views.indexOf(StateManager.state.view) != -1)
			return StateManager.state.view;
		else
			return null;
	});

	StateManager.setClearStateVars('view', ["view"]);

	$rootScope.$on('$stateChangeSuccess',function(event, toState, toParams, fromState, fromParams){
		var states = parentStates["view"];

		for(var i = 0; i < states.length; i++)
		{
			if (states[i] == toState.name)
			{
				StateManager.setStateVar('view', 'info');
				StateManager.updateState();
				break;
			}
		}
	  console.log('$stateChangeSuccess to '+toState.name+'- fired once the state transition is complete.');
	});

}])
.controller('ViewCtrl', ['$scope', 'StateManager', 'serverConfig', '$state', function($scope, StateManager, serverConfig, $state){
	$scope.pageChanged = function() {
		StateManager.Data.ViewData.updatePaginatedView($scope.view);
	};

	$scope.go = function(v){
		var bp = $('#bottom-panel');

		if (bp.hasClass('collapsed')) {
			// if the bottom panel is collapsed and the tab was clicked, expand
			bp.removeClass('collapsed');
		} else if (v === StateManager.state.view) {
			// if the panel is expanded and the same view was clicked again, collapse
			bp.addClass('collapsed');
		}

		StateManager.setStateVar("view", v);
		StateManager.updateState();
	}


	$scope.pageChanged();
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
.factory('ViewData', ['StateManager', 'Readme', 'Comments', 'Log', 'RevisionsByDay', 'Users', function(StateManager, Readme, Comments, Log, RevisionsByDay, Users){
	var o = {
		Readme:				Readme,
		Comments:			Comments,
		Log:				Log,
		RevisionsByDay:		RevisionsByDay,
		Users:				Users,
		totalItems:			0,
		currentPage:		1,
		itemsPerPage:		0
	};

	o.genStateName = function () {
		if (StateManager.state.view)
			return "view";
		else
			return null;
	}

	o.updatePaginatedView = function(view)
	{
		var self = this;
		var first = (self.currentPage - 1) * self.itemsPerPage;
		var last  = Math.min(self.totalItems - 1, self.currentPage * self.itemsPerPage - 1);

		if (view == "comments")
			self.Comments.refresh(StateManager.state.account, StateManager.state.project, first, last);
		else if (view == "log")
			self.Log.refresh(StateManager.state.account, StateManager.state.project, first, last);
		else if (view == "revisions")
			self.RevisionsByDay.refresh(StateManager.state.account, StateManager.state.project, StateManager.state.branch, first, last);
	}

	o.refresh = function() {
		var self = this;
		var view = StateManager.state.view;

		if (view == 'info')
		{
			self.Readme.refresh(StateManager.state.account, StateManager.state.project, StateManager.state.branch, StateManager.state.revision);
		} else if (StateManager.state.view == 'comments') {
			self.Comments.getNumberOfComments(StateManager.state.account, StateManager.state.project)
			.then(function(n_comments) {
				self.totalItems = n_comments;
				self.updatePaginatedView();
			});
		} else if (view == 'log') {
			self.Log.getNumberOfLogEntries(StateManager.state.account, StateManager.state.project)
			.then(function(n_logentries) {
				self.totalItems = n_logentries;
				self.updatePaginatedView();
			});
		} else if (view == 'revisions') {
			self.RevisionsByDay.getNumberOfRevisions(StateManager.state.account, StateManager.state.project, StateManager.state.branch)
			.then(function(n_revisions) {
				self.totalItems = n_revisions;
				self.updatePaginatedView('revisions');
			});
		} else if (view == 'settings') {
			self.Users.refresh(StateManager.state.account, StateManager.state.project);
		} else if (view) {
			// Unknown view
			StateManager.setStateVar("view", null);
			return StateManager.updateState();
		}
	}

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

angular.module('3drepo')
.config([
'$stateProvider',
'parentStates',
function($stateProvider, parentStates) {
	var states = parentStates["sid"];

	for(var i = 0; i < states.length; i++) {
		$stateProvider
		.state(states[i] + '.sid', {
			url: '/:sid',
			resolve: {
				init: function(StateManager, $stateParams) {
					StateManager.setState($stateParams, {});
					StateManager.refresh('sid');
				}
			}
		});
	}
}])
.run(['StateManager', function(StateManager) {
	StateManager.registerPlugin('sid', 'SIDData', function () {
		if (StateManager.state.sid)
			return "sid";
		else
			return null;
	});

	StateManager.setClearStateVars("sid", ["sid"]);
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
.factory('SIDData', ['$http', '$q', 'serverConfig', 'StateManager', '$rootScope', 'ViewerService', function($http, $q, serverConfig, StateManager, $rootScope, ViewerService){
	var o = {

	};

	o.refresh = function() {
		var self = this;
		var account	= StateManager.state.account;
		var project	= StateManager.state.project;
		var sid		= StateManager.state.sid;

		var branch		= StateManager.state.branch ? StateManager.state.branch : "master";
		var revision	= StateManager.state.revision ? StateManager.state.revision : "head";

		var url = null;

		if (revision == "head")
		{
			url = serverConfig.apiUrl(StateManager.state.account + '/' + StateManager.state.project + '/revision/' + branch + '/head/');
		} else {
			url = serverConfig.apiUrl(StateManager.state.account + '/' + StateManager.state.project + '/revision/' + revision + '/');
		}

		url += sid + '.json';

		$http.get(url).then(function(json) {
			// Study the type of object
			if (json.data.cameras_count)
			{
				var camkey	= Object.keys(json.data.cameras)[0];
				var name	= json.data.cameras[camkey].name;

				ViewerService.defaultViewer.setCurrentViewpoint("model__" + name);
			}
		}, function(json) {
			$rootScope.$broadcast("sidNotFound", { uuid: sid });
		});

		/*
		return $q.all([
			self.CurrentBranch.refresh(),
			self.CurrentRevision.refresh()
		]);
		*/

	}

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

(function () {
    "use strict";

    angular.module("3drepo")
        .controller('WalkthroughCtrl', WalkthroughCtrl);

    WalkthroughCtrl.$inject = ["WalkthroughService"];

    function WalkthroughCtrl (WalkthroughService) {
        var wt = this;
        wt.recordButtonClass = "btn walkthroughButton btn-success";
        wt.walkthroughs = WalkthroughService.getWalkthroughs();
        wt.currentWalkthrough = WalkthroughService.getCurrentWalkthrough();

        wt.record = function () {
            if (wt.currentWalkthrough !== -1) {
                if (WalkthroughService.isRecording()) {
                    WalkthroughService.stopRecording();
                    wt.recordButtonClass = "btn walkthroughButton btn-success";
                }
                else {
                    WalkthroughService.startRecording();
                    wt.recordButtonClass = "btn walkthroughButton btn-danger";
                }
            }
        };

        wt.play = function () {
            WalkthroughService.play();
        };

        wt.stop = function () {
            WalkthroughService.stop();
        };

        wt.userInControl = function () {
            WalkthroughService.userInControl();
        };

        wt.setCurrentWalkthrough = function (index) {
            WalkthroughService.setCurrentWalkthrough(index);
            wt.currentWalkthrough = WalkthroughService.getCurrentWalkthrough();
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

    angular.module('3drepo')
        .service('WalkthroughService', WalkthroughService);

    WalkthroughService.$inject = ["$interval", "$timeout", "$http", "ViewerService", "StateManager", "serverConfig"];

    function WalkthroughService($interval, $timeout, $http, ViewerService, StateManager, serverConfig) {
        var defaultViewer = ViewerService.defaultViewer,
            recordingInterval = null,
            playingInterval = null,
            position = 0,
            recording = false,
            playing = false,
            walkthroughs = new Array(5),
            currentWalkthrough = -1,
            state = StateManager.state,
            userControlTimeout = null,
            inUserControl = false;

        function getWalkthroughData(index) {
            var url = "/" + state.account + "/" + state.project + "/" + index + "/walkthrough.json",
                i = 0,
                length = 0;

            $http.get(serverConfig.apiUrl(url))
                .then(function(data) {
                    for (i = 0, length = data.data.length; i < length; i++) {
                        walkthroughs[data.data[i].index] = data.data[i].cameraData;
                    }
                });
        }
        getWalkthroughData("all");

        var startRecording = function () {
            var viewpoint = {};
            if (currentWalkthrough !== -1) {
                recording = true;
                walkthroughs[currentWalkthrough] = [];
                recordingInterval = $interval(function () {
                    viewpoint = defaultViewer.getCurrentViewpointInfo();
                    walkthroughs[currentWalkthrough].push({
                        position: viewpoint.position,
                        up: viewpoint.up,
                        view_dir: viewpoint.view_dir
                    });
                }, 250);
            }
        };

        var stopRecording = function () {
            var postUrl = "/" + state.account + "/" + state.project + "/walkthrough";

            recording = false;
            $interval.cancel(recordingInterval);

            $http.post(serverConfig.apiUrl(postUrl), {index: currentWalkthrough, cameraData: walkthroughs[currentWalkthrough]})
                .then(function(json) {
                    //console.log(json);
                });
        };

        var play = function () {
            var numCameraPositions = 0;

            if ((currentWalkthrough !== -1) && angular.isDefined(walkthroughs[currentWalkthrough])) {
                numCameraPositions = walkthroughs[currentWalkthrough].length;
                playing = true;
                playingInterval = $interval(function () {
                    defaultViewer.updateCamera(
                        walkthroughs[currentWalkthrough][position].position,
                        walkthroughs[currentWalkthrough][position].up,
                        walkthroughs[currentWalkthrough][position].view_dir
                    );
                    if (position === (numCameraPositions - 1)) {
                        position = 0;
                    }
                    else {
                        position += 1;
                    }
                }, 500);
            }
        };

        var stop = function () {
            playing = false;
            $interval.cancel(playingInterval);
            $timeout.cancel(userControlTimeout);
        };

        var userInControl = function () {
            if (playing) {
                $interval.cancel(playingInterval);
                $timeout.cancel(userControlTimeout);
                userControlTimeout = $timeout(function () {
                    play();
                }, 60000);
            }
        };

        var isRecording = function () {
            return recording;
        };

        var setCurrentWalkthrough = function(index) {
            currentWalkthrough = index;
            stop();
            // Go to the start position of the selected walkthrough if it exists
            if (angular.isDefined(walkthroughs[currentWalkthrough])) {
                position = 0;
                play();
            }
            else {
                getWalkthroughData(currentWalkthrough);
            }
        };

        var getCurrentWalkthrough = function () {
            return currentWalkthrough;
        };

        var getWalkthroughs = function () {
            return walkthroughs;
        };

        return {
            isRecording: isRecording,
            startRecording: startRecording,
            stopRecording: stopRecording,
            play: play,
            stop: stop,
            userInControl: userInControl,
            setCurrentWalkthrough: setCurrentWalkthrough,
            getCurrentWalkthrough: getCurrentWalkthrough,
            getWalkthroughs: getWalkthroughs
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
        .controller('ViewingCtrl', ViewingCtrl);

    ViewingCtrl.$inject = ["$scope", "ViewerService"];

    function ViewingCtrl ($scope, ViewerService) {
        var vw = this;
        vw.currentViewing = 0;
        vw.viewings = [
            {icon: "fa-mouse-pointer", mode: "TURNTABLE"},
            {icon: "fa-arrows", mode: "HELICOPTER"},
            {icon: "fa-child", mode: "WALK"},
   	    {icon: "fa-home", mode: "HOME"},
            {icon: "fa-eye", mode: "EYE"}
        ];

        vw.setCurrentViewing = function(index) {

			if (vw.viewings[index].mode === "HOME") {
				ViewerService.defaultViewer.showAll();

				var navModeIndex = vw.viewings.map(function(item) {
					return item.mode;
				}).indexOf(ViewerService.defaultViewer.nav.type);

				vw.currentViewing = navModeIndex;
			} else if (vw.viewings[index].mode === "EYE") {
                ViewerService.defaultViewer.revealAll();
            } else {
				vw.currentViewing = index;
	            ViewerService.defaultViewer.setNavMode(vw.viewings[index].mode);
			}
		};
    }
}());

