angular.module('zyber.services')
.service('AuthService', 
    [function() {

        this.userObj = null;
        this.authToken = null;
        this.deviceObj = null;

        this.setUser = function(userObj){
            this.userObj = userObj;
        }

        this.getUser = function(userObj){
            return this.userObj;
        }

        this.setToken = function(value){
            this.authToken = value;
        }

        this.getToken = function(){
            return this.authToken;
        }

        this.resetToken = function(){
            this.authToken = null;
        }

        this.resetUser = function(){
            this.userObj = null;
            this.authToken = null;
        }

        this.setDevice = function(deviceInfo){
            this.deviceObj = {
                deviceName: deviceInfo.uuid,
                deviceInfo: deviceInfo.platform + '-' + deviceInfo.version,
                deviceLabel: 'deviceLabel' 
            }
        }

        this.getDevice = function(){
            return this.deviceObj;
        }
    }
]);