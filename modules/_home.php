	<!-- MAIN CONTENT GOES HERE -->

	<section id="OurPeople" class="fullBleed">
		<div class="container" id="settleContainer">
			<h1 class="sectionHeading"><span data-forward>WHO SAYS</span> <span data-forward class="blueFont">WE</span> <span data-forward>CAN'T?</span></h1>
	
			<div class="row alignRight">
				<a id="officeToggle" class="button" alt="">OUR OFFICES  <?php addIcon('menu_dropdown_arrow'); ?></a>
			</div>
	
			<div class="cultureContent">
				<?php
					$cultureData = HTMLfromTemplateAndJSON($_SERVER['DOCUMENT_ROOT'] . "/content/templates/culture-template.html", "culture-data",true);
					echo $cultureData; 
				?>
			</div>
			<div class="moreButton active">
				<a id="cultureTileMore" href="#"><?php addIcon('more_button'); ?></a>
			</div>
		</div>	
	</section>


	<section id="OurWork" class="fullBleed">
		<div class="container">		
			<h1 class="sectionHeading"><span data-forward>IT'S NOT</span> <span data-forward class="blueFont">CREATIVE</span> <br> <span data-forward="sectionForward">UNLESS IT</span> <span data-forward class="blueFont">WORKS.</span></h1>
	
			<div class="portfolioContent">
		
				<?php
					$portfolioData = HTMLfromTemplateAndJSON($_SERVER['DOCUMENT_ROOT'] . "/content/templates/portfolio-template.html", "portfolio-data", false);
					echo $portfolioData; 
				?>
			</div>
			<div class="moreButton active">
				<a id="projectTileMore" href=""><?php addIcon('more_button'); ?></a>
			</div>
		</div>
	</section>


	<section id="OurOffices" class="fullBleed">
		<div class="container">
			<h1 class="sectionHeading">OUR OFFICES</h1>

			<article id="officeDetails"></article>
		
			<div class="officeContent">
				<?php
					$officeData = HTMLfromTemplateAndJSON($_SERVER['DOCUMENT_ROOT'] . "/content/templates/office-template.html", "office-data", false);
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
					$clientData = HTMLfromTemplateAndJSON($_SERVER['DOCUMENT_ROOT'] . "/content/templates/clientList-template.html", "clientList-data");
					echo $clientData;
				?>
			</div>
		</div>
	</section>


	<section id="JoinTeam" class="fullBleed">	
		<div class="container">
			<h1 class="sectionHeadingSmall joinTeamCTA">INTERESTED IN <br>
				JOING THE TEAM?</h1>
	
			<a class="button" href="https://mcgarrybowen-dentsuaegisnetwork.icims.com/jobs/intro?hashed=-435684868&mobile=false&width=1279&height=500&bga=true&needsRedirect=false&jan1offset=-300&jun1offset=-240" target="_blank" alt="Take a gander at our job listings">TAKE A GANDER AT OUR JOB LISTINGS</a>
		</div>	
	</section>
	

		