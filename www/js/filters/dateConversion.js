angular.module('zyber.filters')
.filter('dateConversion', function($filter) {
	return function(date){
		if(!angular.isDefined(date))
			return;
		else if(date == '---')
			return '---';
		var filteredDate = $filter('date')(new Date(date),"yyyy/MM/dd h:mm a");
		
		return filteredDate;
	}
});