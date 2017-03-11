angular.module('zyber.controllers')
.controller("ForgotPasswordCtrl", 
    ['$scope', 'HomeService', '$rootScope', 'AuthService','$translate','$window',
    function($scope, HomeService, $rootScope, AuthService, $translate, $window){

        $scope.loading = false;
        $scope.user = {};

        $scope.emailSent = false;
        $scope.showError = false;
        $scope.successMessage = '';
        $scope.errorMessage = '';

        $scope.cancel = function(){
            if($scope.loading)
                return;
            window.history.back();
        }

        $scope.pageTitle = "Forgot Password";
        
        $translate(['forgot.password']).then(function(translations){
            setTimeout(function(translations){
                $scope.pageTitle = translations['forgot.password'];
            },500);         
        });     


        $scope.sendEmail = function(){
            if($scope.loading)
                return;
            $scope.loading = true;
            clearMessages();

            if(!$scope.user.username || $scope.user.username == ''){
                displayError('Please enter your username/email');
            }
            else {
                var withSchema = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                if(withSchema.test($scope.user.username)){
                    HomeService.forgotPassword($scope.user).then(function(success){
                        // console.log('forgotPassword response', success);
                        $scope.loading = false;
                        if(success.data.length < 100){
                            displaySuccess(success.data);
                        }
                        else{
                            displayError('Error: failed to send email');    
                        }
                    },
                    function(error){
                        // console.log('forgot password error', error);
                        $scope.loading = false;
                        if(error.data && error.data.length < 100){
                            displayError(error.data);
                        }
                        else
                            displayError('Error: failed to send email');
                    });
                }
                else{
                    displayError('Please enter a valid email address');
                }
            }           
        }

        var displaySuccess = function(message){
            $scope.loading = false;
            $scope.emailSent = true;
            $scope.showError = false;
            $scope.successMessage = message;
            $scope.errorMessage = '';
        }

        var displayError = function(message){
            $scope.loading = false;
            $scope.emailSent = false;
            $scope.showError = true;
            $scope.successMessage = '';
            $scope.errorMessage = message;
        }

        var clearMessages = function(){
            $scope.emailSent = false;
            $scope.showError = false;
            $scope.successMessage = '';
            $scope.errorMessage = '';
        }

        setTimeout(function(){
            var deviceBackListener = $scope.$on('deviceBackAction', function(){
                var currentLocation = window.location.hash.split('#')[1].split('/')[1];
                if(currentLocation == 'forgot-password'){
                    if($scope.stopDeviceBack){}
                    else {
                        $scope.cancel();
                    }
                }
            });
            
            $scope.$on('$destroy', function(){
                deviceBackListener();
            });
        }, 10);
    }
]);