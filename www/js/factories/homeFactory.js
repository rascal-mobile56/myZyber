angular.module('zyber.factories')
.factory("HomeFactory", function(){
    var sorting = "name";
    var view;
    var asc = true;
    
    return {
      sorting: function(){ 
        return sorting;
      },
      setSorting: function(newSorting){
        sorting = newSorting;
      },
      asc: function(){ 
        return asc;
      },
      setAsc: function(na){
        asc = na;
      },
      view : function(){
        return view;
      },
      setView : function(v){
        view = v;
      },
      urlViewParam: function(){
        var viewParam = view?'?view='+view:'';
        return viewParam;
      }
    };
});