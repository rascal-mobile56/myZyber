// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('zyber.controllers', []);
angular.module('zyber.directives', []);
angular.module('zyber.factories', []);
angular.module('zyber.filters', []);
angular.module('zyber.services', []);

angular.module('zyber',
    ['ionic','ionic.service.core', 'zyber.controllers', 'zyber.services',
    'zyber.factories', 'zyber.directives','zyber.filters', 'zyber.values',
        'pascalprecht.translate', 'ngCordova','ion-autocomplete',
    'underscore', 'ng-mfb', 'ionic.closePopup', 'flow'])

.run(function($ionicPlatform, $rootScope, $cordovaStatusbar) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        console.log("ionicPlatform ready");
        // console.log(JSON.stringify(cordova.file));

        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);


            cordova.plugins.backgroundMode.enable();
            cordova.plugins.backgroundMode.setDefaults({
                title: "Zyber",
                text: "App running in background"
            });
            
            // $cordovaStatusbar.styleHex('#00335e');
        }

        // var isVisible = $cordovaStatusbar.isVisible();

        // console.log('StatusBar.isVisible',isVisible);
        
    });

    
})
.run(function($rootScope, HomeFactory, HomeService, $ionicModal, $window, $localstorage,
                $timeout, userKey, hostKey, viewerKey, _, $location, $ionicPopup,
                $cordovaNetwork, AuthService, myTranslate, $ionicPlatform, DownloadManager,
                $ionicHistory, $translate, $cordovaToast) {

    $ionicPlatform.registerBackButtonAction(function(e){
        $rootScope.$broadcast('deviceBackAction');
    }, 600, [123]);

    // listen for Offline event
    $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
        $rootScope.showNetworkError();
        $rootScope.$broadcast('deviceOffline');
    });

    var showingNetworkError = false;
    $rootScope.showNetworkError = function(){
        if(showingNetworkError)
            return;
        showingNetworkError = true;
        var message = 'The device is offline.';
        window.plugins.toast.showWithOptions(
            {
              message: message,
              duration: "long",
              position: "bottom",
              addPixelsY: -200
            },
            function(success){
                showingNetworkError = false;
                if($window.localStorage[hostKey])
                    $rootScope.logout();
            },
            function(error){
                showingNetworkError = false;
                if($window.localStorage[hostKey])
                    $rootScope.logout();
            });
    };

    $rootScope.initializing = true;

    var stateChangeListener = $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, $timeout, _) {
        console.log(toState.name);
        if(toState.name === "app.my-file" || toState.name === "app.my-activity"){
            console.log('setView myfiles');
            HomeFactory.setView("myfiles");
        } else if(toState.name === "app.my-share") {
            console.log('setView shares');
            HomeFactory.setView("shares");
        } else if(toState.name === "app.shares") {
            HomeFactory.setView("shares");
        }
    });

    $rootScope.$on('$destroy', function(){
        stateChangeListener();
    });
    
    $window.onbeforeunload = function() {
        console.log("onbeforeunload");
        // AuthService.resetUser();
        $rootScope.logout();
    };

    $rootScope.preLogout = function(){
        console.log("preLogout");
        var downloadCompleted = DownloadManager.isEmpty();
        if(!downloadCompleted){
            $translate(['logout', 'download_abort', 'are_you_sure', 'ok', 'cancel']).then(function(translations){
                var confirmPopup = $ionicPopup.confirm({
                    title: '<center>' + translations['logout'] + '</center>',
                    template: '<center>' + translations['download_abort'] + '. <br>' + translations['are_you_sure'] + '?</center>',
                    okText: translations['ok'],
                    cancelText: translations['cancel']
                });             
                
                confirmPopup.then(function(res) {
                    if(res) {
                        $rootScope.logout();
                    }
                });
            });
        }
        else
            $rootScope.logout();
    }

    $rootScope.logout = function(showAlert){
        console.log("logout");
        if(showAlert){
            $translate(['session_expired', 'login_again', 'ok']).then(function(translations){
                $ionicPopup.alert({
                    title: translations['session_expired'] + '!',
                    template: translations['login_again'] + '.',
                    okType: 'button-assertive',
                    okText: translations['ok']
                });
            });
        }
        console.log('Logout called');
        DownloadManager.resetService();
        AuthService.resetUser();
        // window.location = '#/login';
        window.location = '#/home';
    };
    
    $rootScope.settings = {hostname: $localstorage.get(hostKey)};

        $rootScope.doLogin = function(){
            console.log("doLogin");
            var savedUser = AuthService.getUser();
            if(!_.isEmpty(savedUser)){
                if(!AuthService.getToken()){
                    console.log("No token, authenticating with: " + JSON.stringify(savedUser));
                    HomeService.authenticate(savedUser.username, savedUser.password)
                        .then(function(){
                            $rootScope.initializing = false;
                            // window.location.reload();
                            // window.location = '#/home/';
                            console.log("app.my-file");
                            window.location = '#/app.my-file/';
                  
                        },
                        function(error){
                            console.log("app.my-filedrror");
                            if (error.status == -1){
                                $timeout(function(){
                                    $rootScope.doLogin();
                                }, 5000);
                            }
                            else{
                                if (error.status == 401){
                                    AuthService.resetUser();
                                }
                                $timeout(function(){
                                    window.location.reload();
                                }, 500);
                            }

                        });
                }
                else
                    $rootScope.initializing = false;
            }else{
                $rootScope.initializing = false;
                // window.location = '#/login';
                console.log("app.my-error");
                window.location = '#/home';
            }
        }

    // $rootScope.doLogin = function(){
    //  var savedUser = $localstorage.getObject(userKey);
    //  if(!_.isEmpty(savedUser)){
    //      if(!$window.sessionStorage.token){
    //          console.log("No token, authenticating with: " + JSON.stringify(savedUser));
    //          HomeService.authenticate(savedUser.username, savedUser.password)
    //          .then(function(){
    //              $rootScope.initializing = false;
    //              window.location.reload();
    //          }, 
    //          function(error){
    //              // $localstorage.remove(userKey);
    //              if (error.status == -1){
    //                  $timeout(function(){
    //                      $rootScope.doLogin();
    //                  }, 5000);
    //              }
    //              else{
    //                  if (error.status == 401){
    //                      $localstorage.remove(userKey);
    //                  }
    //                  $timeout(function(){
    //                      window.location.reload();
    //                  }, 500);
    //              }
                    
    //          });
    //      }
    //      else
    //          $rootScope.initializing = false;
    //  }else{
    //      $rootScope.initializing = false;
    //      window.location = '#/login';
    //  }
    // }
  
    var host = $localstorage.get(hostKey);

    if(host) {
        console.log("hostok");
        HomeService.checkHost(host).then(function(){
            $rootScope.doLogin();   
        },
        function(error){
            if(error.status == 0){
                $ionicPopup.alert({
                    title: 'Network Error!',
                    template: '<center>Could not reach the host.</center>'
                });
            }
        });
    }
    else{
        console.log("hostelse");
        $rootScope.initializing = false;
        // window.location = '#/home/hide';
    }

    var showExitAlert = true;
    $rootScope.exitApp = function(downloadCompleted){
        console.log("showexitapp");
        if(AuthService.getToken()){
            if(showExitAlert){
                showExitAlert = false;
                $translate(['are_you_sure', 'download_abort', 'app_close', 'ok', 'cancel']).then(function(translations){
                    if(downloadCompleted){
                        var message = '<center>' + translations['are_you_sure'] + '?</center>';
                    }
                    else
                        var message = '<center>' + translations['download_abort'] + '. <br>' + translations['are_you_sure'] + '?</center>';
                                        
                    var confirmPopup = $ionicPopup.confirm({
                        title: '<i class="ion-alert-circled"></i>&nbsp;' + translations['app_close'],
                        template: message,
                        okText: translations['ok'],
                        cancelText: translations['cancel']
                    });             
                    
                    confirmPopup.then(function(res) {
                        if(res) {
                            AuthService.resetUser();
                            ionic.Platform.exitApp();
                        }
                        else
                            showExitAlert = true;
                    });
                });
            }
        }
        else{
            showExitAlert = false;
            var confirmPopup = $ionicPopup.confirm({
                title: '<i class="ion-alert-circled"></i>&nbsp;App is going to close',
                template: '<center>Are you sure?</center>'
            });             
            
            confirmPopup.then(function(res) {
                if(res) {
                    AuthService.resetUser();
                    ionic.Platform.exitApp();
                }
                else
                    showExitAlert = true;
            });
        }
    }

    $rootScope.clearHistory = function() {
        console.log("clearHistory");
        $ionicHistory.clearHistory();
    };

    var showHostError = false;
    $rootScope.showHostError = function(){
        console.log("showHostError");
        if(showHostError)
            return;
        showHostError = true;
        $translate(['disconnected', 'connection_lost', 'ok']).then(function(translations){
            var errPopup = $ionicPopup.alert({
                title: translations['disconnected'] + '!',
                template: '<center>' + translations['connection_lost'] + '</center>',
                okType: 'button-assertive',
                okText: translations['ok']
            });

            errPopup.then(function(res){
                $rootScope.logout();
                showHostError = false;
            });
        });
    };
})
.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('dashboard', {
        abstract: true,
        templateUrl: 'templates/abstract-views/dashboard.html'
    })
    // setup an abstract state for the tabs directive
    .state('app', {
        parent: 'dashboard',
        abstract: true,
        templateUrl: 'templates/abstract-views/tabs.html'
    })
    .state('home', {
        parent: 'dashboard',
        cache: false,
        url: '/home',
        templateUrl : 'templates/views/home.html',
        controller: 'HomeCtrl',
        // views: {
        //  'tab-home': {
        //      templateUrl: 'templates/views/home.html',
        //      controller: 'HomeCtrl'
        //  }
        // },
        // resolve: {
        //  translationReady: function($q, $translate){
        //      var deferred = $q.defer();
        //      // $translate.refresh().then(function(){
        //          $translate('home')
        //          .then(function (translatedValue) {
        //              deferred.resolve();
        //          });
        //      // });

        //      return deferred.promise;
        //  }
        // }
     })
    .state('app.my-file', {
        parent: 'app',
        cache: false,
        url: '/my-file/:fileID:name',
        views: {
            'tab-my-file': {
                templateUrl: 'templates/views/my-file.html',
                controller: 'MyFileCtrl'
            }
        }
    })
    .state('app.my-share', {
        parent: 'app',
        cache: false,
        url: '/my-share/:fileID:name',
        views: {
            'tab-my-shares': {
                templateUrl: 'templates/views/tabs/my-share.html',
                controller: 'MyShareCtrl'
            }
        }
    })
    .state('app.my-share-detail', {
        parent: 'app',
        cache: false,
        url: '/my-share-detail/:fileId',
        views: {
            'tab-my-shares': {
                templateUrl: 'templates/views/tabs/my-share-detail.html',
                controller: 'MyShareDetailCtrl'
            }
        }
    })
    .state('app.my-activity', {
        parent: 'app',
        cache: false,
        url: '/my-activity/:fileID:name',
        views: {
            'tab-my-activity': {
                templateUrl: 'templates/views/tabs/my-activity.html',
                controller: 'MyActivityCtrl'
            }
        }
    })
    .state('app.my-activity-detail', {
        parent: 'app',
        cache: false,
        url: '/my-activity-detail/:fileId:name',
        views: {
            'tab-my-activity': {
                templateUrl: 'templates/views/tabs/activity/detail.html',
                controller: 'ActivityDetailCtrl'
            },
            'side-menu':{
                templeteUrl: 'templetes/views/tabs/sidemenu.html',
                controller:'sidemenuCtrl'
            }
        }
    })
    .state('app.my-deleted', {
        parent: 'app',
        cache: false,
        url: '/my-deleted/:fileID:name',
        views: {
            'tab-deleted': {
                templateUrl: 'templates/views/tabs/deleted-file.html',
                controller: 'DeletedFileCtrl'
            }
        }
    })
    .state('details', {
        parent: 'dashboard',
        cache: false,
        url: '/details/:fileId',
        views: {
            '':{
            templateUrl: 'templates/views/file-details.html',
            controller: 'FileDetailsCtrl'
            }
        }
     })
    .state('settings', {
        parent: 'dashboard',
        cache: false,
        url: '/settings/:name',
        views:{
            '':{
                templateUrl: 'templates/views/host.html',
                controller: 'HostCtrl'      
                }
        }
     })
    .state('login', {
        cache: false,
        url: '/login',
        templateUrl: 'templates/views/login.html',
        controller: 'LoginCtrl'
    })

    .state('create-folder', {
        cache: false,
        url: '/create-folder/:fileId',
        templateUrl: 'templates/views/create-folder.html',
        controller: 'CreateFolderCtrl'
    })

    .state('change-passwd', {
        parent: 'dashboard',
        cache: false,
        url: '/change-passwd',
        templateUrl: 'templates/views/password-change.html',
        controller: 'PasswordChangeCtrl'
    })

    .state('reset-passwd', {
        parent: 'dashboard',
        cache: false,
        url: '/reset-passwd',
        templateUrl: 'templates/views/password-reset.html',
        controller: 'PasswordResetCtrl'
    })

    .state('two-factor-auth', {
        parent: 'dashboard',
        cache: false,
        url: '/two-factor-auth',
        templateUrl: 'templates/views/two-factor-auth.html',
        controller: 'TwoFactorAuthCtrl'
    })

    .state('forgot-password', {
        parent: 'dashboard',
        cache: false,
        url: '/forgot-password',
        templateUrl: 'templates/views/forgot-password.html',
        controller: 'ForgotPasswordCtrl'
    });

    $urlRouterProvider.when('', '/home');
    $urlRouterProvider.otherwise('/home');
})
.config(['$translateProvider', 'hostKey',
    function($translateProvider, hostKey) {
        // var host = window.localStorage[hostKey];
        // if(host){
            // $translateProvider.translations('en',{
            //  'home': 'Home',
            //  'shares': 'Shares',
            //  'select_all': 'Select all'
            // });
            // $translateProvider.translations('es',{
            //  'home': 'Casa',
            //  'shares': 'Comparte',
            //  'select_all': 'Seleccionar todo'
            // });
            // $translateProvider.useUrlLoader ('/api/usermessages');
            $translateProvider.useLoader('customLoader');
            $translateProvider.preferredLanguage("_");//TODO get user language from device
            $translateProvider.useSanitizeValueStrategy('escape');
            $translateProvider.forceAsyncReload(true);

        // }
}])
.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
    $httpProvider.useApplyAsync(true);
})
.config(function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        // Allow loading from our assets domain.  Notice the difference between * and **.
        'http://localhost:9000/**',

        'https://*.stage.zyber.com/**',
        'https://*.qa.zyber.com/**',
        'https://viewer.stage.zyber.com:9003/**'
    ]);
})
.config(function($compileProvider) {

    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|content|file|assets-library):|data:image\/:|blob:/);

    $compileProvider.debugInfoEnabled(false);

})
.config(function($logProvider) {

    $logProvider.debugEnabled(false);

})
.config(function($ionicConfigProvider) {
    // if (!ionic.Platform.isIOS()) {
        // $ionicConfigProvider.scrolling.jsScrolling(false);
    // }

    if(ionic.Platform.isAndroid()){
        $ionicConfigProvider.views.transition("android");
        $ionicConfigProvider.tabs.position("bottom");
    }
    else{
        $ionicConfigProvider.views.transition("none");
    }

    $ionicConfigProvider.navBar.transition('android');

    $ionicConfigProvider.transitions.navBar.android = function(enteringHeaderBar, leavingHeaderBar, direction, shouldAnimate) {
        function setStyles(ctrl, opacity) {
            if (!ctrl) return;
            var css = {};
            // ionic original
            // css.opacity = opacity === 1 ? '' : opacity;

            // modify
            if (opacity === 1) {
                css.opacity = '';
                css.display = '';
            } else {
                css.opacity = opacity;
                css.display = 'none'; // let leavingHeaderBar immediately disappear
            }

            ctrl.setCss('buttons-left', css);
            ctrl.setCss('buttons-right', css);
            ctrl.setCss('back-button', css);
            ctrl.setCss('back-text', css);
            ctrl.setCss('title', css);
        }

        return {
            run: function(step) {
                setStyles(enteringHeaderBar.controller(), step);
                setStyles(leavingHeaderBar && leavingHeaderBar.controller(), 1 - step);
            },
            shouldAnimate: shouldAnimate && (direction == 'forward' || direction == 'back')
        };
    };
});



