// Module to handle site functionality (loading,scrolling,resizing)
var mgbMainSys = {
	currPage: null,
	mainContentLoaded: false,
	
	init : function() {
		
		// console.log('pd',this.pinnedDismissed);
		var that = this;
		
		this.addListeners();
		
		setTimeout(function(){$('footer').removeClass('tempHide')},500);
		
	},
	
	addListeners : function(){
		var that = this;
		$(document).on('click', '[data-tracking-label]', function(e) {
			
			if ($(this).attr('id') == 'homeLogo' && $('body').hasClass('ishome')){
				e.preventDefault();
				$("html, body").animate({
						scrollTop: 0,
					}, 500);
				return;
				
			}
			
			if($(this).attr('target') != "_blank" ) { 
				//console.log("asdfasdfasdf")
				e.preventDefault();
			}
			var virtualPath = $(this).attr('data-tracking-label');
			that.gaTracking(virtualPath,$(this));
		});
		
	},
	
	
	gaTracking : function(virtualPath,$self){
	    var pieces = virtualPath.split('|');
		
	    if (pieces.length == 3) {
			console.log(pieces[0]+'/'+pieces[1]+'/'+pieces[2]);
	        if ($self && $self.attr('href') && $self.attr('href')[0] != '#' && $self.attr('target') != '_blank') {
	            // internal exit page link
	            
				
	            // makes sure to get interaction data before user leaves site
	           ga('send', 'event', pieces[0], pieces[1], pieces[2], {
	               'hitCallback': function() {
	                    //don't use location href = window.location.href = $self.attr('href');
						mgbMainSys.getPage($self.attr('href'));
	               }
			   });
	        } else {
	           // ga('send', 'event', pieces[0], pieces[1], pieces[2]);
	        }
			   
	    }
		
	},
	
	resize : function(){
		mgbMainSys.checkInView('.ll-all');
	},
	
	isScrolledIntoView : function(elem) {
	    var docViewTop = $(window).scrollTop();
	    var docViewBottom = docViewTop + $(window).height();

	    var elemTop = $(elem).offset().top;
	    var elemBottom = elemTop + $(elem).height()/4;

	    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
	},	
	
	
	handleScrolling : function(){
		
		// move the parallax header
		var yPos = -($(window).scrollTop() / 1.5); 
		var topOff = yPos + 'px';
		$('.parallaxHeader,.subnavFixed').css({ top: topOff });
		
		var currScroll = $(window).attr('scrollY');
		
		var el = '.ll';
		if (mgbMainSys.allCultureLoaded || mgbMainSys.allNewsLoaded) {el = '.ll-all';}
		mgbMainSys.checkInView(el);
	},
	
	checkInView : function(el){
		
		// lazyload images into view when they are in the viewport
		$(el).each(function () {
		  if (mgbMainSys.isScrolledIntoView(this) === true) {
		      $(this).addClass('in-view');
			  var _parent = $(this).parent().next();
	 
			  if (_parent.hasClass('officeInfo') || _parent.hasClass('arrow')) {
				  _parent.addClass('showDetails');
			  }
		  }
		});
	},
	
    pushHistoryState: function (page, bool) {
		// console.log('push',page);
		
		var root = appRoot;
		if (root == page) {
			root = '';
		}else if (page == "/"){
			root = root.substring(0, root.length - 1);
		}
		
		
		
        if (window.history.pushState) {
            if (bool !== false) { //-- do not add to history if using back button
                // console.log('pushing ', page, ' to history');
                window.history.pushState({
                    url: page
                }, "", root + page);
            }
        } else {
            window.location.hash = page;
        }
    },
	
    getPage: function (page, bool) {
		
		var sliced;
		
		if (page.slice(0,1) == "/" && page != "/") {
			sliced = page.slice(1,page.length);
			page = sliced;
		}
		
		// console.log("page", page);
		
		this.pushHistoryState(page, bool);
		
		//check to see if they home section array contains the page
		       
		mgbMainSys.currPage = page;
		
		var intContent = true;
		
		if (page == "/") page = appRoot;
		
		if (page == appRoot){
			page = 'index.php'; 
			intContent = false;
			
		}else{
			page += '.php';
		}
		
		
		
		var reqUrl = appRoot + page + '?ajax=1'; //-- appRoot defined in site-pref.php
		
		if (reqUrl.indexOf('work/') != -1){
			//is an extended bio page
			var portArr = reqUrl.split('/');
			var port = portArr[portArr.length-1];
			var port_id = port.replace('.php?ajax=1','');
			reqUrl = appRoot + "case-study.php?ajax=1&port="+port_id;
			// reqUrl = "/extended-bio.php?ajax=1";
		}

		console.log('req',reqUrl);
		
		if (this.mainContentLoaded == true && !intContent){ // if going to home page, check if content is already loaded before ajax call
			
			console.log("home already loaded");
			
			$('body').removeClass('nothome').addClass('ishome');
			
			// $('#header').removeClass('settle');
			mgbInternalContent.kill();
			
			$("#mainContent").removeClass("inactive");
			
			setTimeout(function(){
				
				$("#internalContent").empty();

			},500);
			
			return;
		}
		
		// Fire immediately on getPage
		// $('#header').removeClass('settle'); //this hides the nav instantly during page transitions
		mgbInternalContent.kill();
		
		$('footer').addClass('tempHide');
		
        var request = $.ajax({
            url: reqUrl,
            dataType: 'text',
            beforeSend: function () {
                //-- unslick carousel before we go!
                try {
					
                } catch (err) {
                    // if (window.console && window.console.log) console.error('carousel destroy error');
                }
            }
        });
		
        request.done(function (response) {
			
			if (intContent){ //request page is an internal page
				
				if ($('#internalContent').hasClass('active')){
					$('#internalContent').removeClass('active');
				} 
				
				
				
				setTimeout(function(){
					window.scrollTo(0, 0);
					
					
					
					$('body').removeClass('ishome').addClass('nothome');
					
					// $("nav").addClass("overlayActive");
					
					$("#mainContent").addClass("inactive");

					$("#internalContent").html(response);
					
					 //call js to init current page
					mgbInternalContent.init();
					
					mgbMainSys.checkInView('.ll-all');
					
					$('footer').removeClass('tempHide');

				},500);
				
			}else{ //back to homepage
				
				
				
				$('body').removeClass('nothome').addClass('ishome');

				$('header').removeClass('settle');
				
				$("#mainContent").html(response);
				$("#mainContent").removeClass("inactive");
				
				mgbMainSys.mainContentLoaded = true;
				
				mgbContent.init();
				mgbContent.resize();
				
				// $("nav").removeClass("overlayActive");
				
				
				
				setTimeout(function(){
					$("#internalContent").empty();
					
					$('footer').removeClass('tempHide');
				},1000);
				
				
			}

        });
		
        request.fail(function (err) {
            if (window.console && window.console.log) console.error("Page failed to load: ", page);
        });
		
        request.always(function (content) {});
    }
};

	
// Module to handle site navigation
var mgbHeader = {

	init : function() {
		this.navContainer = $('nav');
		
		this.addListeners();
		
	},
	
	addListeners : function(){
		var that = this;
			
	},
	
	resize : function(){
		var scope = this;
		
	}
};


