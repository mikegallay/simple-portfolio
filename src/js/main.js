$(function() {
  
  (function(){
	  $(".cultureTile").each(function(index){
		  if(index%2 == 0) {
			if($(this).children("a").length > 0){
			   $(this).addClass('pushRight');
		  	}
		  } else {
  			if($(this).children("a").length > 0){
				$(this).addClass('pushLeft');
  		  	}
		  }
		   
  		});
	})();
  
  $("#clientToggle").on('click', function(){
	  $('#clientList').toggle();
  });
  
  
	$(".cultureTile").on('click', function(){
		if(!$(this).hasClass("stretchOut")){
			$(this).siblings().removeClass("shrinkMe stretchOut");	
		}
		 
		 if($(this).hasClass('pushRight')){
			 var nextTile = $(this).next();
			 var picHolder = nextTile.find('.picHolder');

			 var colW = picHolder.width(); //move this to a global var on resize???

			 //can we remove this?
			 if (!$(this).hasClass('stretchOut')){
				 picHolder.css('min-width',colW+'px');
			 }

			 nextTile.toggleClass("shrinkMe");
			 $(this).toggleClass('stretchOut');
		} else if($(this).hasClass('pushLeft')){
			
			 var prevTile = $(this).prev();
			 var picHolder = prevTile.find('.picHolder');

			 var colW = picHolder.width(); //move this to a global var on resize???

			 //can we remove this?
			 if (!$(this).hasClass('stretchOut')){
				 picHolder.css('min-width',colW+'px');
			 }

			 prevTile.toggleClass("shrinkMe");
			 $(this).toggleClass('stretchOut');		
		}
	});
  
});
