angular.module('zyber.factories')
.factory('authInterceptor', function ($rootScope, $q, $window, AuthService) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if (AuthService.getToken()) {
                config.headers.Authorization = AuthService.getToken();
            }
            return config;
        },

        responseError: function (response) {
            console.log("responseError status: " + response.status + " for " + response.config.url);

            var resAuth = response.config.headers.Authorization;
            if (response.status === 401 && 
                AuthService.getToken() && 
                AuthService.getToken() === resAuth) {
        
                var apiName = response.config.url.split('/').pop();
                if(apiName.substr(0, 18) == 'phone-confirmation'){
                    return $q.reject(response);
                }
                else
                    $rootScope.logout(true);
                //invalid token on server, remove token
                // $window.sessionStorage.removeItem("token");
                // AuthService.resetToken();
                // $rootScope.doLogin();
            }
            else if (response.status === 0){
                var url = window.location.hash.substr(2, 8);
                console.log(url);
                if(url != 'settings' && url != 'login'){
                    $rootScope.showHostError();
                }                
                return $q.reject(response);
            }
            else{
                return $q.reject(response);
            }
        },
	
        response: function(response){
            return response;
        }
    };
});