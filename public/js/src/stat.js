function StatCtrl($scope) {

  $scope.metrics = [];
  $scope.logs = [];

  var socket = io.connect(); 

  socket.on('connect', function () { 
        console.log('connect');
        socket.emit('auth',0)

    });

  socket.on('log', function (data) {  
    console.log('  >'+data+'<br>');

    $scope.$apply(function(){
          $scope.logs.unshift(data);
          $scope.logs.splice(7,1);
        });

  });
  
   socket.on('metric', function (data) { 
       $scope.$apply(function(){
          $scope.metrics[data.key] = data.val;
        });
    });

}

StatCtrl.$inject = ['$scope'];