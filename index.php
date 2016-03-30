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
		
		<a name="work">
		<section id="OurWork" class="row" name="work">	
			<h1 class="sectionHeading">OUR WORK</h1>
			<a class="button" href="#" alt="">OUR CLIENTS</a>
			
			<div class="portfolioContent">
				<?php
					$htmlFromTemplate = HTMLfromTemplateAndJSON("content/templates/portfolio-template.html", "content/data/portfolio-data.json");
					echo $htmlFromTemplate; 
				?>
			</div>
		</section>
	
		<a name="people">
		<section id="OurPeople" class="row">
			<h1 class="sectionHeading">OUR CULTURE</h1>
		</section>
		
		<a name="offices">
		<section id="OurOffices" class="row">
			<h1 class="sectionHeading">OUR OFFICES</h1>
		</section>

		<a name="careers">
		<section id="JoinTeam" class="row" name="careers">
			<h1 class="sectionHeading">INTERESTED IN <br>
				JOING THE TEAM?</h1>
		
			<a class="button" href="#" alt="">TAKE A GANDER AT OUR JOB LISTINGS</a>
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
