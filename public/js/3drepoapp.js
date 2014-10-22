angular.module('3drepoapp', ['ui.event'])
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

  return o;
}])
.controller('TreeviewCtrl', ['$scope', 'tree', function($scope, tree){

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

  $scope.initialise_tree = function(o){
    var arrayLength = o.length;
    for (var i = 0; i < arrayLength; i++) {
        // Add needed fields
        o[i]['bid'] = 0;
        o[i]['expanded'] = false;
      }
  }

  //$scope.initialise_tree($scope.objs);
  //$scope.tree = $scope.objs;
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