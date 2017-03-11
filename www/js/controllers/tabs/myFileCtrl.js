angular.module('zyber.controllers')
.controller('MyFileCtrl', 
    ['$scope', "$stateParams", '$translate', '$window', '$ionicActionSheet',
     '$cordovaFileTransfer', 'HomeService', 'HomeFactory', 
     '$ionicModal', '$ionicPopup', '$ionicLoading', 'hostKey', 
     '$cordovaToast', '$q', 'DownloadManager', '$ionicPopover', 
     '$cordovaFile','$ionicPlatform','$cordovaStatusbar',
     '$cordovaNetwork', 'IonicClosePopupService', '$ionicHistory',
     '$rootScope', 'AuthService', 'downloadFolder', '$ionicScrollDelegate',
     'FileService', 'UploadFactory','mimeTypes','$state', '$cordovaCamera','$sce',
    function($scope, $stateParams, $translate, $window,$ionicActionSheet,
        $cordovaFileTransfer, HomeService, HomeFactory, 
        $ionicModal, $ionicPopup, $ionicLoading, hostKey, 
        $cordovaToast, $q, DownloadManager, $ionicPopover, 
        $cordovaFile, $ionicPlatform, $cordovaStatusbar, 
        $cordovaNetwork, IonicClosePopupService, $ionicHistory,
        $rootScope, AuthService, downloadFolder, $ionicScrollDelegate,
        FileService, UploadFactory, mimeTypes, $state, $cordovaCamera, $sce) {

        $scope.isAdndriod = ionic.Platform.isAndroid();
        $scope.file = {};
        $scope.modalFile = {};
        $scope.files = [];
        $scope.listCanSwipe = true;
        $scope.shouldShowDelete = false;
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
        $scope.sharedFilesArray = [];

        $scope.showIOSBar = false;
        if(ionic.Platform.isIOS()){
            $scope.showIOSBar = true;
        }

        $ionicPlatform.onHardwareBackButton(function() {

            $scope.myGoBack();
        });

        var popupShown;

         $scope.openUp = function(file) {
            if(file.isDirectory){
                console.log('isDirectory ',file.isDirectory);
                $state.go('app.my-file',{fileID:file.uuid, name:file.name});
            }
            else
                $scope.previewFile(file);
            return;
        }

        //Action Sheet
        /*
        $scope.showActionsheet = function(file) {

            var src;
            if( file.isDirectory)
            {
               src = "img/icons/folder.png"
            }else if(!file.isDirectory){
                src = file.thumbnailLink
            }
            else
            {
                console.log("Don't undifined");
                return;
            }

            $ionicActionSheet.show({
                buttons: [

                    {text: '<p class="action-p">Share</p><i class="icon ion-share" style="margin-left: 10px;"></i>'},
                    {text: '<p class="action-p">Delete</p><i class="icon ion-trash-b" style="margin-left: 10px;"></i>'},
                    {text: '<p class="action-p">Cancel</p>'}


                ],
                titleText: '<img src='+src+' '+ 'class="sheet-img"><p class="sheet-title">'+file.name + '</p>',
                buttonClicked: function (index) {
                    if (index === 0) {
                        console.log("share");

                        $state.go('app.my-share-detail',{fileId:file.uuid});
                    }
                    if (index === 1) {
                        console.log("delete");
                        if(file.isDirectory) {
                            $state.go('app.my-file', {name :file.uuid});
                            return;
                        }
                        var confirmPopup = $ionicPopup.confirm({
                            title:  '<div class="delete-border"><img src='+ src +' class="pop-img" alt="noimage"><p class="pop-p">'+ file.name+'</p></div>' +
                            '<div class="delete-title"><b>Delete File!</b></div>',
                            template: '<center>Are you sure?</center>',
                            okType: 'button-assertive',
                            okText: 'Ok'
                        });
                        confirmPopup.then(function(res) {
                            if(res) {
                                //alert('value:'+res);
                                HomeService.deleteFile(file.uuid).then(function(data){
                                    $state.reload('app.my-file', {fileID: $stateParams.fileID, name :  $stateParams.name});
                                }, function(error){
                                    //alert("error deleting the file");
                                    console.log('error deleting the file', error);
                                })
                            }
                        });
                    }
                    if (index === 2)
                    {
                        return true;
                    }
                }
            });

            $timeout(function() {
                hideSheet();
            }, 2000);
        };

        */

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



        $ionicModal.fromTemplateUrl('templates/partials/file-preview.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.imagePreviewModal = modal;
        });

        $scope.createImagePreviewModal = function (cb) {
            $ionicModal.fromTemplateUrl('templates/partials/file-preview.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.imagePreviewModal = modal;
                cb();
            });
        }

        var host = $window.localStorage[hostKey];
        $scope.host = host;
        var path = "";
        var pathUrl = "";
        if(typeof $stateParams.fileID !== "undefined"){
            pathUrl = $stateParams.fileID;
        }
    /*  $scope.share = function(uuid) {
            $state.go('app.my-share-detail',{fileId:uuid});
        }
        */
        if($stateParams.name == ""){
            $scope.pageTitle = "My Files <br /><small>"+host+"</small>";
            $scope.showBack = false;
        } else {
            $scope.pageTitle = $stateParams.name + " <br /><small>"+host+"</small>";
            $scope.showBack = true;
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
            return HomeService.getFiles(p,  $scope.showHidden.val, HomeFactory.sorting(), t)
                .then(function(data){
                    console.log('data.data.response',data);
                    $scope.loading = false;
                    $scope.selectAll.value = false;
                    $scope.files = FileService.getFileIcons(data.data.response);
                    FileService.setDownloadCheck($scope.files);
                    // $scope.pageTitle = data.data.response.name+" <br /><small>"+host+"</small>";
                    // $scope.displayFiles = $scope.files.slice(0,10);
                    // $scope.displayFiles = [];
                    // $scope.loadMore();
                    $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
                    // setScrollListener();
                    if($scope.sharedFilesArray != 0){
                        setSharedStatus();
                    }
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

        $ionicModal.fromTemplateUrl('templates/partials/download-status.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.showStatusModal = modal;
        });
        
        $scope.audioUrl = host;

        // $ionicModal.fromTemplateUrl('templates/partials/file-preview.html', {
        //  id: '2', // We need to use and ID to identify the modal that is firing the event!
     //         scope: $scope,
     //         animation: 'slide-in-up'
     //    }).then(function(modal) {
     //         $scope.imageModal = modal;
     //    });
        $scope.closeStatusModal = function(){
            $scope.showStatusModal.hide();
            $scope.toggleSelection(false);
        };

        $scope.clearStatusHistory = function(){
            DownloadManager.clearHistory();
            $scope.downloadHistory = DownloadManager.getDownloadedFiles();
        };

        $scope.abortDownload = function(file, index){
            $scope.modalclickable = false;
            $translate(['abort_download', 'are_you_sure', 'ok', 'cancel']).then(function(translations){
                popupShown = $ionicPopup.confirm({
                    title: '<i class="ion-alert-circled"></i>&nbsp;' + translations['abort_download'],
                    template: '<center>' + translations['are_you_sure'] + '?</center>',
                    okText: translations['ok'],
                    cancelText: translations['cancel']
                });
                popupShown.then(function(res) {
                    if(res) {
                        DownloadManager.abortDownload(file, index);
                        setTimeout(function(){
                            $scope.downloadedFiles = DownloadManager.getDownloadStatus();
                        }, 500);
                    }
                    $scope.modalclickable = true;
                });
            });
        };  

        $scope.modalclickable = true;
        $scope.openCreateFolder = function(){
            if($scope.permissions.createSubfolder){
                $scope.modalclickable = true;
                $scope.mfb_active = false;
                $scope.fabState = 'closed';
                window.location = '#/create-folder/' + pathUrl;
            }
            else{
                $scope.mfb_active = false;
                $scope.fabState = 'closed';
                $scope.modalclickable = false;
                $translate(['permission_cannot_create_folder', 'permission_denied', 'ok']).then(function(translations){
                    popupShown = $ionicPopup.alert({
                        title: translations['permission_denied'] + '!',
                        template: translations['permission_cannot_create_folder'] + '.',
                        okType: 'button-assertive',
                        okText: translations['ok']
                    });
                    popupShown.then(function(res) {
                        $scope.modalclickable = true;
                    });
                });
            }
        };

        $scope.$watch('modalclickable', function(newValue, oldValue) {
            if(newValue){
                var htmlEl = angular.element(document.querySelector('html body > div.modal-backdrop')).css('pointer-events','auto');
            }else{
                var htmlEl = angular.element(document.querySelector('html body > div.modal-backdrop')).css('pointer-events','none');
            }
            _.defer(function(){$scope.$apply();});
            //$scope.$apply();
        });

        $scope.$watch('mfb_active', function(newValue, oldValue) {
            if(newValue){
                $('.overflow-scroll').css('overflow-y', 'hidden');
            }
            else{
                $('.overflow-scroll').css('overflow-y', 'scroll');  
            }
        });
        $scope.obj.flow.opts.target = host + '/api/upload';
        $scope.obj.flow.opts.headers.Authorization = AuthService.getToken();

        $scope.uploadFileSelected = function(){
            if($scope.permissions.upload){
                $scope.transferProgress = 0;
                $scope.obj.flow.upload();
                $ionicLoading.show({
                    templateUrl: 'templates/partials/upload-status.html',
                    scope: $scope,
                    noBackdrop: true
                });
            }
            else{
                $ionicLoading.hide();
                $scope.obj.flow.cancel();
                $scope.modalclickable = false;
                $translate(['permission_denied', 'permission_cannot_upload', 'ok']).then(function(translations){
                    popupShown = $ionicPopup.alert({
                        title: translations['permission_denied'] + '!',
                        template: translations['permission_cannot_upload'],
                        okType: 'button-assertive',
                        okText: translations['ok']
                    });
                    popupShown.then(function(res) {
                        $scope.modalclickable = true;
                    });
                });
            }
        }

        $scope.fileUploadProgress = function($file){
            console.log('fileUploadProgress', $file);
            $scope.transferProgress = $file.progress;
            console.log('fileUploadSuccess', $scope.transferProgress);
            if($scope.transferProgress == 100) {
                $ionicLoading.show({
                    templateUrl: 'templates/partials/processing.html',
                    scope: $scope,
                    noBackdrop: true
                });
            }
        }

        var fileUploadSuccess = $scope.$on('fileUploadSuccess', function(e, data){
            $scope.stopDeviceBack = false;

            $translate(['api.successfull.upload']).then(function(translations){
                var message = translations['api.successfull.upload'].replace('{0}', data);
                $cordovaToast.showLongCenter(message);
                $ionicLoading.hide();
                $scope.mfb_active = false;
                loadContent(path);
                $scope.stopDeviceBack = false;
            });
        });

        var fileUploadError = $scope.$on('fileUploadError', function(event, data){
            $scope.stopDeviceBack = false;
            $cordovaToast.showLongCenter(data);
            $ionicLoading.hide();
            $scope.mfb_active = false;
            $scope.stopDeviceBack = false;
        });

        $scope.openUploadFile = function(){
            console.log('openUploadFile');
            // $state.go('app.upload-file');
            // return false;
            $scope.mfb_active = false;
            $scope.fabState = 'closed';
            UploadFactory.setPath(path);
            $scope.stopDeviceBack = true;

            // if($scope.permissions.upload){
            //  if(ionic.Platform.isAndroid()){
            //      androidUpload();
         //        }
         //        else if(ionic.Platform.isIOS()){
            //      iosUpload();
         //        }
         //    }
         //    else{
         //     $scope.modalclickable = false;
         //     var alertPopup = $ionicPopup.alert({
      //            title: 'Permission denied!',
            //      template: "You don't have permissions to upload file",
            //      okType: 'button-assertive'
            //  }).then(function(res) {
            //      $scope.modalclickable = true;
            //      });
         //    }
        };

        function androidUpload(){
            console.log('androidUpload ###');
            askForUserPermission().then(function(){
                window.plugins.mfilechooser.open([], function (uri) {
                    $scope.transferProgress = 0;
                    $scope.$apply();
                    console.log('androidUpload', uri);
                    window.resolveLocalFileSystemURL("file:///"+uri, 
                        function(entry){
                            entry.file(function(f){
                                    doUpload(uri, f);
                                }, 
                                function(error){
                                    console.log("Error reading file");
                                    console.log(JSON.stringify(error));
                                    $cordovaToast.showLongCenter("Error uploading file");
                                });
                        }, 
                        function(error){
                            console.log("Error resolving file");
                            console.log(JSON.stringify(error));
                            $cordovaToast.showLongCenter("Error uploading file");
                        });

                }, 
                function (error) {
                    console.log(error);
                });
            });
        }
    
        function checkForOverwrite(filename){
            return new Promise(function(fulfill, reject){
                    var noFilenameConflict = true;
                    _.map($scope.files, function(file, index){
                        if(file.name == filename){
                            $scope.modalclickable = false;
                            noFilenameConflict = false;
                            $translate(['api.file.exists', 'confirm.overwrite', 'ok', 'cancel']).then(function(translations){
                                popupShown = $ionicPopup.confirm({
                                    title: '<i class="ion-alert-circled"></i>&nbsp;' + translations['api.file.exists'],
                                    template: '<center>' + translations['confirm.overwrite'] + '</center>',
                                    buttons: [{text: translations.cancel},
                                                {text: translations.ok, 
                                                 type: 'button-positive',
                                                 onTap: function(e) {
                                                    return true;
                                                    }
                                                 }]
                                });
                                popupShown.then(function(res) {
                                    if(res) {
                                        fulfill({confirm: true, index: index});
                                    } else {
                                        fulfill({confirm: false, index: -1});
                                    }
                                    $scope.modalclickable = true;
                                });
                            });
                        }
                    });
                    if(noFilenameConflict)
                        fulfill({confirm: true, index: -1});
                });
        }

        function doUpload(uri, file){

            UploadFactory.setPath(path);
            // File name only
            var filename = uri.split("/").pop();
            console.log("doUpload filename", file, "file.size", file.size);
            checkForOverwrite(filename)
            .then(function(response){ 
                if(response.confirm){
                    if(response.index != -1)
                        $scope.files.splice(response.index, 1);
                    $scope.stopDeviceBack = true;
                    $ionicLoading.show({
                        templateUrl: 'templates/partials/upload-status.html',
                        scope: $scope,
                        noBackdrop: true
                    });

                    var options = {
                        fileKey: "file",
                        fileName: filename,
                        chunkedMode: true,
                        headers : {Authorization: AuthService.getToken(), "file-size": file.size}
                    };
                    var viewPar = HomeFactory.view() ? "&view=" + HomeFactory.view() : "";
                    var url = host + '/api/upload' + '?path=' + path + viewPar;
                
                    fileTransfer(url, uri, options).then(function(){
                        // console.log('done');
                    });
                }
            });
        }

        var fileTransfer = function(url, uri, options){
            var deferred = $q.defer();
            $scope.transferProgress = 0;
            //var targetPath = cordova.file.externalRootDirectory + "logo_radni.png";

            console.log('fileTransfer', url, uri, options);


            $cordovaFileTransfer.upload(url, uri, options)
            .then(function (result) {
                    console.log('successfull', result);
                    $scope.stopDeviceBack = false;
                    $translate(['api.successfull.upload']).then(function(translations){
                        $cordovaToast.showLongCenter(translations['api.successfull.upload']);
                        $ionicLoading.hide();
                        loadFiles(path);
                        getPermissions(path);
                        $scope.mfb_active = false;
                        deferred.resolve();
                    });
                }, 
                function (error) {
                    console.log("ERROR uploading file: ", error);
                    var errorContent = JSON.parse(error.body);
                    $scope.stopDeviceBack = false;
                    $ionicLoading.hide();
                    if(error.code != 4){
                        if(error.code == 3){
                            var message = '<center>Network connection lost!</center>';
                        }
                        else{
                            // var message = '<center>Upload could not be completed.</center>';
                            var message = '<center>' + errorContent.firstError.userMessage + '</center>'
                        }
                        $scope.modalclickable = false;
                        $translate(['ok']).then(function(translations){
                            popupShown = $ionicPopup.alert({
                                template: message,
                                okType: 'button-assertive',
                                okText: translations['ok']
                            });
                            popupShown.then(function(res) {
                                $scope.modalclickable = true;
                            });
                        });
                    }
                    deferred.resolve();
                }, 
                function (progress) {
                    if (progress.lengthComputable) {
                        $scope.transferProgress = (progress.loaded / progress.total) * 100;
                    }
                });
            return deferred.promise;
        }

        function iosUpload(){
            var options = {
                // Some common settings are 20, 50, and 100
                quality: 20,
                destinationType: Camera.DestinationType.FILE_URI,
                // In this app, dynamically set the picture source, Camera or photo gallery
                sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                encodingType: Camera.EncodingType.JPEG,
                mediaType: Camera.MediaType.ALLMEDIA,
                allowEdit: false,
                correctOrientation: true  //Corrects Android orientation quirks
            }
            
            window.navigator.camera.getPicture(function cameraSuccess(imageUri) {
                window.resolveLocalFileSystemURL(imageUri, 
                        function(entry){
                            entry.file(function(f){
                                    doUpload(imageUri, f);
                                }, 
                                function(error){
                                    console.log("Error reading file");
                                    console.log(JSON.stringify(error));
                                    $cordovaToast.showLongCenter("Error uploading file");
                                });
                        }, 
                        function(error){
                            console.log("Error resolving file");
                            console.log(JSON.stringify(error));
                            $cordovaToast.showLongCenter("Error uploading file");
                        });

            }, function cameraError(error) {
                console.debug("Unable to obtain picture: " + error, "app");

            }, options);

        }

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
    
        $scope.fileSelected = function (callback) {
            console.log("fileSelected");
            // print out the selected item
            console.log(callback.item); 

            // print out the component id
            console.log(callback.componentId);

            // print out the selected items if the multiple select flag is set to true and multiple elements are selected
            console.log(callback.selectedItems); 
        };
    
        $scope.downloadFiles = function(){
            if($cordovaNetwork.isOnline()){
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
                        createDirStructureToDownload(contentUrl);
                    }

                    window.nativeDirectory.openDocumentTree("World", success, failure);
                }
            }
            else{
                popupShown = $ionicPopup.alert({
                    title: 'Network Error!',
                    template: 'The device is offline.',
                    okType: 'button-positive'
                });
            }
        };

        var createDirStructureToDownload = function(downloadUrl){
            var contentUrl = downloadUrl;
            var selectedFiles = [];
            _.map($scope.files, function(file){
                if(file.selected){
                    selectedFiles.push(new fileObject(file));
                }
            });

            if(selectedFiles.length){
                var filesToDownload = onlyFiles(selectedFiles, downloadFolder + '/');

                Promise.all(filesToDownload)
                .then(function(files){
                    DownloadManager.download(files, contentUrl);
                },
                function(error){
                    console.log('error in getting files');
                });
                $scope.showDownloadStatus();
                $scope.toggleSelection(false); 
            }
        };

        var IOSDownload = function(){
            window.resolveLocalFileSystemURL(cordova.file.documentsDirectory, 
                function(folder){
                    getSelectedFilesToDownload(folder);
                }, 
                function(error){
                    console.log('error in IOSDownload', error);
                });         
        }

        var getSelectedFilesToDownload = function(selectedFolder){
            var selectedFiles = [];
            _.map($scope.files, function(file){
                if(file.selected){
                    selectedFiles.push(new fileObject(file));
                }
            });
            if(selectedFiles.length)
                downloadFilesDevice(selectedFiles, selectedFolder);
        };

        var aborted = false;
        $scope.abortTransfer = function(){
            // $cordovaFileTransfer.abortUpload();
            $scope.obj.flow.cancel();
            $ionicLoading.hide();
            aborted = true;
            $translate(['transfer_cancelled']).then(function(translations){
                $cordovaToast.showLongCenter(translations['transfer_cancelled']);
            });
        };

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
    
        function downloadFilesDevice(files, selectedFolder){  
            $scope.downloadInProgress = true;

            var onlyFilesPro = onlyFiles(files, selectedFolder.nativeURL + downloadFolder + '/');

            Promise.all(onlyFilesPro).then(
                function(files){
                    DownloadManager.download(files);
                },
                function(error){
                    console.log('error in getting files');
                }
            );

            $scope.showDownloadStatus();
            $scope.toggleSelection(false);        
        }

        $scope.downloadFilesDevice = function(){
            var filesToDownload = _.filter($scope.files, function(file){
                return file.selected === true;
            });
            
            if(filesToDownload.length > 0){
                downloadFilesDevice(filesToDownload);
            }
        };

        function loadContent(pathUrl){
            console.log('loadContent');
            path = pathUrl;
            $scope.loading = true;
            $q.all([loadFiles(path),loadPartials(path), getPermissions(path), getSharedInformation()]).then(function(){
                $scope.loading = false;
            });
        }

        $scope.toggleSelection = function(selectedValue){
            if($scope.files.length == 0)
                return;
            _.map($scope.files, function(file){
                if(file.disableDownload)
                    file.selected = false;
                else
                    file.selected = selectedValue;
            });
            $scope.toggleDownload();
        };
    
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
        $scope.toggleDownload = function(){
            $scope.canDownload = _.some($scope.files, function(f){return f.selected;});
            var selectedStatus = true;
            var i = 0, fileCount = $scope.files.length, fileSelected = 0;
            for( ; i<fileCount; i++){
                if($scope.files[i].disableDownload)
                    continue;
                else if(!$scope.files[i].selected){
                    selectedStatus = false;
                    break;
                }
                else
                    fileSelected++;
            }
            if(fileSelected == 0)
                selectedStatus = false;

            $scope.selectAll.value = selectedStatus;
            // $scope.selectAll.value = _.every($scope.files, function(f){return f.selected || f.disableDownload;});
        };

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
                        console.log('showStatusModal');
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
                fileUploadSuccess();
                fileUploadError();
            });
        }, 10);

        $scope.closeModal = function() {
            var vid = document.getElementById("myAudio");
            if(vid){
                vid.pause();
            }
            $scope.imagePreviewModal.hide();
        };

        $scope.previewFile = function(file){

            $scope.file = file;
            $scope.fileid = file.uuid;
            $scope.previewLoading = true;

            var audioFormats = ["audio/mpeg", "audio/ogg", "audio/wav", "audio/x-wav", "audio/vorbis"];
            var videoFormats = ["video/mp4", "video/webm", "video/ogg", "video/vorbis", "video/theora"];
            var imageFormats = [
                "image/jpeg",
                "image/png",
                "image/gif",
                "image/vnd.wap.wbmp",
                "image/tiff"
            ];

            if(_.contains(mimeTypes.groupDocTypes, file.mimeType)){
                $scope.file.fileType = "document";
                $scope.file.isImage = _.contains(imageFormats, $scope.file.mimeType);
                $scope.file.imageUrl = $scope.host + '/myzyber/view-page?pid=' + $scope.file.uuid;
            }else if(_.contains(videoFormats, file.mimeType)){
                $scope.file.fileType = "video";
            }else if(_.contains(audioFormats, file.mimeType)){
                $scope.file.fileType = "audio";
                if(file.mimeType === "audio/vorbis"){
                    $scope.file.mimeType = "audio/ogg";
                }
            } else {
                $scope.file.fileType = "unsupported";

                $translate(['preview.not.supported', 'ok','error']).then(function(translations){
                    $ionicPopup.alert({
                        title: '<b>' + translations['error'] + '!</b>',
                        template: '<center>'+translations['preview.not.supported']+'</center>',
                        okType: 'button-assertive',
                        okText: translations['ok']
                    });
                });
                return false;
            }

            if(file.fileType == 'document'){
                $scope.fileType = 'document';
                $scope.imagePreviewModal.remove();
                $scope.createImagePreviewModal(function() {
                    $scope.imagePreviewModal.show();    
                });                
            }
            else if(file.mimeType == "application/octet-stream"){
                var audioUrl = host + '/media-preview/'+ file.uuid + '?Authorization=' + $scope.authKey;
                var options = {
                    bgImage: host + '/assets/images/screen.png',
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
                switch (file.mimeType.substr(0,5)){
                    case 'image':
                            $scope.imagePreviewModal.show();
                        break;
                    case 'audio':
                        console.log('audio');
                        $scope.audioUrl = host + '/media-preview/'+ file.uuid + '?Authorization=' + $scope.authKey;
                        $scope.imagePreviewModal.show();
                        $scope.audioLoading = true;
                        setTimeout(function(){
                        var vid = document.getElementById("myAudio");
                        vid.load();
                        vid.oncanplay = function() {
                            $scope.audioLoading = false;
                            $scope.$digest();
                        };
                        },10);
                        break;
                    case 'video':
                        var videoUrl = host + '/media-preview/'+ file.uuid + '?Authorization=' + $scope.authKey;
                        var options = {
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
        }
        
        var setToken = function(){
            var token = AuthService.getToken();
            if(token){
                $scope.authKey = token.substr(6).trim();
            }
        }
        /*$scope.deleteItem = function(uuid, isDirectory) {
            if(isDirectory) {
                $state.go('app.my-file', {name : uuid});
                return;
            }

            var confirmPopup = $ionicPopup.confirm({
                    title: '<b>Delete File!</b>',
                    template: '<center>Are you sure?</center>',
                    okType: 'button-assertive',
                    okText: 'Ok'
                });

            confirmPopup.then(function(res) {
                if(res) {
                    HomeService.deleteFile(uuid).then(function(data){
                        $state.reload('app.my-file', {fileID: $stateParams.fileID, name :  $stateParams.name});
                    }, function(error){
                        console.log('error deleting the file', error);

                    })
                } 
            });

        }*/
        
        $scope.takePicture = function() {

            // var options = {
         //            quality: 20,
         //            destinationType: Camera.DestinationType.FILE_URI,
         //            sourceType: Camera.PictureSourceType.CAMERA,
         //            allowEdit: false,
         //            encodingType: Camera.EncodingType.JPEG,
         //            popoverOptions: CameraPopoverOptions,
         //            saveToPhotoAlbum: false
         //        };
            var options = { 
                quality : 75, 
                destinationType : Camera.DestinationType.DATA_URL, 
                sourceType : Camera.PictureSourceType.CAMERA, 
                allowEdit : false,
                encodingType: Camera.EncodingType.JPEG,
                //targetWidth: 300,
                //targetHeight: 300,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false,
                correctOrientation:true
            };
            $ionicPlatform.ready(function(){
                $cordovaCamera.getPicture(options).then(function(imageData) {
                    UploadFactory.setPath(path);
                    var fileString = atob(imageData);
                    // Creating blob object
                    var n = fileString.length;
                    var byteNumbers = new Array(n);
                    for (var i = 0; i < n; i++) {
                        byteNumbers[i] = fileString.charCodeAt(i);
                    }
                    var u8arr = new Uint8Array(byteNumbers);
                    var blob = new Blob([u8arr], {type: "image/jpeg"});
                    blob.name = 'image' + $scope.files.length + '.jpeg';
                    

                    $scope.obj.flow.addFile(blob);

                }, function(err) {
                    console.log('error in file upload', err);
                    $cordovaToast.showLongCenter("Error uploading file");
             //     popupShown = $ionicPopup.alert({
                            //  title: '<b>Error!</b>',
                            //  template: '<center>Error</center>',
                            //  okType: 'button-assertive'
                            // });
                    // An error occured. Show a message to the user
                });
            });
        };

        $scope.myGoBack = function() {
            $ionicHistory.goBack();
        };

        var setSharedStatus = function(){
            var existingFiles = _.filter($scope.sharedFilesArray, function(file){
                return file.path.parentUuid == $scope.files[0].parentUuid;
            });
            var i=0, count=existingFiles.length;
            for(;i<count;i++){
                var item = _.find($scope.files, function(file, index){
                    return file.uuid == existingFiles[i].path.uuid;
                });
                item.sharing = true;
            }
        }
        function getSharedInformation() {
            HomeService.getSharedInformation()
            .then(function(success){
                $scope.sharedFilesArray = success.data.response;
                if($scope.files.length != 0){
                    setSharedStatus();
                }
            }, function(error){
                console.log('getSharedInformation error', error);
            });
        }
        setToken();
    }

])
