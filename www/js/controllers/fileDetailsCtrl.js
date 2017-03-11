angular.module('zyber.controllers')
.controller("FileDetailsCtrl", 
    [ '$scope', '$stateParams', 'HomeService', 'viewerKey',
     'mimeTypes', '_', '$ionicLoading', '$window', '$cordovaFileTransfer',
     'hostKey', '$localstorage', '$cordovaToast', '$q', '$ionicModal',
     'DownloadManager', '$ionicPopup', '$ionicPopover','$ionicPlatform',
     '$cordovaStatusbar', 'AuthService', 'downloadFolder', '$rootScope',
     'FileService', '$translate',
    function($scope, $stateParams, HomeService, viewerKey, 
        mimeTypes, _, $ionicLoading, $window, $cordovaFileTransfer, 
        hostKey, $localstorage, $cordovaToast, $q, $ionicModal, 
        DownloadManager, $ionicPopup, $ionicPopover, $ionicPlatform, 
        $cordovaStatusbar, AuthService, downloadFolder, $rootScope,
        FileService, $translate){

        $scope.fileId = $stateParams.fileId;
        $scope.file = {};
        $scope.fileActivity = [];
        $scope.showFileIcon = true;
        $scope.viewerUrl = $localstorage.get(viewerKey);
        $scope.fabState = 'closed';
        $scope.canDownload = false;
        $scope.canPreview = false;
        $scope.previewLoading = true;
        $scope.host = $window.localStorage[hostKey];
        $scope.authKey = null;
        $scope.fileActivityError = false;
        $scope.fileActivityErrorMsg = '';
        
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
            scope: $scope,
        }).then(function(popover) {
            $scope.popover = popover;
        });

        $ionicPopover.fromTemplateUrl('templates/partials/fab-menu.html', {
            scope: $scope,
        }).then(function(popover) {
            $scope.fab_menu = popover;
        });

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
                $scope.file = FileService.getFileIcon(data.data.response);
                $scope.fileid = $scope.file.uuid;

                    //$scope.previewLoading = false;
                // $scope.showFileIcon = _.contains(mimeTypes.groupDocTypes, $scope.file.mimeType);
                // if($scope.file.mimeType.substr(0,5) == 'image'){
                //  $scope.file.fileType = 'image';
                //  $scope.canPreview = true;
                //  $scope.showFileIcon = false;
                //  getImageForPreview();
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

        //var getImageForPreview = function(){
        //  HomeService.getFilePreview($scope.fileId)
        //  .then(function(response){
        //      var URL = $window.URL || $window.webkitURL;
        //      $scope.previewFile = URL.createObjectURL(response.data);
        //         $scope.previewLoading = false;
        //         // $scope.$apply();
        //      // $scope.showFileIcon = false;
        //  });
        //}

        $scope.loadActivity = function(fileId){
            return HomeService.getActivity(fileId, false).then(function(data){
                $scope.fileActivity = data.data.response;

                alert("aaa");
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
        
        $scope.downloadFile = function(){
            $scope.mfb_active = false;
            $scope.fabState = 'closed';

            if(ionic.Platform.isIOS()){
                IOSDownload();
            }
            else{
                var failure = function(error) {
                    if(error == 0){
                        $scope.toggleSelection(false);
                        $scope.$apply();
                    }
                    else
                        console("Error calling download plugin");
                }

                var success = function(contentUrl) {
                    downloadFileDevice($scope.file, contentUrl);
                }

                window.nativeDirectory.openDocumentTree("World", success, failure);
            }

        };

        var IOSDownload = function(){
            window.resolveLocalFileSystemURL(cordova.file.documentsDirectory, 
                function(folder){
                    downloadFileDevice($scope.file, folder);
                }, 
                function(error){
                    console.log('error in IOSDownload', error);
                });         
        }

        $scope.abortDownload = function(){
            console.log("Aborting download");
            $cordovaFileTransfer.abort();
            $ionicLoading.hide();
            $cordovaToast.showLongCenter("Transfer cancelled");
        };  

        function downloadFileDevice(file, selectedFolder){
            // $scope.selectFolderModal.hide();
            var fileObj = new fileObject(file);
            fileObj.rootFolder = fileObj;
            if(ionic.Platform.isIOS()){
                fileObj.targetPath = selectedFolder.nativeURL + downloadFolder + '/' + file.name;
            }
            else{
                fileObj.targetPath = downloadFolder + '/' + file.name;
            }
            var contentUrl = selectedFolder;
            
            $translate(['download_error', 'notify_download', 'ok']).then(function(translations){
                HomeService.checkDownload(file)
                .then(function(result){
                    DownloadManager.download([fileObj], contentUrl);
                    alertPopup = $ionicPopup.alert({
                        template: '<center><b>' + translations['notify_download'] + '</b></center>',
                        okType: 'button-stable',
                        okText: translations['ok']
                    });
                },
                function(error){
                    alertPopup = $ionicPopup.alert({
                        template: '<center><b>' + translations['download_error'] +'</b></center>',
                        okType: 'button-assertive',
                        okText: translations['ok']
                    });
                });;
            });
        }
    
        $scope.loading = true;

        //TODO deal with errors when some promise fail
        $q.all([$scope.loadFile($stateParams.fileId),
                $scope.loadActivity($stateParams.fileId), 
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

        $ionicModal.fromTemplateUrl('templates/partials/file-preview.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.imagePreviewModal = modal;
        });

        $scope.showFile = function(file,ev){
            if(!file.previewSupported) {
                var errorText = $filter('translate')('preview.not.supported');
                Notification.error(errorText);
                return false;
            }
            // console.log('permissions',$scope.selectedFilePermissions);
            var modalInstance = $mdDialog.show({
                templateUrl : '/assets/partials/showFile.html',
                controller : 'filePreview',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
                size : "lg",
                locals : {
                    file : file
                }
            }).then(function(result) {

            }).finally(function(){
            });

        };

        $scope.loadFilePreview = function(){
            
            if($scope.file.fileType == 'document'){
                $scope.imagePreviewModal.show();
            }
            else if($scope.file.mimeType == "application/octet-stream"){
                var audioUrl = $scope.host + '/media-preview/'+ $scope.file.uuid + '?Authorization=' + $scope.authKey;
                var options = {
                    bgImage: $scope.host + '/assets/images/screen.png',
                    bgImageScale: "fit", // other valid values: "stretch" 
                    initFullscreen: false, // true(default)/false iOS only 
                    successCallback: function() {
                      console.log("Player closed without error.");
                    },
                    errorCallback: function(errMsg) {
                      console.log("Error! " + errMsg);
                    }
                };
              
                window.plugins.streamingMedia.playAudio(audioUrl, options);
                return;
            }
            else{
                switch ($scope.file.mimeType.substr(0,5)){
                    case 'image':
                            $scope.imagePreviewModal.show();
                        break;
                    case 'audio':
                        $scope.audioUrl = $scope.host + '/media-preview/'+ $scope.file.uuid + '?Authorization=' + $scope.authKey;
                        // $scope.bgImage = $scope.host + '/assets/images/screen.png';
                        $scope.imagePreviewModal.show();
                        $scope.audioLoading = true;
                        var vid = document.getElementById("myAudio");
                        vid.load();
                        vid.oncanplay = function() {
                            $scope.audioLoading = false;
                            $scope.$digest();
                        };

                        // var audioUrl = $scope.host + '/media-preview/'+ $scope.file.uuid + '?Authorization=' + $scope.authKey;
                        // var options = {
                     //     // bgColor: "#004177",
                     //     bgImage: $scope.host + '/assets/images/screen.png',
                     //     bgImageScale: "fit", // other valid values: "stretch" 
                     //     initFullscreen: true, // true(default)/false iOS only 
                        //     successCallback: function() {
                        //      console.log("Player closed without error.");
                        //     },
                        //     errorCallback: function(errMsg) {
                        //       console.log("Error! " + errMsg);
                        //     }
                     //     };
                      
                     //     window.plugins.streamingMedia.playAudio(audioUrl, options);
                        break;
                    case 'video':
                        var videoUrl = $scope.host + '/media-preview/'+ $scope.file.uuid + '?Authorization=' + $scope.authKey;
                        var options = {
                            // bgColor: "#004177",
                            initFullscreen: true, // true(default)/false iOS only 
                            successCallback: function() {
                              console.log("Player closed without error.");
                            },
                            errorCallback: function(errMsg) {
                              console.log("Error! " + errMsg);
                            }
                        };
                        window.plugins.streamingMedia.playVideo(videoUrl, options);
                        break;      
                }
            }
        };

        $scope.cancel = function(){
            if($scope.file.fileType == 'audio'){
                var audioElement = document.getElementById('myAudio');
                audioElement.pause();
            }
            $scope.imagePreviewModal.hide();
        };      

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
    }
]);