angular.module('zyber.factories')
.factory('UploadFactory', 
	function(HomeFactory, $http, hostKey, $window, AuthService, $rootScope, 
		$translate, $cordovaNetwork, $ionicPopup){

		function getHost(){
			return $window.localStorage[hostKey];
		}

		var flow = new Flow({
			singleFile: true,
			simultaneousUploads: 1,
			chunkSize: 1 * 1024 * 1024,
			target: getHost() + '/api/upload',
			generateUniqueIdentifier: function(){
    			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    			    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    			    return v.toString(16);
    			});
    		},
    		query: function($file, $chunk, isTest){
    			return {
    				parentPath: $file.path,
    				addVersion: $file.addVersion,
    				view: $file.view()
    				};
    		},
    		permanentErrors: [403, 404, 415, 501, 500],
    		headers: {Authorization: AuthService.getToken()},
    		allowDuplicateUploads: true
		});
    		
		var viewPar = HomeFactory.urlViewParam();

		var controllerListener = null;

		var path = null;

		flow.on('fileError', function($file, $message, $flow){
			// console.log('fileError');
			// console.log($message);
			$file.processing = "process_failed";
			if($message == ''){
				setTimeout(function(){
					var customMessage;
					if ($cordovaNetwork.isOnline()){
						$translate(['api.error.upload']).then(function(translations){
							customMessage = translations['api.error.upload'];
							customMessage.replace('{0}', $file.name);
							$rootScope.$broadcast('fileUploadError', customMessage);
						});
					}
					else {
						$translate(['network_offline']).then(function(translations){
							customMessage = translations['network_offline'];	
							$rootScope.$broadcast('fileUploadError', customMessage);
						});
					}
				}, 2000);
			}
			else
				$rootScope.$broadcast('fileUploadError', $message.firstError.userMessage);
		});

		flow.on('fileSuccess', function($file, $message, $flow){
			$file.processing = 'processing';
			$file.ended = new Date();
			var ut = $file.ended - $file.started;
			$http.post(
					getHost() + "/api/checkupload/",
					{name : $file.name, relativePath: $file.relativePath},
					{params: {path: $file.path, view: $file.view()}}
					).success(function(data){


				var addVersion = false;
				if(data.response.existent){
					// addVersion = confirm(data.response.confirm_message);
					$translate(['ok', 'cancel']).then(function(translations){
						var confirmPopup = $ionicPopup.confirm({
							template: '<center>' + data.response.confirm_message + '</center>',
							buttons: [{text: translations.cancel},
										{text: translations.ok, 
										 type: 'button-positive',
										 onTap: function(e) {
										 	return true;
										 	}
										 }]
						});  			

						confirmPopup.then(function(res) {
							if(res) {
								addVersion = true;
							} else {
								addVersion = false;
							}
							doComplete($file, $message, $flow, addVersion);
						});
					}); 
				}
				else{
					doComplete($file, $message, $flow, addVersion);
				}
			}).error(function(data){
				//TODO
				$rootScope.$broadcast('fileUploadError', data.firstError.userMessage);
				$file.cancel();
			});
		});

		function doComplete($file, $message, $flow, addVersion){
			$http.put(getHost() + '/api/upload/' + $file.path + $file.viewParam,
					{flowIdentifier: $file.uniqueIdentifier,
				     flowFilename:$file.name,
				     add_version: addVersion,
				     flowRelativePath: $file.relativePath}).success(function(data){
				     	$rootScope.$broadcast('fileUploadSuccess', $file.name);
						$file.processing = 'completed';
						// controllerListener.update(data.response, $file, addVersion);
						var processed = new Date();
						var pt = processed - $file.ended;
					}).error(function(data){
						console.log("Upload failed");
						console.error(data);
						// controllerListener.popItem();
						$file.processing = "process_failed";
						$rootScope.$broadcast('fileUploadError', data.firstError.userMessage);
					});
		}
		

		flow.on('fileAdded', function($file, $event, $flow){
			// controllerListener.pushItem($file);
			$file.processing = null;
			$file.submitting = true;
			$file.path = path;
			$file.view = HomeFactory.view;
			$file.viewParam = HomeFactory.urlViewParam();
		});

		flow.on('fileProgress', function($file, $message, $flow){
			$file.progress = ($message.endByte/$message.fileObj.size)*100;
		});

		return {
			flowObject: function(){
				return flow;
			},
			setPath: function(npath){
				path = npath;
			},
			setControllerListener: function(listener){
				controllerListener = listener;
			},
			checkUpload: function(path){
				return $http.get(getHost() + '/api/checkupload/', {params: {path: path, view: HomeFactory.view()}});
			},
			addFile: function(file){
				var f = new Flow.FlowFile(flow, file);
				flow.addFile(f);
			},
			upload: function(){
				flow.upload();
			}
		};
	});