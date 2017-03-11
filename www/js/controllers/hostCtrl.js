angular.module('zyber.controllers')
.controller("HostCtrl", 
	['$scope', '$localstorage', 'hostKey', '$location', 'userKey', '$window',
	 '$ionicPopup', '$stateParams', 'HomeService','$ionicPlatform','serverKey',
	 '$cordovaStatusbar', '$rootScope', 'AuthService',
	 'DownloadManager',
	function($scope, $localstorage, hostKey, $location, userKey, $window,
		$ionicPopup, $stateParams, HomeService, $ionicPlatform, serverKey,
		$cordovaStatusbar, $rootScope, AuthService,
		DownloadManager){


		$scope.showSub = ($stateParams.name == 'show');
		$scope.loading = false;
		var popupShown;
		//removing the preceding https://
		var host = $localstorage.get(hostKey);


		if(host){
            //var n = parseInt(host.length);
            //console.log("number length:"+ n);
			$scope.settings = {hostname: host};
            console.log(JSON.stringify($scope.settings));
		}
		else {
            $scope.settings = {hostname: ''};
            console.log(JSON.stringify($scope.settings));
        }
		var canShowPopup = true;

		$ionicPlatform.ready(function() {
			if (window.cordova && window.cordova.plugins) {
				$cordovaStatusbar.styleHex('#017aff');
			}
		});


        ////Resetting Host
		//$scope.resetHost = function(){
		//	if($scope.loading) return;
		//	$scope.settings.hostname = '';
		//}

        //Saving Host
		$scope.saveSettings = function(){
			if($scope.loading) return;
			var downloadCompleted = DownloadManager.isEmpty();
			if(downloadCompleted){
				saveHost();
			}
			else {
				popupShown = $ionicPopup.confirm({
					title: '<center>Change Host</center>',
					template: '<center>Download in progress will be aborted. <br>Are you sure?</center>'
				});

				popupShown.then(function(res) {
					if(res) {
						saveHost();
					}
				});
			}
		}

		var saveHost = function(){	
			$scope.loading = true;	
			var withSchema = /\S+\.\S+/;
			if($scope.settings.hostname && $scope.settings.hostname.trim() !== ""){
				if(withSchema.test($scope.settings.hostname)){
					//var enteredHost = 'https://' + $scope.settings.hostname.trim().toLowerCase()+'.zyber.com';
                    var enteredHost = 'https://' + $scope.settings.hostname.trim().toLowerCase();
					HomeService.checkHost(enteredHost).then(function(response){

                        $localstorage.set(serverKey, $scope.settings.hostname.trim().toLowerCase());

						$window.localStorage[hostKey] = enteredHost;
                        console.log(enteredHost);

						// $localstorage.remove(userKey);
						// $window.sessionStorage.removeItem("token");
						// AuthService.resetUser();
						$location.url('/login');
						$scope.loading = false;
						//$rootScope.logout();
					}, function(response){
						if(response.status == 0){
							$scope.showPopup('Host name provided is not reachable');

                            //$location.url('/settings');
                            $scope.loading = false;
					    }
					    else if(response.status != -1){
					    	$scope.showPopup('Host name provided is not responding, please try again later');
					    }
					    else //-1 error - offline
							$scope.loading = false;
					});
				}
				else{
					$scope.showPopup("Hostname entered is incorrect");
				}					
			}
			else{
				$scope.showPopup('Host is required');
			}
		}



		$scope.showPopup = function(message){
			$scope.loading = false;
			if(canShowPopup){
				canShowPopup = false;
				popupShown = $ionicPopup.alert({
		            template: message,
		            okType: 'button-positive'
		        });
		        popupShown.then(function(){
		        	canShowPopup = true;
		        });
		    }
		}


		var deviceBackListener = $scope.$on('deviceBackAction', function(){
			var currentLocation = window.location.hash.split('#')[1].split('/')[1];
			if(currentLocation == 'settings'){
				if($scope.showSub){
					$scope.showSub = false;
					$scope.loading = false;
					$window.history.back();
				}
				else{
					$rootScope.exitApp(true);
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

        $scope.myGoBack = function(backCount) {
            $ionicHistory.goBack(backCount);
        };
	}
]);