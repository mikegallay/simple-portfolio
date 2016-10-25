// Module to handle site functionality (loading,scrolling,resizing)
var mgbMainSys = {
	currPage: null,
	mainContentLoaded: false,
	allCultureLoaded: false,
	allNewsLoaded: false,
	mobileNavMaxWidth: 768 - 16,//1024,
	
	//load targets for tiles
  	pLoadTarget: 6,
	cLoadTarget:5,
	nLoadTargets: 4,
	pLoaded:6,
	cLoaded:5,
	nLoadTargets: 4,
	cMoreTarget:5,
	pMoreTarget:6,
	nMoreTargets: 4,
	
	waypointsInitialized: false,
	glitchesInitialized: false,
	
	currSelection: null,
	currCoun: 'us',
	currCity: 'glo',
	currLang: 'en',
	
	pinnedDismissed: false,
	// permHidePinned: false,
	
	init : function() {
		
		// console.log('pd',this.pinnedDismissed);
		var that = this;
		
		
		setTimeout(function(){
			if($(".homeSection").length > 0) {
				that.initWaypoints(); 
			}
			
			mgbContent.setCultureTileHeight();
		
		},2000);
		
		if (localStorage.getItem('pinnedContent') == 'dismissed'){
			this.pinnedDismissed = true;
		}else{
			setTimeout(function(){
				that.checkLocation();
			},2000);
		}
		
		this.addListeners();
		
		
	},
	
	createWaypoint: function(id){
		var waypoint = $('#'+id).waypoint(function(direction) {
			var elemId = this.element.id;
			mgbHeader.deactivateNavActive();
			$("#nav-" + elemId).addClass('active');
		}, {
			offset: '10%'
		})
		
	},
	
	initWaypoints : function(){
		
		//not woring properly
		var that = this;
		
		this.waypointsInitialized = true;
		
		// this.createWaypoint('work');
		// this.createWaypoint('culture');
		// this.createWaypoint('offices');
		// this.createWaypoint('careers');
		// this.createWaypoint('news');
		
		//create waypoint to note when clients section enters, to deactivate the other navs
		/*var clientWaypoint = $('#clients').waypoint(function(direction) {
			mgbHeader.deactivateNavActive();
		}, {
			offset: '50%'
		});*/
			
		var inviewNews = new Waypoint.Inview({
		  element: $('#news')[0],
		  enter: function(direction) {
			  if (direction == "down") $('#news .sectionButton').addClass('show');
		  },
		  entered: function(direction) {
			  if (direction == "down") $('#news .sectionButton').removeClass('show');
		if (direction == "up") $('#news .sectionButton').addClass('show');
		  },
		  exit: function(direction) {
			  if (direction == "up") $('#news .sectionButton').addClass('show');
		  },
		  exited: function(direction) {
			  $('#news .sectionButton').removeClass('show');
		  }
		})
	
		var inviewCulture = new Waypoint.Inview({
		  element: $('#culture')[0],
		  enter: function(direction) {
			  if (direction == "down") $('#culture .sectionButton').addClass('show');
		    // console.log('Enter triggered with direction ' + direction)
		  },
		  entered: function(direction) {
			  if (direction == "down") $('#culture .sectionButton').removeClass('show');
		     // console.log('Entered triggered with direction ' + direction)
		  },
		  exit: function(direction) {
			  if (direction == "up") $('#culture .sectionButton').addClass('show');
		    // console.log('Exit triggered with direction ' + direction)
		  },
		  exited: function(direction) {
			  $('#culture .sectionButton').removeClass('show');
		    // console.log('Exited triggered with direction ' + direction)
		  }
		})
		
		
	},
	
	expandNav: function(){
		mgbHeader.deactivateNavActive();
		$('#header').removeClass("sticky");
		$('nav').removeClass("sticky");
		$("nav #mbLogo").css({'position': '', 'margin-top' : '' });
		if (!$('#header').hasClass('mobile')) mgbHeader.hideLogo();
		setTimeout(function(){
			if (!$('#header').hasClass('settle')) $('#header').addClass('settle');
		},1500);
		
	},
	
	collapseNav: function(){
		
		
		$('#header').addClass("sticky");
		$('nav').addClass("sticky");
		$("#mbLogo").off('mouseout');
		mgbHeader.showLogo();
		setTimeout(function(){
			if (!$('#header').hasClass('settle')) $('#header').addClass('settle');
		},1500);
	},
	
	showPinned : function(){
		
		$('body').addClass("showPinned");
		$('body').removeClass('pinnedActive');
		if ($('body').hasClass('nothome')){
			var h = 0;
			if($("#heroImage").length > 0) h = $('#heroImage img').innerHeight();
			$('.contentWrapper').css('margin-top',-h+"px");
		}
		
	},
	
	showFooter : function(){
		// console.log("showfooter")
		setTimeout(function(){
			// console.log("showfooterIn");
			$('footer').removeClass('absolute');
			if ($('footer').position().top + 63 < $(window).height()){
				$('footer').addClass('absolute');
				// $('footer').css('bottom', 0 + 'px');
			}
			$('footer').removeClass('tempHide');
		},1500);
	},

	checkLocation : function(){
		// this.showPinned();
		setTimeout(function(){
			if ($(window).attr('scrollY') == 0 && $('body').hasClass('ishome')) mgbMainSys.showPinned();
			// $("body").addClass("showPinned");
		},4000)
	
	},
	
	hidePinned : function(hideForever){
		// console.log('hidePinned');
		
		if (hideForever == false){
			$('body').addClass('pinnedActive');
		}else{
			console.log('set global pinned to hidden');
			this.pinnedDismissed = true;
			localStorage.setItem('pinnedContent', 'dismissed');
			//var hiddenCookie = document.cookie.replace(/(?:(?:^|.*;\s*)mgbHeaderHidden\s*\=\s*([^;]*).*$)|^.*$/, "$1");
			
			//if(hiddenCookie !== "true"){
				//document.cookie = "mgbHeaderHidden=true;max-age=2592e3";
		}
		$('body').removeClass("showPinned");
		
		// if ($('body').hasClass('nothome')){
			$('.contentWrapper').css('margin-top',0+"px");
		// }
		
	},
	
	scrollToSection : function(section,t){
		$("html, body").animate({
				scrollTop: $("#"+section).offset().top - 70,
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
			
			/*
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
			
			*/
			
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
		
		$('.showPinned').children('button').on('click', function(){
			//console.log("hide pinned clicked");
			$(that).hidePinned(true);
		});
		
		$('#removePinnedHeader').on('click', function(){
			//var hiddenCookie = document.cookie.replace(/(?:(?:^|.*;\s*)mgbHeaderHidden\s*\=\s*([^;]*).*$)|^.*$/, "$1");
			
			//if(hiddenCookie !== "true"){
				//document.cookie = "mgbHeaderHidden=true;max-age=2592e3";
				
				mgbMainSys.hidePinned(true);
				//}
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
		
		/*if ($self){
			if ($self.hasClass('cultureLink')){
				$self.toggleClass('active');
				if (!$self.hasClass('active')) pieces[2] += "_close";
			}	
		}	*/	
		
	    if (pieces.length == 3) {
			console.log(pieces[0]+'/'+pieces[1]+'/'+pieces[2]);
	        if ($self && $self.attr('href') && $self.attr('href')[0] != '#' && $self.attr('target') != '_blank') {
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
		this.showFooter(); 
		mgbMainSys.checkInView('.ll-all');
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
			this.nLoadTarget = 6;
			
			if (this.cLoaded < this.cLoadTarget){
				mgbContent.loadMoreContent('cultureTile',this.cLoadTarget - this.cLoaded);
				this.cLoaded = this.cLoadTarget;
			}
			
			if (this.pLoaded < this.pLoadTarget){
				mgbContent.loadMoreContent('projectTile',this.pLoadTarget - this.pLoaded);
				this.pLoaded = this.pLoadTarget;
			}
			
			if (this.nLoaded < this.nLoadTarget){
				mgbContent.loadMoreContent('newsTile', this.nLoadTarget - this.nLoaded);
				this.nLoaded = this.nLoadTarget;
			}
			
			this.cMoreTarget = 7;
			this.pMoreTarget = 8;
			this.nMoreTarget = 6;
			
		}
		
		if (lastWindowWidth >= 1900){
			this.cLoadTarget = 10;
			this.pLoadTarget = 9;
			this.nLoadTarget = 6;
			
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
			
			if (this.nLoaded < this.nLoadTarget){
				mgbContent.loadMoreContent('newsTile', this.nLoadTarget - this.nLoaded);
				this.nLoaded = this.nLoadTarget;
			}
			
			this.cMoreTarget = 5;
			this.pMoreTarget = 6;
			this.nMoreTarget = 6;
			
		}
	},
	
	handleScrolling : function(){
		
		// move the parallax header
		var yPos = -($(window).scrollTop() / 4); 
		var topOff = yPos + 'px';
		$('.parallaxHeader').css({ top: topOff });
		
		if ($('body').hasClass('showPinned')){
			var global = false;
			
			mgbMainSys.hidePinned(global);
			
			
		}
		
		var currScroll = $(window).attr('scrollY');
		
		
		if (currScroll == 0 && mgbMainSys.pinnedDismissed == false){
			if($('body').hasClass('ishome')) {
				mgbMainSys.showPinned();
			
			}
		}
		
		// var scrollBottom = $(document).height() - $("body").height();
		
		var stickyNavRevealY = mgbHeroVideo.maxVideoHeight - 90
		
		//removed because overlay doesn't use this anymore
		/*if ($('#overlayContent').hasClass('active')){
			if($("#heroImage").length > 0) {
				stickyNavRevealY = $('#heroImage img').innerHeight() - 75;
			}else{
				stickyNavRevealY = 50;
			}
		}*/
		
		//there is extra code here, but we only want this to happen on the homepage now
		if($('body').hasClass('ishome')){
			if(currScroll > stickyNavRevealY) {
				mgbMainSys.collapseNav();
				/*$('#header').addClass("sticky");
				if(!$('nav').hasClass("sticky")) {
					//if (lastWindowWidth > mgbMainSys.mobileNavMaxWidth) {
						$('nav').addClass("sticky");
		
					$("#mbLogo").off('mouseout');
					mgbHeader.showLogo();
					//if (lastWindowWidth >= mgbMainSys.mobileNavMaxWidth) mgbHeader.showLogo();
				}*/
			} else {
				mgbMainSys.expandNav();
				/*mgbHeader.deactivateNavActive();
				//if (!$('#header').hasClass('mobile')) 
				$('#header').removeClass("sticky");
				//if(!$('nav').hasClass("overlayActive")) {
					// $('nav a').removeClass('active');
					$('nav').removeClass("sticky");
					// $('#header').removeClass("sticky");
					$("nav #mbLogo").css({'position': '', 'margin-top' : '' });
					if (!$('#header').hasClass('mobile')) mgbHeader.hideLogo();*/
			}
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
		
		// if (page == "/") {
// 			page = '';
// 		}

	console.log("root=",root," page=",page);
		if (root == page) {
			root = '';
		}else{
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
		
		console.log("page", page);
		
		this.pushHistoryState(page, bool);
		
		//check to see if they home section array contains the page
		var homeSectionIndex = jQuery.inArray(page, homeSections);
		var isHomeSection = (homeSectionIndex != -1);
		       
		mgbMainSys.currPage = page;
		
		mgbMainSys.hidePinned(true);
		
		$('#header').removeClass('removed');
		// $('#overlayCover').removeClass('white');
		
		var intContent = true;
		
		console.log('isHomeSection',isHomeSection)
		
		console.log('page',page);
		
		if (page == "/") page = appRoot;
		
		if (page == appRoot || isHomeSection){
			page = 'index.php'; 
			intContent = false;
			
			//your on the homepage and hit one of the top navs
			/*
			if (!$('#overlayCover').hasClass('active')){
							mgbMainSys.scrollToSection(homeSections[homeSectionIndex],1000);
							return;
						}*/
			
		}else{
			page += '.php';
		}
		
		var reqUrl = appRoot + page + '?ajax=1'; //-- appRoot defined in site-pref.php
		
		if (reqUrl.indexOf('global-leadership/') != -1){
			//is an extended bio page
			var bioArr = reqUrl.split('/');
			var bio = bioArr[bioArr.length-1];
			var bio_id = bio.replace('.php?ajax=1','');
			reqUrl = appRoot + "leader-bio.php?ajax=1&bio="+bio_id;
			// reqUrl = "/extended-bio.php?ajax=1";
		}
		
		if (reqUrl.indexOf('people/') != -1){
			//is an extended bio page
			var bioArr = reqUrl.split('/');
			var bio = bioArr[bioArr.length-1];
			var bio_id = bio.replace('.php?ajax=1','');
			reqUrl = appRoot + "people-bio.php?ajax=1&bio="+bio_id;
			// reqUrl = "/extended-bio.php?ajax=1";
		}
		
		if (reqUrl.indexOf('work/') != -1){
			//is an extended bio page
			var portArr = reqUrl.split('/');
			var port = portArr[portArr.length-1];
			var port_id = port.replace('.php?ajax=1','');
			reqUrl = appRoot + "case-study.php?ajax=1&port="+port_id;
			// reqUrl = "/extended-bio.php?ajax=1";
		}
		
		// if (reqUrl = "/.php?ajax=1"){
// 			reqUrl = "/index.php?ajax=1";
// 		}
		console.log('req',reqUrl);
		
		if (this.mainContentLoaded == true && !intContent){ // if going to home page, check if content is already loaded before ajax call
			
			console.log("home already loaded");
			
			// $('#overlayCover').removeClass('active');
			
			$('footer').removeAttr('style');
			
			$('body').removeClass('nothome').addClass('ishome');
			
			/*$("nav").removeClass("overlayActive sticky");
			// $('nav').removeClass('settle sticky');
			mgbHeader.hideLogo();
			mgbHeader.deactivateNavActive();*/
			
			// $('#header').removeClass('settle');
			mgbMainSys.expandNav();
			
			mgbInternalContent.kill();
			
			$('#mainContent .contentWrapper').css({'top':mgbHeroVideo.maxVideoHeight + "px","margin-bottom":mgbHeroVideo.maxVideoHeight + "px"}).addClass('settle');
			
			$("#mainContent").removeClass("inactive");
			
			//run the word cycle again
			mgbHeroVideo.headerWords.restart()
			
			setTimeout(function(){
				
				$("#internalContent").empty();

			},500);
			
			setTimeout(function(){
				
				if (isHomeSection) mgbMainSys.scrollToSection(homeSections[homeSectionIndex],1000);

			},1000);
			
			return;
		}
		
		// Fire immediately on getPage
		// $('#header').removeClass('settle'); //this hides the nav instantly during page transitions
		mgbInternalContent.kill();
		$('footer').addClass('tempHide');
		
		// if (reqUrl.indexOf('all-culture') != -1){
// 			$("#overlayCover").addClass("white");
// 		}
		
		//if (intContent) $('body').addClass('overlayReady'); //turn white bg gray to hide a flash of white when the overlay is building.

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
			
			mgbMainSys.allCultureLoaded = false;
			mgbMainSys.allNewsLoaded = false;
			
			// $('#header').removeClass('settle')
			
			if (intContent){ //request page is an internal page
				
				if ($('#internalContent').hasClass('active')){
					$('#internalContent').removeClass('active');
				} 
				
				// if (!$('#overlayCover').hasClass('active')){
// 					$('#overlayCover').addClass('active');
// 					$('body').removeClass('overlayReady');
// 				}
				
				/*setTimeout(function(){	
					
					$('#overlayCover').addClass('active'); //css takes 500ms
					
				},500);*/
				
				setTimeout(function(){
					window.scrollTo(0, 0);
					
					$('body').removeClass('ishome').addClass('nothome');
					
					//lock the nav as gray bar on sub pages
					mgbMainSys.collapseNav();
					$("nav").addClass("overlayActive");
					
					/*$('nav').addClass('settle sticky');
					mgbHeader.showLogo();*/
					
					$("#mainContent").addClass("inactive");

					$("#internalContent").html(response);
					
					 //call js to init current page
					mgbInternalContent.init();
					
					//if is global-leadership content, initialize that content.
					if (reqUrl.indexOf('global-leadership.') != -1){
						
						// setTimeout(function(){
							 mgbInternalContent.addAllCultureListeners();
							 mgbMainSys.checkInView('.ll-all');
							 resize();
						//}, 1000);
						
					}
					
					//if is all-news content, initialize that content.
					if (reqUrl.indexOf('all-news.') != -1){
						
						 setTimeout(function(){
							 mgbInternalContent.addAllNewsListeners();
							 mgbMainSys.checkInView('.ll-all');
							 resize();
						}, 1000);
						
					}
					
					
					mgbMainSys.checkInView('.ll-all');
					mgbMainSys.showFooter();

				},500);
				
			}else{ //back to homepage
				
				// console.log('repsonse ' ,response);
				// 

				$('body').removeClass('nothome').addClass('ishome');

				// $('#overlayCover').removeClass('active');
				
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
				
				/*mgbHeader.deactivateNavActive();
				$("nav").removeClass("overlayActive sticky");
				$('nav').removeClass('settle sticky');
				mgbHeader.hideLogo();*/
				
				mgbMainSys.expandNav();
				$("nav").removeClass("overlayActive");
				
				// mgbInternalContent.kill();
				mgbMainSys.showFooter();
				
				setTimeout(function(){
					
					$("#internalContent").empty();
					mgbMainSys.checkTileLoad();
					
				},500);
				
				setTimeout(function(){
					if (isHomeSection) mgbMainSys.scrollToSection(homeSections[homeSectionIndex],1000);
				},2000);
				
				
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
		/*$('#homeLogo').one('click',function(e){
			e.preventDefault();		
			
			if (!$('body').hasClass('ishome')){
				console.log('ar',appRoot);
				mgbHeader.deactivateNavActive();
				// mgbMainSys.getPage(appRoot, true);
			
				mgbContent.deactivateActiveContent();
			} else{
				if ($(window).attr('scrollY') > 0) {
					$("html, body").animate({
							scrollTop: 0,
						}, 500);
				}
			}
		});*/
		
		
		$('#menuToggleHolder, .hiddenNavToggle').on('click', function(e){
			e.preventDefault();
			
			var newAlt, alt = $('#menuToggleHolder').attr('aria-label');
			 
            if (alt.indexOf('Open') != -1) { // has 'open'
                newAlt = alt.replace('Open', 'Close');
            } else { // has 'close'
                newAlt = alt.replace('Close', 'Open');
            }
			
			$('#menuToggleHolder').attr('aria-label', newAlt);
			$('.hiddenNavToggle').attr('aria-label', newAlt);
			$('.hiddenNavToggle').html(newAlt);
			
			$('#menuToggleHolder').toggleClass("active");
			$('#navWrapper').toggleClass('active');
			if ($('#menuToggleHolder').hasClass("active")){
				that.showMobileNav();
			}else{
				that.hideMobileNav();
			}	
		});
	
	
		$('nav .menu a').on('click', function(e){
			//e.preventDefault();
			
			$('nav #menuToggleHolder').removeClass("active");
						
						that.hideMobileNav();
						var currLink = $(this);
			
			/*if (mgbMainSys.currPage != appRoot) {
				mgbMainSys.getPage('/',true);
				return;
			}*/
			
			// $(this).removeClass('active');
			

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
			if (lastWindowWidth >= mgbMainSys.mobileNavMaxWidth) mgbHeader.showLogo();
		});

		$('#homeLogo').mouseout(function(){
			if (lastWindowWidth >= mgbMainSys.mobileNavMaxWidth) mgbHeader.hideLogo();
		});
	},
	
	deactivateNavActive : function(){
		$('nav .menu a').removeClass('active');
	},
	
	showMobileNav : function(){
		this.showLogo();
		// $('#mbLogo').css('margin-top','-10px');
		//$('#overlayCover').addClass('mobileNav');
		$('.menu,#header,#mbLogo').addClass('mobile');
	},
	
	hideMobileNav : function(){
		this.hideLogo();
		$('#mbLogo').removeAttr('style');
		//$('#overlayCover').removeClass('mobileNav');
		$('.menu,#header,#mbLogo').removeClass('mobile');
	},
	
	resize : function(){
		var scope = this;
		
		setTimeout(function(){
			$('#header').addClass('settle');
		}, 1500);
		
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

// var mgbTimeLine = {
// 	mgbtl: null,
// 	timelineAnimation : new TimelineMax(),
// 	init: function(){
// 		mgbtl = $('#mb_timeline_path2');
//
// 		TweenMax.set(mgbtl, {drawSVG: "100% 100%"});
//
// 		this.timelineAnimation.eventCallback("onComplete", function(){
// 			$(".timelineDate").addClass("active");
// 		});
// 	},
//
// 	drawTimeline: function(){
// 		this.timelineAnimation.to(mgbtl, 2, {drawSVG: "100% 0%", ease: Cubic.easeInOut});
// 		this.timelineAnimation.play();
// 	}
// };

var mgbHeroVideo = {
	overlayContainer : null,
	videoHeaderContainer : null,
	welcomeContainer : null,
	videoPlayerContainer : null,
	msgContainer: null,
	vimeoPlayer: null,
	aboutUsVideoId: '176376361',
	wordArray: null,
	firstWord: '',
	videoHeight : 0,
	aspectRatio : 16/9,
	videoWidth : $(window).width(),
	maxVideoHeight : 500,
	arrowAnimation : new TimelineMax(),
	headerWords: new TimelineMax({onComplete: function(){mgbHeroVideo.wordCycleComplete()}}),

	init : function() {
		
		var that = this;
		
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
			
			$('.aboutUsClose .videoClose').on('click',function(e){
				that.killAboutUsVideo();
			})

		}
		
	},
	
	resize : function(){
		var scope = this;

		if (mgbMainSys.mainContentLoaded == true) {
			
			this.overlayContainer.addClass('settle');

			

			if ($('#welcomeVideo').hasClass('aboutUs')){
				// console.log('yes');
				this.videoWidth = lastWindowWidth;
				this.videoHeight = this.videoWidth / this.aspectRatio;
				
				// var screenAR = lastWindowWidth / this.videoHeight;
				
				$('.contentWrapper').css('top',this.videoHeight + 'px').css('margin-bottom',this.videoHeight + 'px');
				$('.videoHeader').css('height',this.videoHeight + 'px')
				
			}else{
				setTimeout(function(){
					scope.videoHeaderContainer.addClass('settle');
					$('#mainContent .contentWrapper').css({'top':scope.maxVideoHeight + "px","margin-bottom":scope.maxVideoHeight + "px"}).addClass('settle');
				}, 1000);
				
				// console.log('no');
				//$('.contentWrapper').css('top',this.maxVideoHeight + 'px').css('margin-bottom',this.maxVideoHeight + 'px')
				
				this.videoHeight = lastWindowHeight;
				
				if (this.videoHeight > this.maxVideoHeight) {
					this.videoHeight = this.maxVideoHeight;
				}
				
				var videoHolderHeight = this.videoHeight;

				this.videoHeaderContainer.css('height',videoHolderHeight+'px');

				this.videoWidth = (this.videoHeight * this.aspectRatio);

				
			
		}
		
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
	
	toggleHeaderElements: function() {
		// $("#header").fadeOut('fast');
		// $("#downArrow").fadeOut('fast');
		// $(".video-overlay").fadeOut('fast');
		
		$("#header").addClass('hidden');
		$("#downArrow").addClass('hidden');
		$(".video-overlay").addClass('hidden');
		
		$('#welcomeVideo').addClass('aboutUs');
		
	},
	
	killAboutUsVideo:function(){
		
		// $("#header").fadeIn('fast');
		// $("#downArrow").fadeIn('fast');
		// $(".video-overlay").fadeIn('fast');
		
		$("#header").removeClass('hidden');
		$("#downArrow").removeClass('hidden');
		$(".video-overlay").removeClass('hidden');
		
		$('#welcomeVideo').removeClass('aboutUs');
		
		this.loadHeaderVideo();
		
	},
	
	initWordCycle:function(){
		var that = this;
		// var headerWords = new TimelineMax({onComplete: function(){that.wordCycleComplete()}});
		var spinLength = 1;
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
		var that = this;
		
		this.wordArray = $(".headerHeroText").data("words").split(",").sort(function() { return 0.5 - Math.random() });
		
		this.messageContainer.on('click', function(){
			$(".headerHeroText").text('');
		});
		
		this.messageContainer.keypress(function(e){
			var code = e.which;
			if(e.which == 13){
				e.preventDefault();
				mgbMainSys.gaTracking('Home|HeaderText|'+$(".headerHeroText").text());
				mgbHeroVideo.headerWords.restart();
				$(".headerHeroText").blur();
			}
		});
		
		$(".cta").on("click", function(){
			that.aboutUsVideoId = $(this).data('content');
			
			that.toggleHeaderElements();
			
			$("#headerVideo").html('<iframe src="https://player.vimeo.com/video/' + that.aboutUsVideoId + '?background=0 width="400" height="225" frameborder="0" id="vimeoPlayer" data-vimeoId="'+that.aboutUsVideoId+'" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
			
			that.vimeoPlayer = new Vimeo.Player($('#headerVideo'));
			
			that.vimeoPlayer.ready().then(function(){
				that.vimeoPlayer.setLoop(false);
				that.addVideoEvents();
				
				// that.vimeoPlayer.play();
				// that.vimeoPlayer.setVolume(1);
				// $("#headerVideo #vimeoPlayer").css({"width": "100%", "height":"100%" });
				// 
			});
			
			$('#headerVideo').fitVids();
			
			that.resize();
			
			/*that.vimeoPlayer.loadVideo(vId).then(function(id) {
				//that.vimeoplayer.setVolume(1);
				//that.vimeoPlayer.setLoop(false);
				//that.vimeoPlayer.play();	
				
				setTimeout(function(){
					$("#headerVideo #vimeoPlayer").css({"width": "100%", "height":"100%" });
				}, 1000);
		//	}).catch(function(error) {
				
				//console.log('Could not load video');
				// that.resize();
				$('#headerVideo').fitVids();
			});*/
		});
		
		
		this.changeHeaderCopy();
		
		if(location.hash === '') {
			this.initWordCycle();
		}
	},
	
	addVideoEvents : function(){
		var that = this;
		var vimeoProgress = 0;
		
		this.vimeoPlayer.on('pause', function() {
			mgbMainSys.gaTracking('AboutUs_Video|'+that.aboutUsVideoId+'|_PAUSED');
		});
		
		this.vimeoPlayer.on('ended', function() {
			mgbMainSys.gaTracking('AboutUs_Video|'+that.aboutUsVideoId+'|_COMPLETE');
		});
		
		this.vimeoPlayer.on('timeupdate', function(e) {
			var progress = e.percent * 100;
			if (progress > 0 && progress <= 25) {
				if (vimeoProgress !== 0 ) {
					mgbMainSys.gaTracking('AboutUs_Video|'+that.aboutUsVideoId+'|_STARTED');
					vimeoProgress = 0;
				}
			} else if (progress > 25 && progress <= 50) {
				if (vimeoProgress !== 25 ) {
					mgbMainSys.gaTracking('AboutUs_Video|'+that.aboutUsVideoId+'|_25');
					vimeoProgress = 25;
				}
			} else if (progress > 50 && progress <= 75) {
				if (vimeoProgress !== 50) {
					mgbMainSys.gaTracking('AboutUs_Video|'+that.aboutUsVideoId+'|_50');
					vimeoProgress = 50;
				}
			} else if (progress > 75) {
				if (vimeoProgress !== 75) {
					mgbMainSys.gaTracking('AboutUs_Video|'+that.aboutUsVideoId+'|_75');
					vimeoProgress = 75;
				}
			}
		});
		
		this.vimeoPlayer.play();	
		
	},
	
	changeHeaderCopy:function(){
		this.firstWord = this.wordArray.shift();
		this.messageContainer.html(this.firstWord);
		this.wordArray.push(this.firstWord);
	},
	
	wordCycleComplete:function(){
		
		$(".moreMsg").delay(500).slideDown();
		if(this.giveFocus === true) {
			mgbHeader.messageContainer.focus();
		}
		
		//mgbMainSys.addGlitch('.fullBleed, #mbLogo, .menu, .responsive-video,.video-overlay,.socialIcons,.legal',250);
		mgbMainSys.addGlitch('#mbLogo, .menu, .responsive-video,.video-overlay,.socialIcons,.legal',250);
		
		if (this.glitchesInitialized == false) {
			mgbMainSys.initializeGlitches(2000);
		}
	},
	
	loadHeaderVideo: function() {
		var that = this;
		this.maxVideoHeight = 700;
		//var headerVideoPath = 'assets/videos/Main_Sequence_opt';
		
		$("#headerVideo").html('<iframe src="https://player.vimeo.com/video/176376361?background=1 width="400" height="225" frameborder="0" id="vimeoPlayer" data-vimeoId="176376361" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
		
		that.vimeoPlayer = new Vimeo.Player($('#headerVideo'));
		
		that.vimeoPlayer.ready().then(function(){
			that.vimeoPlayer.setLoop(true);
		});
		
		//setTimeout(function(){
			$("#headerVideo #vimeoPlayer").css({"width": "100%", "height":"100%" });
			//}, 1000);

		// $('.videoWrapper').fitVids();
		
		this.resize();
	}
};

// Module to handle site content
var mgbContent = {
    portfolioContent: null,
    cultureContent: null,
    officeClocks: null,
	cultureTimeout: null,
	newsContent: null,
	
	cultureContentInit:false,
    
    init: function() {
        this.portfolioContent = $('.projectTile');
        this.cultureContent = $('.cultureTile');
        this.officeClocks = $('.officeTile');
		this.newsContent = $('.newsTile');
        
        this.initPortfolioCnt();
        this.initCultureCnt();
        this.initClockCnt();
		this.initNewsCnt();
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

              //  $('.vimeoVideos .slick-prev, .slick-next').on('click', function () {
                    /*var getButton = $(event.target).data( "ga-label" );
					
                    if(getButton == "Arrow_Right"){
                        trackGAEvent("header", "click", "Arrow_Right");
                    }
                    else{
                        trackGAEvent("header", "click", "Arrow_Left");
                    }

					$('.vimeoVideos').slick('slickPause');
					
					//togglePlayPause('play');*/
                   
             //   });

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
            $(this).children("a").on('click', function(e) {
				e.preventDefault();
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
		
		console.log('inicultureContentInit')
		this.cultureContentInit = true;
		/*$('.closeCulture').on('click', function(e) {
			$('.cultureTile').removeClass('shrinkMe stretchOut');
		});*/
		
        this.pushLeftPushRight($('.homeSection .pushLeft .cultureLink'),$('.homeSection .pushRight .cultureLink'));
		
		$('#cultureTileMore').on('click',function(e){
			e.preventDefault();
			
			that.loadMoreContent('cultureTile',mgbMainSys.cMoreTarget);
			
			mgbMainSys.cLoaded += mgbMainSys.cMoreTarget;
		});
    },
	
	findNext : function(el){
		//used to find next culture item
		//important on all culture page when "next" item may be hidden
		var $el = el,p = $el.parent().next();
		for (var i=0;i<10;i++){
			if (p.hasClass('hide')) {
				$el = p;
				p = $el.next();
			}else{
				return p;
			}
		}
		
		return p;
	},
	
	findPrev : function(el){
		//used to find prev culture item
		//important on all culture page when "prev" item may be hidden
		var $el = el,p = $el.parent().prev();
		for (var i=0;i<10;i++){
			if (p.hasClass('hide')) {
				$el = p;
				p = $el.prev();
			}else{
				return p;
			}
		}
		
		return p;
	},
	
	
	pushLeftPushRight : function(leftEl,rightEl){
		var that = this;
		var elR = rightEl;
		var elL = leftEl;

		$(elR).each(function(index) {
			var cleanup;
	        $(this).on('mouseenter', function(e) {
					 // e.preventDefault();
					e.stopPropagation();
			
					that.setCultureTileHeight();
					
				//	clearTimeout(cleanup);
            		
		            if (!$(this).parent().hasClass("stretchOut")) {
		                $(this).parent().siblings().removeClass("shrinkMe stretchOut");
		            }
            
		            var nextTile = that.findNext($(this));
		            var picHolder = nextTile.find('.picHolder');
            
		            var colW = picHolder.width();
		            //move this to a global var on resize???
            
		            if (!$(this).parent().hasClass('stretchOut')) {
		                picHolder.css('min-width', colW + 'px');
		            }
			
		            nextTile.toggleClass("shrinkMe");
		            $(this).parent().toggleClass('stretchOut');
				});
				
			$(this).on('mouseleave',function(e){
				e.stopPropagation();
				$('.cultureTile').removeClass('shrinkMe stretchOut'); 
				/*cleanup = setTimeout(function(){
					$('.picHolder').removeAttr('style');
				},1500);*/
				
			})
		});
		
		$(elL).each(function(index) {
			var cleanup;
	        $(this).on('mouseenter', function(e) {
				// e.preventDefault();
					e.stopPropagation();

					that.setCultureTileHeight();
					
					//clearTimeout(cleanup);

					if (!$(this).parent().hasClass("stretchOut")) {
					    $(this).parent().siblings().removeClass("shrinkMe stretchOut");
					}

					var prevTile =  that.findPrev($(this));//$(this).parent().prev();
					var picHolder = prevTile.find('.picHolder');

					var colW = picHolder.width();
					//move this to a global var on resize???

					if (!$(this).parent().hasClass('stretchOut')) {
					    picHolder.css('min-width', colW + 'px');
					}

					prevTile.toggleClass("shrinkMe");
					$(this).parent().toggleClass('stretchOut');
				});
				
			$(this).on('mouseleave',function(e){
				e.stopPropagation();
				$('.cultureTile').removeClass('shrinkMe stretchOut'); 
				/*cleanup = setTimeout(function(){
					
					$('.picHolder').removeAttr('style');
				},1500);*/
			});
		});
       
	},
	
	loadMoreContent:function(tar,num){
		
		//make sure the culture tiles have a height to animate against
		if (tar == 'cultureTile') {
			this.setCultureTileHeight();
			$('#news .sectionButton').removeClass('show');
		  	setTimeout(function(){
				//contents on the page will more down, so reset waypoints.
		    	mgbMainSys.initWaypoints();
		    }, 500);
		}
		
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
			
			var btn = $(this).find('a');
			btn.on('click', function() {
				var currThis = $(this).parent();
				currThis.siblings().children("a").removeClass("active");
				currThis.children("a").addClass("active");

				var officeDataText = currThis.children('article').html();
				
				$("#officeDetails").removeClass('showDetails');
				
				$("#officeDetails").html('');
				$("#officeDetails").html(officeDataText);
				
				/*var titleLength = $("#officeDetails h3").text().length;
				if (titleLength > 10) {
					$(".rightSide h3").addClass("long");
				}else{
					$(".rightSide h3").removeClass("long");
				}*/
				
				
				// setTimeout(function(){
				// 					var rightHeight = $("#officeDetails").find(".rightSide").height();
				// 					$("#officeDetails").find(".leftSide").attr("max-height", rightHeight + "px");
				// 				}, 1000);

				// location.hash = 'officeDetails';
				
				mgbMainSys.scrollToSection("offices",250);

				setTimeout(function() {
					/*var rs = $('.rightSide .info').height();
					$("#officeDetails").css('height',rs+"px");
					var statsH = $('.officeStats').height() 
					$(".leftSide").css('height',(rs + statsH + 22)+"px");*/
					
					
					//animated the margin to exposes section
					$("#officeDetails").css('margin-bottom','600px');
					
					setTimeout(function() {
						
						$("#officeDetails").addClass('showDetails mb0');
						$("#officeDetails").css('visibility','visible');
						$("#officeDetails").css('margin-bottom',total+"px").css('opacity',1);
						
						$(".rightSide").attr("tabindex",-1).focus();
						
						var rs = $('.rightSide').height();
						var pt = $('.rightSide').css('padding-top').replace("px", "");
						var pb = $('.rightSide').css('padding-bottom').replace("px", "");
						var total = (Number(rs) + Number(pt) /*+ Number(pb) - 6*/);
						
						// console.log(rs,pt,pb,total);
						// $("#officeDetails").css('height',total+"px");
						$(".leftSide").css('height',total+"px");
						
						
						
					}, 750);
					
					$('.closeMe').on('click', function(e) {
						e.preventDefault();
						
						$('.officeTile a').removeClass("active");
						
						$("#officeDetails").addClass('removed').removeClass('mb0');
						
						setTimeout(function(){
							$("#officeDetails").removeClass('showDetails').removeAttr("style").removeClass('removed');
							$("#officeDetails").html('');
						},300)
						
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

				var ndHours = nd.getHours();
				var ndMinutes = nd.getMinutes();

				var ampm = "AM";
				if (ndHours > 12) {
				    ndHours -= 12;
					ampm = "PM";
				}

				var clockHours = Math.floor((ndHours / 12) * 100) + "%";
				var clockMinutes = Math.floor(100 * (ndMinutes / 60)) + "%";

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
	
	initNewsCnt : function() {
		var that = this;
		
		$('#newsTileMore').on('click',function(e){
			e.preventDefault();
			
			that.loadMoreContent('newsTile',mgbMainSys.pMoreTarget);
			mgbMainSys.pLoaded += mgbMainSys.pMoreTarget;
		});
	},
	
	setCultureTileHeight: function(){
		var that = this;
			
		clearTimeout(this.cultureTimeout);
		
		// console.log('setCultureTileHeight')
				
		this.cultureTimeout = setTimeout(function(){
			
			// var colW = that.cultureContent.first().next().find('.picHolder').innerWidth();
			
			var firstStatic = $('.cultureTile.static').first();
			
			if ($('#mainContent').hasClass('inactive')) firstStatic = $('#globalLeadershipWrapper .cultureTile.static').first();
			
			var colW = firstStatic.find('.picHolder').innerWidth();
			
			/*//for the global culture page where there is no static content
			if (firstStatic.length == 0){
				colW = $('#globalLeadershipWrapper .cultureTile').first().find('.picHolder').innerWidth();
			}
			console.log('colW',colW);*/
			$('.cultureTile').removeAttr('style').css('height', colW + 'px');
			
			//checker for page load to make sure the content is ready.
			if (colW < 50) {
				$('.cultureTile').removeAttr('style');
				that.setCultureTileHeight();
			}
			
			if ($('.cultureTile').length > 0){// && !$('.cultureTile').hasAttr('style')){
				var attr = $('.cultureTile').attr('style');
				
				if (attr == undefined) {
					that.setCultureTileHeight();
					console.log('cultureTile does not have style attribute');
				}
				
			}
	
		},350);
		
	},
	
	resize: function() {
		var that = this;

		this.setCultureTileHeight();
		
		$('.arrow').addClass('offTile');
		$('.picHolder').removeAttr('style');
		if(that.cultureContent) that.cultureContent.removeClass("stretchOut shrinkMe");
		
		setTimeout(function(){		
			$('.arrow').removeClass('offTile');
		},600);

		if ($("#officeDetails").hasClass('showDetails')) {
			$('.ribbon').addClass('moving');
			setTimeout(function(){
				$('.ribbon').removeClass('moving');
			},350);
			
			var rs = $('.rightSide').height();
			var pt = $('.rightSide').css('padding-top').replace("px", "");
			var pb = $('.rightSide').css('padding-bottom').replace("px", "");
			//$("#officeDetails").css('height',rs+"px");
			//r statsH = $('.officeStats').height() 
			var total = (Number(rs) + Number(pt) /*+ Number(pb)- 6*/ );
			console.log('update office ',total);
			$(".leftSide").css('height',total+"px");
			
		}
		
		
	},
};


var mgbInternalContent = {
	allCultureFilter : [],
	vimeoPlayer:null,
	vimeoId:null,
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
		
		$('.subnav a').on('click',function(e){
			e.preventDefault();		
			// mgbHeader.deactivateNavActive();
			mgbMainSys.getPage($(this).attr('href'), true);
		
			mgbContent.deactivateActiveContent();
		});
		
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
	addAllNewsListeners : function(){
		mgbMainSys.allNewsLoaded = true;
	},
	addAllCultureListeners : function(){
		
		this.allCultureFilter = [];
		var that = this;

		if (mgbContent.cultureContentInit == false) mgbContent.initCultureCnt();
		mgbContent.cultureContent = $('.cultureTile');
		mgbContent.setCultureTileHeight();
		mgbMainSys.allCultureLoaded = true;
		that.filterAllCulture('all');

		$('input:checkbox[name=radio-select]').change(function() {
			
			$('#globalLeadershipWrapper label').removeClass('active');
			that.allCultureFilter = [];
			
			that.allCultureFilter.push(this.value);
			$('#label-select-'+this.value).addClass('active');
			
			$('select').val(this.value);
			
			var filterOption = "";
			if (that.allCultureFilter[0] == "all") filterOption = "all";
			that.filterAllCulture(filterOption);
			
		});
	   
	   $('select').change(function() {
		   $('#globalLeadershipWrapper label').removeClass('active');
		   
		   	that.allCultureFilter = [];
		   	that.allCultureFilter.push(this.value);
		  	
			$('#label-select-'+this.value).addClass('active');
			
			var filterOption = "";
			if (that.allCultureFilter[0] == "all") filterOption = "all";
			that.filterAllCulture(filterOption);
	   });
	   
	},	
	
	filterAllCulture : function(filterList){
		
		var that = this;
		var tempCultureList = [];
		$( "#globalLeadershipWrapper .cultureTile" ).each(function( index ) {
			var filter = $( this ).data('office-filter');
			var tile = $(this);
			var chosen = jQuery.inArray(filter, that.allCultureFilter);
			
			// if (tile.hasClass('col-2-by-1')) chosen = 1;
			
			tile.removeClass('shrinkMe');
			tile.removeClass('stretchOut');
			tile.removeClass('hide');
			
			
			if (chosen == -1 && filterList != "all") {
				if (!tile.hasClass('static')) tile.addClass('hide');
			}else{
				// var hasInfo = (tile.hasClass('pushLeft') || tile.hasClass('pushRight')) ? true : false;
				var hasInfo = false;
				if (tile.hasClass('pushLeft') || tile.hasClass('pushRight')){
					hasInfo = true;
					tile.removeClass('pushLeft');
					tile.removeClass('pushRight');
				}
				
				if (!tile.hasClass('static')) tempCultureList.push('count');
				
				if (tile.hasClass('col-2-by-1')) tempCultureList.push('count');
				
				if (hasInfo){
					if (tempCultureList.length % 2 ==0){
						tile.addClass('pushLeft');
					}else{
						tile.addClass('pushRight');
					}
				}
			}
		});

		mgbContent.setCultureTileHeight();

		setTimeout(function(){
			mgbMainSys.checkInView('.ll-all');
			
			$( "#globalLeadershipWrapper .cultureLink").off( "click" );
			
			mgbContent.pushLeftPushRight($( "#globalLeadershipWrapper .pushLeft .cultureLink"),$( "#globalLeadershipWrapper .pushRight .cultureLink"));
			
			
		},1000);
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
		/*$('footer').removeAttr('style');
		var footerY = Math.round($('footer').position().top);
		var footerH = lastWindowHeight - footerY;// - 16;
		$('footer').css('height',footerH+'px');*/
		
		//add height style to hero image to be able to collapse it using css3
		
		var maxHero = 350;
		
		if($("#heroImage").length > 0) {
			var hi = $('#heroImage img').innerHeight();
			if (hi>maxHero) hi=maxHero;
			// if (hi<400) hi=400;
			$('.subpageHeader').css('height',hi + "px");
			$('#heroImage').css('height',hi + "px");
			$('#internalContent .contentWrapper').css({'top':hi + "px",'margin-bottom':hi + "px"});
			// $('.videoHolder').css('height',hi + "px");
		}
		
		if($(".videoHolder").length > 0 ) {
			var hv = $('.videoWrapper').height();
			$('.videoHolder').css('height',hv+'px');
			$('.subpageHeader').css('height',hv + "px");
			$('#internalContent .contentWrapper').css({'top':hv + "px",'margin-bottom':hv + "px"});
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
	// $('#overlayCover').addClass('active');
	mgbHeader.logoAnimation.progress(1, false);
	mgbInternalContent.init();
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
//uncomment #header nav ul.menu:after css in _header.css
// mgbMainSys.handleOfficeSelector();


if($("body").hasClass("ishome") && !isMobile.any()) {
	mgbHeroVideo.loadHeaderVideo();
	
	// Check for location in header section
	/*if("geolocation" in navigator) {
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
	}*/
}


if($("body").hasClass("ishome")) {
	mgbMainSys.currPage = appRoot;
	
}else{
	mgbMainSys.collapseNav();
}

window.onscroll = mgbMainSys.handleScrolling;
window.onresize = resizeChecker;
// window.onunload = displayCurrentContent;


window.onpopstate = function (event) {
	//console.log('pop',event,loc = window.location.pathname);
	
    if (event.state) {
        // console.log('retrieving ', event.state.url, ' from history');
        mgbMainSys.getPage(event.state.url, false);
    }else{
    	mgbMainSys.getPage(window.location.pathname, false);
    }
};

// setTimeout(function(){
	//console.log("init reseize")
	// resize();
	// mgbMainSys.showFooter(); // show the footer once page is loaded
 // }, 750);

window.onload = resize;

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
	mgbHeroVideo.resize();
	
	if (lastWindowWidth < (768 - 16)){
		$('body').addClass('small');
	}else{
		$('body').removeClass('small');
	}
		
	if (mgbMainSys.mainContentLoaded == true || mgbMainSys.allCultureLoaded == true || mgbMainSys.allNewsLoaded == true) {
		mgbMainSys.resize();
		mgbContent.resize();
	}
	
	if ($('#internalContent').hasClass('active')) mgbInternalContent.resize();
}



