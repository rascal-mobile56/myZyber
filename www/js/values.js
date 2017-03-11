
angular.module('zyber.values', [])
// .constant("apiServer", "http://localhost:9000")
// .constant("viewerUrl", "http://localhost:9002")
.constant("downloadFolder", 'Zyber_Downloads')
.constant("userKey", "ZYBER_USER")
.constant("passwdKey", "ZYBER_PASSWORD")
.constant("serverKey", "ZYBER_SERVER")
.constant("hostKey", "ZYBER_HOST")
.constant("viewerKey", "ZYBER_HOST_VIEWER")
.constant("mimeTypes", {
	groupDocTypes : [   "application/epub+zip",
						"application/msword",
						"application/pdf",
						"application/rtf",
						"application/vnd.ms-excel",
						"application/vnd.ms-excel.sheet.binary.macroenabled.12",
						"application/vnd.ms-excel.sheet.macroenabled.12",
						"application/vnd.ms-powerpoint",
						"application/vnd.ms-project",
						"application/vnd.ms-word.document.macroenabled.12",
						"application/vnd.ms-word.template.macroenabled.12",
						"application/vnd.ms-xpsdocument",
						"application/vnd.oasis.opendocument.presentation",
						"application/vnd.oasis.opendocument.spreadsheet",
						"application/vnd.oasis.opendocument.text",
						"application/vnd.openxmlformats-officedocument.presentationml.presentation",
						"application/vnd.openxmlformats-officedocument.presentationml.slideshow",
						"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
						"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
						"application/vnd.openxmlformats-officedocument.wordprocessingml.template",
						"application/vnd.visio",
						"application/x-tika-ooxml",
						"application/xml",
						"message/rfc822",
						"text/csv",
						"text/html",
						"text/plain",
						"image/gif",
						"image/jpeg",
						"image/png",
						"image/x-icon",
						"image/vnd.dxf",
						"image/vnd.dwg",
	            ],
	audioTypesAndroid: [
					'audio/3ga',
					'audio/midi',
					'audio/mobile-xmf',
					'audio/mp4',
					'audio/mpeg',
					'audio/ogg',
					'audio/x-aac',
					'audio/x-flac',
					'audio/x-imelody',
					'audio/x-m4a',
					'audio/x-matroska',
					'audio/x-rtttl',
					'audio/x-wav',
					'audio/x-xmf',
					'audio/vorbis'
	],
	audioTypesIOS: [
					'audio/3gpp',
					'audio/3gpp2',
					'audio/aiff',
					'audio/x-aiff',
					'audio/amr',
					'audio/mp3',
					'audio/mpeg3',
					'audio/x-mp3',
					'audio/x-mpeg3',
					'audio/mp4',
					'audio/mpeg',
					'audio/x-mpeg',
					'audio/wav',
					'audio/x-wav',
					'audio/x-m4a',
					'audio/x-m4b',
					'audio/x-m4p'
	],
	videoTypesAndroid: [
					'video/mp4',
					'video/3gpp',
					'video/webm',
					'video/x-matroska'
	],
	videoTypesIOS: [
					'video/3gpp',
					'video/3gpp2',
					'video/mp4',
					'video/quicktime',
					'video/x-m4v'
	]
})
;