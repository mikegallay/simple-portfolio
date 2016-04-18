(function() {

	var mgbUtils = {
	   	tt : TweenMax.to,
	 	ts : TweenMax.set,
		logoAnimation : new TimelineMax(),
		arrowAnimation : new TimelineMax(),
		
		isScrolledIntoView : function(elem) {
		    var docViewTop = $(window).scrollTop();
		    var docViewBottom = docViewTop + $(window).height();

		    var elemTop = $(elem).offset().top;
		    var elemBottom = elemTop + $(elem).height();

		    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
		},	
		
		init : function() {
			this.ts(rect,{rotation:-90,transformOrigin:"50% 50%"});
	
			this.logoAnimation.to(rect,.3,{transformOrigin:"50% 50%", drawSVG:"0%"}).
			to(bowenTXT,.2,{x:102, ease:Quad.easeIn}, .2).
			to(cgarryContainer,.2,{width:102, ease:Quad.easeIn}, .2).
			to(owenContainer,.2,{width:79, ease:Quad.easeOut}, .4);
			
			this.logoAnimation.stop();	
		
			this.arrowAnimation.to(downArrow,1.5,{y:"-20", delay:0,ease:Back.easeInOut}).
			to(downArrow,1,{y:"0", delay:0.75, ease:Bounce.easeOut, overwrite:false });
			
			this.arrowAnimation.yoyo(true).play();
		},
			
		showLogo : function() {
			this.logoAnimation.play();
		},
		
		hideLogo : function() {
			this.logoAnimation.pause().reverse();
		},
	};
	
		
	// Module to handle site navigation
	var mgbHeader = {
		navContainer : null,
		mainContainer : null,
		overlayContainer : null,
		videoHeaderContainer : null,
		welcomeContainer : null,
		videoPlayerContainer : null,
		
		videoHeight : 0,
		aspectRatio : 16/9,
		videoWidth : $(window).width(),
		navHeight : $("nav").height(),
		maxVideoHeight : 700,

		init : function() {
			this.navContainer = $('nav');
			this.mainContainer = $('.container');
			this.overlayContainer = $('.video-overlay');
			this.videoHeaderContainer = $(".videoHeader");
			this.welcomeContainer = $("#welcomeVideo");
			this.videoPlayerContainer = $(".responsive-video");	
		},
		
		resize : function(){
			var scope = this;

			this.navContainer.addClass('settle');
			this.mainContainer.addClass('settle');
			this.overlayContainer.addClass('settle');

			setTimeout(function(){
				scope.videoHeaderContainer.addClass('settle');
			}, 1000);

			this.navHeight = $('nav').height();
			
			this.videoHeight = lastWindowHeight;

			if (this.videoHeight > this.maxVideoHeight) {
				this.videoHeight = this.maxVideoHeight;
			}

			var videoHolderHeight = this.videoHeight;

			this.videoHeaderContainer.css('height',videoHolderHeight+'px');

			this.videoWidth = (this.videoHeight * this.aspectRatio);

			var screenAR = lastWindowWidth / this.videoHeight;
			

			//reset all inline styles
			this.overlayContainer.css('margin-top',0);
			this.videoPlayerContainer.css({'margin-top' : '0', 'margin-left' : '0' });
			this.welcomeContainer.css('height','100%');

			if (screenAR > this.aspectRatio){ //if screen is wider than 16:9 use video width to set the video size

				this.videoWidth = lastWindowWidth;
				this.videoHeight = (this.videoWidth * (1/this.aspectRatio));

				var videoDiff = (this.videoHeight - videoHolderHeight)/2;

				var mt = -videoDiff; //(lastWindowHeight - videoHeight)/2; //calculate the margin-top offset

				this.videoPlayerContainer.css('margin-top',mt+"px");
				this.overlayContainer.css('margin-top',mt+"px"); //offset video overlay so content stays centered vertically
				this.welcomeContainer.css('height',lastWindowHeight+'px');

			} else { //if screen is skinnier than 16:9 use video height (set above line 43) to set the video size

				var ml = (lastWindowWidth-this.videoWidth)/2; //calculate the margin-left offset
				this.videoPlayerContainer.css('margin-left',ml+"px");
			}

			this.videoPlayerContainer.css('width', this.videoWidth + 'px');
			this.videoPlayerContainer.css('height', this.videoHeight+'px');
			this.overlayContainer.css('height',this.videoHeight + 'px');
		}

	};


	// Module to handle site content
	var mgbContent = {
		portfolioContent : null,
		cultureContent : null,
		officeClocks : null,
		
		init : function() {
			this.portfolioContent = $('.projectTile');
			this.cultureContent = $('.cultureTile');
			this.officeClocks = $('.officeTile');
		
			this.initPortfolioCnt();
			this.initCultureCnt();
			this.initClockCnt();
			
			force.opt.moveEasing = 'easeInCubic';
		},
		
		initPortfolioCnt : function(){
			
		},
		
				
		initCultureCnt : function() {
	  	  this.cultureContent.each(function(index) {
	  		  if(index%2 == 0) {
	  			if($(this).children("a").length > 0) {
	  			   $(this).addClass('pushRight');
				   
				   $(this).on('click', function (){	
				   		if(!$(this).hasClass("stretchOut")){
				   			$(this).siblings().removeClass("shrinkMe stretchOut");	
				   		}
					   
						var nextTile = $(this).next();
						var picHolder = nextTile.find('.picHolder');

						var colW = picHolder.width(); //move this to a global var on resize???

						//can we remove this?
						if (!$(this).hasClass('stretchOut')) {
							picHolder.css('min-width',colW+'px');
						}

						nextTile.toggleClass("shrinkMe");
						$(this).toggleClass('stretchOut');
				   });   
	  		  	}
	  		  } else {
    			if($(this).children("a").length > 0) {
  					$(this).addClass('pushLeft');
    		  		
					$(this).on('click', function() {	
						 if(!$(this).hasClass("stretchOut")){
							$(this).siblings().removeClass("shrinkMe stretchOut");	
						 }
					
			   			 var prevTile = $(this).prev();
			   			 var picHolder = prevTile.find('.picHolder');

			   			 var colW = picHolder.width(); //move this to a global var on resize???

			   			 //can we remove this?
			   			 if (!$(this).hasClass('stretchOut')){
			   			 	picHolder.css('min-width',colW+'px');
			   			 }

			   			 prevTile.toggleClass("shrinkMe");
			   			 $(this).toggleClass('stretchOut');	
					});
				}
	  		  }
	    	});
		},
		
		initClockCnt : function() {
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

				mgbUtils.tt(hrEle, 1, {transformOrigin:"50% 50%", drawSVG: clockHours, overwrite:true});
				mgbUtils.tt(minEle, 1, {transformOrigin:"50% 50%", drawSVG: clockMinutes, overwrite:false});
			});
		},
		
		resize : function() {

			var colW;

			this.cultureContent.each(function(){

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

			this.cultureContent.removeClass("stretchOut shrinkMe");
			this.cultureContent.css('max-height', colW+'px');
		},
	};


	// Module to handle window resizing
	var mgbMainSys = {

		init : function() {

			$('nav a').on('click', function(){
				$('nav a').removeClass('active');
				$(this).addClass('active');

				var hashValue = $(this).attr('href');

				force.jump(hashValue); // force is a plugin for link scrolling
			});
		},

		resize : function() {},
		
		handleScrolling : function(){
			var currScroll = $(window).attr('scrollY');
		
			if(currScroll > 60) {
				if(!$("nav").hasClass("sticky")) {
					$("nav").addClass("sticky");
					$("nav").css({'background-color': "rgba(107, 109, 111, 1.0)", 'margin-top': '0'});
			
					$("#mbLogo").off('mouseout');
			
					mgbUtils.showLogo();
				}
			} else {
				$("nav").removeClass("sticky");
				$("nav").css({'background-color': 'rgba(107, 109, 111, 0.0)', 'margin-top': '1.5625em'});
				$("nav #mbLogo").css({'position': '', 'margin-top' : '' });
			
				mgbUtils.hideLogo();
			
				$('#mbLogo').on('mouseover',function(){
					mgbUtils.showLogo();
				});

				$('#mbLogo').on('mouseout',function(){
					mgbUtils.hideLogo();
				});
			}
		
	 	   $('.ll').each(function () {
	 	      if (mgbUtils.isScrolledIntoView(this) === true) {
	 	          $(this).addClass('in-view');
	 			  $(this).parent().next().css('opacity', '1');
	 	      }
	 	   });
		},
	};

	mgbUtils.init();
	mgbHeader.init();
	mgbContent.init();
	mgbMainSys.init();
		
	window.onscroll = mgbMainSys.handleScrolling;
	window.onresize = resizeChecker;
	
	setTimeout(function(){ resize(); }, 500);
	
    var lastWindowHeight = $(window).height();
   	var lastWindowWidth = $(window).width();
		
	function resizeChecker() {
	    //confirm window was actually resized
	    if ($(window).height() != lastWindowHeight || $(window).width() != lastWindowWidth) {

	        //set this windows size
	        lastWindowHeight = $(window).height();
	        lastWindowWidth = $(window).width();

			//call resize function
	        resize();
		}
	}
	
	function resize(){
		mgbHeader.resize();
		mgbContent.resize();
	}

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

			mgbUtils.tt(hrEle, 1, {transformOrigin:"50% 50%", drawSVG: clockHours, overwrite:true});
			mgbUtils.tt(minEle, 1, {transformOrigin:"50% 50%", drawSVG: clockMinutes, overwrite:false});
		});
	}, 60000);


	// var lastWindowHeight = $(window).height();
	// var lastWindowWidth = $(window).width();
	// var videoHeight;
	// var aspectRatio = 16/9;
	// var videoWidth = $(window).width();
	// var navHeight = $("nav").height();
	//
	// setTimeout(function(){ resize(); }, 500);


	//window.onresize = resize;
	

	// function resizeChecker() {
	//     //confirm window was actually resized
	//     if ($(window).height() != lastWindowHeight || $(window).width() != lastWindowWidth) {
	//
	//
	// 		//this is a hack that isn't working just yet...
	// 		//animation delay on cultureTile for width and margin
	// 		//causes the resize function to not work properly
	// 		//needs fixing.
	// 		//
	// 		// var magicNumber = 768;
	// 		// if (lastWindowWidth < magicNumber && $(window).width() > magicNumber){
	// 		// 	console.log('magicnumber')
	// 		// 	setTimeout(function(){resize();},500)
	// 		// }
	//
	//
	//         //set this windows size
	//         lastWindowHeight = $(window).height();
	//         lastWindowWidth = $(window).width();
	//
	// 		//call resize function
	//         resize();
	//     }
	// }

	// function resize() {
	//
	// 	$('nav').addClass('settle');
	// 	$('.container').addClass('settle');
	// 	$('.video-overlay').addClass('settle');
	//
	// 	setTimeout(function(){ $('.videoHeader').addClass('settle'); }, 1000);
	//
	//
	// 	var colW;
	// 	var maxVideoHeight = 700;
	//
	//
	// 	navHeight = $("nav").height();
	//
	// 	//use video height to set the video size
	// 	videoHeight = lastWindowHeight;
	// 	if (videoHeight > maxVideoHeight) videoHeight = maxVideoHeight;
	//
	// 	var videoHolderHeight = videoHeight;
	//
	// 	$('.videoHeader').css('height',videoHolderHeight+'px');
	//
	// 	videoWidth = (videoHeight * aspectRatio);
	//
	// 	var screenAR = lastWindowWidth/ videoHeight;
	//
	// 	//reset all inline styles
	// 	$('.video-overlay').css('margin-top',0);
	// 	$('.responsive-video').css('margin-top',0);
	// 	$('.responsive-video').css('margin-left',0);
	// 	$('#welcomeVideo').css('height','100%');
	//
	// 	if (screenAR > aspectRatio){ //if screen is wider than 16:9 use video width to set the video size
	//
	// 		videoWidth = lastWindowWidth;
	// 		videoHeight = (videoWidth * (1/aspectRatio));
	//
	// 		var videoDiff = (videoHeight - videoHolderHeight)/2;
	//
	// 		var mt = -videoDiff; //(lastWindowHeight - videoHeight)/2; //calculate the margin-top offset
	//
	// 		$('.responsive-video').css('margin-top',mt+"px");
	// 		$('.video-overlay').css('margin-top',mt+"px"); //offset video overlay so content stays centered vertically
	// 		$('#welcomeVideo').css('height',lastWindowHeight+'px');
	//
	// 	} else { //if screen is skinnier than 16:9 use video height (set above line 43) to set the video size
	//
	// 		var ml = (lastWindowWidth-videoWidth)/2; //calculate the margin-left offset
	// 		$('.responsive-video').css('margin-left',ml+"px");
	// 	}
	//
	// 	$(".responsive-video").css('width', videoWidth + 'px');
	// 	$(".responsive-video").css('height', videoHeight+'px');
	// 	$('.video-overlay').css('height',videoHeight + 'px');
	//
	// 	// End top video section
	//
	// 	$(".cultureTile").each(function(){
	//
	// 		if($(this).hasClass("pushRight")) {
	// 			 var nextTile = $(this).next();
	// 			 var picHolder = nextTile.find('.picHolder');
	//
	// 			 colW = picHolder.width(); //move this to a global var on resize???
	//
	// 		} else if($(this).hasClass('pushLeft')) {
	// 			 var prevTile = $(this).prev();
	// 			 var picHolder = prevTile.find('.picHolder');
	//
	// 			 colW = picHolder.width(); //move this to a global var on resize???
	// 		}
	// 	});
	//
	// 	$(".cultureTile").removeClass("stretchOut shrinkMe");
	// 	$(".cultureTile").css('max-height', colW+'px');
	//
	// }
  
  	
	// Update navigation based on user scrolling

  
  
	// (function(){
	//   $(".cultureTile").each(function(index){
	// 	  if(index%2 == 0) {
	// 		if($(this).children("a").length > 0){
	// 		   $(this).addClass('pushRight');
	// 	  	}
	// 	  } else {
	//   			if($(this).children("a").length > 0){
	// 			$(this).addClass('pushLeft');
	//   		  	}
	// 	  }
	//   		});
	// })();

    
	// $(".cultureTile").on('click', function(){
	//
	// 	if($(this).children('a').length < 1) {
	// 		return;
	// 	}
	//
	// 	if(!$(this).hasClass("stretchOut")){
	// 		$(this).siblings().removeClass("shrinkMe stretchOut");
	// 	}
	//
	// 	 if($(this).hasClass('pushRight')){
	// 		 var nextTile = $(this).next();
	// 		 var picHolder = nextTile.find('.picHolder');
	//
	// 		 var colW = picHolder.width(); //move this to a global var on resize???
	//
	// 		 //can we remove this?
	// 		 if (!$(this).hasClass('stretchOut')){
	// 		 	picHolder.css('min-width',colW+'px');
	// 		 }
	//
	// 		 nextTile.toggleClass("shrinkMe");
	// 		 $(this).toggleClass('stretchOut');
	// 	} else if($(this).hasClass('pushLeft')){
	//
	// 		 var prevTile = $(this).prev();
	// 		 var picHolder = prevTile.find('.picHolder');
	//
	// 		 var colW = picHolder.width(); //move this to a global var on resize???
	//
	// 		 //can we remove this?
	// 		 if (!$(this).hasClass('stretchOut')){
	// 		 	picHolder.css('min-width',colW+'px');
	// 		 }
	//
	// 		 prevTile.toggleClass("shrinkMe");
	// 		 $(this).toggleClass('stretchOut');
	// 	}
	// });
	
	
	
	// /* animate header logo */
	//    	var tt = TweenMax.to;
	//  	var ts = TweenMax.set;
	// var animation = new TimelineMax();
	// ts(rect,{rotation:-90,transformOrigin:"50% 50%"});
	//
	// animation.to(rect,.3,{transformOrigin:"50% 50%", drawSVG:"0%"}).
	// to(bowenTXT,.2,{x:102, ease:Quad.easeIn}, .2).
	// to(cgarryContainer,.2,{width:102, ease:Quad.easeIn}, .2).
	// to(owenContainer,.2,{width:79, ease:Quad.easeOut}, .4);
	//
	// animation.stop();
	//
	// /* animate downarrow pulse*/
	// function downArrowPulse(){
	// 	tt(downArrow,1.5,{y:"-20", delay:0,ease:Back.easeInOut});
	// 	tt(downArrow,1,{y:"0", delay:0.75,ease:Bounce.easeOut,overwrite:false,onComplete:downArrowPulse});
	//
	// }
	//
	// downArrowPulse();
	

	// $('#mbLogo').on('mouseover',function(){
	// 	showLogo();
	// });
	//
	// $('#mbLogo').on('mouseout',function(){
	// 	hideLogo();
	// });
	//
	// function showLogo(){
	// 	animation.play();
	// }
	//
	// function hideLogo(){
	// 	animation.pause().reverse();
	// }
	
		
	// Initialize clocks
	// (function(){
	// 	$(".officeTile").each(function(index){
	// 		var timeOffset = parseInt($(this).data("timeOffset")),
	// 	  	d = new Date(),
	// 		utc = d.getTime() + (d.getTimezoneOffset() * 60000),
	// 		nd = new Date(utc + (3600000*timeOffset));
	//
	// 		var ndHours = nd.getHours();
	// 		if(ndHours > 12) {
	// 			ndHours -= 12;
	// 		}
	//
	// 		var clockHours = Math.floor((ndHours/12) * 100) + "%";
	// 		var clockMinutes = Math.floor(100 * (nd.getMinutes()/60))+"%";
	//
	// 		nd = nd.toLocaleString({hour: 'numeric', minute: 'numeric'}).replace(/:\d{2}\s/,' ').split(",")[1];
	//
	// 		$(this).children("a").find("time").text(nd);
	//
	// 		var hrEle = $(this).find(".clockHours");
	// 		var minEle = $(this).find(".clockMinutes");
	//
	// 		tt(hrEle, 1, {transformOrigin:"50% 50%", drawSVG: clockHours, overwrite:true});
	// 		tt(minEle, 1, {transformOrigin:"50% 50%", drawSVG: clockMinutes, overwrite:false});
	// 	});
	//
	//
	// 	// Update clocks
	// 	setInterval(function(){
	// 		$(".officeTile").each(function(index){
	// 			var timeOffset = parseInt($(this).data("timeOffset")),
	// 		  	d = new Date(),
	// 			utc = d.getTime() + (d.getTimezoneOffset() * 60000),
	// 			nd = new Date(utc + (3600000*timeOffset));
	//
	// 			var ndHours = nd.getHours();
	// 			if(ndHours > 12) {
	// 				ndHours -= 12;
	// 			}
	//
	// 			var clockHours = Math.floor((ndHours/12) * 100) + "%";
	// 			var clockMinutes = Math.floor(100 * (nd.getMinutes()/60))+"%";
	//
	// 			nd = nd.toLocaleString({hour: 'numeric', minute: 'numeric'}).replace(/:\d{2}\s/,' ').split(",")[1];
	//
	// 			$(this).children("a").find("time").text(nd);
	//
	// 			var hrEle = $(this).find(".clockHours");
	// 			var minEle = $(this).find(".clockMinutes");
	//
	// 			tt(hrEle, 1, {transformOrigin:"50% 50%", drawSVG: clockHours, overwrite:true});
	// 			tt(minEle, 1, {transformOrigin:"50% 50%", drawSVG: clockMinutes, overwrite:false});
	// 		});
	// 	}, 60000);
	// })();

//	force.opt.moveEasing = 'easeInCubic';	
		
	
	// function isScrolledIntoView(elem) {
	//     var docViewTop = $(window).scrollTop();
	//     var docViewBottom = docViewTop + $(window).height();
	//
	//     var elemTop = $(elem).offset().top;
	//     var elemBottom = elemTop + $(elem).height();
	//
	//     return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
	// }
	//
	// $(window).scroll(function () {
	//    $('.ll').each(function () {
	//       if (isScrolledIntoView(this) === true) {
	//           $(this).addClass('in-view');
	// 		  $(this).parent().next().css('opacity', '1');
	//       }
	//    });
	// });
	
	})();
