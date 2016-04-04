$(function() {
  
  (function(){
	  $(".cultureTile").each(function(index){
		  if(index%2 == 0) {
			if($(this).children("a").length > 0){
			  $(this).addClass('pushRight');
		  	}
		  }
  		});
	})();
  
  $("#clientToggle").on('click', function(){
	  $('#clientList').toggle();
  });
  
  
  $(".cultureTile").on('click', function(){
   	  if($(this).hasClass('pushRight')){
		  $(this).next().toggleClass("shrinkMe");
   		  $(this).toggleClass('stretchOut');
   	  }
   });
  
});
