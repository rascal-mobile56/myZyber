angular.module('zyber.controllers')
.controller("previewController",
    ['$scope','$stateParams', 'HomeService', '$timeout','$ionicPopup','$state',
    function($scope, $stateParams, HomeService, $timeout, $ionicPopup , $state){
        $scope.previewLoading1 = false;




        $timeout(function(){
            $scope.previewLoading1 = false;
        }, 3000);


        $scope.deleteItem = function(thumbnailLink, uuid, isDirectory, name) {

            var src;
            if (!thumbnailLink) {
                src = "../img/icons/blank.png"
            } else if (thumbnailLink) {
                src = thumbnailLink;
            }

            var confirmPopup = $ionicPopup.confirm({
                title: '<div class="delete-border"><img src=' + src + ' class="pop-img" alt="noimage"><p class="pop-p">' + name + '</p></div>' +
                '<div class="delete-title"><b>Delete File!</b></div>',
                template: '<center>Are you sure?</center>',
                okType: 'button-assertive',
                okText: 'Ok'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    HomeService.deleteFile(uuid).then(function (data) {
                        //$state.reload('app.my-deleted', {name: $stateParams.name});
                        console.log("aaaaa");
                        //$state.go('app.my-file');
                        $scope.closeModal();
                        $state.reload('app.my-file', {fileID: $stateParams.fileID, name :  $stateParams.name});


                    }, function (error) {
                        console.log('error deleting the file', error);

                    })
                }
            });
        }

        $scope.shareItem = function(uuid) {
            $scope.closeModal();
            $state.go('app.my-share-detail',{fileId:uuid});

        }

    }


]);