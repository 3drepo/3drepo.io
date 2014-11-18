angular.module('3drepo', [])
.controller('MenuCtrl', ['$scope', '$http', function($scope, $http){

  $scope.view = "readme";

  $scope.setView = function(view){
    $scope.view = view;
  }

}]);