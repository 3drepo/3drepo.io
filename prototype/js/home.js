angular.module('3drepo', [])
.controller('DashboardCtrl', ['$scope', '$http', function($scope, $http){

  $scope.view = "dashboard";

  $scope.setView = function(view){
    $scope.view = view;
  }

  $scope.isView = function(view){
    return $scope.view == view;
  }

}]);