angular.module('zyber.controllers')
.controller("TwoFactorAuthCtrl", 
	['$scope', 'HomeService', 'AuthService', '$translate', '$ionicPlatform', '$cordovaStatusbar', '$window', 'hostKey','$localstorage',
	function($scope, HomeService, AuthService, $translate, $ionicPlatform, $cordovaStatusbar, $window, hostKey, $localstorage) {

		$scope.smsCode = {};
		$scope.SMSSent = false;
		$scope.showWaiting = false;
		$scope.showError = false;
		$scope.errorMessage = '';
		$scope.sendingSMS = false;

		$ionicPlatform.ready(function() {
			if (window.cordova && window.cordova.plugins) {
				$cordovaStatusbar.styleHex('#017aff');
			}
		});
		var host = $window.localStorage[hostKey];
		$scope.pageTitle = "Two factor<br /><small>"+host+"</small>";
		
		$translate(['twoFactor']).then(function(translations){
			setTimeout(function(translations){
				$scope.pageTitle = translations['twoFactor'] + "<br /><small>"+host+"</small>";
			},500);			
		});	
		
		$scope.sendSMS = function(){
			if($scope.sendingSMS || $scope.showWaiting)
				return;
			$scope.showError = false;
			$scope.sendingSMS = true;
			HomeService.resendSMS().then(function(success){
				$scope.sendingSMS = false;
				$scope.SMSSent = true;
				setTimeout(function(){
					$scope.SMSSent = false;
				},2000);
			},
			function(error){
				$scope.sendingSMS = false;
				$scope.errorMessage = 'Error in sending SMS';
				$scope.showError = true;
			});
		}

		$scope.verifyCode = function(){
			if($scope.showWaiting)
				return;
			$scope.showError = false;
			$scope.SMSSent = false;
			$scope.showWaiting = true;
			HomeService.phoneConfirmation($scope.smsCode).then(function(success){
				$translate.refresh().then(function(){
					// $scope.showWaiting = false;
					// var skipIntro = $localstorage.get('skipIntro');
					// if(skipIntro)
					// 	window.location = '#/my-file/hide';
					// else
					window.location = '#/my-file/hide';
				});
			},
			function(error){
				$scope.showWaiting = false;
				if(error.status == 401){
					$scope.errorMessage = 'Invalid code entered';	
				}
				else{
					$scope.errorMessage = 'Error in verifying code';
				}
				$scope.showError = true;
			});
		}

		$scope.sendSMS();
	}
]);