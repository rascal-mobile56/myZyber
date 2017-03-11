angular.module('zyber.services')
.service('HomeService', 
    ['$http', '$window', 'HomeFactory', 'hostKey', '$localstorage',
     'userKey', '$cordovaNetwork', '$q', '$rootScope', '$ionicPopup',
     'AuthService',
    function($http, $window, HomeFactory, hostKey, $localstorage,
         userKey, $cordovaNetwork, $q, $rootScope, $ionicPopup,
         AuthService) {

        var host = $window.localStorage[hostKey];
  
        this.authenticate = function(username, passwd){
            console.log('Authenticating user');
            return new Promise(function(fulfill, reject){
                if(AuthService.getToken()){
                    fulfill();
                }
                else{
                    host = $window.localStorage[hostKey];
                    // var userObj = {username:username, password:passwd};
                    var userObj = AuthService.getDevice();

                    //console.log(userObj);
                    userObj.username = username;
                    userObj.password = passwd;
                    userObj.deviceInfo = "iOS-10.0.2";
                    userObj.deviceName = "4D98CB48-F5CC-4C14-9705-BC39BA08657C";
                    console.log(userObj);

                    if(checkNetwork()){
                        $http.post(host + "/api/authenticate", userObj)
                        .success(function(data){
                            console.log("Authenticated with " + JSON.stringify(data));
                            AuthService.setToken(data.Authorization);
                            AuthService.setUser(userObj);
                            if(data.password_change){
                                window.location = "#/reset-passwd";
                            }
                            else if(data.two_factor){
                                window.location = "#/two-factor-auth";
                            }
                            else
                                fulfill();
                        })
                        .error(function (data, status, headers, config) {
                            console.log("Error: " + JSON.stringify(data));
                            reject({message: data, status: status});
                        });
                    }
                    else{
                        reject({status: -1});
                    }
                }
            });
        };
        
        this.checkDownload = function(file){
            if(checkNetwork()){
                return $http.get(host + '/api/download/' + file.uuid + '/checkdownload');
            }
            else{
                return $q.reject({status: -1});
            }
        };

        this.getFiles = function(path, showHidden, ord, asc){   
            console.log('HomeFactory.view()', HomeFactory.view());
            if(checkNetwork()){
                var params = {path: path, showHidden: showHidden, ord: ord, t: asc, view: HomeFactory.view()};
                //var url = host + "/api/paths";
                var url = host + "/api/my-files";
                console.log(JSON.stringify(url));

                return $http.get(url, {params: params});
            }
            else{
                return $q.reject({status: -1});
            }
        };

        this.getFile = function(pathId){
            if(checkNetwork()){
                return $http.get(host + "/api/paths/"+pathId);
            }
            else{
                return $q.reject({status: -1});
            }
        };

        this.getBreadcrumb = function(pathId){
            if(checkNetwork()){
                var params = {path: pathId, view: HomeFactory.view()};
                return $http.get(host + "/api/breadcrumb", {params: params});
            }
            else{
                return $q.reject({status: -1});
            }
        };

        this.createFolder = function(path, folder){
            if(checkNetwork()){
                // var viewPar = HomeFactory.view() ? "?view=" + HomeFactory.view() : "";
                // return $http.post(host + "/api/createFolder" + viewPar, {path: path, folderName: folder});
                // passing view as param as fix for home path
                return $http.post(host + "/api/createFolder", {path: path, folderName: folder, view: HomeFactory.view()});
            }
            else{
                return $q.reject({status: -1});
            }
        };
  
        this.searchFiles = function(name, path, view, showHidden,hiddenOnly, limit){
            var params = {
                name: name, 
                spath: path, 
                view: view,
                showHidden: showHidden,
                hiddenOnly: hiddenOnly, 
                limit: limit
            };
            var searchFiles = $http.get(host +"/api/search", {params: params});
            return searchFiles.then(function(response){ 
                return response.data.response; 
            })
        };

        this.getActivity = function(path,showHidden){
            if(checkNetwork()){
                var params = {
                    path: path, 
                    view: HomeFactory.view(),
                    showHidden: showHidden
                };

                //console.log($rootScope.params.view);
                //return $http.get(host + "/api/activity", {params: params});
                return $http.get(host + "/api/plain-activity", {params: params});
            }
            else{
                return $q.reject({status: -1});
            }
        };

        this.loadViewer = function(fileId){
            var params= {path: fileId};
            //return $http.get(host + "/doc/viewer", {params: params});
            return $http.get(host + "/viewer/document-viewer?path=" + fileId);
        };

        this.checkHost = function(hostname){
            if(checkNetwork()){
                return $http.get(hostname + '/login');
            }
            else{
                return $q.reject({status: -1});
            }
        };

        this.deleteFile = function(file){
            //return $http.post(host + "/api/paths/delete", file);
            return $http.post(host + "/api/paths/" + file + "/destroy");
        };

        var checkNetwork = function(){
            if(!host){ //added to take care of init before setting the host
                host = $window.localStorage[hostKey];
            }
            if(window.cordova && window.cordova.plugins){
                if ($cordovaNetwork.isOnline()){
                    return true;
                }
                else{
                    $rootScope.showNetworkError();
                    return false;
                }
            }
            else
                return true;
        };

        this.getPermissions = function(pathId){
            if(checkNetwork()){
                var params = {path: pathId, view: HomeFactory.view()};
                return $http.get(host + "/api/permissions", {params: params});
            }
            else{
                return $q.reject({status: -1});
            }
        };

        this.getFilePreview = function(pathId){
            if(checkNetwork()){
                return $http.get(host + "/api/download/" + pathId,
                    {'responseType': 'blob' }); 
            }
            else{
                return $q.reject({status: -1});
            }
        }

        this.changePassword = function(passwordObj){
            if(checkNetwork()){
                return $http.put(host + "/api/settings/changePassword", passwordObj);
            }
            else{
                return $q.reject({status: -1});
            }
        };

        this.updatePassword = function(passwordObj){igyvyubugyvhj
            if(checkNetwork()){
                return $http.put(host + "/api/update-password", passwordObj);
            }
            else{
                return $q.reject({status: -1});
            }
        };

        this.resendSMS = function(){
            if(checkNetwork()){
                console.log('send sms');
                return $http.post(host + "/api/resendSms");
            }
            else{
                return $q.reject({status: -1});
            }
        };

        this.phoneConfirmation = function(code){
            if(checkNetwork()){
                return $http.post(host + "/api/phone-confirmation?code=" + code.code);
            }
            else{
                return $q.reject({status: -1});
            }
        };

        this.forgotPassword = function(user){
            host = $window.localStorage[hostKey];
            if(checkNetwork()){
                return $http.post(host + "/forgotPassword?email=" + user.username);
            }
            else{
                return $q.reject({status: -1});
            }
        };

        this.getDeletedFile = function(){
            host = $window.localStorage[hostKey];
            if(checkNetwork()){
                return $http.get(host + "/api/archive");
            }
            else{
                return $q.reject({status: -1});
            }
        };

        this.getSharedFiles = function(uuid){
            host = $window.localStorage[hostKey];
            if(checkNetwork()){
                return $http.get(host + "/api/myzyber/share?pathId="+uuid);
            }
            else {
                return $q.reject({status: -1});
            }
        };

        this.shareFile = function(uuid, data){
            host = $window.localStorage[hostKey];
            if(checkNetwork()){
                return $http.post(host + "/api/myzyber/share?pathId="+uuid, data);
            }
            else {
                return $q.reject({status: -1});
            }
        };
        // https://sarika.stage.zyber.com/api/myzyber/share?pathId=e02a1c9f-099d-4baa-b46e-c5091cc4217f
        // Request Method:GET

        
        this.removeShare = function(shareId){
            host = $window.localStorage[hostKey];
            if(checkNetwork()){
                return $http.delete(host + "/api/myzyber/share?shareId="+shareId);
            }
            else {
                return $q.reject({status: -1});
            }
        };

        //{{ host + '/viewer/document-viewer?path=' + file.uuid}}
        this.getPreviewFile = function(uuid){
            host = $window.localStorage[hostKey];
            if(checkNetwork()){
                return $http.get(host + "/viewer/document-viewer?path="+uuid);
            }
            else {
                return $q.reject({status: -1});
            }
        };

        this.getSharedInformation = function(uuid){
            host = $window.localStorage[hostKey];
            if(checkNetwork()){
                return $http.get(host + "/api/myzyber/shares");
            }
            else {
                return $q.reject({status: -1});
            }
        };
    }









    ]);
