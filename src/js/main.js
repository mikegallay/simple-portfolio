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
		
		if($(this).children('a').length < 1) {
			return;
		}
		
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



	// $(".officeTile").on("click", function(){
	// 	var content = $(this).children("span").html();
	//
	// 	$("#officeDetails").hide().html("");
	// 	$("#officeDetails").html(content).delay(1000).show();
	// });

  	setInterval(function(){
		$(".officeTile").each(function(index){
			var timeOffset = parseInt($(this).data("timeOffset"));

		  	var d = new Date();

			var utc = d.getTime() + (d.getTimezoneOffset() * 60000);

			var nd = new Date(utc + (3600000*timeOffset));
  
			nd = nd.toLocaleString({hour: 'numeric', minute: 'numeric'}).replace(/:\d{2}\s/,' ').split(",")[1];
  
			$(this).children("a").find("time").text(nd);
		});  		
  	}, 1000);


	var loader = document.getElementsByClassName('loader')
	, border = document.getElementsByClassName('border')
	, α = 0
	, π = Math.PI
	, t = 30;

	(function draw() {
		α++;
		α %= 360;
		var r = ( α * π / 180 )
		  , x = Math.sin( r ) * 150
		  , y = Math.cos( r ) * - 150
		  , mid = ( α > 180 ) ? 1 : 0
		  , anim = 'M 0 -150 A 150 150 1 ' 
		         + mid + ' 1 ' 
		         +  x  + ' ' 
		         +  y;//  + ' z';
		//[x,y].forEach(function( d ){
		//  d = Math.round( d * 1e3 ) / 1e3;
		//});
		
		for(var i = 0; i < loader.length; i++) {
			loader[i].setAttribute( 'd', anim );
			border[i].setAttribute( 'd', anim );
		}

		setTimeout(draw, t); // Redraw
		})();
});
