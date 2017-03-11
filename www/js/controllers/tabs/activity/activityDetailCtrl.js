angular.module('zyber.controllers')
.controller('ActivityDetailCtrl', 
    ['$scope', '$stateParams', 'HomeService', 'viewerKey',
     'mimeTypes', '_', '$ionicLoading', '$window', '$cordovaFileTransfer',
     'hostKey', '$localstorage', '$cordovaToast', '$q', '$ionicModal',
     'DownloadManager', '$ionicPopup', '$ionicPopover','$ionicPlatform',
     '$cordovaStatusbar', 'AuthService', 'downloadFolder', '$rootScope',
     'FileService', '$translate','$ionicHistory',
    function($scope, $stateParams, HomeService, viewerKey, 
        mimeTypes, _, $ionicLoading, $window, $cordovaFileTransfer, 
        hostKey, $localstorage, $cordovaToast, $q, $ionicModal, 
        DownloadManager, $ionicPopup, $ionicPopover, $ionicPlatform, 
        $cordovaStatusbar, AuthService, downloadFolder, $rootScope,
        FileService, $translate, $ionicHistory) {

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
        $scope.pageTitle = "Activity<br /><small>"+$scope.host+"</small>";
        $scope.activities = {
            // "09 Oct 2016" : {
            //  "18:30 PM" :
            //      [{"action " : "Viewed by Megha Kumari"}, {"action" : "Viewed by Megha Kumari"} ]
            // }
        };
        var alertPopup;
        if($stateParams.name == ""){
            $scope.pageTitle = "Activity <br /><small>"+$scope.host+"</small>";
            $scope.showBack = false;
        } else {
            $scope.pageTitle = $stateParams.name + " <br /><small>"+$scope.host+"</small>";
            $scope.showBack = true; 
        }
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
        $scope.form = {
            email : null,
            addEmail : function() {
                if(!$scope.form.email) {
                    $ionicPopup.alert({
                        title: 'Error!',
                        template: '<center>Please enter an email</center>',
                        okType: 'button-assertive'
                    });
                    return false;
                }
                var exist = _.findIndex($scope.file.shares, function(x) { return x.email === $scope.form.email; });
                if(exist != -1) {
                    $ionicPopup.alert({
                        title: 'Error!',
                        template: '<center>Email already added</center>',
                        okType: 'button-assertive'
                    });
                    return false;
                }
                $scope.file.shares.push({email: $scope.form.email});
                $scope.form.email = null;
            },
            remove : function($index) {
                console.log('Remove ',$index);
                $scope.file.shares.splice($index, 1);
                console.log('Remove after',$scope.file.shares);
            },
            update : function() {
                if(!$scope.file.shares.length ) {
                    console.log('$scope.file.shares.length', $scope.file.shares.length);
                    return false;
                }

                console.log('update called', $scope.file);
            }
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

        
        
        var setToken = function(){
            var token = AuthService.getToken();
            if(token){
                $scope.authKey = token.substr(6).trim();
            }
        }

        // var getImageForPreview = function(){
        //  HomeService.getFilePreview($scope.fileId)
        //  .then(function(response){
        //      var URL = $window.URL || $window.webkitURL;
        //      $scope.previewFile = URL.createObjectURL(response.data);
        //         $scope.previewLoading = false;
        //         // $scope.$apply();
        //      // $scope.showFileIcon = false;
        //  });
        // }

        $scope.loadActivity = function(fileId){

            $scope.activities = {};
            var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


            return HomeService.getActivity(fileId, false).then(function(data){

                angular.forEach(data.data.response, function(value) {

                    ////New version.
                    //if(value.date != 'undefined') {
                    //  var date = new Date(value.date);
                    //  var hours = date.getHours();
                    //  hours = hours % 12;
                    //  hours = hours ? hours : 12; // the hour '0' should be '12'


                    if(value.prettyTimestamp != 'undefined') {
                        //Todo host+/api/activity
                        //var date = new Date(value.prettyTimestamp);
                        //Todo host+/api/plain-activity
                        var date = new Date(value.date);
                        console.log(date);
                        // Hours part from the timestamp
                        var hours = (date.getHours()<10?'0':'') + date.getHours();


                        var day = date.getDate();
                        var month = monthNames[date.getMonth()];
                        var year = date.getFullYear();
                        // Minutes part from the timestamp
                        var minutes = (date.getMinutes()<10?'0':'') + date.getMinutes() 

                        // Seconds part from the timestamp
                        var seconds = date.getSeconds();
                        var ampm = hours >= 12 ? 'PM' : 'AM';
                        
                        // Will display time in 10:30:23 format
                        //var formattedTime = hours + ':' + minutes.substr(-2);// + ':' + seconds.substr(-2);
                        dateFormat = day+" "+month + " " + year;
                        time = hours+":"+minutes+" "+ampm;
                        
                        if(!$scope.activities.hasOwnProperty(dateFormat)) 
                            $scope.activities[dateFormat] = {};
                        //if( !$scope.activities[dateFormat].hasOwnProperty(time) ){
                        if(!$scope.activities[dateFormat].hasOwnProperty(time))
                            $scope.activities[dateFormat][time] = [];
                        
                        $scope.activities[dateFormat][time].push({action: value.header, note: value.note});

                    }
                });

                $scope.fileActivity = data.data.response;
                //console.log('data.data.response',data.data.response);
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
        $q.all([$scope.loadActivity($stateParams.fileId), 
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

        $scope.myGoBack = function() {
            $ionicHistory.goBack();
        };
    }

]);