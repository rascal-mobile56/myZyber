angular.module('zyber.services')
.service('FileService', 
	[function() {

		this.getFileIcons = function(filesArray){
			var i = 0, filesArrayLength = filesArray.length;
			if(filesArrayLength > 0){
				if(filesArray[0].path){  // share tab files
					for(;i<filesArrayLength;i++){
						if(filesArray[i].path.mimeType == "application/octet-stream"){
							filesArray[i].iconFile = getApplicationIcon(filesArray[i].path.name.substr(filesArray[i].name.length - 3));
						}
						else{
							filesArray[i].iconFile = getIcon(filesArray[i].path.mimeType);
							filesArray[i].fileType = getFileType(filesArray[i].path.mimeType);
						}
					}
				} else {
					for(;i<filesArrayLength;i++){
						if(filesArray[i].isDirectory){
							continue;
						}
						else{
							if(filesArray[i].mimeType == "application/octet-stream"){
								filesArray[i].iconFile = getApplicationIcon(filesArray[i].name.substr(filesArray[i].name.length - 3));
							}
							else{
								filesArray[i].iconFile = getIcon(filesArray[i].mimeType);
								filesArray[i].fileType = getFileType(filesArray[i].mimeType);
							}
						}
					}					
				}
			}
			return filesArray;
		}

		this.getFileIcon = function(fileObject){
			if(fileObject.mimeType == "application/octet-stream"){
				fileObject.iconFile = getApplicationIcon(fileObject.name.substr(fileObject.name.length - 3));
			}
			else{
				fileObject.iconFile = getIcon(fileObject.mimeType);
			}
			return fileObject;
		}

		var getIcon = function(fileMimeType){

			switch(fileMimeType){
				case "application/pdf": 
					return "img/icons/pdf.png";
					break;
				case "image/gif":
					return "img/icons/jpg.png";
					break;
				case "image/png":
					return "img/icons/jpg.png";
					break;
				case "image/jpeg":
					return "img/icons/jpg.png";
					break;
				case "text/plain":
					return "img/icons/txt.png";
					break;
				case "text/html":
					return "img/icons/html5.png"
				case "application/zlib":
					return "img/icons/zip.png";
					break;
				case "application/zip":
					return "img/icons/zip.png";
					break;
				case "application/x-tika-ooxml":
					return "img/icons/ppt.png";
					break;
				case "video/mp4":
					return "img/icons/mp4.png";
					break;
				case "video/3gpp":
					return "img/icons/3gp.png";
					break;
				case "video/ogg":
					return "img/icons/ogv.png";
					break;
				case "video/webm":
					return "img/icons/webm.png";
					break;
				case "video/mkv":
					return "img/icons/mkv.png";
					break;
				case "video/quicktime":
					return "img/icons/video.png";
					break;
				case "video/x-matroska":
					return "img/icons/mkv.png";
					break;
				case "video/x-flv":
					return "img/icons/flv.png";
					break;
				case "application/vnd.ms-excel":
					return "img/icons/xls.png";
					break;
				case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
					return "img/icons/xls.png";
					break;
				case "application/msword":
					return "img/icons/docs.png";
					break;
				case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
					return "img/icons/docs.png";
					break;
				case "audio/3ga":
					return "img/icons/3gp.png";
					break;
				case "audio/x-m4a":
					return "img/icons/m4a.png";
					break;
				case "audio/mp4":
					return "img/icons/mp4.png";
					break;
				case "audio/x-aac":
					return "img/icons/aac.png";
					break;
				case "audio/x-flac":
					return "img/icons/flac.png";
					break;
				case "audio/mpeg":
					return "img/icons/mp3.png";
					break;
				case "audio/midi":
					return "img/icons/mid.png";
					break;
				case "audio/x-xmf":
					return "img/icons/xmf.png";
					break;
				case "audio/mobile-xmf":
					return "img/icons/mxmf.png";
					break;
				case "audio/x-rtttl":
					return "img/icons/rtttl.png";
					break;
				case "audio/x-imelody":
					return "img/icons/imy.png";
					break;
				case "audio/vorbis":
					return "img/icons/ogg.png";
					break;
				case "audio/x-matroska":
					return "img/icons/mkv.png";
					break;
				case "audio/x-wav":
					return "img/icons/wav.png";
					break;
				case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
					return "img/icons/pptx.png";
					break;
				default:
					return "img/icons/blank.png";
					break;

			}
		};
		var getFileType = function(fileMimeType){
			switch(fileMimeType){
				case "application/pdf": 
					return true;
					break;
				//.doc
				case "application/msword":
					return true;
					break;	
				//.docx	
				case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":	
					return true;	
					break;	
				//docm	
				case "application/vnd.ms-word.document.macroenabled.12":	
					return true;	
					break;	
				//dotx	
				case "application/vnd.openxmlformats-officedocument.wordprocessingml.template":	
					return true;	
					break;	
				//dotm	
				case "application/vnd.ms-word.template.macroenabled.12":	
					return true;	
					break;	
				//.xls	
				case "application/vnd.ms-excel":	
					return true;	
					break;	
				//.xlsx	
				case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":	
					return true;	
					break;	
				//.xlsx	
				case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":	
					return true;	
					break;	
				//.xlsm	
				case "application/vnd.ms-excel.sheet.macroenabled.12":	
					return true;	
					break;	
				//.xlsb	
				case "application/vnd.ms-excel.sheet.binary.macroenabled.12":	
					return true;	
					break;	
				//.xml	
				case "application/rss+xml":	
					return true;	
					break;	
				//.ppt	
				case "application/vnd.ms-powerpoint":	
					return true;
					break;
				//.pptx	
				case "application/vnd.openxmlformats-officedocument.presentationml.presentation":	
					return true;	
					break;	
				//.ppsx	
				case "application/vnd.openxmlformats-officedocument.presentationml.slideshow":	
					return true;	
					break;	
				//.ppsx
				case "application/vnd.openxmlformats-officedocument.presentationml.slideshow":
					return true;
					break;
				//.vsd
				case "application/vnd.visio":
					return true;
					break;
				//.vsd
				case "application/vnd.visio":
					return true;
					break;
				//.mpp
				case "application/vnd.ms-project":
					return true;
					break;
				//.mpp
				case "application/vnd.ms-project":
					return true;
					break;
				//.eml
				case "message/rfc822":
					return true;
					break;
				//.odt
				case "application/vnd.oasis.opendocument.text":
					return true;
					break;
				//.ott
				case "application/vnd.oasis.opendocument.text-templat":
					return true;
					break;
				//.ods
				case "application/vnd.oasis.opendocument.spreadsheet":
					return true;
					break;
				//.odp
				case "application/vnd.oasis.opendocument.presentation":
					return true;
					break;
				//.rtf
				case "application/rtf":
					return true;
					break;	
				//.txt	
				case "text/plain":	
					return true;	
					break;	
				//.txt	
				case "text/csv":	
					return true;	
					break;	
				//.html	
				case "text/html":	
					return true;	
					break;	
				//.xps	
				case "application/vnd.ms-xpsdocument":	
					return true;
					break;
				//.dxf	
				case "image/vnd.dxf":	
					return true;	
					break;	
				//.dwg	
				case "image/vnd.dwg":	
					return true;	
					break;	
				//.dwg	
				case "image/vnd.dwg":	
					return true;	
					break;	
				//.gif	
				case "image/gif":	
					return true;	
					break;	
				//.png	
				case "image/png":	
					return true;	
					break;	
				//.jpeg
				case "image/jpeg":	
					return true;	
					break;	
				//jpg	
				case "image/jpg":	
					return true;	
					break;	
				//.bmp	
				case "image/bmp":	
					return true;	
					break;	
				//.tiff	
				case "image/tiff":	
					return true;	
					break;	
				//.ico	
				case "image/x-icon":	
					return true;	
					break;	
				//.epub
				case "application/epub+zip":
					return true;
					break;
				//Other file type
				default:
					return false;
					break;
			}
		};

		var getApplicationIcon = function(fileExtension){
			switch(fileExtension){
				case ".ts":
					return "img/icons/ts.png";
					break;
				case "rtx":
					return "img/icons/rtx.png";
					break;
				case "ota":
					return "img/icons/ota.png";
					break;
				default:
					return "img/icons/blank.png";
					break;
			}
		};

		this.setDownloadCheck = function(filesArray){
			var filesArrayLength = filesArray.length;
			var i = 0;
			for(;i<filesArrayLength;i++){
				if(filesArray[i].isDirectory){
					filesArray[i].disableDownload = !filesArray[i].permissions.viewFile;
				}
				else{
					filesArray[i].disableDownload = !filesArray[i].permissions.download;
				}
			}
		};
	}
]);