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
	

	/* animate header logo */
	
   	var tt = TweenMax.to;
 	var ts = TweenMax.set;
	ts(rect,{rotation:-90,transformOrigin:"50% 50%"})

	var l = document.getElementById('mbLogo')
	l.addEventListener('mouseover',function(){
		showLogo()
	})

	l.addEventListener('mouseout',function(){
		hideLogo()
	})

	function showLogo(){
		tt(rect,.4,{transformOrigin:"50% 50%", drawSVG:"0%",overwrite:true});
		tt(bowenTXT,.4,{x:102, ease:Quad.easeIn, delay:0, overwrite:true});
		tt(cgarryContainer,.4,{width:102, ease:Quad.easeIn, delay:0, overwrite:true});
		tt(owenContainer,.4,{width:79, ease:Quad.easeOut, delay:.35, overwrite:true});
	}

	function hideLogo(){
		tt(rect,.3,{transformOrigin:"50% 50%", delay:.2, drawSVG:"100%",overwrite:true});
		tt(bowenTXT,.3,{x:0, ease:Quad.easeIn, delay:0, overwrite:true});
		tt(cgarryContainer,.3,{width:0, ease:Quad.easeIn, delay:0, overwrite:true});
		tt(owenContainer,.3,{width:0, ease:Quad.easeOut, delay:0, overwrite:true});
	}
	
	

	

	/* calculate correct times for each clock */
	
	/* animate time dials*/
	ts(".clockHours", {rotation: -90, transformOrigin:"50% 50%", drawSVG: "0%", overwrite:true});
	ts(".clockMinutes", {rotation: -90, transformOrigin:"50% 50%", drawSVG: "0%", overwrite:true});
	
		
	// Initialize clocks
	(function(){
		$(".officeTile").each(function(index){
			var timeOffset = parseInt($(this).data("timeOffset")),
		  	d = new Date(),
			utc = d.getTime() + (d.getTimezoneOffset() * 60000),
			nd = new Date(utc + (3600000*timeOffset));
  		  	
			var ndHours = nd.getHours();
			if(ndHours > 12) {
				ndHours -= 12;
			}
			
			var clockHours = Math.floor((ndHours/12) * 100) + "%";
			var clockMinutes = Math.floor(100 * (nd.getMinutes()/60))+"%";
			
			nd = nd.toLocaleString({hour: 'numeric', minute: 'numeric'}).replace(/:\d{2}\s/,' ').split(",")[1];
  		  	
			$(this).children("a").find("time").text(nd);
			
			var hrEle = $(this).find(".clockHours");
			var minEle = $(this).find(".clockMinutes");
			
			tt(hrEle, 1, {transformOrigin:"50% 50%", drawSVG: clockHours, overwrite:true});
			tt(minEle, 1, {transformOrigin:"50% 50%", drawSVG: clockMinutes, overwrite:false});
		});  
	})();
	
	// Update clocks
	
	setInterval(function(){
		$(".officeTile").each(function(index){
			var timeOffset = parseInt($(this).data("timeOffset")),
		  	d = new Date(),
			utc = d.getTime() + (d.getTimezoneOffset() * 60000),
			nd = new Date(utc + (3600000*timeOffset));

			var ndHours = nd.getHours();
			if(ndHours > 12) {
				ndHours -= 12;
			}
			
			var clockHours = Math.floor((ndHours/12) * 100) + "%";
			var clockMinutes = Math.floor(100 * (nd.getMinutes()/60))+"%";
			
			nd = nd.toLocaleString({hour: 'numeric', minute: 'numeric'}).replace(/:\d{2}\s/,' ').split(",")[1];
  		  	
			$(this).children("a").find("time").text(nd);
			
			var hrEle = $(this).find(".clockHours");
			var minEle = $(this).find(".clockMinutes");
			
			tt(hrEle, 1, {transformOrigin:"50% 50%", drawSVG: clockHours, overwrite:true});
			tt(minEle, 1, {transformOrigin:"50% 50%", drawSVG: clockMinutes, overwrite:false});
		});
	}, 60000);	
});
