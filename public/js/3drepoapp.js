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

angular.module('3drepoapp')
.config(['$stateProvider', '$urlRouterProvider',  function($stateProvider, $urlRouterProvider) {

  $stateProvider
  .state('columnview', {
    url: '/columnview',
    templateUrl: 'columnview.html',
    controller: 'ColumnviewCtrl',
    resolve: {
      treePromise: ['$stateParams', '$location', 'tree', function($stateParams, $location, tree) {
        // Dirty way of retrieving the current scene
        var url = $location.absUrl().split('#')[0];
        var scene =  /[^/]*$/.exec(url)[0];
        return tree.initialise(scene);
      }]
    }
  })
  .state('treeview', {
    url: '/treeview',
    templateUrl: 'treeview.html',
    controller: 'TreeviewCtrl',
    resolve: {
      treePromise: ['$stateParams', '$location', 'tree', function($stateParams, $location, tree) {
        // Dirty way of retrieving the current scene
        var url = $location.absUrl().split('#')[0];
        var scene =  /[^/]*$/.exec(url)[0];
        return tree.initialise(scene);
      }]
    }
  });

  $urlRouterProvider.otherwise('treeview');
}])
.factory('tree', ['$http', function($http){

  var o = {
    tree : {nodes:[]}
  }

  // Recursively build the tree from the received json
  o.populate = function(node){
    var obj = {};
    obj['id'] = node['uuid']
    obj['bid'] = node['bid'];
    obj['visible'] = true;
    obj['selected'] = false;

    if(node.hasOwnProperty('name')){
      obj['name'] = node['name'];
    }
    else{
      obj['name'] = node['uuid'].substring(0, 8) + "...";
    }

    if(node['nodes'] && (node['nodes'].length > 0)){
      obj['nodes'] = [];
      obj['linked'] = true;
	  obj['nodes'] = [];
      var l = node['nodes'].length
      for(var i = 0; i < l; i++){
        obj['nodes'].push(o.populate(node['nodes'][i]));
      }
    }

    return obj;
  }

  // Trigger the tree building instructions
  o.initialise = function(name){
    return $http.get("/data/" + name + ".price.json").success(function(data){
      o.tree.nodes = [];
	  o.tree.nodes.push(o.populate(data));
    });
  }

  return o;
}])
.controller('TreeviewCtrl', ['$scope', 'tree', 'x3dlink', 'navigation', '$location', '$anchorScroll', function($scope, tree, x3dlink, navigation, $location, $anchorScroll){

  // Controller that defines the treeview

  $scope.iconExpand = 'icon-plus  glyphicon glyphicon-plus  fa fa-plus';
  $scope.iconCollapse = 'icon-minus glyphicon glyphicon-minus fa fa-minus';
  $scope.iconLeaf = 'icon-file  glyphicon glyphicon-file  fa fa-file';
  $scope.iconLink = 'icon-file  glyphicon glyphicon-link  fa fa-link';
  $scope.iconVisible = 'icon-file  glyphicon glyphicon-eye-open  fa fa-link';
  $scope.iconHidden = 'icon-file  glyphicon glyphicon-eye-close  fa fa-link';

  $scope.tree = tree.tree;
  $scope.selected_node = "";
  $scope.in_focus = "";
  $scope.search = "";

  // Register as a listener so that we pick up the 
  // object click events
  x3dlink.add_listener($scope);

  // This is called when an object is clicked on
  $scope.clicked_callback = function(id){
    $scope.$apply(function () {
      $scope.selected = id;
    });

    // Navigate
    objects = [];
    objects.push(x3dlink.links[id]);
    navigation.show_objects(objects); 

    navigation.navigate_to_object(x3dlink.links[id]);
    $scope.in_focus = id;

    $location.hash(id);
    $anchorScroll();
  }

  // Makes the input fields lose focus on Enter keypress
  $scope.blur_on_enter = function($event){
    if($event.keyCode == 13){
      $event.target.blur();
    }
  }

  $scope.gather = function(container, item){
    container.push(item);
    if(item['nodes']){
      var arrayLength = item['nodes'].length;
      for(var i=0; i<arrayLength; i++){
        $scope.gather(container, item['nodes'][i]);
      }
    }
  }

  $scope.show_object = function(item){
    container = [];
    $scope.gather(container, item);

	// TODO: Don't do this here
	var bboxmin = [0,0,0];
	var bboxmax = [0,0,0];
	var firstObject = true;

    objects = [];
    var length = container.length;
    for(var i=0; i<length; i++){
	  if (container[i].id in x3dlink.links)
	  {
		var domobj = x3dlink.links[container[i].id];
		objects.push(x3dlink.links[container[i].id]);

		if (domobj[0].hasAttribute("bboxcenter"))
		{
			var mat = domobj[0]._x3domNode.getCurrentTransform();                                                                                                                                                                      
			var min = x3dom.fields.SFVec3f.MAX();                                                                 
			var max = x3dom.fields.SFVec3f.MIN();                                                                                                                                                                          
			domobj[0]._x3domNode.getVolume().getBounds(min, max);                    
			
			min = mat.multMatrixPnt(min);                                                                         
			max = mat.multMatrixPnt(max);            

			if (firstObject) {
				bboxmin = [min.x, min.y, min.z];
				bboxmax = [max.x, max.y, max.z];
			} else {
				bboxmin[0] = Math.min(min.x, bboxmin[0]);
				bboxmin[1] = Math.min(min.y, bboxmin[1]);
				bboxmin[2] = Math.min(min.z, bboxmin[2]);
			
				bboxmax[0] = Math.max(max.x, bboxmax[0]);
				bboxmax[1] = Math.max(max.y, bboxmax[1]);
				bboxmax[2] = Math.max(max.z, bboxmax[2]);

				firstObject = false;
			}
		}
	  }
	}

	var bboxcenter = [0,0,0];

	bboxcenter[0] = (bboxmax[0] + bboxmin[0]) / 2;
	bboxcenter[1] = (bboxmax[1] + bboxmin[1]) / 2;
	bboxcenter[2] = (bboxmax[2] + bboxmin[2]) / 2;

	navigation.look_at(bboxcenter[0], bboxcenter[1], bboxcenter[2]);

    // navigation.show_object(x3dlink.links[item.id]); 
    navigation.show_objects(objects); 
  }

  // Instructs the x3dom runtime to zoom on an object
  $scope.navigate_to = function(item){
    if($scope.in_focus != item.id && item.visible){
      navigation.navigate_to_object(x3dlink.links[item.id]);
      $scope.in_focus = item.id;
    }
  }

  // Recursively computes the bids
  $scope.compute_bid = function(node){
    var bid = 0;
    if(node['nodes'] && node.linked){
      var arrayLength = node.nodes.length;
      for (var i = 0; i < arrayLength; i++) {
        // Use subtraction to avoid concatenting strings
        bid -= -$scope.compute_bid(node.nodes[i]);
      }
    }
    else{
      bid = node.bid;
    }
    return bid;
  } 

  // Return total bid
  $scope.compute_total = function(){
    var total = 0;

    var arrayLength = $scope.tree.nodes.length;
    for (var i = 0; i < arrayLength; i++) {
      // Use subtraction to avoid concatenting strings
      total -= -$scope.compute_bid($scope.tree.nodes[i]);
    }

    return total;
  }

  // Toggle the link capabilities for non-leaf nodes
  // Ie. when activated the bid will be equal to the sum
  // of the bid of the children
  // When disabled, the user can manually override the value
  $scope.toggle_link = function(item){
    var current = $scope.compute_bid(item);
    item.linked = !item.linked;
    if(!item.linked){
      item.bid = current;
    }
  }

  $scope.select_item = function(item){
    $scope.selected = item.id;
  }

  $scope.toggle_expand = function(item){
    item.expanded = !item.expanded;
  } 

  $scope.set_visible = function(item, visible){
    item.visible = visible;
    navigation.set_visible(x3dlink.links[item.id], item.visible);
    // Recurse on children
    if(item['nodes']){
      var length = item.nodes.length;
      for(var i = 0; i<length; i++){
        $scope.set_visible(item.nodes[i], visible);
      }
    }
  }

  $scope.toggle_visible = function(item){
    $scope.set_visible(item, !item.visible);
  }
}])
.filter('collapseTree', function(){

  matches_recursive = function(item, search){
    if(item['nodes']){
      var length = item['nodes'].length;
      for(var i=0; i<length; i++){
        var m = matches_recursive(item['nodes'][i], search);
        if(m){
          return true;
        }
      }
    }
    if(item.hasOwnProperty('name')){
      return item['name'].indexOf(search) > -1; 
    }

    return false;
  };

  matches_exactly = function(item, search){
    if(item.hasOwnProperty('name')){
      return item['name'].indexOf(search) > -1; 
    }
  }

  do_search = function(items, search){
    var filtered = [];

    if (!items)
      return [];

    var length = items.length;
    for(var i=0; i<length; i++){
      if(matches_recursive(items[i], search)){
        filtered.push(items[i]);
      }
      else{

      }
    }

    return filtered;
  }

  return do_search;

});
