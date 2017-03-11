angular.module('zyber.directives')
.directive('appVersion', function () {
	return function(scope, elm, attrs) {
		cordova.getAppVersion(function (version) {
			elm.text(version);
		});
	};
});