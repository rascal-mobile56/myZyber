angular.module('zyber.controllers')
.controller("CreateFolderCtrl", 
    [ '$scope', '$stateParams', 'HomeService', 'viewerKey',
     'mimeTypes', '_', '$ionicLoading', '$window', '$cordovaFileTransfer',
     'hostKey', '$localstorage', '$cordovaToast', '$q', '$ionicModal',
     'DownloadManager', '$ionicPopup', '$ionicPopover','$ionicPlatform',
     '$cordovaStatusbar', 'AuthService', 'downloadFolder', '$translate', '$ionicHistory',
    function($scope, $stateParams, HomeService, viewerKey, 
        mimeTypes, _, $ionicLoading, $window, $cordovaFileTransfer, 
        hostKey, $localstorage, $cordovaToast, $q, $ionicModal, 
        DownloadManager, $ionicPopup, $ionicPopover, $ionicPlatform, 
        $cordovaStatusbar, AuthService, downloadFolder, $translate, $ionicHistory){

        $scope.fileId = $stateParams.fileId;
        $scope.folder = {};
        $scope.loading = false;
        $scope.stopDeviceBack = false;
        $scope.host = $localstorage.get(hostKey);
        
        var alertPopup;

        $scope.cancel = function() {
            window.history.back();
        };

        $scope.doCreateFolder = function(name){
            $scope.stopDeviceBack = true;
            if(!name || name.trim() == ''){
                $translate(['error', 'name_required_create_folder', 'ok']).then(function(translations){
                    alertPopup = $ionicPopup.alert({
                        title: translations['error'] + '!',
                        template: translations['name_required_create_folder'] + '.',
                        okType: 'button-assertive',
                        okText: translations['ok']
                    });
                    alertPopup.then(function(){
                        $scope.stopDeviceBack = false;
                    });
                });
            }
            else{
                $scope.loading = true;
                HomeService.createFolder($scope.fileId, name)
                .then(function(data){
                    if(data){
                        $scope.loading = false;
                        $translate(['ok']).then(function(translations){
                            alertPopup = $ionicPopup.alert({
                                template: '<center>' + data.data.response.message + '</center>',
                                okText: translations['ok']
                            });
                            alertPopup.then(function(){
                                $scope.stopDeviceBack = false;
                                //window.history.back();
                                $ionicHistory.goBack();
                            });
                        });
                    }
                    // IonicClosePopupService.register(alertPopup);
                },
                function(data, status, header, config) {
                    $scope.loading = false;
                    if(data.status == -1){
                        $scope.stopDeviceBack = false;
                        $scope.cancel();
                    }
                    else{
                        // console.log("Error in creating folder: ", data);
                        $translate(['ok']).then(function(translations){
                            alertPopup = $ionicPopup.alert({
                                template: '<center>' + data.data.firstError.userMessage + '</center>',
                                okType: 'button-assertive',
                                okText: translations['ok']
                            });
                            alertPopup.then(function(){
                                $scope.stopDeviceBack = false;
                            });
                        });
                    }
                });
            }
        };

        setTimeout(function(){
            var deviceBackListener = $scope.$on('deviceBackAction', function(){
                var currentLocation = window.location.hash.split('#')[1].split('/')[1];
                if(currentLocation == 'create-folder'){
                    if($scope.stopDeviceBack){}
                    else {
                        window.history.back();
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