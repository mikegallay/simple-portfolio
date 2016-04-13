<!doctype html>
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
    <?php include 'modules/_head.inc.php'; ?>
</head>
<body>
	<?php include 'modules/_methods.inc.php'; ?>
    <?php include 'modules/_header.inc.php'; ?>
	
	<!-- MAIN CONTENT GOES HERE -->
	<div class="container">
		
		<section id="OurWork">	
			<h1 class="sectionHeading">IT'S NOT CREATIVE UNLESS IT WORKS</h1>
			
			<div class="portfolioContent">
				
				<?php
					$portfolioData = HTMLfromTemplateAndJSON("content/templates/portfolio-template.html", "content/data/portfolio-data.json");
					echo $portfolioData; 
				?>
			</div>
			<div class="moreButton">
				<a id="addFolioContent" href=""><?php addIcon('more_button'); ?></a>
			</div>
		</section>
		
		<section id="OurPeople">
			<h1 class="sectionHeading">WHO SAYS WE CAN'T</h1>
			
			<div class="row alignRight">
				<a id="officeToggle" class="button" alt="">OUR OFFICES  <?php addIcon('menu_dropdown_arrow'); ?></a>
			</div>
			
			<div class="cultureContent">
				<?php
					$cultureData = HTMLfromTemplateAndJSON("content/templates/culture-template.html", "content/data/culture-data.json");
					echo $cultureData; 
				?>
			</div>
			<div class="moreButton">
				<a id="addCultureContent" href=""><?php addIcon('more_button'); ?></a>
			</div>
		</section>
		

		<section id="OurOffices">
			<h1 class="sectionHeading">OUR OFFICES</h1>
			
			<article id="officeDetails" class="row"></article>
			
			<div class="officeContent">
				<?php
					$officeData = HTMLfromTemplateAndJSON("content/templates/office-template.html", "content/data/office-data.json");
					echo $officeData; 
				?>
			</div>
		</section>
		
		<section id="JoinTeam">
			<h1 class="sectionHeading joinTeamCTA">INTERESTED IN <br>
				JOING THE TEAM?</h1>
		
			<a class="button" href="https://mcgarrybowen-dentsuaegisnetwork.icims.com/jobs/intro?hashed=-435684868&mobile=false&width=1279&height=500&bga=true&needsRedirect=false&jan1offset=-300&jun1offset=-240" target="_blank" alt="Take a gander at our job listings">TAKE A GANDER AT OUR JOB LISTINGS</a>
		</section>
		
	</div>
<!-- 	
	<div class="pfill-test">
		<div class="pfill-wrapper">
			<?php // pictureFillImage('assets/img/home/campaign1','campaign one alt'); ?>
		</div>
	</div>
	
	<div class="handlebars-test">
		<?php
		/*	$htmlFromTemplate = HTMLfromTemplateAndJSON("content/templates/test-template.html", "content/data/test-data.json");
			echo $htmlFromTemplate; */
		?>
	</div> 
-->

    <?php include 'modules/_footer.inc.php'; ?>
    <?php include 'modules/_foot.inc.php'; ?>

</body>

</html>
