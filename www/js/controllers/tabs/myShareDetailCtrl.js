angular.module('zyber.controllers')
.controller('MyShareDetailCtrl', 
	['$scope', '$stateParams', 'HomeService', 'viewerKey','$timeout',
	 'mimeTypes', '_', '$ionicLoading', '$window', '$cordovaFileTransfer',
	 'hostKey', '$localstorage', '$cordovaToast', '$q', '$ionicModal',
	 'DownloadManager', '$ionicPopup', '$ionicPopover','$ionicPlatform',
	 '$cordovaStatusbar', 'AuthService', 'downloadFolder', '$rootScope',
	 'FileService', '$translate','$ionicHistory',
	function($scope, $stateParams, HomeService, viewerKey, $timeout,
		mimeTypes, _, $ionicLoading, $window, $cordovaFileTransfer, 
		hostKey, $localstorage, $cordovaToast, $q, $ionicModal, 
		DownloadManager, $ionicPopup, $ionicPopover, $ionicPlatform, 
		$cordovaStatusbar, AuthService, downloadFolder, $rootScope,
		FileService, $translate, $ionicHistory) {

		$scope.fileId = $stateParams.fileId;
		$scope.file = {};
		//$scope.fileActivity = [];
		$scope.showFileIcon = true;
		$scope.viewerUrl = $localstorage.get(viewerKey);
		$scope.host = $window.localStorage[hostKey];
		$scope.authKey = null;
		$scope.pageTitle = "My Shares <br /><small>"+$scope.host+"</small>";
		
		var alertPopup;

		var fileObject = function(file){
			this.file = file;
			this.size = 0;
			this.downloaded = false;
			this.targetPath = '';
			this.loaded = 0;
			this.rootFolder = null;
			this.cancelDownload = false;
		};

		$ionicPlatform.ready(function() {
			if (window.cordova && window.StatusBar) {
				$cordovaStatusbar.styleHex('#017aff');
			}
		});

		$ionicPopover.fromTemplateUrl('templates/partials/top-menu.html', {
			scope: $scope
		}).then(function(popover) {
			$scope.popover = popover;
		});

		$ionicPopover.fromTemplateUrl('templates/partials/fab-menu.html', {
			scope: $scope
		}).then(function(popover) {
			$scope.fab_menu = popover;
		});
		
		$scope.isAdded = false;
		$scope.isDeleted = false;

		$scope.form = {
			shares : [],
			email : null,
			addEmail : function() {
				if(!$scope.form.email) {
                    console.log('Empty Email');
					$ionicPopup.alert({
						title: 'Error!',
						template: '<center>Please enter an email</center>',
						okType: 'button-assertive'
					});
					return false;
				}
				var exist = _.findIndex($scope.form.shares, function(x) { return x.email === $scope.form.email; });
				if(exist != -1) {
                    console.log('Email already added');
					$ionicPopup.alert({
						title: 'Error!',
						template: '<center>Email already added</center>',
						okType: 'button-assertive'
					});
					return false;
				}
				var newEmail = [];
				
				newEmail.push($scope.form.email);
				$scope.saving = true;
                console.log($scope.form.email);
				HomeService.shareFile($scope.fileid, newEmail).then(function(data) {
					//$scope.loadShares($stateParams.fileId);
					//$scope.isAdded = true;
                    console.log(data);
					$scope.form.shares.unshift({email: $scope.form.email, isAdded : true});
					$scope.saving = false; 
					
					setEmailObject($scope.form.email);
					$scope.form.email = null;
				}, function(error) {
					$scope.saving = false; 
					//$scope.form.email = null;
                    console.log(error);
					var userMessage = error.data.firstError.userMessage;
					$ionicPopup.alert({
						title: 'Error!',
						template: '<center>'+userMessage+'</center>',
						okType: 'button-assertive'
					});
				});
				
				
			},
			remove : function($index) {
				var shareObj;
				if($scope.form.shares[$index] != 'undefined') {
					shareObj = $scope.form.shares[$index];
					$scope.form.shares[$index]['isDeleted'] = true;
					if(shareObj.shareId != 'undefined' && shareObj.shareId ) {
						//$scope.loading = true;
                        $timeout(function() {

                            HomeService.removeShare(shareObj.shareId).then(function (data) {

                                console.log(data);
                                // var alertPopup = $ionicPopup.alert({
                                //     	title: 'My zyber share',
                                //     	template: data.data.response
                                //   	});
                                $scope.form.shares.splice($index, 1);
                                // alertPopup.then(function(res) {
                                // 	console.log('Thank you for not eating my delicious ice cream cone');
                                // });

                            }, function (error) {

                                console.log(error);
                                $ionicPopup.alert({
                                    title: 'Error!',
                                    template: '<center>Unanble to unshare</center>',
                                    okType: 'button-assertive'
                                });
                            });
                        },2000);
					} else {
						console.log('just remove the item');
						$scope.form.shares.splice($index, 1);		
					}


				}
			}
		}

		function usersToString(theUsers) {
			return _.map(theUsers, function (i) {
				return i.userEmail;
			}).join();
		}

		$scope.getPermissions = function(path){
			return HomeService.getPermissions(path)
			.then(function(data){
				$scope.canDownload = data.data.response.download;
			},
			function(error){
				console.log('getPermissions error', error);
			});
		}

		$scope.loadFile = function(fileId){
			// getPermissions(fileId);
			return HomeService.getFile(fileId).then(function(data){
				//$scope.file = FileService.getFileIcon(data.data.response);
                    console.log(data);
                    console.log(data.data);
				$scope.file = data.data.response;
				$scope.fileid = $scope.file.uuid;
				$scope.pageTitle = data.data.response.name+" <br /><small>"+$scope.host+"</small>";
				// $scope.showFileIcon = _.contains(mimeTypes.groupDocTypes, $scope.file.mimeType);
				// if($scope.file.mimeType.substr(0,5) == 'image'){
				// 	$scope.file.fileType = 'image';
				// 	$scope.canPreview = true;
				// 	$scope.showFileIcon = false;
				// 	getImageForPreview();
				// }
				// else 
				if(_.contains(mimeTypes.groupDocTypes, $scope.file.mimeType)){
					$scope.file.fileType = 'document';
					$scope.canPreview = true;
				}
				else if($scope.file.mimeType == 'application/octet-stream'){
					switch ($scope.file.name.substr($scope.file.name.length - 3)){
						case '.ts':
						case 'rtx':
						case 'ota':
							$scope.canPreview = true;
							setToken();
							break;
					}
				}
				else if(ionic.Platform.isAndroid()){
					if(_.contains(mimeTypes.audioTypesAndroid, $scope.file.mimeType)){
						$scope.file.fileType = 'audio';
						$scope.canPreview = true;
						setToken();
					}
					else if(_.contains(mimeTypes.videoTypesAndroid, $scope.file.mimeType)){
						$scope.canPreview = true;
						setToken();
					}
				}
				else if(ionic.Platform.isIOS()){
					if(_.contains(mimeTypes.audioTypesIOS, $scope.file.mimeType)){
						$scope.file.fileType = 'audio';
						$scope.canPreview = true;
						setToken();
					}
					else if(_.contains(mimeTypes.videoTypesIOS, $scope.file.mimeType)){
						$scope.canPreview = true;
						setToken();
					}
				}
				//$scope.loadFilePreview();
			},
			function(error){
				console.error("Error retrieving file information");
				console.error(error);
				if(error.status == 403){
					$translate(['error', 'ok']).then(function(translations){
						alertPopup = $ionicPopup.alert({
							title: '<b>' + translations['error'] + '!</b>',
							template: error.data.firstError.userMessage,
							okType: 'button-assertive',
							okText: translations['ok']
						});
						alertPopup.then(function(){
							$rootScope.clearHistory();
							window.location = '#/shares/';
						});
					});
				}
			});
		}
		
		var setToken = function(){
			var token = AuthService.getToken();
			if(token){
				$scope.authKey = token.substr(6).trim();
			}
		}

		// var getImageForPreview = function(){
		// 	HomeService.getFilePreview($scope.fileId)
		// 	.then(function(response){
		// 		var URL = $window.URL || $window.webkitURL;
		// 		$scope.previewFile = URL.createObjectURL(response.data);
		//         $scope.previewLoading = false;
		//         // $scope.$apply();
		// 		// $scope.showFileIcon = false;
		// 	});
		// }
		
		$scope.loadShares = function(fileId){
			return HomeService.getSharedFiles(fileId, false).then(function(data){
				$scope.form.shares = data.data.response;
			}).catch(function(err) {
				console.log("Error loading activity: ", err);
				$scope.fileActivity = [];
				if(err.status == 403){
					$scope.fileActivityError = true;
					$scope.fileActivityErrorMsg = err.data.firstError.userMessage;
				}
				return Promise.resolve();
			});
		}
		
		$scope.loadPartials =  function(path){
			return HomeService.getBreadcrumb(path)
				.success(function(data){
					$scope.partials = data.response;
					$scope.location = $scope.partials[0].name;
					for(var i=1; i<$scope.partials.length-1; i++){
						$scope.location = $scope.location + ' / ' + $scope.partials[i].name;
					}
				});
		}
		
		
		$scope.loading = true;

		//TODO deal with errors when some promise fail
		$q.all([$scope.loadFile($stateParams.fileId),
		 		$scope.loadShares($stateParams.fileId), 
		 		$scope.loadPartials($stateParams.fileId),
		 		$scope.getPermissions($stateParams.fileId)
		]).then(function(){
			$scope.loading = false;
			//$scope.showFile($scope.file);
		});

		$scope.back = function(){
			var currentLocation = window.location.hash.split('#')[1].split('/')[1];
			if(currentLocation == 'details'){
				$window.history.back();
			}
		}

		
		var deviceBackListener = $scope.$on('deviceBackAction', function(){
			var currentLocation = window.location.hash.split('#')[1].split('/')[1];
			if(currentLocation == 'details'){
				if($scope.imagePreviewModal && $scope.imagePreviewModal.isShown())
					$scope.cancel();
				else{
					$scope.fab_menu.hide();
					$scope.back();
				}
			}
		});

		var deviceOfflineListener = $scope.$on('deviceOffline', function(){
			$scope.popover.hide();
			$scope.fab_menu.hide();
			alertPopup.close();
		});

		$scope.$on('$destroy', function(){
			deviceBackListener();
			deviceOfflineListener();
			$scope.popover.remove();
			$scope.fab_menu.remove();
		});

		$scope.myGoBack = function() {
			$ionicHistory.goBack();
		};

		var setEmailObject = function(newEmail){
			var newEmail = newEmail;
			HomeService.getSharedFiles($scope.fileId, false).then(function(data){
				var requiredObject = _.find(data.data.response, function(obj){
					return obj.email == newEmail;
				});
				$scope.form.shares[0].shareId = requiredObject.shareId;
			}).catch(function(err) {
				console.log("Error in getting shares: ", err);
			});
		};
	}

]);