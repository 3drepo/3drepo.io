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