// Module to handle site content
var mgbContent = {
    
    init: function() {
	
		$('.homeTile').each(function() {
            $(this).children("a").on('click', function(e) {
				e.preventDefault();
				var thisPage = $(this).data('content');
				mgbMainSys.getPage(thisPage,true);	
            });
		});
    },
	
	resize: function() {
		var that = this;

	}
};


var mgbInternalContent = {
	init: function() {
		var that = this;
		
		this.addListeners();
		setTimeout(function(){that.resize();$("#internalContent").addClass("active");},500);
	},
	
	kill : function(){
		$("#internalContent").removeClass("active");
		// $('#overlayCover').removeClass('active');
	},
	addListeners : function(){
		var that = this;
		
		$('.workHero.vimeo,.workHero.youtube').fitVids();
	},
	
	loadVideo : function(id){
		var that = this;
		$('.videoHolder').empty();
		// console.log($('#heroImage').height())
		$('.videoHolder').css('height',$('#heroImage').height() + "px");
		
		$('#heroImage').addClass('faded collapsed');
		$('#header').addClass('removed');
		$('.videoClose').addClass('revealed');
		
		
		var videoHeight = (lastWindowWidth*9)/16;
		
		setTimeout(function(){
			$('.videoHolder').addClass('growing');
			$('.contentWrapper').addClass('growing');
			
			$('.videoHolder').css('height',videoHeight + "px");
			
			
			$('.videoHolder').html('<div class="videoWrapper"><iframe src="https://player.vimeo.com/video/'+id+'?title=0&byline=0&portrait=0&badge=0&autoplay=1&player_id=vimeoPlayer" width="400" height="225" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen id="vimeoPlayer" data-vimeoId='+id+'></iframe></div>');
		
			$('.videoWrapper').fitVids();
					
			
			$('html,body').animate({ scrollTop: 0 }, 'fast');

			
			that.initVideo();
			
			setTimeout(function(){mgbInternalContent.resize();},300);
			
			setTimeout(function(){
				$('.videoHolder').addClass('expanded').removeClass('growing');
				$('.contentWrapper').removeClass('growing');
			},600);
			
			
		},300);
	},
	
	initVideo : function(){
		// var that = this;
		// var iframe = $('#vimeoPlayer')[0];
		// var player = $f(iframe);
		
		var that = this;
		
		
		this.vimeoPlayer = new Vimeo.Player($('#vimeoPlayer'));
		
		this.vimeoPlayer.ready().then(function(){
			that.vimeoPlayer.setLoop(false);
			
			that.vimeoPlayer.getVideoId().then(function(id) {
	   		 	that.vimeoId = id;
				that.addVideoEvents();
			});
		});
		
	},
	
	addVideoEvents : function(){
		var that = this;
		var vimeoProgress = 0;
		
		this.vimeoPlayer.on('pause', function() {
			mgbMainSys.gaTracking('CS_Video|'+that.vimeoId+'|_PAUSED');
		});
		
		this.vimeoPlayer.on('ended', function() {
			mgbMainSys.gaTracking('CS_Video|'+that.vimeoId+'|_COMPLETE');
		});
		
		this.vimeoPlayer.on('timeupdate', function(e) {
			var progress = e.percent * 100;
			if (progress > 0 && progress <= 25) {
				if (vimeoProgress !== 0 ) {
					mgbMainSys.gaTracking('CS_Video|'+that.vimeoId+'|_STARTED');
					vimeoProgress = 0;
				}
			} else if (progress > 25 && progress <= 50) {
				if (vimeoProgress !== 25 ) {
					mgbMainSys.gaTracking('CS_Video|'+that.vimeoId+'|_25');
					vimeoProgress = 25;
				}
			} else if (progress > 50 && progress <= 75) {
				if (vimeoProgress !== 50) {
					mgbMainSys.gaTracking('CS_Video|'+that.vimeoId+'|_50');
					vimeoProgress = 50;
				}
			} else if (progress > 75) {
				if (vimeoProgress !== 75) {
					mgbMainSys.gaTracking('CS_Video|'+that.vimeoId+'|_75');
					vimeoProgress = 75;
				}
			}
		});
		
		this.vimeoPlayer.play();	
		
	},
	
	removeVideo : function(){
		$('.videoHolder').empty();
		$('.videoHolder').removeAttr('style');
		$('.videoHolder').removeClass('expanded');
		$('.videoHolder').css('height','0px');
		$('#heroImage').removeClass('faded collapsed');
		$('#header').removeClass('removed');
		$('.videoClose').removeClass('revealed');
		mgbInternalContent.resize();
		
		// setTimeout(function(){
		// },300);
	},

	resize : function(){
		
	
	}
};



