(function() {
	
	// Module to handle site navigation 
	// var mgbHeader = {
	// 	navContainer : null,
	// 	mainContainer : null,
	// 	overlayContainer : null,
	// 	videoHeaderContainer : null,
	// 	welcomeContainer : null,
	// 	videoPlayerContainer : null,
	//
	// 	init : function() {
	// 		navContainer = $('nav');
	// 		mainContainer = $('.container');
	// 		overlayContainer = $('.video-overlay');
	// 		videoHeaderContainer = $(".videoHeader");
	// 		welcomeContainer = $("#welcomeVideo");
	// 		videoPlayerContainer = $(".responsive-video");
	// 	},
	//
	// };
	//
	// // Module to handle site content
	// var mbgContent = {
	//
	// };
	//
	//
	// // Module to handle window resizing
	// var mgbMainSys = {
	// 	settings : {
	// 		lastWindowHeight : 0,
	// 		lastWindowWidth : 0,
	// 		videoHeight : 0,
	// 		aspectRatio : 16/9,
	// 		videoWidth : 0,
	// 		navHeight : 0,
	// 		maxVideoHeight : 0
	// 	},
	//
	// 	init : function() {
	// 		this.settings.lastWindowHeight = $(window).height();
	// 		this.settings.lastWindowWidth = $(window).width();
	// 		this.settings.aspectRatio = 1.77777777777778; // 16/9
	// 		this.settings.videoWidth = $(window).width();
	// 		this.settings.navHeight = $("nav").height();
	//
	// 		setTimeout(function(){ this.resize(); }, 500)
	// 	},
	//
	// 	resizeUpdate : function() {
	// 		var winWidth = $(window).width();
	// 		var winHeight = $(window).height();
	//
	// 		if(winHeight != this.settings.lastWindowHeight || winWidth != this.settings.lastWindowWidth) {
	// 	        this.settings.lastWindowHeight = winHeight;
	// 	        this.settings.lastWindowWidth = winWidth;
	// 		}
	// 	},
	//
	// 	resize : function() {
	// 		mgbHeader.navContainer.addClass('settle');
	// 		mgbHeader.mainContainer.addClass('settle');
	// 		mgbHeader.overlayContainer.addClass('settle');
	//
	// 		setTimeout(function(){
	// 			mgbHeader.videoHeaderContainer.addClass('settle');
	// 		}, 1000);
	//
	// 		this.settings.videoHeight = this.settings.lastWindowHeight;
	//
	// 		if (this.settings.videoHeight > this.settings.maxVideoHeight) {
	// 			this.settings.videoHeight = this.settings.maxVideoHeight;
	// 		}
	//
	// 		var videoHolderHeight = this.settings.videoHeight;
	//
	// 		mgbHeader.css('height',videoHolderHeight+'px');
	//
	// 		var screenAR = this.settings.lastWindowWidth/ this.settings.videoHeight;
	//
	// 		//reset all inline styles
	// 		mgbHeader.overlayContainer.css('margin-top',0);
	// 		mgbHeader.videoPlayerContainer.css({'margin-top' : '0', 'margin-left' : '0' });
	// 		mgbHeader.welcomeContainer.css('height','100%');
	//
	//
	// 		if (screenAR > this.settings.aspectRatio){ //if screen is wider than 16:9 use video width to set the video size
	//
	// 			this.settings.videoWidth = this.settings.lastWindowWidth;
	// 			this.settings.videoHeight = (this.settings.videoHeight * (1/this.settings.aspectRatio));
	//
	// 			var videoDiff = (this.settings.videoHeight - videoHolderHeight)/2;
	//
	// 			var mt = -videoDiff; //(lastWindowHeight - videoHeight)/2; //calculate the margin-top offset
	//
	// 			mgbHeader.videoPlayerContainer.css('margin-top',mt+"px");
	// 			mgbHeader.overlayContainer.css('margin-top',mt+"px"); //offset video overlay so content stays centered vertically
	// 			mgbHeader.welcomeContainer.css('height',this.settings.+'px');
	//
	// 		} else { //if screen is skinnier than 16:9 use video height (set above line 43) to set the video size
	//
	// 			var ml = (this.settings.lastWindowWidth-this.settings.videoWidth)/2; //calculate the margin-left offset
	// 			mgbHeader.videoPlayerContainer.css('margin-left',ml+"px");
	// 		}
	//
	// 		var colW;
	//
	// 		$(".cultureTile").each(function(){
	//
	// 			if($(this).hasClass("pushRight")) {
	// 				 var nextTile = $(this).next();
	// 				 var picHolder = nextTile.find('.picHolder');
	//
	// 				 colW = picHolder.width(); //move this to a global var on resize???
	//
	// 			} else if($(this).hasClass('pushLeft')) {
	// 				 var prevTile = $(this).prev();
	// 				 var picHolder = prevTile.find('.picHolder');
	//
	// 				 colW = picHolder.width(); //move this to a global var on resize???
	// 			}
	// 		});
	//
	// 		$(".cultureTile").removeClass("stretchOut shrinkMe");
	// 		$(".cultureTile").css('max-height', colW+'px');
	//
	// 	},
	// };		
	

	var lastWindowHeight = $(window).height();
	var lastWindowWidth = $(window).width();
	var videoHeight;
	var aspectRatio = 16/9;
	var videoWidth = $(window).width();
	var navHeight = $("nav").height();

	

	setTimeout(function(){ resize(); }, 500);

	function resizeChecker() {
	    //confirm window was actually resized
	    if ($(window).height() != lastWindowHeight || $(window).width() != lastWindowWidth) {


			//this is a hack that isn't working just yet...
			//animation delay on cultureTile for width and margin
			//causes the resize function to not work properly
			//needs fixing.
			//
			// var magicNumber = 768;
			// if (lastWindowWidth < magicNumber && $(window).width() > magicNumber){
			// 	console.log('magicnumber')
			// 	setTimeout(function(){resize();},500)
			// }


	        //set this windows size
	        lastWindowHeight = $(window).height();
	        lastWindowWidth = $(window).width();

			//call resize function
	        resize();
	    }
	}

	function resize() {

		$('nav').addClass('settle');
		$('.container').addClass('settle');
		$('.video-overlay').addClass('settle');

		setTimeout(function(){ $('.videoHeader').addClass('settle'); }, 1000);


		var colW;
		var maxVideoHeight = 700;


		navHeight = $("nav").height();

		//use video height to set the video size
		videoHeight = lastWindowHeight;
		if (videoHeight > maxVideoHeight) videoHeight = maxVideoHeight;

		var videoHolderHeight = videoHeight;

		$('.videoHeader').css('height',videoHolderHeight+'px');

		videoWidth = (videoHeight * aspectRatio);

		var screenAR = lastWindowWidth/ videoHeight;

		//reset all inline styles
		$('.video-overlay').css('margin-top',0);
		$('.responsive-video').css('margin-top',0);
		$('.responsive-video').css('margin-left',0);
		$('#welcomeVideo').css('height','100%');

		if (screenAR > aspectRatio){ //if screen is wider than 16:9 use video width to set the video size

			videoWidth = lastWindowWidth;
			videoHeight = (videoWidth * (1/aspectRatio));

			var videoDiff = (videoHeight - videoHolderHeight)/2;

			var mt = -videoDiff; //(lastWindowHeight - videoHeight)/2; //calculate the margin-top offset

			$('.responsive-video').css('margin-top',mt+"px");
			$('.video-overlay').css('margin-top',mt+"px"); //offset video overlay so content stays centered vertically
			$('#welcomeVideo').css('height',lastWindowHeight+'px');

		} else { //if screen is skinnier than 16:9 use video height (set above line 43) to set the video size

			var ml = (lastWindowWidth-videoWidth)/2; //calculate the margin-left offset
			$('.responsive-video').css('margin-left',ml+"px");
		}

		$(".responsive-video").css('width', videoWidth + 'px');
		$(".responsive-video").css('height', videoHeight+'px');
		$('.video-overlay').css('height',videoHeight + 'px');

		// End top video section

		$(".cultureTile").each(function(){

			if($(this).hasClass("pushRight")) {
				 var nextTile = $(this).next();
				 var picHolder = nextTile.find('.picHolder');

				 colW = picHolder.width(); //move this to a global var on resize???

			} else if($(this).hasClass('pushLeft')) {
				 var prevTile = $(this).prev();
				 var picHolder = prevTile.find('.picHolder');

				 colW = picHolder.width(); //move this to a global var on resize???
			}
		});

		$(".cultureTile").removeClass("stretchOut shrinkMe");
		$(".cultureTile").css('max-height', colW+'px');

	}
  
  	
	// Update navigation based on user scrolling
	function updateNav() {

		var currScroll = $(window).attr('scrollY');
		
		if(currScroll > navHeight) {
			if(!$("nav").hasClass("sticky")) {
				$("nav").addClass("sticky");
				$("nav").css({'background-color': "rgba(107, 109, 111, 1.0)", 'margin-top': '0'});
			
				$("#mbLogo").off('mouseout');
			
				showLogo();
			}
		} else {
			$("nav").removeClass("sticky");
			$("nav").css({'background-color': 'rgba(107, 109, 111, 0.0)', 'margin-top': '1.5625em'});
			$("nav #mbLogo").css({'position': '', 'margin-top' : '' });
			
			hideLogo();
			
			$('#mbLogo').on('mouseover',function(){
				showLogo();
			});

			$('#mbLogo').on('mouseout',function(){
				hideLogo();
			});
		}
	}
  
  
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
	var animation = new TimelineMax();
	ts(rect,{rotation:-90,transformOrigin:"50% 50%"});
	
	animation.to(rect,.3,{transformOrigin:"50% 50%", drawSVG:"0%"}).
	to(bowenTXT,.2,{x:102, ease:Quad.easeIn}, .2).
	to(cgarryContainer,.2,{width:102, ease:Quad.easeIn}, .2).
	to(owenContainer,.2,{width:79, ease:Quad.easeOut}, .4);
	
	animation.eventCallback("onComplete", function(){
		//$("nav #mbLogo").css({'position': 'relative', 'margin-top' : '-0.625em' });
	});
	
	animation.eventCallback("onReverseComplete", function(){
		//$("nav #mbLogo").css({'position': '', 'margin-top' : '' });
	});
	
	animation.stop();
	
	/* animate downarrow pulse*/
	function downArrowPulse(){
		tt(downArrow,1.5,{y:"-20", delay:0,ease:Back.easeInOut});
		tt(downArrow,1,{y:"0", delay:0.75,ease:Bounce.easeOut,overwrite:false,onComplete:downArrowPulse});
		
	}
	
	downArrowPulse();
	

	$('#mbLogo').on('mouseover',function(){
		showLogo();
	});

	$('#mbLogo').on('mouseout',function(){
		hideLogo();
	});

	function showLogo(){
		animation.play();
	}

	function hideLogo(){
		animation.pause().reverse();
	}
	
		
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
	})();
	

	force.opt.moveEasing = 'easeInCubic';	
	
	$('nav a').on('click', function(){
		$('nav a').removeClass('active');
		$(this).addClass('active');
		
		var hashValue = $(this).attr('href');
		
		force.jump(hashValue);
	});
	
	
	function isScrolledIntoView(elem) {
	    var docViewTop = $(window).scrollTop();
	    var docViewBottom = docViewTop + $(window).height();

	    var elemTop = $(elem).offset().top;
	    var elemBottom = elemTop + $(elem).height();

	    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
	}
	
	$(window).scroll(function () {
	   $('.ll').each(function () {
	      if (isScrolledIntoView(this) === true) {
	          $(this).addClass('in-view');
			  $(this).parent().next().css('opacity', '1');
	      }
	   });
	});
	

	mgbHeader.init();
	mgbMainSys.init();
	
	window.onresize = mgbMainSys.resizeUpdate;
	window.onscroll = updateNav;

	
	setTimeout(function(){ mgbMainSys.resize(); }, 500);
	
	
})();
