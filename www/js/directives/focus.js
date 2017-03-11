angular.module('zyber.directives')
.directive('focus', function() {
  return {
    restrict: 'A',
    link: function($scope,elem,attrs) {

      elem.bind('keyup', function(e) {
      	if(e.keyCode == 13){
      		if(elem[0].getAttribute('ng-model') == 'user.username'){
      			$(elem[0].form[1]).focus();
      		}
      		else{
      			window.ionic.keyboard.hide();
      		}
      	}
      });
    }
  }
});