angular.module('zyber.controllers')
.controller("PasswordChangeCtrl", 
	['$scope', '$ionicPopup', 'HomeService', '$rootScope', 'DownloadManager', '$translate','$window','hostKey', '$ionicHistory',
	function($scope, $ionicPopup, HomeService, $rootScope, DownloadManager, $translate, $window, hostKey, $ionicHistory){

		$scope.password = {};
		$scope.stopDeviceBack = false;
		$scope.loading = false;
		$scope.pageTitle = null;
		var popupShown;
		$scope.cancel = function(){
			if($scope.loading) return;
			// window.history.back();
			$ionicHistory.goBack();
		}
		var host = $window.localStorage[hostKey];
		$scope.pageTitle = "Change Password<br /><small>"+host+"</small>";
		
		$translate(['change.password']).then(function(translations){
			setTimeout(function(translations){
				$scope.pageTitle = translations['change.password'] + "<br /><small>"+host+"</small>";
			},500);			
		});		
		
		$scope.changePassword = function(){
			if($scope.loading) return;
			$scope.loading = true;
			$scope.stopDeviceBack = true;
			if(!$scope.password.password || !$scope.password.newpassword || !$scope.password.confirm
				|| $scope.password.password == '' || $scope.password.newpassword == '' || $scope.password.confirm == ''){
				$translate(['require_all']).then(function(translations){
					showPopup(translations['require_all']);
				});
			}
			else if($scope.password.newpassword != $scope.password.confirm){
				$translate(['password.compareTo']).then(function(translations){
					showPopup(translations['password.compareTo']);
				});
			}
			else {
				HomeService.changePassword($scope.password).then(function(success){
					// console.log('password Change success', success);
					$scope.loading = false;
					$translate(['password_update_success', 'login_again', 'ok']).then(function(translations){
						popupShown = $ionicPopup.alert({
							title: '<center>' + translations['password_update_success'] + '</center>',
							template: '<center>' + translations['login_again'] + '</center>',
							okType: 'button-positive',
							okText: translations['ok']
						});

						popupShown.then(function(){
							$scope.stopDeviceBack = false;
							$rootScope.logout();
						});
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
			$translate(['password_change_error', 'ok']).then(function(translations){
				popupShown = $ionicPopup.alert({
					title: translations['password_change_error'],
					template: '<center>' + message + '</center>',
					okType: 'button-positive',
					okText: translations['ok']
				});

				popupShown.then(function(){
					$scope.stopDeviceBack = false;
				});
			});
		}

		var downloadAlert = function(){
			var downloadCompleted = DownloadManager.isEmpty();
			if(!downloadCompleted){
				$translate(['change.password', 'download_abort', 'are_you_sure', 'ok', 'cancel']).then(function(translations){
					popupShown = $ionicPopup.confirm({
						title: '<center>' + translations['change.password'] + '</center>',
						template: '<center>' + translations['download_abort'] + '. <br>' + translations['are_you_sure'] + '?</center>',
						okText: translations['ok'],
						cancelText: translations['cancel']
					});  			
					
					popupShown.then(function(res) {
						if(!res) {
							$scope.cancel();
						}
					});
				});
			}
		}

		downloadAlert();

		setTimeout(function(){
			var deviceBackListener = $scope.$on('deviceBackAction', function(){
				var currentLocation = window.location.hash.split('#')[1].split('/')[1];
				if(currentLocation == 'change-passwd'){
					if($scope.stopDeviceBack){}
					else {
						window.history.back();
					}
				}				
			});
			
			var deviceOfflineListener = $scope.$on('deviceOffline', function(){
				popupShown.close();
			});

			$scope.$on('$destroy', function(){
				deviceBackListener();
				deviceOfflineListener();
			});
		}, 10);
	}
]);