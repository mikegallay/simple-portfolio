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
			<p>With over 20 years in the digital industry in NYC, I am confident working independently or managing a team of developers in building cutting-edge digital experiences.<br/><br/>I am open to working with groups of like-minded individuals who are curious and excited about the future of technology. <br/><br/><strong>Capabilities:</strong> Technology Management, Front-End Development, Wordpress, 3D Animation, After Effects, Illustration, Internet of Things, Virtual Reality
			</p>
		</section>
		<section id="homeTiles" class="fullBleed">
			<div class="container">

				<div class="columnWrapper">
					<p><strong>RECENT PROJECTS</strong></p>
					<hr>
					<?php
						$portfolioData = HTMLfromTemplateAndJSON("content/templates/portfolio-template.html", "portfolio-data");
						echo $portfolioData;
					?>
					<!-- <br/>
					<p><strong>FROM THE ARCHIVES</strong></p>
					<hr>
					<?php
						// $portfolioData = HTMLfromTemplateAndJSON("content/templates/portfolio-template.html", "dev-data");
						// echo $portfolioData;
					?> -->
				</div>

			</div>
		</section>


	</div>
