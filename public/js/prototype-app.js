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

angular.module('prototype', ['ui.event', 'ui.router'])
.config(['$stateProvider', '$urlRouterProvider',  function($stateProvider, $urlRouterProvider) {

  $stateProvider
  .state('home', {
    url: '/home',
    templateUrl: 'home.html',
    controller: 'HomeCtrl',
    resolve: {
      dbPromise: ['$stateParams', 'databases', function($stateParams, databases) {
        return databases.getAll();
      }]
    }
  })
  .state('view', {
    url: '/view/{id}',
    templateUrl: 'view.html',
    controller: 'ViewCtrl',
  });

  $urlRouterProvider.otherwise('home');
}])
.factory('databases', ['$http', function($http){

  var o = {
    databases:[
    ]
  };

  o.getAll = function() {
    return $http.get('/dblist').success(function(data){
      angular.copy(data, o.databases);
    });
  };

  return o;
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
    // tree : [
    // ]
  }

  o.populateNode = function(node, data){
    // console.log(data);
  }

  o.populate = function(data){
    o.tree = [];
    var obj = {name: data.mRootNode.name, id: data.mRootNode.id, bid: 0, expanded: false, nodes: []};
    o.tree.push(obj);
    // console.log(o.tree);
    var l = data.mRootNode.children.length;
    for(var i = 0; i < l; i++){
      o.populateNode(obj, data.mRootNode.children[i]);
    }
  }

  o.initialise = function(name){
    // console.log("Populating with " + name);
    // return $http.get("/data/" + name + ".price.json").success(function(data){
    //   console.log(data);
    //   o.populate(data);
    // });
  }

  return o;
}])
.controller('HomeCtrl', ['$scope', 'databases', function($scope, databases){
  $scope.databases = databases.databases;
}])
.controller('ViewCtrl', ['$scope', function($scope){

}])
.controller('TreeviewCtrl', ['$scope', '$timeout', 'tree', function($scope, $timeout, tree){

  $scope.iconExpand = 'icon-plus  glyphicon glyphicon-plus  fa fa-plus';
  $scope.iconCollapse = 'icon-minus glyphicon glyphicon-minus fa fa-minus';
  $scope.iconLeaf = 'icon-file  glyphicon glyphicon-file  fa fa-file';
  $scope.iconLink = 'icon-file  glyphicon glyphicon-link  fa fa-link';
  $scope.total_bid = 0;

  $scope.objs = objs;
  $scope.selected_node = "";

  // Behaviour.picked = function(item){
  //   console.log('Picked item: ');
  //   console.log(item);
  //   console.log('Need to extract def field and highlight');
  // }

  $timeout(function(){
    $scope.model = document.getElementById("model");
  });

  $scope.initialise_tree = function(o){
    var arrayLength = o.length;
    for (var i = 0; i < arrayLength; i++) {
        // Add needed fields
        o[i]['bid'] = 0;
        o[i]['expanded'] = false;
      }
  }

  $scope.tree = tree.tree;

  $scope.blur_on_enter = function($event){
    if($event.keyCode == 13){
      $event.target.blur();
    }
  }

  $scope.initialise_navigation = function(){
  }
  $scope.initialise_navigation();

  $scope.navigate_to = function(item){
    console.log('Here add navigation to the XML element named ' + item.name)
    //$scope.model.runtime.showObject("519829fc-faf3-4a81-a3ab-65089644578c");
    $scope.model.runtime.showAll();
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