//can this device support autoplaying video (not a mobile device or tablet)

if($("body").hasClass("ishome")) { //this is the homepage
    mgbContent.init();
	mgbMainSys.mainContentLoaded = true;
	var pathname = window.location.pathname;
	mgbMainSys.currPage = appRoot;
}else{
	mgbInternalContent.init();
}

mgbMainSys.init();
mgbHeader.init();

if(!isMobile.any()) {
	$('body').removeClass('no-autoplay').addClass('autoplay');
}


if($("body").hasClass("ishome") && !isMobile.any()) {
}


window.onscroll = mgbMainSys.handleScrolling;
window.onresize = resizeChecker;
window.onload = resize;


window.onpopstate = function (event) {
	//console.log('pop',event,loc = window.location.pathname);
	
    if (event.state) {
        // console.log('retrieving ', event.state.url, ' from history');
        mgbMainSys.getPage(event.state.url, false);
    }else{
    	mgbMainSys.getPage(window.location.pathname, false);
    }
};



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
	
	// console.log('resize')
	mgbHeader.resize();
	
	if (mgbMainSys.mainContentLoaded == true || mgbMainSys.allCultureLoaded == true || mgbMainSys.allNewsLoaded == true) {
		mgbMainSys.resize();
		mgbContent.resize();
	}
	
	if ($('#internalContent').hasClass('active')) mgbInternalContent.resize();
}



