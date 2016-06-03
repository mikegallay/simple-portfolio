	<!-- MAIN CONTENT GOES HERE -->
	<section class="videoHeader">
		
		<div id="welcomeImage"></div>
		
		<div id="welcomeVideo">	
			<video class="responsive-video" id="headerVideo" autoplay loop preload="auto"></video>
		</div>
			
		<div class="video-overlay">
			<div class="headerHeroText" contentEditable="true" data-words="#hello,mgb,#$@%!,#content,pizza,nyc,dogs in office,thirsty thursday,frying pan,coffee,#hashtags,#youreit,new york,creative,get 'er done,awesome,beer,cocktails,#agencylife,601 w26th,zeeshan,intel,clorox,burt's bees,united,the standard"></div>
			<div class="moreMsg">that's us. <span class="cta blueFont">get to know more!</span></div>
		</div>
		
		<div id="downArrow">
			<?php addIcon('marquee_down_arrow')?>
		</div>

	</section>
	
	<section id="Timeline" class="fullBleed">
		<div class="container">
			<h1 class="sectionHeading">WHO SAYS <span data-forward class="blueFont">WE</span> CAN'T?</h1>
		</div>
		
		<div style="width: 100%; text-align: center; position:relative">
			<div style="width: 100%; height: 560px; margin: 0 auto; transform: scale(1.85); margin-bottom: 4em; max-height: 1280px;">
				<svg class="icon mb_timeline_path-inline" role="img" aria-labelledby="title">
				  <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#mb_timeline_path"></use>
				  <!--[if lt IE 9]> <img src="assets/img/svg/ie8-fallback/mb_timeline_path.png" alt="mb_timeline_path icon"> <!--<![endif]-->
				</svg>
			</div>
		</div>
	</section>
	
	<section id="OurWork" class="fullBleed">
		<div class="container">		
			<h1 class="sectionHeading">IT'S NOT <span data-forward class="blueFont">CREATIVE</span> <br> UNLESS IT <span data-forward class="blueFont">WORKS.</span></h1>
	
			<div class="portfolioContent">
		
				<?php
					$portfolioData = HTMLfromTemplateAndJSON("content/templates/portfolio-template.html", "portfolio-data", false);
					echo $portfolioData; 
				?>
			</div>
			<div class="moreButton active">
				<a id="projectTileMore" href="" data-tracking-label="Home|Click|Project_LoadMore"><?php addIcon('more_button'); ?></a>
			</div>
		</div>
	</section>

	<section id="OurPeople" class="fullBleed">
		<div class="container">
			<h1 class="sectionHeading">OUR <span data-forward class="blueFont">CULTURE</span></h1>
	
			<div class="alignRight">
				<a id="officeToggle" class="button" alt="">OUR OFFICE<?php addIcon('menu_dropdown_arrow'); ?></a>
			</div>

			<!-- <div>
				<input class="cityFilter" id="select-all" name="radio-select" type="radio"><label for="select-ams">All</label></li>
				<input class="cityFilter" id="select-ams" name="radio-select" type="radio"><label for="select-ams">Amsterdam</label></li>
				<input class="cityFilter" id="select-chi" name="radio-select" type="radio"><label for="select-chi">Chicago</label></li>
				<input class="cityFilter" id="select-hk" name="radio-select" type="radio"><label for="select-hk">Hong Kong</label></li>
				<input class="cityFilter" id="select-ldn" name="radio-select" type="radio"><label for="select-ldn">London</label></li>
				<input class="cityFilter" id="select-ny" name="radio-select" type="radio"><label for="select-ny">New York</label></li>
				<input class="cityFilter" id="select-par" name="radio-select" type="radio"><label for="select-par">Paris</label></li>
				<input class="cityFilter" id="select-sf" name="radio-select" type="radio"><label for="select-ams">San Francisco</label></li>
				<input class="cityFilter" id="select-sao" name="radio-select" type="radio"><label for="select-sao">Sau Paulo</label></li>
				<input class="cityFilter" id="select-sg" name="radio-select" type="radio"><label for="select-ams">Shanghai</label></li>
			</div> -->

			<div class="cultureContent">				
				<?php
					$cultureData = HTMLfromTemplateAndJSON("content/templates/culture-template.html", "culture-data",true);
					echo $cultureData; 
				?>
			</div>
			<div class="moreButton active">
				<a id="cultureTileMore" href="#" data-tracking-label="Home|Click|Culture_LoadMore"><?php addIcon('more_button'); ?></a>
			</div>
		</div>	
	</section>

	<section id="OurOffices" class="fullBleed">
		<div class="container">
			<h1 class="sectionHeading">OUR OFFICES</h1>

			<article id="officeDetails"></article>
		
			<div class="officeContent">
				<?php
					$officeData = HTMLfromTemplateAndJSON("content/templates/office-template.html", "office-data", false);
					echo $officeData; 
				?>
			</div>
		</div>
	</section>


	<section id="OurClients" class="fullBleed">
		<div class="container">
			<h1 class="sectionHeading">OUR <span class="blueFont">CLIENTS</span></h1>
		
			<div class="clientContent">
				<?php
					$clientData = HTMLfromTemplateAndJSON("content/templates/clientList-template.html", "clientList-data");
					echo $clientData;
				?>
			</div>
		</div>
	</section>


	<section id="JoinTeam" class="fullBleed">	
		<div class="container">
			<h1 class="sectionHeadingSmall joinTeamCTA">INTERESTED IN JOINING THE TEAM?</h1>
	
			<a class="button" href="https://mcgarrybowen-dentsuaegisnetwork.icims.com/jobs/intro?hashed=-435684868&mobile=false&width=1279&height=500&bga=true&needsRedirect=false&jan1offset=-300&jun1offset=-240" target="_blank" alt="Take a gander at our job listings" data-tracking-label="Home|Click|JobListings" >TAKE A GANDER AT OUR JOB LISTINGS</a>
		</div>	
	</section>
	

		