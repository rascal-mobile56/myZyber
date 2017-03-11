angular.module('zyber.controllers')
.controller('MyActivityCtrl', 
    ['$scope', "$stateParams", '$translate', '$window', 
     '$cordovaFileTransfer', 'HomeService', 'HomeFactory', 
     '$ionicModal', '$ionicPopup', '$ionicLoading', 'hostKey', 
     '$cordovaToast', '$q', 'DownloadManager', '$ionicPopover', 
     '$cordovaFile','$ionicPlatform','$cordovaStatusbar',
     '$cordovaNetwork', 'IonicClosePopupService', '$ionicHistory',
     '$rootScope', 'AuthService', 'downloadFolder', '$ionicScrollDelegate',
     'FileService', 'UploadFactory','$state',
    function($scope, $stateParams, $translate, $window, 
        $cordovaFileTransfer, HomeService, HomeFactory, 
        $ionicModal, $ionicPopup, $ionicLoading, hostKey, 
        $cordovaToast, $q, DownloadManager, $ionicPopover, 
        $cordovaFile, $ionicPlatform, $cordovaStatusbar, 
        $cordovaNetwork, IonicClosePopupService, $ionicHistory,
        $rootScope, AuthService, downloadFolder, $ionicScrollDelegate,
        FileService, UploadFactory, $state) {


        $scope.files = [];
        $scope.displayFiles = [];
        $scope.partials = [];
        $scope.showHidden = {val:false};
        $scope.downloadInProgress = false;
        $scope.downloadedFiles = DownloadManager.getDownloadStatus();
        $scope.downloadHistory = DownloadManager.getDownloadedFiles();
        $scope.permissions = {};
        $scope.stopDeviceBack = false;
        $scope.obj = {flow: UploadFactory.flowObject()};

        $scope.addElement = ionic.Platform.isIOS();
        $scope.showFiles = false;
        $scope.showBack = false;

        $scope.showIOSBar = false;
        if(ionic.Platform.isIOS()){
            $scope.showIOSBar = true;
        }

        var popupShown;

        $scope.selectedFileCount = 0;
        var fileObject = function(file, rootFolder){
            this.file = file;
            this.size = 0;
            this.downloaded = false;
            this.targetPath = '';
            this.loaded = 0;
            this.rootFolder = rootFolder;
            this.cancelDownload = false;
        };

        $ionicPlatform.ready(function() {
            if (window.cordova && window.cordova.plugins) {
                $cordovaStatusbar.styleHex('#017aff');
            }
        });

        $ionicPopover.fromTemplateUrl('templates/partials/top-menu.html', {
            scope: $scope,
        }).then(function(popover) {
            $scope.popover = popover;
        });

        var host = $window.localStorage[hostKey];
        var path = "";
        var pathUrl = "";
        if(typeof $stateParams.fileID !== "undefined"){
            pathUrl = $stateParams.fileID;
        }
        if($stateParams.name == ""){
            $scope.pageTitle = "Activity <br /><small>"+host+"</small>";
            $scope.showBack = false;
        } else {
            $scope.pageTitle = $stateParams.name + " <br /><small>"+host+"</small>";
            $scope.showBack = true; 
        }
        
        $scope.goToNextPage = function(uuid, isDirectory, name) {
            console.log('goToNextPage',uuid, isDirectory, $scope.pageTitle);
            if(isDirectory)
                $state.go('app.my-activity',{fileID : uuid, name: name});       
            else
                $state.go('app.my-activity-detail',{fileId : uuid,name: name});
        }

        var getPermissions = function(path){
            HomeService.getPermissions(path)
            .then(function(data){
                $scope.permissions = data.data.response;
            },
            function(error){
                console.log('getPermissions error', error);
            });
        }

        var wrapperEl, listEL;

        var loadFiles = function(p){
            $scope.canDownload = false;
            var t = HomeFactory.asc() ? "asc" : "desc";
            return HomeService.getSharedInformation()
            .then(function(data){
                $scope.loading = false;
                $scope.selectAll.value = false;
                $scope.files = FileService.getFileIcons(data.data.response);
                // $scope.displayFiles = $scope.files.slice(0,10);
                // $scope.displayFiles = [];
                //$scope.loadMore();
                $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
                // setScrollListener();
            },
            function(error) {
                console.log("Error: ");
                console.log(error);
                $scope.loading = false;
                if($scope.currentView() == 'shares' &&
                    error.status == 403){
                    $translate(['permission_denied', 'ok']).then(function(translations){
                        popupShown = $ionicPopup.alert({
                            title: '<b>' + translations['permission_denied'] + '!</b>',
                            template: '<center>' + error.data.firstError.userMessage + '</center>',
                            okType: 'button-assertive',
                            okText: translations['ok']
                        });
                        popupShown.then(function(){
                            $rootScope.clearHistory();
                            window.location = '#/shares/';
                        });
                    });
                }
            });
        }

        var loadPartials =  function(path){
            return HomeService.getBreadcrumb(path)
                .then(function(data){
                    $scope.partials = data.data.response;
                },
                function(){
                    $scope.partials = [];   
                });
        }

        $scope.currentView = function(){
            return HomeFactory.view();
        };

       
        $scope.reloadFiles = function(){
            $scope.loading = true;
            loadFiles(path);
            getPermissions(path);
        };
    
        $scope.searchFiles = function (query, isInitializing) {
            if(isInitializing || query === "") {
                return [];
            } else {
                var searchFiles = HomeService.searchFiles(query,path,'home',
                    $scope.showHidden.val,false);
                return searchFiles;
            }
        }
    
    
        function onlyFiles(files, targetPath){
            return _.map(files, function(file){
                if(file.file.isDirectory){
                    if(file.rootFolder){
                        var rootFolder = file.rootFolder;
                    }
                    else{
                        var rootFolder = file;
                    }
                    
                    var folderName = file.file.name;
                    var path = targetPath + file.file.name + "/";
                    return HomeService.getFiles(file.file.uuid, false).then(function(data){
                        if(data.data.response.length == 0){
                            return Promise.resolve({path: targetPath, type: 'empty-folder', file: {name: folderName, size: 0}, rootFolder: rootFolder, progress: 0});
                        }
                        else{
                            var newSetOfFiles = [];
                            _.map(data.data.response, function(file){
                                newSetOfFiles.push(new fileObject(file, rootFolder));
                            });
                            return Promise.all(onlyFiles(newSetOfFiles, path));
                        }
                    });
                    
                }
                else{
                    file.targetPath = targetPath + file.file.name;
                    if(!file.rootFolder)
                        file.rootFolder = file;
                }
                return Promise.resolve(file);
            });
        }
    
    
        function loadContent(pathUrl){
            path = pathUrl;
            $scope.loading = true;
            $q.all([loadFiles(path),loadPartials(path), getPermissions(path)]).then(function(){
                $scope.loading = false;
            });
        }
         
        $scope.$on('updateProgress', function(event){
            $scope.$apply();
        });

        $scope.showDownloadStatus = function(){
            $scope.downloadHistory = DownloadManager.getDownloadedFiles();
            $scope.downloadedFiles = DownloadManager.getDownloadStatus();
            $scope.showStatusModal.show();
        }
        $scope.formatNumber = function(i) {
            return Math.round(i * 100)/100; 
        }
        $scope.selectAll = {value: false};
        $scope.canDownload = false;

        loadContent(pathUrl);
      
        $scope.loadContent = loadContent;

        $scope.updateCount = function(){
            $scope.selectedFileCount = 0;
            for(var i=0; i<$scope.files.length; i++){
                if($scope.files[i].selected){
                    $scope.selectedFileCount++;
                }
            }
        };

        $scope.setCount = function(){
            if($scope.selectAll.value){
                // $scope.selectedFileCount = $scope.files.length;
                $scope.selectedFileCount = 0;
                var filesArrayLength = $scope.files.length;
                var i = 0;
                for(;i<filesArrayLength;i++){
                    if(!$scope.files[i].disableDownload){
                        $scope.selectedFileCount++;
                    }
                }
            }
            else{
                $scope.selectedFileCount = 0;   
            }
        };

        var askForUserPermission = function(){
            // need to add to get runtime permission for android 6+
            var deferred = $q.defer();
            window.cordova.plugins.diagnostic.requestRuntimePermissions(function(status){
                switch(status.WRITE_EXTERNAL_STORAGE){
                    case window.cordova.plugins.diagnostic.runtimePermissionStatus.GRANTED:
                        console.log("Permission granted");
                        deferred.resolve(status.WRITE_EXTERNAL_STORAGE);
                        break;
                    case window.cordova.plugins.diagnostic.runtimePermissionStatus.NOT_REQUESTED:
                        console.log("Permission to write to storage has not been requested yet");
                        deferred.reject(status.WRITE_EXTERNAL_STORAGE);
                        break;
                    case window.cordova.plugins.diagnostic.runtimePermissionStatus.DENIED:
                        console.log("Permission denied to write to storage - ask again?");
                        deferred.reject(status.WRITE_EXTERNAL_STORAGE);
                        break;
                    case window.cordova.plugins.diagnostic.runtimePermissionStatus.DENIED_ALWAYS:
                        console.log("Permission permanently denied to write to storage");
                        $translate(['permission_permanently_denied', 'grant_in_settings', 'ok']).then(function(translations){
                            popupShown = $ionicPopup.alert({
                                title: '<i class="ion-alert-circled"></i>&nbsp;' + translations['permission_permanently_denied'],
                                template: '<center>' + translations['grant_in_settings'] + '</center>',
                                okType: 'button-positive',
                                okText: translations['ok']
                            });
                            popupShown.then(function(res) {
                                deferred.reject(status.WRITE_EXTERNAL_STORAGE);
                            });
                        });
                        break;
                }
            }, function(error){
                console.error("The following error occurred: "+error);
                deferred.reject(error);
            }, [window.cordova.plugins.diagnostic.runtimePermission.WRITE_EXTERNAL_STORAGE,
                window.cordova.plugins.diagnostic.runtimePermission.READ_EXTERNAL_STORAGE
            ]);
            return deferred.promise;
        };

        $scope.fabSelected = function(){
            $scope.toggleSelection(false);
        }

        setTimeout(function(){
            var deviceBackListener = $scope.$on('deviceBackAction', function(){
                var currentLocation = window.location.hash.split('#')[1].split('/')[1];
                if(currentLocation == 'home' || currentLocation == 'shares'){
                    if($scope.stopDeviceBack){}
                    else if(!$scope.modalclickable){}
                    else if($scope.fabState == 'open'){
                        $scope.mfb_active = false;
                        $scope.fabState = 'closed';
                        $scope.$apply();
                    }
                    else if ($scope.showStatusModal && $scope.showStatusModal.isShown()){
                        $scope.closeStatusModal();
                    }
                    else if($scope.partials && $scope.partials.length > 1){
                        $scope.popover.hide();
                        window.location = '#/' + $scope.currentView() + '/' + $scope.partials[$scope.partials.length - 2].uuid;
                    }
                    else{
                        $rootScope.exitApp(DownloadManager.isEmpty());
                    }
                }
                
            });
            
            var deviceOfflineListener = $scope.$on('deviceOffline', function(){
                if ($scope.showStatusModal && $scope.showStatusModal.isShown()){
                    $scope.closeStatusModal();
                }
                $ionicLoading.hide();
                $scope.popover.hide();
                popupShown.close();
            });

            $scope.$on('$destroy', function(){
                deviceBackListener();
                deviceOfflineListener();
                $scope.popover.remove();
            });
        }, 10);
        $scope.myGoBack = function() {
            $ionicHistory.goBack();
        };  
    }
]);