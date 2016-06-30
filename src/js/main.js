// Module to handle site functionality (loading,scrolling,resizing)
var mgbMainSys = {
	currPage: null,
	mainContentLoaded: false,
	mobileNavMaxWidth: 768 - 16,//1024,
	
	//load targets for tiles
  	pLoadTarget: 6,
	cLoadTarget:5,
	pLoaded:6,
	cLoaded:5,
	cMoreTarget:5,
	pMoreTarget:6,
	
	waypointsInitialized: false,
	glitchesInitialized: false,
	
	currSelection: null,
	currCoun: 'us',
	currCity: 'glo',
	currLang: 'en',
	
	init : function() {
		var that = this;
		
		
		setTimeout(function(){
			if($(".homeSection").length > 0) {
				that.initWaypoints(); 
			}
			
			mgbContent.setCultureTileHeight();
		
		},2000);
		
		this.addListeners();
		
		
	},
	
	createWaypoint: function(id){
		var waypoint = $('#'+id).waypoint(function(direction) {
			var elemId = this.element.id;
			mgbHeader.deactivateNavActive();
			$("#nav-" + elemId).addClass('active');
		}, {
			offset: '25%'
		})
		
	},
	
	initWaypoints : function(){  
		
		//not woring properly
		var that = this;
		
		this.waypointsInitialized = true;
		
		this.createWaypoint('work');
		this.createWaypoint('culture');
		this.createWaypoint('offices');
		
		//create waypoint to note when clients section enters, to deactivate the other navs
		var clientWaypoint = $('#clients').waypoint(function(direction) {
			mgbHeader.deactivateNavActive();
		}, {
			offset: '50%'
		});
		
		
	},
	
	scrollToSection : function(section,t){
		$("html, body").animate({
				scrollTop: $("#"+section).offset().top - 40,
			}, t);
	},
	
	addGlitch : function(tar,t){
		$(tar).addClass("glitch");

		setTimeout(function(){
			$(tar).removeClass("glitch");
		},t);
	},
	
	selectRandomItemToGlitch : function(el,t){
		
		var arr = el.split('|');
		var index = Math.floor(Math.random()*arr.length);
		this.addGlitch(arr[index],t);
		
	},
	
	initializeGlitches : function(t){
		
		var that = this;
		
		this.glitchesInitialized = true;
		
		//header glitches
		//offset by 1 second from the rest
		/*setTimeout(function(){
			that.selectRandomItemToGlitch('#mbLogo|.menu');
		},1000);*/
		
		setTimeout(function(){
			
			//video section
			that.selectRandomItemToGlitch('#welcomeImage|.responsive-video|.headerHeroText|.moreMsg');
			
			//culture section
			var targets = '#culture .sectionHeading|#culture .moreButton|';
			for (var i=0;i<that.cLoaded;i++){
				targets += '.cultureTile:nth-child('+i+') img|'
			}
			
			(function(tars){
				setTimeout(function(){that.selectRandomItemToGlitch(tars,500);},0);
				setTimeout(function(){that.selectRandomItemToGlitch(tars,250);},200);
				setTimeout(function(){that.selectRandomItemToGlitch(tars,150);},300);
			}(targets));
			
			//work section
			targets = '#work .sectionHeading|#work .moreButton|';
			for (var i=0;i<that.pLoaded;i++){
				targets += '.projectTile:nth-child('+i+') img|'
			}
			
			(function(tars){
				setTimeout(function(){that.selectRandomItemToGlitch(tars,500);},0);
				setTimeout(function(){that.selectRandomItemToGlitch(tars,250);},200);
				setTimeout(function(){that.selectRandomItemToGlitch(tars,150);},300);
			}(targets));
			
			
			//office section
			targets = '#offices .sectionHeading|';
			for (var i=0;i<$('.officeTile').length;i++){
				targets += '.officeTile:nth-child('+i+') img|'
			}
			
			(function(tars){
				setTimeout(function(){that.selectRandomItemToGlitch(tars,500);},0);
				setTimeout(function(){that.selectRandomItemToGlitch(tars,250);},200);
			}(targets));
			
			//clients/jobs section
			/*
			targets = '#clients .sectionHeading|.joinTeamCTA|';
			for (var i=0;i<$('.clientLogo').length;i++){
				targets += '.clientLogo:nth-child('+i+')|'
			}
			
			(function(tars){
				setTimeout(function(){that.selectRandomItemToGlitch(tars,500);},0);
				setTimeout(function(){that.selectRandomItemToGlitch(tars,250);},200);
				setTimeout(function(){that.selectRandomItemToGlitch(tars,150);},300);
				setTimeout(function(){that.selectRandomItemToGlitch(tars,150);},300);
			}(targets));
			*/
			
			//footer
			targets = '.legal|';
			for (var i=0;i<$('.socialIcons a').length;i++){
				targets += '.socialIcons a:nth-child('+i+')|'
			}
			that.selectRandomItemToGlitch(targets,250);
			
			that.initializeGlitches(3000 + Math.random() * 2000);
			
		},t);
	
	},
	
	addListeners : function(){
		var that = this;
		$(document).on('click', '[data-tracking-label]', function(e) {
			
			if($(this).attr('target') != "_blank" ) { 
				console.log("asdfasdfasdf")
				e.preventDefault();
			}
			var virtualPath = $(this).attr('data-tracking-label');
			that.gaTracking(virtualPath,$(this));
		});
		
		
	},
	
	handleOfficeChange : function(val){
		var currId = this.currCoun;
		$('.flag').removeClass(currId);
	    var selVal = val;
		
		var selArr = selVal.split('-');
		this.currCoun = selArr[0];
		this.currCity = selArr[1];
		this.currLang = selArr[2];
		$('.flag').addClass(this.currCoun);
	},
	
	handleOfficeSelector : function(){
		var that = this;
		
		if ($('body').hasClass('autoplay')){
			//not a mobile device/table: use dropkick
			//fire "selection" on close to allow for keyboard control
			$("#office-selector").dropkick({
				change: function () {
					//set global selection on change (fired using down arrow on keyboard)
					that.currSelection = this;
				},
				close: function () {
					setTimeout(function(){
						//if global is set (from keyboard control): use it; if not use mouse value
						var v = (that.currSelection != null) ? that.currSelection.value : this.value;
						
						if (v) that.handleOfficeChange(v);
						that.currSelection = null; //reset global
					},100);
					
					
				}
			});
		} else{
			//use tradition select/option
			$('#office-selector').change(function(){
				that.handleOfficeChange($('#office-selector').val());
			});
		}
	},
	
	gaTracking : function(virtualPath,$self){
	    var pieces = virtualPath.split('|');
		
		if ($self){
			if ($self.hasClass('cultureLink')){
				$self.toggleClass('active');
				if (!$self.hasClass('active')) pieces[2] += "_close";
			}
		
			
		}		
		
	    if (pieces.length == 3) {
			console.log(pieces[0]+'/'+pieces[1]+'/'+pieces[2]);
	        if ($self.attr('href') && $self.attr('href')[0] != '#' && $self.attr('target') != '_blank') {
	            // internal exit page link
	            
				
	            // makes sure to get interaction data before user leaves site
	          //  ga('send', 'event', pieces[0], pieces[1], pieces[2], {
	               // 'hitCallback': function() {
	                    //don't use location href = window.location.href = $self.attr('href');
						mgbMainSys.getPage($self.attr('href')); 
	               // }
			   // });
	        } else {
	           // ga('send', 'event', pieces[0], pieces[1], pieces[2]);
	        }
			   
	    }
		
	},
	
	resize : function(){
		this.checkTileLoad();
	},
	
	isScrolledIntoView : function(elem) {
	    var docViewTop = $(window).scrollTop();
	    var docViewBottom = docViewTop + $(window).height();

	    var elemTop = $(elem).offset().top;
	    var elemBottom = elemTop + $(elem).height()/4;

	    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
	},	
	
	checkTileLoad : function(){
		if (lastWindowWidth >= mgbMainSys.mobileNavMaxWidth){
			//console.log("tile load >1024");
			this.cLoadTarget = 7;
			this.pLoadTarget = 6;
			if (this.cLoaded < this.cLoadTarget){
				mgbContent.loadMoreContent('cultureTile',this.cLoadTarget - this.cLoaded);
				this.cLoaded = this.cLoadTarget;
			}
			
			if (this.pLoaded < this.pLoadTarget){
				mgbContent.loadMoreContent('projectTile',this.pLoadTarget - this.pLoaded);
				this.pLoaded = this.pLoadTarget;
			}
			
			this.cMoreTarget = 7;
			this.pMoreTarget = 8;
			
		}
		
		if (lastWindowWidth >= 1900){
			//console.log("tile load >1900");
			this.cLoadTarget = 10;
			this.pLoadTarget = 9;
			
			/*
			// make sure the target is a multiple of 5 just in case the user 
			// has loaded more at a smaller size and made the screen bigger
			if (this.cLoaded > this.cLoadTarget && this.cLoaded%5 != 0){
				this.cLoadTarget =  round(this.cLoaded/5) * 5;
			}
			*/
			
			if (this.cLoaded < this.cLoadTarget){
				mgbContent.loadMoreContent('cultureTile',this.cLoadTarget - this.cLoaded);
				this.cLoaded = this.cLoadTarget;
			}
			
			if (this.pLoaded < this.pLoadTarget){
				mgbContent.loadMoreContent('projectTile',this.pLoadTarget - this.pLoaded);
				this.pLoaded = this.pLoadTarget;
			}
			
			this.cMoreTarget = 5;
			this.pMoreTarget = 6;
			
		}
	},
	
	handleScrolling : function(){
		
		// move the parallax header
		var yPos = -($(window).scrollTop() / 4); 
		var topOff = yPos + 'px';
		$('.parallaxHeader').css({ top: topOff });
		
		// console.log("scrolling");
		var currScroll = $(window).attr('scrollY');
		// var scrollBottom = $(document).height() - $("body").height();
		
		var stickyNavRevealY = mgbHeroVideo.maxVideoHeight - 75
		
		if ($('#overlayContent').hasClass('active')){
			if($("#heroImage").length > 0) {
				stickyNavRevealY = $('#heroImage img').innerHeight() - 75;
			}else{
				stickyNavRevealY = 50;
			}
		}

		if(currScroll > stickyNavRevealY) {
			$('#Home').addClass("sticky");
			if(!$('nav').hasClass("sticky")) {
				//if (lastWindowWidth > mgbMainSys.mobileNavMaxWidth) {
					$('nav').addClass("sticky");
					/*}else{
					$('#Home').addClass("")
				}*/
		
				$("#mbLogo").off('mouseout');
				mgbHeader.showLogo();
				//if (lastWindowWidth >= mgbMainSys.mobileNavMaxWidth) mgbHeader.showLogo();
			}
		} else {
			mgbHeader.deactivateNavActive();
			//if (!$('#Home').hasClass('mobile')) 
			$('#Home').removeClass("sticky");
			//if(!$('nav').hasClass("overlayActive")) {
				// $('nav a').removeClass('active');
				$('nav').removeClass("sticky");
				// $('#Home').removeClass("sticky");
				$("nav #mbLogo").css({'position': '', 'margin-top' : '' });
				if (!$('#Home').hasClass('mobile')) mgbHeader.hideLogo();
				// if (lastWindowWidth >= mgbMainSys.mobileNavMaxWidth) mgbHeader.hideLogo();
			
				/*$('#mbLogo').on('mouseover',function(){
					mgbHeader.showLogo();
				});

				$('#mbLogo').on('mouseout',function(){
					if (!$('#overlayContent').hasClass('active')) mgbHeader.hideLogo();
				});*/
			//}
		}
		
		/*
		// update the navigation based on which section is at the top of the viewport
		$('section').each(function(){
		
			var diff = Math.abs($(this).offset().top - $(window).scrollTop());
			var hashName = $(this).attr('id');
			
			if(diff <= 600) {			
				// $('nav a').removeClass('active');
				$('nav a[href="#'+hashName+'"]').addClass('active');
				$('#'+hashName).find("span[data-forward]").addClass('forwardVisible');			
				
				if(hashName === "Timeline") {
					if(mgbTimeLine !== null) {
						mgbTimeLine.drawTimeline();
					}
				}
			}
		
			if($(window).scrollTop() === scrollBottom) {
				// $('nav a').removeClass('active');
				// $('.navigation li:last-child a').addClass('active');
			} 
		});	*/
		
	   // lazyload images into view when they are in the viewport
 	   $('.ll').each(function () {
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
		
		if (page == appRoot) root = '';
		
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
		
		this.pushHistoryState(page, bool);
		
		//check to see if they home section array contains the page
		var homeSectionIndex = jQuery.inArray(page, homeSections);
		var isHomeSection = (homeSectionIndex != -1);
		       
		mgbMainSys.currPage = page;
		
		$('#Home').removeClass('removed');
		
		
		var useOverlay = true;
		
		if (page == appRoot || isHomeSection){
			page = 'index.php'; 
			useOverlay = false;
			//your on the homepage and hit one of the top navs
			if (!$('#overlayCover').hasClass('active')){
				mgbMainSys.scrollToSection(homeSections[homeSectionIndex],1000);
				return;
			}
		}else{
			page += '.php';
		}
		
		
		
		var reqUrl = appRoot + page + '?ajax=1'; //-- appRoot defined in _head.inc.php
		
		// console.log('req',reqUrl);
		
		if (this.mainContentLoaded == true && !useOverlay){ // if going to home page, check if content is already loaded before ajax call
			
			console.log("home already loaded");
			
			$('#overlayCover').removeClass('active');
			
			$('footer').removeAttr('style');
			
			$("nav").removeClass("overlayActive sticky");
			
			mgbHeader.hideLogo();
			mgbHeader.deactivateNavActive();
			
			mgbOverlay.kill();
			
			$('#mainContent .contentWrapper').css({'top':mgbHeroVideo.maxVideoHeight + "px","margin-bottom":mgbHeroVideo.maxVideoHeight + "px"}).addClass('settle');
			
			$("#mainContent").removeClass("inactive");
			
			//run the word cycle again
			mgbHeroVideo.headerWords.restart()
			
			setTimeout(function(){
				
				$("#overlayContent").empty();

			},500);
			
			setTimeout(function(){
				
				if (isHomeSection) mgbMainSys.scrollToSection(homeSections[homeSectionIndex],1000);

			},1200);
			
			return;
		}

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
			
			if (useOverlay){ //request page requires overlay
				
				if ($('#overlayContent').hasClass('active')){
					$('#overlayContent').removeClass('active');
				} 
				
				setTimeout(function(){	
					
					
					$('#overlayCover').addClass('active'); //css takes 500ms
					
				},500);
				
				setTimeout(function(){
					window.scrollTo(0, 0);
					
					$("#mainContent").addClass("inactive");

					$("#overlayContent").html(response);
					
					 //call js to init current page
					mgbOverlay.init();
										
					$("nav").addClass("overlayActive").removeClass("sticky");
			
					mgbHeader.hideLogo();
					
					
				},1000);
				
			}else{ //back to homepage
				
				// console.log('repsonse ' ,response);
				
				$('#overlayCover').removeClass('active');
				
				$('footer').removeAttr('style');
				
				$("#mainContent").html(response);
				$("#mainContent").removeClass("inactive");
				
				mgbMainSys.mainContentLoaded = true;
				
				mgbContent.init();
				mgbContent.resize();
				mgbHeroVideo.init();
				
				mgbHeader.deactivateNavActive();
				
				if (!mgbMainSys.waypointsInitialized) mgbMainSys.initWaypoints();
				
				mgbHeroVideo.loadHeaderVideo();
				
				$("nav").removeClass("overlayActive sticky");
				mgbHeader.deactivateNavActive();
			
				mgbHeader.hideLogo();
				
				mgbOverlay.kill();
				
				setTimeout(function(){
					
					$("#overlayContent").empty();
					mgbMainSys.checkTileLoad();
					
				},500);
				
				setTimeout(function(){
					
					if (isHomeSection) mgbMainSys.scrollToSection(homeSections[homeSectionIndex],1000);
					
				},1200);
				
				
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
	navContainer : null,
	giveFocus: true, 
	// mainContainer : null,
	navHeight : $("nav").height(),
	ts : TweenMax.set,
	logoAnimation : new TimelineMax(),

	init : function() {
		this.navContainer = $('nav');
		// this.mainContainer = $('section:nth-child(2)');
		
		TweenMax.set(rect,{rotation:-90,transformOrigin:"50% 50%"});
		
		this.logoAnimation.to(rect,.3,{transformOrigin:"50% 50%", drawSVG:"0%"}).
		to(bowenTXT,.2,{x:102, ease:Quad.easeIn}, .2).
		to(cgarryContainer,.2,{width:102, ease:Quad.easeIn}, .2).
		to(owenContainer,.2,{width:79, ease:Quad.easeOut}, .4);
		
		this.logoAnimation.stop();	
		
		this.addListeners();
		
	},
	
	addListeners : function(){
		var that = this;
		$('#homeLogo').on('click',function(e){
			e.preventDefault();		
			var nav = $('nav');
		
			// The menu navigation doubles as the container that displays videos
			// clicking on the nav should close the video player container and return
			// the nav menu to its original height. 
		
			//if(nav.hasClass("overlayActive")){
				//$(".navigation").fadeIn();
			mgbHeader.deactivateNavActive();
			mgbMainSys.getPage(appRoot, true);
					
					/*$('#mbLogo').on('mouseover',function(){
						mgbHeader.showLogo();
					});

					$('#mbLogo').on('mouseout',function(){
						if (!$('#overlayContent').hasClass('active')) mgbHeader.hideLogo();
					});*/
			//}
			
			mgbContent.deactivateActiveContent();
		});
		
		$('nav #menuToggleHolder').on('click', function(){
			$(this).toggleClass("active");
			if ($(this).hasClass("active")){
				that.showMobileNav();
			}else{
				that.hideMobileNav();
			}
			
		});
	
		$('nav .menu a').on('click', function(e){
			e.preventDefault();
			$('nav #menuToggleHolder').removeClass("active");
			
			that.hideMobileNav();

			/*if (mgbMainSys.currPage != appRoot) {
				mgbMainSys.getPage('/',true);
				return;
			}*/
			
			// $(this).removeClass('active');
			var currLink = $(this);

			//var hashValue = $(this).attr('href');
			
			//scroll nav
			
			/*$("html, body").animate({
				scrollTop: $(hashValue).offset().top,
			}, 1000, function() {
				$(hashValue).find("span[data-forward]").addClass('forwardVisible'); // animate the text for the section

				$(hashValue).children('.ll').each(function () {
				  if (mgbMainSys.isScrolledIntoView(this) === true) {
				      $(this).addClass('in-view');
					  $(this).parent().next().css('opacity', '1');
				  }
				});

				currLink.addClass('active');	
			});	*/	
		});
	
	
		$('#homeLogo').mouseover(function(){
			// console.log("showLogo")
			if (lastWindowWidth >= mgbMainSys.mobileNavMaxWidth) mgbHeader.showLogo();
		});

		$('#homeLogo').mouseout(function(){
			
			// console.log("hideLogo")
			if (lastWindowWidth >= mgbMainSys.mobileNavMaxWidth) mgbHeader.hideLogo();
		});
	},
	
	deactivateNavActive : function(){
		$('nav .menu a').removeClass('active');
	},
	
	showMobileNav : function(){
		this.showLogo();
		$('#mbLogo').css('margin-top','-10px');
		//$('#overlayCover').addClass('mobileNav');
		$('.menu,#Home,#mbLogo').addClass('mobile');
	},
	
	hideMobileNav : function(){
		this.hideLogo();
		$('#mbLogo').removeAttr('style');
		//$('#overlayCover').removeClass('mobileNav');
		$('.menu,#Home,#mbLogo').removeClass('mobile');
	},
	
	resize : function(){
		var scope = this;

		this.navContainer.addClass('settle');
		this.navHeight = $('nav').height();

		if (lastWindowWidth >= mgbMainSys.mobileNavMaxWidth) {
			$('#menuToggleHolder').removeClass('active');
			this.hideMobileNav();
		}
		
/*
		// check to see if overlay is required
		var loc = $(location).attr('href');
		
		if (loc.indexOf('work') != -1){
			
			// $("#mainContent").addClass("inactive");
			
			// $(".navigation").fadeOut(200);
			
			setTimeout(function(){			
				// $("nav").toggleClass("overlayActive sticky");
				// mgbHeader.logoAnimation.progress(1, false);
			},1000)
			
			
		}else{
			
			// this.mainContainer.addClass('settle');
		}*/
	},
	showLogo : function() {
		this.logoAnimation.play();
	},
	
	hideLogo : function() {
		if (!this.navContainer.hasClass('sticky')) this.logoAnimation.pause().reverse();
	}
};

var mgbTimeLine = {
	mgbtl: null,
	timelineAnimation : new TimelineMax(),
	init: function(){
		mgbtl = $('#mb_timeline_path2');
		
		TweenMax.set(mgbtl, {drawSVG: "100% 100%"});
		
		this.timelineAnimation.eventCallback("onComplete", function(){
			$(".timelineDate").addClass("active");
		});
	},
	
	drawTimeline: function(){
		this.timelineAnimation.to(mgbtl, 2, {drawSVG: "100% 0%", ease: Cubic.easeInOut});
		this.timelineAnimation.play();
	}
};

var mgbHeroVideo = {
	overlayContainer : null,
	videoHeaderContainer : null,
	welcomeContainer : null,
	videoPlayerContainer : null,
	msgContainer: null,
	wordArray: null,
	firstWord: '',
	videoHeight : 0,
	aspectRatio : 16/9,
	videoWidth : $(window).width(),
	maxVideoHeight : 500,
	arrowAnimation : new TimelineMax(),
	headerWords: new TimelineMax({onComplete: function(){mgbHeroVideo.wordCycleComplete()}}),

	init : function() {
		
		if (mgbMainSys.mainContentLoaded == true) 
		{
			this.overlayContainer = $('.video-overlay');
			this.videoHeaderContainer = $(".videoHeader");
			this.welcomeContainer = $("#welcomeVideo");
			this.videoPlayerContainer = $(".responsive-video");

			this.messageContainer = $(".headerHeroText");
			
			this.initHeaderCopy();
			
			this.arrowAnimation.to(downArrow,1,{y:"-20", delay:0,ease:Back.easeInOut}).
			to(downArrow,1,{y:"0", delay:0.75, ease:Bounce.easeOut, overwrite:false });
			this.arrowAnimation.repeat(-1).play();

		}
		
	},
	
	resize : function(){
		var scope = this;

		if (mgbMainSys.mainContentLoaded == true) {
			
			this.overlayContainer.addClass('settle');

			setTimeout(function(){
				scope.videoHeaderContainer.addClass('settle');
				$('#mainContent .contentWrapper').css({'top':scope.maxVideoHeight + "px","margin-bottom":scope.maxVideoHeight + "px"}).addClass('settle');
			}, 1000);

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
		
		// check to see if overlay is required
		/*var loc = $(location).attr('href');
		
		console.log(loc);
		
		if (loc.indexOf('work') != -1){ //this is the work section
						
			setTimeout(function(){			
					
				if (mgbMainSys.mainContentLoaded == true) scope.overlayContainer.addClass('settle');
				
		        $("#overlayContent").addClass("active");
				
				mgbHeader.logoAnimation.progress(1, false);
				
			},1000)
			
			setTimeout(function(){
				
				if (scope.mainContainer) {
					
					scope.videoHeaderContainer.addClass('settle');

					scope.videoHeaderContainer.css('height',videoHolderHeight+'px');
				}
				
			},3000)
			
		}else{
			
			this.overlayContainer.addClass('settle');

			setTimeout(function(){
				scope.videoHeaderContainer.addClass('settle');
			}, 1000);
			
			this.videoHeaderContainer.css('height',videoHolderHeight+'px');
		}*/	
	},
	
	initWordCycle:function(){
		var that = this;
		// var headerWords = new TimelineMax({onComplete: function(){that.wordCycleComplete()}});
		var spinLength = 4;
		var n = 0;
		
		for (i=0; i < spinLength*10; i++){
			this.headerWords.addCallback(function(){that.changeHeaderCopy()}, i * .1);
		}
		
		for (i=0;i<13;i++){
			if (i > 0) n += ((i-1) * .1)/2.5;
			this.headerWords.addCallback(function(){that.changeHeaderCopy()}, spinLength + n);
		}	
	},
	
	initHeaderCopy:function(){
		this.wordArray = $(".headerHeroText").data("words").split(",").sort(function() { return 0.5 - Math.random() });
		this.messageContainer.on('click', function(){
			$(".headerHeroText").text('');
		});
		
		this.messageContainer.keypress(function(e){
			var code = e.which;
			
			if(e.which == 13){
				e.preventDefault(); 
				
				$(".headerHeroText").text('');
			}
		});
		
		$(".cta").on("click", function(){
			$(".headerHeroText").text('').focus();
		});
		
		this.changeHeaderCopy();
		
		if((location.hash === '')) {
			this.initWordCycle();
		}
	},
	
	changeHeaderCopy:function(){
		this.firstWord = this.wordArray.shift();
		this.messageContainer.html(this.firstWord);
		this.wordArray.push(this.firstWord);
	},
	
	wordCycleComplete:function(){
		
		$(".moreMsg").delay(500).slideDown();
		if(this.giveFocus === true) {
			// mgbHeader.messageContainer.focus();
		}
		mgbMainSys.addGlitch('.fullBleed, #mbLogo, .menu, .responsive-video,.video-overlay,.socialIcons,.legal',250);
		if (this.glitchesInitialized == false) mgbMainSys.initializeGlitches(2000);
	},
	
	loadHeaderVideo: function() {
		this.maxVideoHeight = 700;
		var headerVideoPath = 'assets/videos/Main_Sequence_opt';
	
		//$("#headerVideo").html('<source src="'+headerVideoPath+'.mp4" type="video/mp4"><source src="'+headerVideoPath+'.webm" type="video/webm">' );
		
		$("#headerVideo").html('<iframe src="https://player.vimeo.com/video/119997282?title=0&byline=0&portrait=0&badge=0&api=1&autoplay=1&player_id=vimeoPlayer width="400" height="225" frameborder="0" id="vimeoPlayer" data-vimeoId="119997282" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
		
		setTimeout(function(){
			$("#headerVideo #vimeoPlayer").css({"width": "100%", "height":"100%" });
			
			var iframe = $("#vimeoPlayer")[0],
			player = $f(iframe);
		
			console.log("player name: ", player);
		
			player.addEvent('ready', function(){
				player.api('setVolume', 0);
			});
		}, 1000);

		
		// $('.videoHolder').html('<div class="videoWrapper"><iframe src="https://player.vimeo.com/video/'+id+'?title=0&byline=0&portrait=0&badge=0&api=1&autoplay=0&player_id=vimeoPlayer" width="400" height="225" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen id="vimeoPlayer" data-vimeoId='+id+'></iframe></div>');
		//
		// $('.videoWrapper').fitVids();
		
		this.resize();
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
	
	deactivateActiveContent : function(){
		if (mgbMainSys.mainContentLoaded == true) {
			this.portfolioContent.each(function(){
				if($(this).children("a").hasClass("active")) {
					$(this).children("a").removeClass("active");
				}
			});
		}
		
	},
    
    initPortfolioCnt: function() {		
		var that = this;
		
        var c_obj = {
            slide: '.vimeoSlide',
            autoplay: false,
            dots: false,
            speed: 300,
            infinite: false,
            fade: false,
			centerMode: true,
            prevArrow: '<button type="button" data-ga-label="Arrow_Left" class="slick-prev">View previous home page carousel slide</button>',
            nextArrow: '<button type="button" data-ga-label="Arrow_Right" class="slick-next">View next home page carousel slide</button>',
            customPaging: function (slick, index) {
                return '<button type="button" data-ga-label="MarqueeDot' + (index + 1) + '" data-role="none" role="button" aria-required="false" tabindex="0">Slide ' + (index + 1) + ' of ' + slick.slideCount + '</button>';
            },
            onInit: function () {

                //$('.carousel-wrapper').fadeTo(600, 1);
				
				//setTimeout(function(){ $('.vimeoVideos').slick('slickPlay'); }, 500)
				
				//addPlayPause('pause');
                //$('.vimeoVideos').append('<p class="slide-count">' + setSlideCount(this.currentSlide) + '</p>');

                $('.vimeoVideos .slick-prev, .slick-next').on('click', function () {
                    /*var getButton = $(event.target).data( "ga-label" );
					
                    if(getButton == "Arrow_Right"){
                        trackGAEvent("Home", "click", "Arrow_Right");
                    }
                    else{
                        trackGAEvent("Home", "click", "Arrow_Left");
                    }

					$('.vimeoVideos').slick('slickPause');
					
					//togglePlayPause('play');*/
                   
                });

                //for ada removing the slide count on init
                //$('.slide-count').remove();
            },
            onBeforeChange: function (event, slick) {
               // $('.vimeoVideos .slick-prev, .slick-next').attr('disabled', true);
            },
            onAfterChange: function (event, slick) {
				
                //-- one rotation
                /*var oneRotation = this.currentSlide + 1 * getTotalSlides() == getTotalSlides();
                if (oneRotation) {
                    $(".vimeoVideos").slickPause();
                }*/
                
            }
        };
		
        this.portfolioContent.each(function() {
            $(this).children("a").on('click', function() {
				/*$(".vimeoVideos").empty(); // clear out carousel
				
                var videoID = $(this).attr("data-url").split(","); // get the id's for this video
				
                var header = $(this).attr("data-header");
				var title = $(this).attr("data-title");
				var defUrl = "http://player.vimeo.com/video/"; // default vimeo url
				
                if(videoID[0] !== "") {
					// loop through ID's and create the video slide show
					
					for(var i = 0, len = videoID.length; i < len; i++){	
						var frameFrag = '<div class="vimeoSlide"><div class="vimeoHolder"><div class="vimeoVideo"><iframe src="https://player.vimeo.com/video/'+videoID[i]+'?title=0&byline=0&portrait=0&badge=0&api=1" width="400" height="225" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div><div class="vimeoTitle">title</div></div></div>';
						
						$(".vimeoVideos").append(frameFrag);
					}
					
					$('.vimeoVideos').fitVids();
					
					setTimeout(function(){
						
			            $(".vimeoVideos").on('init', function (event, slick) {
			                slick.options.onInit(event, slick);
			            });
			            $(".vimeoVideos").on('beforeChange', function (event, slick) {
			                slick.options.onBeforeChange(event, slick);
			            });
			            $(".vimeoVideos").on('afterChange', function (event, slick) {
			                slick.options.onAfterChange(event, slick);
			            });

			            $(".vimeoVideos").slick(c_obj); //-- passing object from above into carousel
						
						$('.vimeoContainer').addClass('loaded');
						
					},1000);
								
				
                    $("nav").toggleClass("overlayActive");
					$(".navigation").fadeOut(200);
                    $(".vimeoContainer").addClass("active");
					$(".vimeoContainer").children(".videoTitle").html(header);
					$(".vimeoContainer").children(".videoDescription").html(title);
                    $(this).addClass("active");
                }*/
               
			   mgbHeader.deactivateNavActive();
			   $("#nav-work").addClass('active');
				var thisPage = $(this).data('content');
				mgbMainSys.getPage(thisPage,true);
				
				
            });
        });
		
		$('#projectTileMore').on('click',function(e){
			e.preventDefault();
			
			that.loadMoreContent('projectTile',mgbMainSys.pMoreTarget);
			mgbMainSys.pLoaded += mgbMainSys.pMoreTarget;
		});
    },
    
    
    initCultureCnt: function() {
        var that = this;
		
		$('#officeToggle').on('click', function(){
			$('.cityFilter').toggleClass('active');
		});
		
		$('.closeCulture').on('click', function(e) {
			$('.cultureTile').removeClass('shrinkMe stretchOut');
		});
		
        $('.pushRight .cultureLink').on('click', function(e) {
            e.preventDefault();
			
			that.setCultureTileHeight();
            
            if (!$(this).parent().hasClass("stretchOut")) {
                $(this).parent().siblings().removeClass("shrinkMe stretchOut");
            }
            
            var nextTile = $(this).parent().next();
            var picHolder = nextTile.find('.picHolder');
            
            var colW = picHolder.width();
            //move this to a global var on resize???
            
            if (!$(this).parent().hasClass('stretchOut')) {
                picHolder.css('min-width', colW + 'px');
            }
			
            nextTile.toggleClass("shrinkMe");
            $(this).parent().toggleClass('stretchOut');
        });
        
        $('.pushLeft .cultureLink').on('click', function(e) {
            e.preventDefault();
            
			that.setCultureTileHeight();
			
            if (!$(this).parent().hasClass("stretchOut")) {
                $(this).parent().siblings().removeClass("shrinkMe stretchOut");
            }
            
            var prevTile = $(this).parent().prev();
            var picHolder = prevTile.find('.picHolder');
            
            var colW = picHolder.width();
            //move this to a global var on resize???

            if (!$(this).parent().hasClass('stretchOut')) {
                picHolder.css('min-width', colW + 'px');
            }
			
            prevTile.toggleClass("shrinkMe");
            $(this).parent().toggleClass('stretchOut');
        });
		
		$('#cultureTileMore').on('click',function(e){
			e.preventDefault();
			
			that.loadMoreContent('cultureTile',mgbMainSys.cMoreTarget);
			
			mgbMainSys.cLoaded += mgbMainSys.cMoreTarget;
		});
    },
	
	loadMoreContent:function(tar,num){
		
		//make sure the culture tiles have a height to animate against
		if (tar == 'cultureTile') this.setCultureTileHeight();
		
		//REMOVED THIS TEMPORARILY. WAS WONKY ON SAFARI!!
		//make sure the project tiles have a height to animate against
		//then remove it once the animation is complete.
		/*if (tar == 'projectTile'){
			
			//use the fourth project because it is guaranteed to have a 1x1 ratio
			var colW = $('.projectTile:nth-child(4) a').width();
			$('.projectTile').css('height', colW + 'px');
			
		  	setTimeout(function(){
		    	$('.projectTile').removeAttr('style');
		    }, 2000);
		}*/
		
		var newContent = $("."+tar+".notLoaded").slice(0, num);
		
		for (var i=0, len = newContent.length; i < len; i++){
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
			var ndMinutes = nd.getMinutes();

			var ampm = "AM";
			if (ndHours > 12) {
			ndHours -= 12;
			ampm = "PM";

			}

			var clockHours = Math.floor((ndHours / 12) * 100) + "%";
			var clockMinutes = Math.floor(100 * (ndMinutes / 60)) + "%";

			/* nd = nd.toLocaleString({
			hour: 'numeric',
			minute: 'numeric'
			}).replace(/:\d{2}\s/, ' ').split(",")[1];*/

			if (ndHours == 0) ndHours = 12;
			if (ndMinutes < 10) ndMinutes = "0" + ndMinutes;
			var displayTime = ndHours + ":" + ndMinutes + " " + ampm;
			// console.log("nd",displayTime);

			$(this).children("a").find("time").text(displayTime);

			var hrEle = $(this).find(".clockHours");
			var minEle = $(this).find(".clockMinutes");

			TweenMax.to(hrEle, 1, {
			transformOrigin: "50% 50%",
			drawSVG: clockHours,
			overwrite: true
			});
			TweenMax.to(minEle, 1, {
			transformOrigin: "50% 50%",
			drawSVG: clockMinutes,
			overwrite: false
			});

			$(this).on('click', function() {
				var currThis = $(this);
				$(this).siblings().children("a").removeClass("active");
				$(this).children("a").addClass("active");

				var officeDataText = $(this).children('article').html();
				
				$("#officeDetails").removeClass('showDetails');
				$("#officeDetails").html('');
				$("#officeDetails").html(officeDataText);
				
				var titleLength = $("#officeDetails h3").text().length;
				if (titleLength > 10) {
					$(".rightSide h3").addClass("long");
				}else{
					$(".rightSide h3").removeClass("long");
				}
				// setTimeout(function(){
				// 					var rightHeight = $("#officeDetails").find(".rightSide").height();
				// 					$("#officeDetails").find(".leftSide").attr("max-height", rightHeight + "px");
				// 				}, 1000);

				// location.hash = 'officeDetails';
				
				mgbMainSys.scrollToSection("offices",250);

				setTimeout(function() {
					$("#officeDetails").css('height',$('.rightSide').height()+"px");
					
					setTimeout(function() {
						$("#officeDetails").addClass('showDetails');
					}, 750);
					
					$('.closeMe').on('click', function() {
						
						$(currThis).children("a").removeClass("active");
						
						$("#officeDetails").addClass('removed');
						
						setTimeout(function(){
							$("#officeDetails").removeClass('showDetails').removeAttr("style").removeClass('removed');
							$("#officeDetails").html('');
						},400)
						
					});
					
				}, 500);
			});
		});

		setInterval(function(){
		$(".officeTile").each(function(index){
			var timeOffset = parseInt($(this).data("timeOffset")),
			d = new Date(),
			utc = d.getTime() + (d.getTimezoneOffset() * 60000),
			nd = new Date(utc + (3600000*timeOffset));
			
			/*var ndHours = nd.getHours();
			if(ndHours > 12) {
				ndHours -= 12;
			}

			var clockHours = Math.floor((ndHours/12) * 100) + "%";
			var clockMinutes = Math.floor(100 * (nd.getMinutes()/60))+"%";

			nd = nd.toLocaleString({hour: 'numeric', minute: 'numeric'}).replace(/:\d{2}\s/,' ').split(",")[1];
			
			$(this).children("a").find("time").text(nd);*/
			
			

			var ndHours = nd.getHours();
			var ndMinutes = nd.getMinutes();

			var ampm = "AM";
			if (ndHours > 12) {
			    ndHours -= 12;
				ampm = "PM";

			}

			var clockHours = Math.floor((ndHours / 12) * 100) + "%";
			var clockMinutes = Math.floor(100 * (ndMinutes / 60)) + "%";

			/* nd = nd.toLocaleString({
			    hour: 'numeric',
			    minute: 'numeric'
			}).replace(/:\d{2}\s/, ' ').split(",")[1];*/

			if (ndHours == 0) ndHours = 12;
			if (ndMinutes < 10) ndMinutes = "0" + ndMinutes;
			var displayTime = ndHours + ":" + ndMinutes + " " + ampm;
			
			$(this).children("a").find("time").text(displayTime);

			var hrEle = $(this).find(".clockHours");
			var minEle = $(this).find(".clockMinutes");

			TweenMax.to(hrEle, 1, {transformOrigin:"50% 50%", drawSVG: clockHours, overwrite:true});
			TweenMax.to(minEle, 1, {transformOrigin:"50% 50%", drawSVG: clockMinutes, overwrite:false});
			});
		}, 60000);
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

		if ($("#officeDetails").hasClass('showDetails')) {
			$('.ribbon').addClass('moving');
			setTimeout(function(){
				$('.ribbon').removeClass('moving');
				},350);
			
		}
	},
};

var mgbOverlay = {

	init: function() {
		var that = this;
		
		this.addListeners();
		setTimeout(function(){that.resize();$("#overlayContent").addClass("active");},500);
	},
	
	kill : function(){
		$("#overlayContent").removeClass("active");
		$('#overlayCover').removeClass('active');
	},
	addListeners : function(){
		var that = this;
		/*$('.returnHome').on('click',function(){
			mgbMainSys.getPage(appRoot,true);
		});*/
		$('.workThumb a').on('click', function(e){
			e.preventDefault();
			if ($(this).hasClass('active')) return;
			$('.workThumb a').removeClass('active');
			$(this).addClass('active');
			var vidId = $(this).attr('data-content');
			that.loadVideo(vidId);
		});
		$('.videoClose').on('click', function(e){
			e.preventDefault();
			$('.workThumb a').removeClass('active');
			that.removeVideo();
		});
	},
	loadVideo : function(id){
		var that = this;
		$('.videoHolder').empty();
		$('#heroImage').addClass('faded collapsed');
		$('#Home').addClass('removed');
		$('.videoClose').addClass('revealed');
		
		
		var videoHeight = (lastWindowWidth*9)/16;
		
		
		$('.videoHolder').css('height',videoHeight + "px");
		setTimeout(function(){
			
			$('.videoHolder').html('<div class="videoWrapper"><iframe src="https://player.vimeo.com/video/'+id+'?title=0&byline=0&portrait=0&badge=0&api=1&autoplay=1&player_id=vimeoPlayer" width="400" height="225" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen id="vimeoPlayer" data-vimeoId='+id+'></iframe></div>');
		
			$('.videoWrapper').fitVids();
			$('.videoHolder').addClass('expanded');
			
			$('html,body').animate({ scrollTop: 0 }, 'fast');
			
			mgbOverlay.resize();
			
			that.addVideoEvents();
			
			
			
		},600);
	},
	addVideoEvents : function(){
		// var that = this;
		var iframe = $('#vimeoPlayer')[0];
		var player = $f(iframe); 
		
		player.id = $(iframe).data('vimeoid');
		player.progress = null;
		
		//console.log(iframe,player);
		console.log(player.id);
		
		player.addEvent('ready', function() {
			//console.log('vimeo ready');

			player.addEvent('pause', vimeoPaused);
			player.addEvent('finish', vimeoComplete);
			player.addEvent('playProgress', vimeoUpdate);
			
		});
		
		function vimeoPaused(data){
			mgbMainSys.gaTracking('a|'+player.id+'|c');
		};
		
		function vimeoComplete(data){
			mgbMainSys.gaTracking('a|'+player.id+'|_COMOPLETE');
		};
		
		function vimeoUpdate(data){
			var progress = data.percent * 100;
			if (progress > 0 && progress <= 25) {
				if (player.progress !== 0 ) {
					mgbMainSys.gaTracking('a|'+player.id+'|_STARTED');
					player.progress = 0;
				}
			} else if (progress > 25 && progress <= 50) {
				if (player.progress !== 25 ) {
					mgbMainSys.gaTracking('a|'+player.id+'|_25');
					player.progress = 25;
				}
			} else if (progress > 50 && progress <= 75) {
				if (player.progress !== 50) {
					mgbMainSys.gaTracking('a|'+player.id+'|_50');
					player.progress = 50;
				}
			} else if (progress > 75) {
				if (player.progress !== 75) {
					mgbMainSys.gaTracking('a|'+player.id+'|_75');
					player.progress = 75;
				}
			}
		};
	},
	
	removeVideo : function(){
		$('.videoHolder').empty();
		$('.videoHolder').removeAttr('style');
		$('.videoHolder').removeClass('expanded');
		$('#heroImage').removeClass('faded collapsed');
		$('#Home').removeClass('removed');
		$('.videoClose').removeClass('revealed');
		mgbOverlay.resize();
		
		// setTimeout(function(){
		// },300);
	},

	resize : function(){
		/*$('footer').removeAttr('style');
		var footerY = Math.round($('footer').position().top);
		var footerH = lastWindowHeight - footerY;// - 16;
		$('footer').css('height',footerH+'px');*/
		
		//add height style to hero image to be able to collapse it using css3
		
		if($("#heroImage").length > 0) {
			var hi = $('#heroImage img').innerHeight();
			$('.subpageHeader').css('height',hi + "px");
			$('#heroImage').css('height',hi + "px");
			$('#overlayContent .contentWrapper').css({'top':hi + "px",'margin-bottom':hi + "px"});
		}
		
		if($(".videoHolder").length > 0) {
			var hv = $('.videoWrapper').height();
			$('.videoHolder').css('height',hv+'px');
			$('.subpageHeader').css('height',hv + "px");
			$('#overlayContent .contentWrapper').css({'top':hv + "px",'margin-bottom':hv + "px"});
		}
	}
};



//can this device support autoplaying video (not a mobile device or tablet)


if($("body").hasClass("ishome")) { //this is the homepage
    mgbContent.init();
	mgbMainSys.mainContentLoaded = true;
	var pathname = window.location.pathname;
	
	if (pathname != appRoot){
		var section = pathname.replace('/', '');
		setTimeout(function(){mgbMainSys.scrollToSection(section,1000);},2000);
		
	}
	// if (useHeaderVideo) loadHeaderVideo();
}else{
	$('#overlayCover').addClass('active');
	mgbHeader.logoAnimation.progress(1, false);
	mgbOverlay.init();
}
// mgbUtils.init();
mgbMainSys.init();
mgbHeader.init();
mgbHeroVideo.init();
//mgbTimeLine.init();

if(!isMobile.any()) {
	$('body').removeClass('no-autoplay').addClass('autoplay');
}

//globalization/flags
//uncomment .flag and select in _header_inc.php
//uncomment #Home nav ul.menu:after css in _header.css
// mgbMainSys.handleOfficeSelector();

if($("body").hasClass("ishome") && !isMobile.any()) {
	mgbHeroVideo.loadHeaderVideo();

	// Check for location in header section
	if("geolocation" in navigator) {
		navigator.geolocation.getCurrentPosition(function(pos){

			var lat = pos.coords.latitude;
			var lng = pos.coords.longitude;

			$.ajax({ url:'https://nominatim.openstreetmap.org/reverse?format=json&lat='+lat+'&lon='+lng+'&zoom=18&addressdetails=1',
			         success: function(data){
			             var countryCode = data.address.country_code;
			 
						 if(countryCode === "us") {
							 setTimeout(function(){
							 	$("#siteSelect").fadeIn();
							 }, 2000);
						 }
			         }
			});
		}, function(){
			console.log("Not able to get location.");
		});
	}
	/////////////	
}

if($("body").hasClass("ishome")) mgbMainSys.currPage = appRoot;

window.onscroll = mgbMainSys.handleScrolling;
window.onresize = resizeChecker;
// window.onunload = displayCurrentContent;

/*$(window).on('hashchange', function () {
    mgbMainSys.getPage(location.hash);
});*/

window.onpopstate = function (event) {
	//console.log('pop',event,loc = window.location.pathname);
	
    if (event.state) {
        // console.log('retrieving ', event.state.url, ' from history');
        mgbMainSys.getPage(event.state.url, false);
    }else{
    	mgbMainSys.getPage(window.location.pathname, false);
    }
};

setTimeout(function(){  
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
	mgbHeroVideo.resize();
	
	
	if (mgbMainSys.mainContentLoaded == true) {
		mgbMainSys.resize();
		mgbContent.resize();
	}
	
	if ($('#overlayContent').hasClass('active')) mgbOverlay.resize();
}



