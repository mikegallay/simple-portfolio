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
		
		<a name="work"></a>
		<section id="OurWork">	
			<h1 class="sectionHeading">OUR WORK</h1>
			
			<div class="row alignRight">
				<a id="clientToggle" class="button" alt="">OUR CLIENTS</a>
			</div>
			
			<div id="clientList" class="row">
				<ul>
				<?php
					$clientListData = HTMLfromTemplateAndJSON("content/templates/clientList-template.html", "content/data/clientList-data.json");
					
					echo $clientListData;
				?>
				</ul>
			</div>
			
			<div class="portfolioContent">
				<?php
					$portfolioData = HTMLfromTemplateAndJSON("content/templates/portfolio-template.html", "content/data/portfolio-data.json");
					echo $portfolioData; 
				?>
			</div>
		</section>
	
		<a name="people"></a>
		<section id="OurPeople">
			<h1 class="sectionHeading">OUR CULTURE</h1>
			
			<div class="row alignRight">
				<a id="officeToggle" class="button" alt="">OUR OFFICES</a>
			</div>
			
			<div class="cultureContent">
				<?php
					$cultureData = HTMLfromTemplateAndJSON("content/templates/culture-template.html", "content/data/culture-data.json");
					echo $cultureData; 
				?>
			</div>
		</section>
		
		<a name="offices"></a>
		<section id="OurOffices">
			<h1 class="sectionHeading">OUR OFFICES</h1>
		</section>

		<a name="careers"></a>
		<section id="JoinTeam">
			<h1 class="sectionHeading">INTERESTED IN <br>
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
