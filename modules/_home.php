	<!-- MAIN CONTENT GOES HERE -->	
	<section class="videoHeader parallaxHeader">	
		<div id="welcomeImage"></div>
		
		<div id="welcomeVideo">	
			<div class="responsive-video" id="headerVideo"></div>
		</div>
			
		<div class="video-overlay">
			<div class="headerHeroText" contentEditable="true" data-words="#hello,mgb,#$@%!,#content,pizza,nyc,dogs in office,thirsty thursday,frying pan,coffee,#hashtags,#youreit,new york,creative,get 'er done,awesome,beer,cocktails,#agencylife,601 w26th,zeeshan,intel,clorox,burt's bees,united,the standard"></div>
			<div class="moreMsg">that's us. <span class="cta blueFont">get to know more!</span></div>
		</div>
		
		<div id="downArrow">
			<?php addIcon('marquee_down_arrow')?>
		</div>
	</section>
	<div class="contentWrapper">
		<!-- <section id="Timeline" class="fullBleed">
			<div class="container">
				<h1 class="sectionHeading">WHO SAYS <span data-forward class="blueFont">WE</span> CAN'T?</h1>
			</div>

			<div style="width:100%;position:relative;">


				<div style="width: 130%; margin-bottom: 200px; margin-left: -34%;">

						<svg class="icon mb_timeline_path-inline" xmlns="http://www.w3.org/2000/svg" viewBox="-433.3 385.4 600 127.4"><path id="mb_timeline_path2" fill="none" stroke="#46ccc5" stroke-width="2" stroke-linejoin="bevel" stroke-miterlimit="10" d="M166.7 510.3h-218c24.7 0 35.2-21.8 35.2-44.3 0-22-11.6-41.4-35.3-41.4-14.3 0-22.5 5.6-27.1 13.2h-.3V388H-94v120.4c-5.9 0-25.6-.4-32.3-.4-6.6 0-7.2.2-13.9.4v-4.8c5.1 0 6.1 0 6.1-6.1v-40.7c0-11.6-2.4-22.6-16-22.6-7.2 0-17.5 5.9-21.7 8.8v54.5c0 6.1 1.6 6.1 6.7 6.1v4.8c-6.4 0-7.1-.4-13.7-.4s-7.3.2-13.9.4v-4.8h.3c5.2 0 5.9 0 5.9-6.1v-40.7c0-11.6-2.4-22.6-16-22.6-7.2 0-17.5 5.9-21.7 8.8v54.5c0 6.1 1 6.1 6.2 6.1h.3v4.8c-6.4 0-6.9-.4-13.5-.4s-7.3.2-14.4.4v-4.8h.9c5.2 0 5.8 0 5.8-6.1v-49.7c0-8.1-2.8-9.2-9.6-12.9h-184.8"/>
						</svg>
						<div style="position:absolute; width:100%; height:100%; top:0; left:0;">


							<div class="timelineDate" style="top: 33%; left: 16%;">
								<a href="#">2002<span class="arrow bottom"></span></a>
							</div>

							<div class="timelineDate align-right" style="top: 85%; left: 20%">
								<a href="#">2003<span class="arrow right"></span></a>
							</div>

							<div class="timelineDate" style="left: 47%; top: 32%;">
								<a href="#" class="dateButton">2004<span class="arrow bottom"></span></a>
							</div>

							<div class="timelineDate align-right" style="left: 60.5%; top: 90%;">
								<a href="#" class="dateButton">2008<span class="arrow right"></span></a>
							</div>

							<div class="timelineDate align-right" style="left: 60.5%; top: 9%;">
								<a href="#" class="dateButton">2009<span class="arrow right"></span></a>
							</div>

							 <div class="timelineDate align-left" style="left: 86%; top: 40%;">
								<a href="#"><span class="arrow left"></span>2011</a>
							</div>

							<div class="timelineDate" style="left: 90%; top: 92%;">
								<a href="#">2012<span class="arrow bottom"></span></a>
							</div>
						</div>
					</div>
				</div>
		</section> -->
		<section id="work" class="homeSection fullBleed">
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
		<section id="culture" class="homeSection fullBleed">
			<a href="all-culture" data-tracking-label="Home|Click|AllCulture" style="color:red;">Culture ALL!!!</a>
			<div class="container">
				<h1 class="sectionHeading">OUR <span data-forward class="blueFont">CULTURE</span></h1>
	
				<!--<div class="alignRight">
					<a id="officeToggle" class="button" alt="">OUR OFFICE<?php //addIcon('menu_dropdown_arrow'); ?></a>
				</div>

				 <div>
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
		<section id="offices" class="homeSection fullBleed">
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
		<section id="news" class="homeSection fullBleed">
			<div class="container">
				<h1 class="sectionHeadingSmall latestNews">LATEST NEWS</h1>
				
				<div class="newsContent">
					<?php
						$newsData = HTMLfromTemplateAndJSON("content/templates/news-template.html", "news-data");
						echo $newsData;
					?>
				</div>
				<div class="moreButton active">
					<a id="newsTileMore" href="#" data-tracking-label="Home|Click|News_LoadMore"><?php addIcon('more_button'); ?></a>
				</div>
			</div>
		</section>
		
		<section id="clients" class="fullBleed">
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
		<section id="careers" class="fullBleed">	
			<div class="container">
				<h1 class="sectionHeadingSmall">INTERESTED IN JOINING THE&nbsp;TEAM?</h1>
	
				<a class="button" href="https://mcgarrybowen-dentsuaegisnetwork.icims.com/jobs/intro?hashed=-435684868&mobile=false&width=1279&height=500&bga=true&needsRedirect=false&jan1offset=-300&jun1offset=-240" target="_blank" aria-label="Take a gander at our job listings" data-tracking-label="Home|Click|JobListings" >TAKE A GANDER AT OUR JOB LISTINGS</a>
			</div>	
		</section>
		
		
	</div>