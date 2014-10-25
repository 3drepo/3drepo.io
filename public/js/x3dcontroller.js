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

var app = angular.module('3drepoapp', ['ui.event', 'ui.router']);

// This directive replaces the inline from the x3dom library and allows the file to be parsed by angular
app.directive("include", ["$compile", '$http', '$templateCache', 'navigation', function ($compile, $http, $templateCache, navigation) {
  return {
    restrict: 'E',
    link: function(scope , element, attrs) {

      scope.$watch(attrs.url, function (value) {
        if (value) {
          loadTemplate(value);
        }
      });

      function loadTemplate(template) {
        $http.get(template, { cache: $templateCache })
          .success(function(templateContent) {
            element.replaceWith($compile(templateContent)(scope));                
            navigation.view_all();
          });    
      }
    } 
  }
}]);

// This directive allows us to link directly with the shapes in the dom and setup links and callbacks
app.directive('link', [ 'x3dlink', function(x3dlink) {
  return {
    restrict: 'AE',
    link: function(scope, elem, attrs) {
      // Get the id of the element
      var id = attrs["id"];
      // Link the id with the element
      x3dlink.links[id] = elem[0];
      // Callback is set on the element
      elem[0].onclick = x3dlink.clicked_callback(id);
    }
  };
}]);

// This makes the link between controllers and the x3dom elements
// A controller that wished to be notified of a click
// needs to be registered as a listener.
app.factory('x3dlink', [function(){

  listeners = [];

  var o = {
    links : {},
    add_listener : function(controller){
      listeners.push(controller);
    },
    clicked_callback : function(id){
      function fn(){
        var length = listeners.length;
        for(var i = 0; i<length; i++){
          listeners[i].clicked_callback(id);
        }
      }
      return fn;
    }
  };

  return o;
}]);

// This allows controller to poke the x3d runtime
app.factory('navigation', [function(){

  var model = document.getElementById("model");

  var o = {
    view_all : function(){
      model.runtime.showAll();
    },
    default_viewpoint : function(){
      model.runtime.resetView();
    },
    show_object : function(item){
      model.runtime.showObject(item);
    },
  };

  return o;
}]);

// Base navigation controller for the menus
app.controller('BaseNavigationCtrl', ['$scope', 'navigation', function($scope, navigation){

  $scope.view_all = function(){
    navigation.view_all();
  }

  $scope.default_viewpoint = function(){
    navigation.default_viewpoint();
  }

}]);

