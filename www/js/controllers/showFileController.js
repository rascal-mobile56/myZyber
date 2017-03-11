angular.module('zyber.controllers')
.controller("ShowFileController1", 
	['$scope', '$mdDialog', 'HomeService', '$file',
	function($scope, $mdDialog, HomeService, file){
			
			console.log('ShowFileController called');

			$scope.file = file;
			$scope.url = '/api/download/' + file.uuid;
			$scope.viewPermission = true;

			var audioFormats = ["audio/mpeg", "audio/ogg", "audio/wav", "audio/x-wav", "audio/vorbis"];
			var videoFormats = ["video/mp4", "video/webm", "video/ogg", "video/vorbis", "video/theora"];

			$scope.downloadFile = function(){
				homeService.downloadFileJs(file);
			};
			$scope.cancel = function() {
				$mdDialog.cancel('cancel');
			};
			
			$('#video_id').on('loadstart', function (event) {
			    console.log('loading');
			  });
			  $('#video_id').on('canplay', function (event) {
			    console.log('loaded');
			  });


			if(_.contains(mimeTypes.groupDocTypes, file.mimeType)){
				$scope.fileType = "document";
			}else if(_.contains(videoFormats, file.mimeType)){
				$scope.fileType = "video";
			}else if(_.contains(audioFormats, file.mimeType)){
				$scope.fileType = "audio";
				if(file.mimeType === "audio/vorbis"){
					file.mimeType = "audio/ogg";
				}
			}else{
				$scope.fileType = "unsupported";
			}
	}
]);