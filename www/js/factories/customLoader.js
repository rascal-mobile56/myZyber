angular.module('zyber.factories')
.factory('customLoader', function ($q, $translateUrlLoader, myTranslate, $localstorage, hostKey) {
	return function (options) {
		var deferred = $q.defer();
        
        // deferred.resolve(myTranslate.getTranslation());
		var host = $localstorage.get(hostKey);
		if(host){
			$translateUrlLoader({url : host + '/api/usermessages'}).then(function(response){
				// console.log('success', response);
				deferred.resolve(response);
			},
			function(response){
				deferred.resolve();
			});
		}
		else{
			deferred.resolve();
		}

        return deferred.promise;
    };

    

})

// angular.module('zyber.factories')
.factory('myTranslate', function ($q, $translateUrlLoader, $localstorage, hostKey) {
	
	var deferred = $q.defer();

	var setTranslation = function(){
		var host = $localstorage.get(hostKey);
		if(host){
			$translateUrlLoader({url : host + '/api/usermessages'}).then(function(response){
				// console.log('success', response);
				deferred.resolve(response);
			},
			function(response){
				deferred.resolve();
			});
		}
	}

	var getTranslation = function () {
        return deferred.promise;
    };

    return {
    	setTranslation: setTranslation,
    	getTranslation: getTranslation
    };

});