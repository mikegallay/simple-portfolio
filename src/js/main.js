
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
    portfolioContent: null ,
    cultureContent: null ,
    officeClocks: null ,
    
    init: function() {
        this.portfolioContent = $('.projectTile');
        this.cultureContent = $('.cultureTile');
        this.officeClocks = $('.officeTile');
        
        this.initPortfolioCnt();
        this.initCultureCnt();
        this.initClockCnt();
        
        //force.opt.moveEasing = 'easeInOutBack';
    },
    
    initPortfolioCnt: function() {
        this.portfolioContent.each(function() {
            $(this).children("a").on('click', function() {
                var url = $(this).attr("data-url");
                
                if (url !== "") {
                    $("nav").toggleClass("videoActive");
                    $(".vimeoContainer").addClass("active");
                    $(this).addClass("active");
                    
                    var iframe = $('#vimeoPlayer')[0];
                    url += "?api=1&autoplay=1";
                    $(iframe).attr('src', url);
                }
            });
        });
    },
    
    
    initCultureCnt: function() {
        
        $('.pushRight').on('click', function(e) {
            e.preventDefault();
            
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
		
		$('#addCultureContent').on('click',function(e){
			e.preventDefault();
			
			$('.cultureTile').removeClass('notLoaded');
			setTimeout(function(){$('.cultureTile').find('img').removeClass('lazy');},150);
		});
    },
    
    initClockCnt: function() {
        $(".officeTile").each(function(index) {
            var timeOffset = parseInt($(this).data("timeOffset"))
              , 
            d = new Date()
              , 
            utc = d.getTime() + (d.getTimezoneOffset() * 60000)
              , 
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
                        //$("#officeDetails").children().fadeOut();
                    });
                }, 300);
            });
        });
    },
    
    resize: function() {
        
        var colW;
        var that = this;
		
		setTimeout(function(){
	        that.cultureContent.each(function() {
            
	            if ($(this).hasClass("pushRight")) {
	                var nextTile = $(this).next();
	                var picHolder = nextTile.find('.picHolder');
                
	                colW = picHolder.width();
            
	            } else if ($(this).hasClass('pushLeft')) {
	                var prevTile = $(this).prev();
	                var picHolder = prevTile.find('.picHolder');
                
	                colW = picHolder.width();
	            }
	        });
        
	        that.cultureContent.removeClass("stretchOut shrinkMe");
	        that.cultureContent.css('height', colW + 'px');
		},250);
        
    },
};


// Module to handle window resizing
var mgbMainSys = {

	init : function() {
		$('nav').on('click', function(){
			if($(this).hasClass("videoActive")){
				$(this).removeClass("videoActive");
				
				var iframe = $('#vimeoPlayer')[0];
				$(iframe).attr('src', '');
				
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
			
			$('nav a').removeClass('active');
			var currLink = $(this);

			var hashValue = $(this).attr('href');

			$("html, body").animate({
				scrollTop: $(hashValue).offset().top,
			}, 1000, function() {
				location.hash = hashValue;
			});
			
			$(hashValue).find("span[data-forward]").addClass('forwardVisible');

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
			if(!$("nav").hasClass("sticky")) {
				$("nav").addClass("sticky");
		
				$("#mbLogo").off('mouseout');
		
				mgbUtils.showLogo();
			}
		} else {
			if(!$("nav").hasClass("videoActive")) {
				$('nav a').removeClass('active');
				$("nav").removeClass("sticky");
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
window.onload = pauseHashUpdate;

setTimeout(function(){  
	mgbHeader.resize();
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

