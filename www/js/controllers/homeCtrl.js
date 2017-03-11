angular.module('zyber.controllers')
    .controller("HomeCtrl",
    ['$scope', '$state','serverKey','$localstorage', '$ionicSlideBoxDelegate','$window', function($scope, $state,serverKey,$localstorage, $ionicSlideBoxDelegate, $window) {



        console.log('start home');
        $scope.slideIndex = 0;

        $scope.nextimgstyle = function(){
            if($scope.slideIndex > 0){
                return {'margin-left': '40%'}
            } else{
                return {'margin-left': '20%'}
            }
        }

        $scope.previousimgstyle = function(){
            if($scope.slideIndex < 2){

                return {'margin-left': '0%'}
            } else{
                return {'margin-left': '20%'}
            }
        }

        $scope.startApp = function() {
            console.log('startApp');
            $state.go('login');
            if($localstorage.get(serverKey))
            {
                $state.go('login');
            }else{
                $state.go('settings');
            }
        };

        $scope.skipSlide = function() {

            $ionicSlideBoxDelegate.next();
            $ionicSlideBoxDelegate.next();
        };

        $scope.next = function() {
            console.log('next');
            $ionicSlideBoxDelegate.next();
        };
        $scope.previous = function() {
            console.log('previous');

            $ionicSlideBoxDelegate.previous();
        };

        $scope.inAppBrowser = function()
        {
            // Open in external browser
            window.open('https://www.myzyber.com','_blank','location=no');
        };

// Called each time the slide changes
        $scope.slideChanged = function(index) {
            $scope.slideIndex = index;
        };

        $scope.myGoBack = function() {
            $ionicHistory.goBack();
        };
    }]);