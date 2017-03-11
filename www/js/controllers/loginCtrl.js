angular.module('zyber.controllers')
    .controller("LoginCtrl",
    [ '$scope','$state', '$localstorage', 'hostKey', '$location', 'userKey', 'passwdKey',
        '$window', 'HomeService', '$ionicPopup','$ionicPlatform','$cordovaStatusbar',
        'AuthService', '$rootScope', 'DownloadManager', '$translate', 'serverKey',
        function($scope,$state, $localstorage, hostKey, $location, userKey, passwdKey,
                 $window, HomeService, $ionicPopup, $ionicPlatform, $cordovaStatusbar,
                 AuthService, $rootScope, DownloadManager, $translate, serverKey){

            var defaultValues = {
                server: $localstorage.get(serverKey),
                username: $localstorage.get(userKey),
                password: $localstorage.get(passwdKey)
            };

            console.log("Host Name:"+defaultValues.server);
            console.log("email Name:"+defaultValues.username);
            console.log("password Name:"+defaultValues.username);

            var canShowPopup = true;
            $scope.settings = {
                scheme : 'https://',
                hostname : defaultValues.server,
                loading : false,
                isValid : false

            };
            $scope.user = {
                username : defaultValues.username,
                password : defaultValues.password
            };



            $ionicPlatform.ready(function() {
                if (window.cordova && window.cordova.plugins) {
                    $cordovaStatusbar.styleHex('#dddddd');
                }
                $('ion-scroll').removeClass('has-header');
                var deviceInformation = ionic.Platform.device();
                AuthService.setDevice(deviceInformation);
            });

            var bindElement = $('ion-scroll').bind('scroll', function(e){
                if(e.detail.scrollTop > 0){
                    $('ion-scroll').addClass('bg-blue');
                    $('ion-scroll').removeClass('bg-white');
                }
                else{
                    $('ion-scroll').addClass('bg-white');
                    $('ion-scroll').removeClass('bg-blue');
                }
            });

            $scope.loading = false;

            $scope.saveSettings = function() {

                $scope.settings.isValid = false;
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

            var saveHost = function() {
                if(!$scope.settings.hostname || !$scope.user.username || !$scope.user.password || $scope.user.username == '' || $scope.user.password == '')	{


                    $ionicPopup.alert({
                        title: 'Login error!',
                        template: '<center>username and password are required</center>',
                        okType: 'button-assertive'
                    });
                    return false;
                }

                $scope.loading = true;
                var withSchema = /\S+\.\S+/;
                var enteredHost = 'https://' +  $scope.settings.hostname.trim().toLowerCase();
                //enteredHost += '.zyber.com';
                if(enteredHost && enteredHost.trim() !== ""){
                    if(withSchema.test($scope.settings.hostname)){

                        HomeService.checkHost(enteredHost).then(function(response){
                            $window.localStorage[hostKey] = enteredHost;
                            $scope.loading = false;
                            $scope.settings.isValid = true;

                            $scope.signIn();

                        }, function(response){
                            if(response.status == 0){
                                $scope.showPopup('Host name provided is not reachable');
                            }
                            else if(response.status != -1){
                                $scope.showPopup('Host name provided is not responding, please try again later');
                            }
                            else //-1 error - offline
                                $scope.loading = false;

                        });
                    }
                }
            }
            //Reset Host
            $scope.resetHost = function(){
                console.log("RestRocal Stroage");
                $state.go('settings');
                $scope.loading = false;
                $window.localStorage.clear();
            }

            $scope.signIn = function(){
                if(!$scope.settings.isValid) {
                    $ionicPopup.alert({
                        title: 'Login error!',
                        template: '<center>Hostname</center>',
                        okType: 'button-assertive'
                    });
                }
                var user = $scope.user;

                if($scope.loading) return;
                if(!user || !$scope.settings.isValid || !user.username || !user.password || user.username == '' || user.password == '') {
                    $ionicPopup.alert({
                        title: 'Login error!',
                        template: '<center>Hostname, username and password are required</center>',
                        okType: 'button-assertive'
                    });
                }
                else{


                    $scope.loading = true;
                    HomeService.authenticate(user.username, user.password)
                        .then(function(response){
                            if($scope.user.remember){
                                //$localstorage.set(serverKey, $scope.settings.hostname.trim().toLowerCase());
                                $localstorage.set(userKey, $scope.user.username);
                                $localstorage.set(passwdKey, $scope.user.password);
                            }
                            else if(!$scope.user.remember){
                                //$localstorage.set(serverKey, $scope.settings.hostname.trim().toLowerCase());
                                $localstorage.set(userKey,'');
                                $localstorage.set(passwdKey,'');
                            }
                            DownloadManager.resetService();
                            $translate.refresh().then(function(){
                                $scope.loading = false;
                                //var skipIntro = $localstorage.get('skipIntro');
                                //if(skipIntro)
                                //	window.location = '#/my-file/hide';
                                //else
                                //	window.location = '#/home';
                                window.location = '#/my-file/hide';
                            });
                        },
                        function(error, code){
                            $scope.loading = false;
                            if(error.status == 401){
                                $ionicPopup.alert({
                                    title: 'Login Error!',
                                    template: '<center>Invalid credentials</center>',
                                    okType: 'button-assertive'
                                });
                            }
                            else if(error.status == 0){
                                $ionicPopup.alert({
                                    title: 'Login Error!',
                                    template: '<center>Host not reachable</center>',
                                    okType: 'button-assertive'
                                });
                            }
                            else if(error.status != -1){
                                $ionicPopup.alert({
                                    title: 'Login Error!',
                                    template: '<center>Unknown error</center>',
                                    okType: 'button-assertive'
                                });
                            }
                            else{
                                $scope.$apply();
                            }
                        });
                }
            };

            $scope.inputType = 'password';
            $scope.passwordCheckbox = false;

            // Hide & show password function
            $scope.hideShowPassword = function(){
                if ($scope.inputType == 'password'){
                    $scope.passwordCheckbox = true;
                    $scope.inputType = 'text';
                }
                else{
                    $scope.passwordCheckbox = false;
                    $scope.inputType = 'password';
                }

            };



            $scope.myGoBack = function() {
                $ionicHistory.goBack();
            };


            var deviceBackListener = $scope.$on('deviceBackAction', function(){
                var currentLocation = window.location.hash.split('#')[1].split('/')[1];
                if(currentLocation == 'login'){
                    $rootScope.exitApp(true);
                }

            });

            $scope.$on('$destroy', function(){
                bindElement;
                deviceBackListener();
            });
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

            $scope.forgotPassword = function() {
                $state.go('forgot-password');
            }

        }]);
