angular.module('zyber.directives')
.directive('filePreview', [ 'HomeService', function(HomeService) {

        //$scope.previewLoading = true;
	function convertToText(obj) {
		//create an array that will later be joined into a string.
		var string = [];

		//is object
		//    Both arrays and objects seem to return "object"
		//    when typeof(obj) is applied to them. So instead
		//    I am checking to see if they have the property
		//    join, which normal objects don't have but
		//    arrays do.
		if (obj == undefined) {
			return String(obj);
		} else if (typeof(obj) == "object" && (obj.join == undefined)) {
			for (prop in obj) {
				if (obj.hasOwnProperty(prop))
				string.push(prop + ": " + convertToText(obj[prop]));
			};
		return "{" + string.join(",") + "}";

		//is array
		} else if (typeof(obj) == "object" && !(obj.join == undefined)) {
			for(prop in obj) {
				string.push(convertToText(obj[prop]));
			}
		return "[" + string.join(",") + "]";

		//is function
		} else if (typeof(obj) == "function") {
			string.push(obj.toString());

		//all other values can be done with JSON.stringify
		} else {
			string.push(JSON.stringify(obj))
		}

		return string.join(",");
	}
	
  return {
      restrict: 'AE',
	  scope: {
                fileid: "=fileid"
      },
      link: function (scope, element, attrs) {
			scope.$watch('fileid', function(newValue, oldValue) {
            loadData();
        });
        function loadData(){
        	var iframeExisting = element.find('iframe');
			if(iframeExisting.length){
				iframeExisting.remove();
			}
				
  			var fileid = scope.fileid;	
  			var windowHeight = $( document ).height();	
  			console.log(windowHeight);
  			HomeService.loadViewer(fileid).then(function (response) {
				console.log("___Loading viewer: ");
                //var previewloadingdisable = document.getElementById("previewloadingdisable");
                //$(previewloadingdisable).css("display", "none");
                var	iframe = document.createElement('iframe');
				console.log(response.data);
				var html = response.data.replace("<center>", "<center style='height:100%; margin-top: 4vh;'>");

				//TODO This may not work on all devices. Test in real devices.
				//an alternative could be to get the default viewer page and
				//just change the necessary elements
				// iframe.srcdoc = html;
				
				iframe.width = '100%';
				iframe.height = '100%';
				iframe.setAttribute("srcdoc", html);
				iframe.setAttribute('name','file-preview');
				element.append(iframe);

				$(iframe).load(function(){
					console.log('Host', HomeService.getHost());
                    //alert( JSON.stringify(HomeService.getHost()));
					$(iframe).css('background', 'rgba(0,0,0,0.8)');

					var iframeContent = iframe.contentDocument;

					$(iframeContent).find(".new_head_tools_dropdown_wrapper .dropdown-menu li a").attr("href", "javascript:;");

					element[0].firstChild.classList.add('display-none');
					
				});
            });
        }
    }
  };
}]);