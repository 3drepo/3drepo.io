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
app.directive('shape', [ 'x3dlink', 'x3dmouselink', function(x3dlink, x3dmouselink) {
  return {
    restrict: 'E',
    link: function(scope, elem, attrs) {
      // Get the id of the element
      var id = attrs["id"];
      // Link the id with the element
      x3dlink.links[id] = elem;
      // Callback is set on the element
      elem[0].onclick = x3dlink.clicked_callback(id);
    }
  };
}]);

// This makes the link between controllers and the x3dom elements
// A controller that wished to be notified of a click
// needs to be registered as a listener.
app.factory('x3dlink', [function(){

  var o = {
      listeners : [],
      links : {},
  }

  o.add_listener = function(controller){
    o.listeners.push(controller);
  };

  o.clicked_callback = function(id){
    function fn(event){
      var length = o.listeners.length;
      for(var i = 0; i<length; i++){
        o.listeners[i].clicked_callback(id, event);
      }
    }
    return fn;
  };

  return o;
}]);

app.factory('x3dmouselink', [function(){
  
  var o = {
    listeners: [],
  	links : {},
  };


  o.add_listener = function(controller){
    o.listeners.push(controller);
  };

  o.mouseover_callback = function() {
    function fn(event) {
      var length = o.listeners.length;
      for(var i = 0; i<length; i++){
        o.listeners[i].mouseover_callback(event);
      }
    }
    return fn;
  };

  o.mousemove_callback = function() {
    function fn(event) {
      var length = o.listeners.length;
      for(var i = 0; i<length; i++){
        o.listeners[i].mouseover_callback(event);
      }
    }
    return fn;
  };

  return o;
}]);

// This allows controller to poke the x3d runtime
app.factory('navigation', [function(){

  var previous_objs = [];

  var o = {
	look_at : function(x,y,z) {
		var model = document.getElementById("model");
		if(model && model.runtime){
			var pickVec = new x3dom.fields.SFVec3f(x,y,z);
			model.runtime.canvas.doc._viewarea._pick = pickVec;
			model.runtime.canvas.doc._viewarea.onDoubleClick();
		}
	},
    view_all : function(){
      var model = document.getElementById("model");
      if(model && model.runtime){
        model.runtime.showAll();
      }
    },
    default_viewpoint : function(){
      var model = document.getElementById("model");
      if(model && model.runtime){
        model.runtime.resetView();
      }
    },

    show_objects : function(items){

      var prev_length = previous_objs.length;
      for(var i=0; i<prev_length; i++){
        var obj = previous_objs[i];
        
		if(obj && obj.children){
		  var app = obj.getElementsByTagName('appearance')[0];
		  var mat = app.getElementsByTagName('material')[0];

		  mat.setAttribute('emissiveColor', '0 0 0');
		  mat.setAttribute('transparency', '0.0');
		}
      }

      previous_objs = [];
      var length = items.length;

      for(var i=0; i<length; i++){
        var obj = items[i][0];
	    if(obj && obj.children){
		  var app = obj.getElementsByTagName('appearance')[0];
		  var mat = app.getElementsByTagName('material')[0];

		  mat.setAttribute('emissiveColor', '1.0 0.5 0');
		  mat.setAttribute('transparency', '0.1');
		}
        previous_objs.push(obj);
	 }
    },
    navigate_to_object : function(item){
      var model = document.getElementById("model");
      if(item && model && model.runtime){
		var mat = item[0]._x3domNode.getCurrentTransform();                                                                                                                                                                      
		var min = x3dom.fields.SFVec3f.MAX();                                                                 
		var max = x3dom.fields.SFVec3f.MIN();                                                                                                                                                                          
		item[0]._x3domNode.getVolume().getBounds(min, max);                    
			
		min = mat.multMatrixPnt(min);                                                                         
		max = mat.multMatrixPnt(max);            

		var bboxcenter = [0,0,0];

		bboxcenter[0] = (min.x + max.x) / 2;
		bboxcenter[1] = (min.y + max.y) / 2;
		bboxcenter[2] = (min.z + max.z) / 2;

		this.look_at(bboxcenter[0], bboxcenter[1], bboxcenter[2]);
      }
    },
    set_visible : function(item, visible){
      if(item && item.attr){
        item.attr('render', visible);
      }
    },
  	change_cursor: function (cursor_type) {
  		var model = document.getElementById("model");
      if(model && model.runtime){
  		  model.runtime.canvas.canvas.style.setProperty("cursor", cursor_type);
      }
  	},
  };

  return o;
}]);

// Base navigation controller for the menus
app.controller('BaseNavigationCtrl', ['$scope', '$rootScope', 'navigation', function($scope, $rootScope, navigation){
  $scope.view_all = function(){
    navigation.view_all();
  }

  $scope.default_viewpoint = function(){
    navigation.default_viewpoint();
  }

  $rootScope.toggle_measure = function(){
	  $rootScope.$broadcast('toggleMeasure');
  }
}]);

