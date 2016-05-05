
var mgbUtils = {
   	tt : TweenMax.to,
 	ts : TweenMax.set,
	logoAnimation : new TimelineMax(),
	arrowAnimation : new TimelineMax(),
	
	
	isScrolledIntoView : function(elem) {
	    var docViewTop = $(window).scrollTop();
	    var docViewBottom = docViewTop + $(window).height();

	    var elemTop = $(elem).offset().top;
	    var elemBottom = elemTop + $(elem).height()/4;

	    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
	},	
	
	init : function() {
		this.ts(rect,{rotation:-90,transformOrigin:"50% 50%"});

		this.logoAnimation.to(rect,.3,{transformOrigin:"50% 50%", drawSVG:"0%"}).
		to(bowenTXT,.2,{x:102, ease:Quad.easeIn}, .2).
		to(cgarryContainer,.2,{width:102, ease:Quad.easeIn}, .2).
		to(owenContainer,.2,{width:79, ease:Quad.easeOut}, .4);
		
		this.logoAnimation.stop();	
	
		this.arrowAnimation.to(downArrow,1,{y:"-20", delay:0,ease:Back.easeInOut}).
		to(downArrow,1,{y:"0", delay:0.75, ease:Bounce.easeOut, overwrite:false });
		
		this.arrowAnimation.repeat(-1).play();
		
		jQuery.easing.def = "easeInOutQuint";
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
	msgContainer: null,
	wordArray: null,
	firstWord: '',
	giveFocus: true,
	
	videoHeight : 0,
	aspectRatio : 16/9,
	videoWidth : $(window).width(),
	navHeight : $("nav").height(),
	maxVideoHeight : 500,

	init : function() {
		this.navContainer = $('nav');
		this.mainContainer = $('.container');
		this.overlayContainer = $('.video-overlay');
		this.videoHeaderContainer = $(".videoHeader");
		this.welcomeContainer = $("#welcomeVideo");
		this.videoPlayerContainer = $(".responsive-video");	
		this.messageContainer = $(".largeTag");
		this.wordArray = $(".largeTag").data("words").split(",").sort(function() { return 0.5 - Math.random() });
		
		this.messageContainer.on('click', function(){
			$(".largeTag").text('');
		});
		
		this.messageContainer.keypress(function(e){
			var code = e.which;
			
			if(e.which == 13){
				e.preventDefault();
				
				$(".largeTag").text('');
			}
		});
		
		this.initWordCycle();
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
	},
	
	initWordCycle:function(){
		var that = this;
		var headerWords = new TimelineMax({onComplete: function(){that.wordCycleComplete()}});
		var spinLength = 4;
		var n = 0;
		
		for (i=0; i < spinLength*10; i++){
			headerWords.addCallback(function(){that.changeHeaderCopy()}, i * .1);
		}
		
		for (i=0;i<13;i++){
			if (i > 0) n += ((i-1) * .1)/2.5;
			headerWords.addCallback(function(){that.changeHeaderCopy()}, spinLength + n);
		}
		
	},
	
	changeHeaderCopy:function(){
		mgbHeader.firstWord = mgbHeader.wordArray.shift();
		mgbHeader.messageContainer.html(mgbHeader.firstWord);
		mgbHeader.wordArray.push(mgbHeader.firstWord);
	},
	
	wordCycleComplete:function(){
		
		$(".moreMsg").delay(500).slideDown();
		if(mgbHeader.giveFocus === true) {
			mgbHeader.messageContainer.focus();
		}
	}

};


// Module to handle site content
var mgbContent = {
    portfolioContent: null ,
    cultureContent: null ,
    officeClocks: null ,
	cultureTimeout: null,
    
    init: function() {
        this.portfolioContent = $('.projectTile');
        this.cultureContent = $('.cultureTile');
        this.officeClocks = $('.officeTile');
        
        this.initPortfolioCnt();
        this.initCultureCnt();
        this.initClockCnt();
    },
    
    initPortfolioCnt: function() {
		
		var that = this;
		
        this.portfolioContent.each(function() {
            $(this).children("a").on('click', function() {
                var url = $(this).attr("data-url");
                var header = $(this).attr("data-header");
				var title = $(this).attr("data-title");
				
                if (url !== "") {
                    $("nav").toggleClass("videoActive");
                    $(".vimeoContainer").addClass("active");
					$(".vimeoContainer").children(".videoTitle").html(header);
					$(".vimeoContainer").children(".videoDescription").html(title);
                    $(this).addClass("active");
                    
                    var iframe = $('#vimeoPlayer')[0];
                    url += "?api=1&autoplay=1";
                    $(iframe).attr('src', url);
                }
            });
        });
		
		$('#projectTileMore').on('click',function(e){
			e.preventDefault();
			
			that.loadMoreContent('projectTile',2);	
		});
    },
    
    
    initCultureCnt: function() {
        var that = this;
		
        $('.pushRight').on('click', function(e) {
            e.preventDefault();
			
			that.setCultureTileHeight();
            
            if (!$(this).hasClass("stretchOut")) {
                $(this).siblings().removeClass("shrinkMe stretchOut");
            }
            
            var nextTile = $(this).next();
            var picHolder = nextTile.find('.picHolder');
            
            var colW = picHolder.width();
            //move this to a global var on resize???
            
            if (!$(this).hasClass('stretchOut')) {
                picHolder.css('min-width', colW + 'px');
            }
			
            nextTile.toggleClass("shrinkMe");
            $(this).toggleClass('stretchOut');
        });
        
        $('.pushLeft').on('click', function(e) {
            e.preventDefault();
            
			that.setCultureTileHeight();
			
            if (!$(this).hasClass("stretchOut")) {
                $(this).siblings().removeClass("shrinkMe stretchOut");
            }
            
            var prevTile = $(this).prev();
            var picHolder = prevTile.find('.picHolder');
            
            var colW = picHolder.width();
            //move this to a global var on resize???

            if (!$(this).hasClass('stretchOut')) {
                picHolder.css('min-width', colW + 'px');
            }
			
            prevTile.toggleClass("shrinkMe");
            $(this).toggleClass('stretchOut');
        });
		
		$('#cultureTileMore').on('click',function(e){
			e.preventDefault();
			
			that.loadMoreContent('cultureTile',2);
		});
    },
	
	loadMoreContent:function(tar,num){
		
		//make sure the culture tiles have a height to animate against
		if (tar == 'cultureTile') this.setCultureTileHeight();
		
		//make sure the project tiles have a height to animate against
		//then remove it once the animation is complete.
		if (tar == 'projectTile'){
			
			//use the fourth project because it is guaranteed to have a 1x1 ratio
			var colW = $('.projectTile:nth-child(4) a').width();
			$('.projectTile').css('height', colW + 'px');
			
		  	setTimeout(function(){
		    	$('.projectTile').removeAttr('style');
		    }, 1000);
		}
		
		var newContent = $("."+tar+".notLoaded").slice(0, num);
		
		for (var i=0;i<newContent.length;i++){
			var nc = $(newContent[i]);
			nc.removeClass('notLoaded');
			
			(function(content){
			  	setTimeout(function(){
					//removing 'notShowing' removes the zero value for margin and height
			    	content.removeClass('notShowing');
			    }, 150);
				setTimeout(function(){
					//removing 'lazy' fades the image in
			    	content.find('img').removeClass('lazy');
			    }, 450);
			  }(nc));
		
		}
		
		//remove the plus button
		if ($("."+tar+".notLoaded").length == 0) {
            setTimeout(function(){$("#"+tar+"More").parent().removeClass('active'); }, 500);
        }
	},
    
    initClockCnt: function() {
        $(".officeTile").each(function(index) {
            var timeOffset = parseInt($(this).data("timeOffset")), 
            d = new Date(), 
            utc = d.getTime() + (d.getTimezoneOffset() * 60000), 
            nd = new Date(utc + (3600000 * timeOffset));
            
            var ndHours = nd.getHours();
            if (ndHours > 12) {
                ndHours -= 12;
            }
            
            var clockHours = Math.floor((ndHours / 12) * 100) + "%";
            var clockMinutes = Math.floor(100 * (nd.getMinutes() / 60)) + "%";
            
            nd = nd.toLocaleString({
                hour: 'numeric',
                minute: 'numeric'
            }).replace(/:\d{2}\s/, ' ').split(",")[1];
            
            $(this).children("a").find("time").text(nd);
            
            var hrEle = $(this).find(".clockHours");
            var minEle = $(this).find(".clockMinutes");
            
            mgbUtils.tt(hrEle, 1, {
                transformOrigin: "50% 50%",
                drawSVG: clockHours,
                overwrite: true
            });
            mgbUtils.tt(minEle, 1, {
                transformOrigin: "50% 50%",
                drawSVG: clockMinutes,
                overwrite: false
            });
            
            $(this).on('click', function() {
                var currThis = $(this);
                $(this).siblings().children("a").removeClass("active");
                $(this).children("a").addClass("active");
                
                var officeDataText = $(this).children('span').html();
                
                $("#officeDetails").removeClass('showDetails');
                $("#officeDetails").html('');
                $("#officeDetails").html(officeDataText);
				
                setTimeout(function() {
                    $("#officeDetails").addClass('showDetails');
                    
                    $('.closeMe').on('click', function() {
                        $("#officeDetails").removeClass('showDetails');
                        $(currThis).children("a").removeClass("active");
                    });
                }, 300);
            });
        });
    },
	
	setCultureTileHeight: function(){
		
        var that = this;
			
		clearTimeout(this.cultureTimeout);
				
		this.cultureTimeout = setTimeout(function(){
			
			// var colW = that.cultureContent.first().next().find('.picHolder').innerWidth();
			var colW = $('.cultureTile.static').first().find('.picHolder').innerWidth();
			$('.cultureTile').removeAttr('style').css('height', colW + 'px');
			
			//checker for page load to make sure the content is ready.
			if (colW < 50) {
				$('.cultureTile').removeAttr('style');
				that.setCultureTileHeight();
			}
	
		},350);
		
	},
    
    resize: function() {

        var that = this;
		
		this.setCultureTileHeight();
		
		$('.arrow').addClass('offTile');
		$('.picHolder').removeAttr('style');
        that.cultureContent.removeClass("stretchOut shrinkMe");
		
		setTimeout(function(){
					
			$('.arrow').removeClass('offTile');
			
		},600);
        
    },
};


// Module to handle window resizing
var mgbMainSys = {

	init : function() {
		mgbHeader.navContainer.on('click', function(){
			
			// The menu navigation doubles as the container that displays videos
			// clicking on the nav should close the video player container and return
			// the nav menu to its original height. 
			
			if($(this).hasClass("videoActive")){
				$(this).removeClass("videoActive");
				
				var iframe = $('#vimeoPlayer')[0];
				$(iframe).attr('src', '');
				$(".vimeoContainer").children(".videoTitle").html("");
				$(".vimeoContainer").children(".videoDescription").html("");
				
				if($(window).attr('scrollY') < 60){
					$(this).removeClass("sticky");
					$(this).children("#mbLogo").css({'position': '', 'margin-top' : '' });
		
					mgbUtils.hideLogo();
			
					$('#mbLogo').on('mouseover',function(){
						mgbUtils.showLogo();
					});

					$('#mbLogo').on('mouseout',function(){
						mgbUtils.hideLogo();
					});
				}
				
				mgbContent.portfolioContent.each(function(){
					if($(this).children("a").hasClass("active")) {
						$(this).children("a").removeClass("active");
					}
				});
			}
		});
		
		$('nav a').on('click', function(e){
			e.preventDefault();
			
			$(this).removeClass('active');
			var currLink = $(this);

			var hashValue = $(this).attr('href');

			$("html, body").animate({
				scrollTop: $(hashValue).offset().top,
			}, 1000, function() {
				location.hash = hashValue;
			});
			
			$(hashValue).find("span[data-forward]").addClass('forwardVisible'); // animate the text for the section

			$(hashValue).children('.ll').each(function () {
			  if (mgbUtils.isScrolledIntoView(this) === true) {
			      $(this).addClass('in-view');
				  $(this).parent().next().css('opacity', '1');
			  }
			});

			currLink.addClass('active');
		});
		
		$('#mbLogo').on('mouseover',function(){
			mgbUtils.showLogo();
		});

		$('#mbLogo').on('mouseout',function(){
			mgbUtils.hideLogo();
		});
	},
	
	resize : function() {},
	
	handleScrolling : function(){
		var currScroll = $(window).attr('scrollY');
		var scrollBottom = $(document).height() - $("body").height();
	
		if(currScroll > 60) {
			if(!$('nav').hasClass("sticky")) {
				$('nav').addClass("sticky");
		
				$("#mbLogo").off('mouseout');
		
				mgbUtils.showLogo();
			}
		} else {
			if(!$('nav').hasClass("videoActive")) {
				$('nav a').removeClass('active');
				$('nav').removeClass("sticky");
				$("nav #mbLogo").css({'position': '', 'margin-top' : '' });
		
				mgbUtils.hideLogo();
			
				$('#mbLogo').on('mouseover',function(){
					mgbUtils.showLogo();
				});

				$('#mbLogo').on('mouseout',function(){
					mgbUtils.hideLogo();
				});
			
				location.hash = '';
			}
		}

		$('section').each(function(){
		
			var diff = Math.abs($(this).offset().top - $(window).scrollTop());
			var hashName = $(this).attr('id');
			
			if(diff <= 60) {			
				$('nav a').removeClass('active');
				$('nav a[href="#'+hashName+'"]').addClass('active');
				$('#'+hashName).find("span[data-forward]").addClass('forwardVisible');
				
				location.hash = hashName;
			}
		
			if($(window).scrollTop() === scrollBottom) {
				$('nav a').removeClass('active');
				$('.navigation li:last-child a').addClass('active');
			} 
			
			if(mgbUtils.isScrolledIntoView( $(this).find("h1") )) {
			 	$(this).find("span[data-forward]").addClass('forwardVisible');
			}
		});				
			
 	   $('.ll').each(function () {
 	      if (mgbUtils.isScrolledIntoView(this) === true) {
 	          $(this).addClass('in-view');
 			  var _parent = $(this).parent().next();
			 
			  if (_parent.hasClass('officeInfo') || _parent.hasClass('arrow')) _parent.addClass('showDetails');//.css('opacity', '1');
 	      }
 	   });
	},
};


//can this device support autoplaying video (not a mobile device or tablet)
if (!isMobile.any()){
	
	mgbHeader.maxVideoHeight = 700;
	var headerVideoPath = 'assets/img/Main_Sequence_opt';
	
	$('body').removeClass('no-autoplay').addClass('autoplay');
	
	$("#headerVideo").html('<source src="'+headerVideoPath+'.mp4" type="video/mp4"><source src="'+headerVideoPath+'.webm" type="video/webm">' );
	
}

mgbUtils.init();
mgbHeader.init();
mgbContent.init();
mgbMainSys.init();

window.onscroll = mgbMainSys.handleScrolling;
window.onresize = resizeChecker;
window.onload = pauseHashUpdate;

setTimeout(function(){  
	// mgbHeader.resize();
	resize();
}, 500);	

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

// Prevent the page of jumping abruptly when loading from a hash
function pauseHashUpdate() {
	if((location.hash !== "#") && (location.hash !== "")) {
		mgbHeader.giveFocus = false;
		
		var currHash = location.hash; // store the hash 
		location.hash = ""; // empty the hash to keep page at top until the header animation finishes 
		
		setTimeout(function(){
			$("html,body").animate({
				scrollTop: $(currHash).offset().top, 
			}, 800, function(){
				location.hash = currHash;
			});
		}, 2000);
	}
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

