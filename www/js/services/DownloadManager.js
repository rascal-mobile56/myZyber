angular.module('zyber.services')
.service('DownloadManager', 
	['$q', '$cordovaFileTransfer', '$window', 'hostKey', '$cordovaFile',
	 'AuthService', '$rootScope', '$translate',
	function($q, $cordovaFileTransfer, $window, hostKey, $cordovaFile,
		AuthService, $rootScope, $translate) {
		this.downloadHistory = [];
		this.downloadStack = [];

		this.downloadingStatus = [];
		this.downloadedFiles = [];

		this.processingStack = false;
		this.pause = false;

		this.addToHistory = function(file){
			this.downloadHistory.push(file);
		};

		this.getHistory = function(){
			return this.downloadHistory;
		};

		this.clearHistory = function(){
			this.downloadedFiles = [];
		};

		this.isEmpty = function(){
			if(this.downloadStack.length == 0)
				return true;
			else
				return false;
		};

		this.addToStack = function(files, contentUrl){
			var contentUrl = contentUrl;
			var that = this;
			_.map(files, function(file){
				if(file instanceof Array){
					that.addToStack(file.reverse(), contentUrl);
				}
				else{
					file.rootFolder.size += file.file.size;
					file.contentUrl = contentUrl;
					that.downloadStack.push(file);
				}
			});
			// console.log('addToStack', this.downloadStack);
			if(!this.processingStack)
				this.processItem();
		};

		this.removeFromStack = function(){
			this.downloadStack.splice(0, 1);
		};

		this.processItem = function(){
			if(!this.isEmpty()){
				this.processingStack = true;
				if(this.downloadStack[0].cancelDownload){
					this.moveNext();
				}
				else{
					if(this.downloadStack[0].type){
						if(ionic.Platform.isIOS()){
							var that = this;
							setTimeout(function(){
								that.moveNext();
							}, 10);
						}
						else{
							var promise = this.createFolder(this.downloadStack[0]);
							var that = this;
							promise.then(
								function(){
									console.log('folder created successful');
									that.moveNext();
								},
								function(error){
									console.log('error in creating folder', error);
									that.moveNext();
								}
							);
						}
					}
					else{
						if(ionic.Platform.isAndroid()){
							var promise = this.downloadFileAndroid(this.downloadStack[0]);
				        }
				        else if(ionic.Platform.isIOS()){
				        	var promise = this.downloadFileIOS(this.downloadStack[0]);
				        }
						var that = this;
						promise.then(
							function(){
								// console.log('download was successful');
								that.moveNext();
							},
							function(error){
								that.downloadStack[0].downloaded = false;
								// if(error.code == 3){
								// 	that.downloadStack[0].message = 'failed: no internet connection';
								// 	that.downloadStack[0].rootFolder.message = 'failed: no internet connection';
								// }
								// else 
								if(error.code == 0){
									that.downloadStack[0].message = error.message;
									that.downloadStack[0].rootFolder.message = error.message;
								}
								else{
									$translate(['failed', 'download_error']).then(function(translations){
										var message = translations['failed'] + ': ' + translations['download_error'];
										if(that.downloadStack[0]){
											that.downloadStack[0].message = message;
											that.downloadStack[0].rootFolder.message = message;
										}
									});
								}
								
								that.moveNext();
							}
						);
					}
				}
			}
			else{
				this.processingStack = false;
			}
		};

		this.download = function(files, contentUrl){
			if(files.length != 0){
				this.addToStack(files, contentUrl);
				this.trackProgress(files);
			}
		};

		this.downloadFileAndroid = function(file){
			var deferred = $q.defer();

			window.nativeDirectory.getFreeSpace(
				[file.contentUrl], 
				function(availableSpace){
					if(Number(availableSpace) > file.file.size){
						// space available - do download
						
						var name = file.targetPath;
					 	var token = AuthService.getToken();
					 	var contentType = "application/json; charset=utf-8";
						var host = $window.localStorage[hostKey];
						var url = host + '/api/download/' + file.file.uuid;
						var initialSize = file.rootFolder.loaded;

						window.nativeDirectory.startDownload(
							[url, token, file.contentUrl, name, contentType], 
							function(data){
								if(data == 'completed'){
									file.downloaded = true;
									file.rootFolder.loaded = initialSize + file.file.size;
									deferred.resolve();
								}
								else{
									file.rootFolder.loaded = initialSize + parseInt(data);
									file.rootFolder.progress = file.rootFolder.loaded/file.rootFolder.size * 100;
									$rootScope.$broadcast('updateProgress');
								}
							}, 
							function(error){
								console.log('error', error);
								file.downloaded = false;
								deferred.reject(error, file);
							});
					}
					else{
						//return error for lack of space
						// console.log('out of space');
						file.downloaded = false;
						$translate(['failed', 'insufficient_space']).then(function(translations){
							var message = translations['failed'] + ': ' + translations['insufficient_space'];
							deferred.reject({code: 0, message: message}, file);
						});
					}
				}, function(error){
					console.log('error in getting freeSpace', error);
				});

			

			return deferred.promise;
		}

		this.downloadFileIOS = function(file){
			var deferred = $q.defer();
			
			var options = {headers : {Authorization: AuthService.getToken()}};
			var host = $window.localStorage[hostKey];
			var url = host + '/api/download/' + file.file.uuid;

			$cordovaFile.getFreeDiskSpace()
			.then(function (success) {
				// success in kilobytes
				if(success < file.size/1024){
					file.downloaded = false;
					// deferred.reject({code: 0, message: 'failed: insufficient space'}, file);
					$translate(['failed', 'insufficient_space']).then(function(translations){
						var message = translations['failed'] + ': ' + translations['insufficient_space'];
						deferred.reject({code: 0, message: message}, file);
					});
				}
				else{
					file.targetPath = file.targetPath.replace(/ /g, '_');
					if(file.file.mimeType.substr(0, 5) == 'image'){
						file.rootFolder.startDownload = true;
						$cordovaFileTransfer.download(url, file.targetPath, options, true)
						.then(function (result) {
							file.rootFolder.loaded += file.file.size;
							var onSuccess = function(result) {
	                            file.downloaded = true;
	                    		deferred.resolve();
	                        }

	                        var onError = function(error) {
	                        	console.log("error", error);
	                          	file.downloaded = false;
								// deferred.reject({code:0, message: error}, file);
								$translate(['failed']).then(function(translations){
									var message = translations['failed'] + ': ' + error;
									if(file.rootFolder.file.isDirectory){
										file.rootFolder.loaded += file.file.size;
									}
									else{
										file.rootFolder.loaded = file.file.size;
									}
									file.rootFolder.status = message;
									deferred.resolve();
								});
	                        }
	                        window.plugins.socialsharing.saveToPhotoAlbum(
								[result.nativeURL],
								onSuccess,
								onError
	                        );
						},function(error){
							console.log("On error", error);
							file.downloaded = false;
							// deferred.reject(error, file);
							$translate(['failed', 'download_error']).then(function(translations){
								var message = translations['failed'] + ': ' + translations['download_error'];
								file.rootFolder.loaded += file.file.size;
								file.rootFolder.status = message;
								deferred.resolve();
							});
						},function(progress){
							// if(aborted)$cordovaFileTransfer.abort();
							file.rootFolder.progress = (file.rootFolder.loaded + progress.loaded)/file.rootFolder.size * 100;
						});
					}
					else if(file.file.mimeType.substr(0, 5) == 'video'){
						file.rootFolder.startDownload = true;
						$cordovaFileTransfer.download(url, file.targetPath, options, true)
						.then(function (result) {
							file.rootFolder.loaded += file.file.size;
							var onSuccess = function(result) {
	                            file.downloaded = true;
	                    		deferred.resolve();
	                        }

	                        var onError = function(error) {
	                        	console.log("error", error);
	                          	file.downloaded = false;
	                          	$translate(['failed']).then(function(translations){
									var message = translations['failed'] + ': ' + error;
									if(file.rootFolder.file.isDirectory){
										file.rootFolder.loaded += file.file.size;
									}
									else{
										file.rootFolder.loaded = file.file.size;
									}
									file.rootFolder.status = message;
									deferred.resolve();
								});
								
	                        }
	                        window.cordova.plugins.PhotoLibrary.videoFromUrl(
								result.nativeURL,
								onSuccess,
								onError
	                        );
						},function(error){
							console.log("On error", error);
							file.downloaded = false;
							// deferred.reject(error, file);
							$translate(['failed', 'download_error']).then(function(translations){
								var message = translations['failed'] + ': ' + translations['download_error'];
								file.rootFolder.loaded += file.file.size;
								file.rootFolder.status = message;
								deferred.resolve();
							});
						},function(progress){
							// if(aborted)$cordovaFileTransfer.abort();
							file.rootFolder.progress = (file.rootFolder.loaded + progress.loaded)/file.rootFolder.size * 100;
						});
					}
					else{
						// deferred.reject({code:0, message: 'Not a valid image file'}, file);
						if(file.rootFolder.file.isDirectory){
							file.rootFolder.loaded += file.file.size;
							$translate(['partial_download']).then(function(translations){
								var message = translations['partial_download'];
								file.rootFolder.status = message;
								deferred.resolve();
							});
						}
						else{
							$translate(['failed', 'invalid_image']).then(function(translations){
								var message = translations['failed'] + ': ' + translations['invalid_image'];
								deferred.reject({code: 0, message: message}, file);
							});
						}
					}

				}	         
			}, function (error) {
				// error
				console.log('getFreeDiskSpace error', error);
				file.downloaded = false;
				// deferred.reject({code: 0, message: 'failed: could not read free space'}, file);
				$translate(['failed', 'error_read_free_space']).then(function(translations){
					var message = translations['failed'] + ': ' + translations['error_read_free_space'];
					deferred.reject({code: 0, message: message}, file);
				});
			});

			return deferred.promise;
		};

		this.getDownloadStatus = function(){
			return this.downloadingStatus;
		};

		this.getDownloadedFiles = function(){
			return this.downloadedFiles;
		};

		this.moveNext = function(){
			var that = this;
			if(that.downloadStack.length){
				var processedItem = that.downloadStack.splice(0,1);
				// processedItem[0].rootFolder.loaded += processedItem[0].file.size;
				if (processedItem[0].rootFolder.loaded == 0 &&
					processedItem[0].rootFolder.size == 0)
					processedItem[0].rootFolder.downloaded = true;
				that.updateDownloadingStatus();
				if(!that.pause){
					that.processItem();
				}
				else
					that.processingStack = false;
			}
		};

		this.createFolder = function(folder){
			var deferred = $q.defer();
			//TODO replace <folder.file.name> with <folder.path + folder.file.name>
			window.nativeDirectory.createDirectory(
				[folder.path + folder.file.name, folder.contentUrl], 
				function(success){
					deferred.resolve('folder created successfully');
				}, function(error){
					deferred.reject(error);
				});
			// $cordovaFile.createDir(folder.path, folder.file.name, false)
			// .then(function (success) {
			// 	deferred.resolve('folder created successfully');
			// }, function (error) {
			// 	deferred.reject(error);
			// });
			return deferred.promise;
		};

		this.trackProgress = function(files){
			var that = this;
			_.map(files, function(file){
				if(file instanceof Array){
					if(file[0].rootFolder){
						that.downloadingStatus.push(file[0].rootFolder);
					}
					else{
						//traverse in the nested arrays to get rootFolder
						var notFound = true;
						var innerArray = file[0];
						while(notFound){
							if(innerArray instanceof Array){
								if(innerArray[0].rootFolder){
									that.downloadingStatus.push(innerArray[0].rootFolder);
									notFound = false;
								}
								else{
									innerArray = innerArray[0];
								}	
							}
							else{
								//empty folder
								notFound = false;
							}
						}
					}
				}
				else{
					that.downloadingStatus.push(file);	
				}
			});
			$rootScope.$broadcast('updateProgress');
		};

		this.updateDownloadingStatus = function(){
			for(var i=0; i< this.downloadingStatus.length; i++){
				if(this.downloadingStatus[i] && this.downloadingStatus[i].message){
					this.downloadingStatus[i].downloaded = false;
					this.downloadedFiles.push(this.downloadingStatus.splice(i, 1)[0]);
				}
				else if( this.downloadingStatus[i] && (this.downloadingStatus[i].downloaded || this.downloadingStatus[i].loaded != 0)
				 && this.downloadingStatus[i].size == this.downloadingStatus[i].loaded){
				 	if(ionic.Platform.isIOS() && this.downloadingStatus[i].status){
				 		this.downloadingStatus[i].downloaded = false;
				 		this.downloadingStatus[i].message = this.downloadingStatus[i].status;
				 		this.downloadedFiles.push(this.downloadingStatus.splice(i, 1)[0]);
				 	}
				 	else
						this.downloadingStatus.splice(i, 1);
				}
			}
			if(ionic.Platform.isIOS()){
				$rootScope.$broadcast('updateProgress');
			}
		};

		this.abortDownload = function(file, fileIndex){
			this.pause = true;
			if(fileIndex == 0){
				if(this.downloadStack[0].file == file.file ||
					this.downloadStack[0].rootFolder.file == file.file){
					// $cordovaFileTransfer.abortDownload();
					this.abortFileTransfer();
					this.downloadingStatus.splice(fileIndex, 1);
				}
			}
			else
				this.downloadingStatus.splice(fileIndex, 1);
			
			var index = this.downloadStack.indexOf(file);
			if(index != -1){
				this.downloadStack[index].cancelDownload = true;
			}
			else{
				//find entries pending in stack and mark cancel
				var rootFolder = file;
				var folderEntries = _.filter(this.downloadStack, function(file){
					return file.rootFolder.file === rootFolder.file;
				});
				_.map(folderEntries, function(file){
					file.cancelDownload = true;
				})
				
				// var found = true;
				// while(found){
				// 	var entry = _.find(this.downloadStack, function(file){
				// 		return file.rootFolder.file === rootFolder.file;
				// 	});
				// 	if(entry){
				// 		var entryIndex = this.downloadStack.indexOf(entry);
				// 		console.log('file entry index', entryIndex);
				// 		if(entryIndex != -1){
				// 			this.downloadStack.splice(entryIndex, 1);
				// 		}
				// 	}
				// 	else{
				// 		found = false;
				// 	}
				// }
			}
			this.pause = false;
			if(!this.processingStack)
				this.processItem();
		};

		this.processItem();

		this.resetService = function(){
			$cordovaFileTransfer.abortDownload();
			
			this.downloadStack = [];
			this.downloadingStatus = [];
			this.downloadedFiles = [];
			this.processingStack = false;
			this.pause = false;	
		};

		this.abortFileTransfer = function(){
			if(ionic.Platform.isIOS()){
				$cordovaFileTransfer.abortDownload();
			}
			else{
				var success = function(message) {
				  	console.log("cancelled"+message);
				}
				var failure = function(message){
					console.log('error in aborting', message);
				}

				window.nativeDirectory.abortDownload("hello", success, failure);
			}
		};
	}
]);