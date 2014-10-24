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
  .state('scene', {
    url: '/scene',
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

  $urlRouterProvider.otherwise('scene');
}])
.factory('tree', ['$http', function($http){

  var o = {
    tree : [
      { 
        name: "Body", bid: 12, linked: true, expanded: true, nodes:[
          {
            name: "Left Leg", bid: 18, expanded: false
          },
          {
            name: "Right Leg", bid: 18, expanded: false
          },
          {
            name: "Left Arm", bid: 14,  linked: true, expanded: true, nodes:[
              {
                name: "Left Hand", bid: 17, linked: true, expanded: false, nodes:[
                  {
                    name: "Left Finger 1", bid: 1, expanded: false
                  },
                  {
                    name: "Left Finger 2", bid: 2, expanded: false
                  },
                  {
                    name: "Left Finger 3", bid: 1, expanded: false
                  },
                  {
                    name: "Left Finger 4", bid: 3, expanded: false
                  },
                  {
                    name: "Left Finger 5", bid: 5, expanded: false
                  },
                ]
              },
              {
                name: "Left Forearm", bid: 5, expanded: false
              },
            ]
          },
          {
            name: "Right Arm", bid: 14,  linked: true, expanded: true, nodes:[
              {
                name: "Right Hand", bid: 17, linked: true, expanded: false, nodes:[
                  {
                    name: "Right Finger 1", bid: 3, expanded: false
                  },
                  {
                    name: "Right Finger 2", bid: 4, expanded: false
                  },
                  {
                    name: "Right Finger 3", bid: 10, expanded: false
                  },
                  {
                    name: "Right Finger 4", bid: 0, expanded: false
                  },
                  {
                    name: "Right Finger 5", bid: 1, expanded: false
                  },
                ]
              },
              {
                name: "Right Forearm", bid: 7, expanded: false
              },
            ]
          },
      ]}
    ]
  }

  o.populate = function(node){
    obj = {};
    obj['id'] = node['uuid']
    obj['bid'] = node['bid'];
    if(node.hasOwnProperty('name')){
      obj['name'] = node['name'];
    }
    else{
      obj['name'] = node['uuid'].substring(0, 8) + "...";
    }
    if(node['nodes'] && node['nodes'].length > 0){
      obj['linked'] = true;
      var l = node['nodes'].length
      for(var i = 0; i < l; i++){
        obj['nodes'].push(o.populate(node['nodes'][i]));
      }
    }

    return obj;
  }

  o.initialise = function(name){
    console.log("Populating with " + name);
    return $http.get("/data/" + name + ".price.json").success(function(data){
      o.tree = [];
      var l = data.nodes.length;
      for(var i = 0; i < l; i++){
        o.tree.push(o.populate(data.nodes[i]));
      }
    });
  }

  return o;
}])
.controller('TreeviewCtrl', ['$scope', '$timeout', 'tree', 'X3DController', function($scope, $timeout, tree, X3DController){

  $scope.iconExpand = 'icon-plus  glyphicon glyphicon-plus  fa fa-plus';
  $scope.iconCollapse = 'icon-minus glyphicon glyphicon-minus fa fa-minus';
  $scope.iconLeaf = 'icon-file  glyphicon glyphicon-file  fa fa-file';
  $scope.iconLink = 'icon-file  glyphicon glyphicon-link  fa fa-link';
  $scope.total_bid = 0;

  $scope.objs = objs;
  $scope.selected_node = "";

  $timeout(function(){
    $scope.model = document.getElementById("model");
  });

  $scope.tree = tree.tree;

  $scope.blur_on_enter = function($event){
    if($event.keyCode == 13){
      $event.target.blur();
    }
  }

  $scope.initialise_navigation = function(){
  }
  $scope.initialise_navigation();

  $scope.$on('x3donclick', function()
	{
		console.log('Clicked on item' + x3dmessage.id);
	});

  $scope.navigate_to = function(item){
    console.log('Zooming on ' + item.id);

    // Here need to zoom on object like so
    // $scope.model.runtime.showObject(obj);

    // But for that it seems that we need the dom element...
    // and it seems that the following jquery doesnt work to show all objects with attribute DEF ?
    // console.log($('[DEF]').get());

    //$scope.model.runtime.showAll();
  }

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

  $scope.compute_total = function(){
    var total = 0;

    var arrayLength = $scope.tree.length;
    for (var i = 0; i < arrayLength; i++) {
      // Use subtraction to avoid concatenting strings
      total -= -$scope.compute_bid($scope.tree[i]);
    }

    return total;
  }

  $scope.update_total = function(){
    $scope.total_bid = $scope.compute_total();
  }

  $scope.deselect_all = function(node){
    node.selected = false;

    if(node['nodes']){
      var arrayLength = node.nodes.length;
      for (var i = 0; i < arrayLength; i++) {
        $scope.deselect_all(node.nodes[i]);
      }
    }
  }

  $scope.toggle_link = function(item){
    var current = $scope.compute_bid(item);
    item.linked = !item.linked;
    if(!item.linked){
      item.bid = current;
    }
  }

  $scope.select_item = function(item){
    $scope.selected = item.name;
  }

  $scope.toggle_expand = function(item){
    item.expanded = !item.expanded;
  }

  $scope.update_total();

}]);
