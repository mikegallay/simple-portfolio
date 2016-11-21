	<!-- MAIN CONTENT GOES HERE -->	
	<section class="parallaxHeader">	
		<div id="headerWrapper">
			<h1>Michael Gallay</h1>
		</div>
		
		
		
	</section>
	<div class="contentWrapper">
		<section class="homeBio">
			<p><strong>DEVELOPER, ILLUSTRATOR, TEAM-LEADER</strong></p>
			<hr>
			<p>With over 15 years in the digital industry in NYC, I am confident working independently or managing a team of developers in building cutting-edge digital experiences.<br/><br/>I am looking to become part of a group of like-minded individuals who are curious and excited about the future of technology. Currently available for freelance or full-time opportunities.<br/><br/><strong>Capabilities:</strong> Front-End Development, Wordpress, Banner Development, 3D Animation, After Effects, Illustration, Internet of Things, Virtual Reality
			</p>
		</section>
		<section id="homeTiles" class="fullBleed">
			<div class="container">
	
				<div class="columnWrapper">
					<p><strong>SELECT WORK</strong></p>
					<hr>
					<?php
						$portfolioData = HTMLfromTemplateAndJSON("content/templates/portfolio-template.html", "portfolio-data");
						echo $portfolioData; 
					?>
				</div>
				
			</div>
		</section>
		
		
	</div>