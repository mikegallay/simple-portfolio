<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7" lang="en"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8" lang="en"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9" lang="en"> <![endif]-->
<!--[if gt IE 8]><!-->
<html class="no-js" lang="en">
<!--<![endif]-->

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <title>mcgarrybowen</title>
    <meta name="description" content="">
    <meta name="keywords" content="">
		
	<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, user-scalable=no"/>
	
	<link href="https://fonts.googleapis.com/css?family=Open+Sans:400,400i,700" rel="stylesheet">
	<link rel="stylesheet" href="assets/css/main.css?v<?php echo $vnum; ?>">
	
	<style type="text/css" media="screen">
	body{background:black;
/*		background:url('assets/img/common/starrettLehigh.jpg');*/
	}
	div{font-size:1em;color:white;
/*		-webkit-font-smoothing: subpixel-antialiased;
		-webkit-text-stroke:1px transparent;
		-webkit-backface-visibility: hidden;*/
		
		
	}
	.os400{font-family:'Open Sans';font-weight:400;}
	.os700{font-family:'Open Sans';font-weight:700;}
	.dinL{font-family:'Din-Light';}
	.dinR{font-family:'Din-Regular';}
	.dinB{font-family:'Din-Bold';}
	.em{font-style:italic;}
	
	.animation{
		width: 400px;
	    height: 100px;
		position:absolute;
	    background-color: white;
	    -webkit-animation-name: example; /* Safari 4.0 - 8.0 */
	    -webkit-animation-duration: 3s; /* Safari 4.0 - 8.0 */
	    animation-name: example;
	    animation-duration: 3s;
		animation-iteration-count: infinite;
	}
	
	/* Safari 4.0 - 8.0 */
	@-webkit-keyframes example {
	    from {top: 0px;}
	    to {top: 500px;}
	}

	/* Standard syntax */
	@keyframes example {
	    from {top: 0px;}
	    to {top: 500px;}
	}
	

	
	#cover{
		width:100%;
		z-index:1;
		height:50px;
		background:red;
	}
	
	#videoHolder{
	    position: relative;
	    z-index: 1;
/*	    left: 50%;*/
	    width: 100%;
	    height: 100%;
/*	    margin: 0 -1500px;*/
	    height: 100%;
	    display: block;
		-webkit-transform: translate3d(0, 0, 0);
	}
	
	#background-video {
	    display: block;
	    height: 100%;
	    margin: 0 auto;
		
		   
	}
	
	section{
/*		float:left;*/
		position:absolute;
		top:0px;
		left:0;
		padding:20px;
		z-index: 50;
		display:block;
		    height: 100%;
			
	}
	section .div{
		z-index:100;
	}
	
	section.bg{
		background:black;
	}
	
	</style>


</head>

<body style="font-size:20px;">
	<!-- <div class="animation"></div> -->
	<div id="videoHolder">
		<video id='background-video' loop='loop' preload='auto' autoplay>
		  <source src='assets/videos/Main_Sequence_opt.mp4' type='video/mp4'>
		</video>
	</div>
	
	<!-- <div id="cover"></div> -->
	
	<section class="">
	    <div class="os400">
			Open Sans 400<br/>
	    	THE QUICK BROWN FOX JUMPED OVER THE LAZY DOG<br/>
			the quick brown fox jumped over the lazy dog<br/><br/>
	    </div>
	
	    <div class="os400 em">
			Open Sans 400i<br/>
	    	THE QUICK BROWN FOX JUMPED OVER THE LAZY DOG<br/>
			the quick brown fox jumped over the lazy dog<br/><br/>
	    </div>
	
	    <div class="os700">
			Open Sans 700<br/>
	    	THE QUICK BROWN FOX JUMPED OVER THE LAZY DOG<br/>
			the quick brown fox jumped over the lazy dog<br/><br/>
	    </div>
	
	    <div class="dinL">
			Din-Light<br/>
	    	THE QUICK BROWN FOX JUMPED OVER THE LAZY DOG<br/>
			the quick brown fox jumped over the lazy dog<br/><br/>
	    </div>
	
	    <div class="dinR">
			Din-Regular<br/>
	    	THE QUICK BROWN FOX JUMPED OVER THE LAZY DOG<br/>
			the quick brown fox jumped over the lazy dog<br/><br/>
	    </div>
	
	    <div class="dinB">
			Din-Bold<br/>
	    	THE QUICK BROWN FOX JUMPED OVER THE LAZY DOG<br/>
			the quick brown fox jumped over the lazy dog<br/><br/>
	    </div>
	</section>
	
</body>

</html>
