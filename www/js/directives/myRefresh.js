angular.module('zyber.directives')
.directive('myRefresh',function($location, $state){
    return {
      link: function(scope, element, attrs) {
		console.log("My refresh directive");
        element.bind('click',function(){
			console.log("My refresh directive");
            if(element[0] && element[0].href && element[0].href === $location.absUrl()){
                $state.reload();
            }
        });
	  }
    };
})