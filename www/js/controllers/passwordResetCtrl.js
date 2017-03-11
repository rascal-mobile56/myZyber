angular.module('zyber.controllers')
.controller("PasswordResetCtrl", 
	['$scope', '$ionicPopup', 'HomeService', '$rootScope', 'AuthService',
	function($scope, $ionicPopup, HomeService, $rootScope, AuthService){

		$scope.password = {};
		$scope.stopDeviceBack = false;
		$scope.loading = false;

		var alertPopup;

		$scope.cancel = function(){
			if($scope.loading) return;
			window.history.back();
		}

		$scope.updatePassword = function(){
			if($scope.loading) return;
			$scope.loading = true;
			if(!$scope.password.newpassword || !$scope.password.confirm
				|| $scope.password.newpassword == '' || $scope.password.confirm == ''){
				showPopup('All the fields are mandatory');
			}
			else if($scope.password.newpassword != $scope.password.confirm){
				showPopup('passwords do not match');
			}
			else {
				var user = AuthService.getUser();
				$scope.password.password = user.password;
				HomeService.updatePassword($scope.password).then(function(success){
					// console.log('password Change success', success);
					$scope.stopDeviceBack = true;
					$scope.loading = false;

					alertPopup = $ionicPopup.alert({
						title: '<center>Password successfully updated</center>',
						template: '<center>Please login again</center>',
						okType: 'button-positive'
					});

					alertPopup.then(function(){
						$scope.stopDeviceBack = false;
						$rootScope.logout();
					});
				},
				function(error){
					// console.log('password Change error', error);
					if(error.status == 500){
						showPopup(error.data.firstError.message);
					}
					else{
						showPopup(error.data.firstError.userMessage);
					}
				});
			}			
		}

		var showPopup = function(message){
			$scope.stopDeviceBack = true;
			$scope.loading = false;
			alertPopup = $ionicPopup.alert({
				title: 'Password Change Error',
				template: '<center>' + message + '</center>',
				okType: 'button-positive'
			});

			alertPopup.then(function(){
				$scope.stopDeviceBack = false;
			});
		}

		setTimeout(function(){
			var deviceBackListener = $scope.$on('deviceBackAction', function(){
				var currentLocation = window.location.hash.split('#')[1].split('/')[1];
				if(currentLocation == 'reset-passwd'){
					if($scope.stopDeviceBack){}
					else {
						$rootScope.exitApp(true);
					}
				}				
			});
			
			var deviceOfflineListener = $scope.$on('deviceOffline', function(){
				alertPopup.close();
			});

			$scope.$on('$destroy', function(){
				deviceBackListener();
				deviceOfflineListener();
			});
		}, 10);
	}
]);