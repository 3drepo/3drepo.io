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
	obj['nodes'] = [];

    if(node.hasOwnProperty('name')){
      obj['name'] = node['name'];
    }
    else{
      obj['name'] = node['uuid'].substring(0, 8) + "...";
    }

    if(node['nodes'] && (node['nodes'].length > 0)){
      obj['linked'] = true;
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

  // // Example tree
  // var o = {
  //   tree : {
  //   nodes: [
  //     { 
  //       name: "Body", id: "Body", visible: true, bid: 12, linked: true, expanded: true, nodes:[
  //         {
  //           name: "Left Leg", id: "Left Leg", visible: true, bid: 18, expanded: false
  //         },
  //         {
  //           name: "Right Leg", id: "Right Leg", visible: true, bid: 18, expanded: false
  //         },
  //         {
  //           name: "Left Arm", id: "Left Arm", visible: true, bid: 14,  linked: true, expanded: true, nodes:[
  //             {
  //               name: "Left Hand", id: "Left Hand", visible: true, bid: 17, linked: true, expanded: false, nodes:[
  //                 {
  //                   name: "Left Finger 1", id: "Left Finger 1", visible: true, bid: 1, expanded: false
  //                 },
  //                 {
  //                   name: "Left Finger 2", id: "Left Finger 2", visible: true, bid: 2, expanded: false
  //                 },
  //                 {
  //                   name: "Left Finger 3", id: "Left Finger 3", visible: true, bid: 1, expanded: false
  //                 },
  //                 {
  //                   name: "Left Finger 4", id: "Left Finger 4", visible: true, bid: 3, expanded: false
  //                 },
  //                 {
  //                   name: "Left Finger 5", id: "Left Finger 5", visible: true, bid: 5, expanded: false
  //                 },
  //               ]
  //             },
  //             {
  //               name: "Left Forearm", id: "Left Forearm", visible: true, bid: 5, expanded: false
  //             },
  //           ]
  //         },
  //         {
  //           name: "Right Arm", id: "Right Arm", visible: true, bid: 14,  linked: true, expanded: true, nodes:[
  //             {
  //               name: "Right Hand", id: "Right Hand", visible: true, bid: 17, linked: true, expanded: false, nodes:[
  //                 {
  //                   name: "Right Finger 1", id: "Right Finger 1", visible: true, bid: 3, expanded: false
  //                 },
  //                 {
  //                   name: "Right Finger 2", id: "Right Finger 2", visible: true, bid: 4, expanded: false
  //                 },
  //                 {
  //                   name: "Right Finger 3", id: "Right Finger 3", visible: true, bid: 10, expanded: false
  //                 },
  //                 {
  //                   name: "Right Finger 4", id: "Right Finger 4", visible: true, bid: 0, expanded: false
  //                 },
  //                 {
  //                   name: "Right Finger 5", id: "Right Finger 5", visible: true, bid: 1, expanded: false
  //                 },
  //               ]
  //             },
  //             {
  //               name: "Right Forearm", id: "Right Forearm", visible: true, bid: 7, expanded: false
  //             },
  //           ]
  //       }]
  //     }
  //   ]}
  // }

  return o;
}])
.controller('ColumnviewCtrl', ['$scope', 'tree', 'x3dlink', 'navigation', '$location', '$anchorScroll', function($scope, tree, x3dlink, navigation, $location, $anchorScroll){

  // Controller that defines the treeview

  $scope.iconExpand = 'icon-plus  glyphicon glyphicon-plus  fa fa-plus';
  $scope.iconCollapse = 'icon-minus glyphicon glyphicon-minus fa fa-minus';
  $scope.iconLeaf = 'icon-file  glyphicon glyphicon-file  fa fa-file';
  $scope.iconNode = 'icon-file  glyphicon glyphicon-folder-open  fa fa-file';
  $scope.iconBack = 'icon-file  glyphicon glyphicon-arrow-left  fa fa-file';
  $scope.iconLink = 'icon-file  glyphicon glyphicon-link  fa fa-link';
  $scope.iconVisible = 'icon-file  glyphicon glyphicon-eye-open  fa fa-link';
  $scope.iconHidden = 'icon-file  glyphicon glyphicon-eye-close  fa fa-link';
  $scope.iconSearch = 'icon-file  glyphicon glyphicon-search  fa fa-link';
  $scope.iconRemove = 'icon-file  glyphicon glyphicon-remove  fa fa-link';

  $scope.tree = tree.tree;
  $scope.selected_node = "";
  $scope.in_focus = "";

  $scope.element = tree.tree;

  $scope.stack = [];
  $scope.search = "";

  // Register as a listener so that we pick up the 
  // object click events
  x3dlink.add_listener($scope);

  $scope.clear_search = function(){
    $scope.search = "";
  }

  $scope.go_inside = function(item){
    if(item['nodes']){
      $scope.stack.push($scope.element);
      $scope.element = item;
      $scope.clear_search();
    }
  }

  $scope.go_outside = function(){
    $scope.element = $scope.stack[$scope.stack.length-1];
    $scope.stack.pop();
    $scope.clear_search();
  }

  // This is called when an object is clicked on
  $scope.clicked_callback = function(id){
    $scope.$apply(function () {
      $scope.selected = id;
    });
    // Navigate
    navigation.show_object(x3dlink.links[id]);
    $scope.in_focus = id;

    // $location.hash(id);
    // $anchorScroll();
  }

  // Makes the input fields lose focus on Enter keypress
  $scope.blur_on_enter = function($event){
    if($event.keyCode == 13){
      $event.target.blur();
    }
  }

  // Instructs the x3dom runtime to zoom on an object
  $scope.navigate_to = function(item){
    if($scope.in_focus != item.id && item.visible){
      navigation.show_object(x3dlink.links[item.id]);
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

  $scope.toggle_visible = function(item){
    item.visible = !item.visible;
    navigation.set_visible(x3dlink.links[item.id], item.visible);
    // Recurse on children
    if(item['nodes']){
      var length = item.nodes.length;
      for(var i = 0; i<length; i++){
        $scope.toggle_visible(item.nodes[i]);
      }
    }
  }
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

  // Register as a listener so that we pick up the 
  // object click events
  x3dlink.add_listener($scope);

  // This is called when an object is clicked on
  $scope.clicked_callback = function(id, event){
    $scope.$apply(function () {
      $scope.selected = id;
    });
    // Navigate
    navigation.show_object(x3dlink.links[id]);
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

  // Instructs the x3dom runtime to zoom on an object
  $scope.navigate_to = function(item){
    if($scope.in_focus != item.id && item.visible){
      navigation.show_object(x3dlink.links[item.id]);
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

    var arrayLength = $scope.tree.length;
    for (var i = 0; i < arrayLength; i++) {
      // Use subtraction to avoid concatenting strings
      total -= -$scope.compute_bid($scope.tree[i]);
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

  $scope.toggle_visible = function(item){
    item.visible = !item.visible;
    navigation.set_visible(x3dlink.links[item.id], item.visible);
    // Recurse on children
    if(item['nodes']){
      var length = item.nodes.length;
      for(var i = 0; i<length; i++){
        $scope.toggle_visible(item.nodes[i]);
      }
    }
  }
}]);
