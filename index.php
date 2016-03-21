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
    <title>TITLE</title>
    <meta name="description" content="">
    <meta name="keywords" content="">
    <?php include 'modules/_head.inc.php'; ?>
	
	<style type="text/css" media="screen">
	.pfill-test{width:100%;}
	.pfill-wrapper{width:100%;max-width:1200px;position:relative;margin:0 auto;overflow:hidden;}
	img {
	    max-width: 100%;
	}
	</style>
	
</head>
<body class="index">
	<?php include 'modules/_methods.inc.php'; ?>
	
    <?php include 'modules/_header.inc.php'; ?>
	
	<!-- MAIN CONTENT GOES HERE -->
	
	<?php addIcon('heart'); ?>
	
	<div>
		Play Music <span><?php addIcon('music'); ?></span>
	</div>
	<div>
		Play Music <span><img src="assets/img/svg/ie8-fallback/music.png"></span>
	</div>
	
	<div class="pfill-test">
		<div class="pfill-wrapper">
			<?php pictureFillImage('assets/img/home/campaign1','campaign one alt'); ?>
		</div>
	</div>
	
	<div class="handlebars-test">
		<?php
			$htmlFromTemplate = HTMLfromTemplateAndJSON("content/templates/test-template.html", "content/data/test-data.json");
			echo $htmlFromTemplate;
		?>
	</div>
	
	
    <?php include 'modules/_footer.inc.php'; ?>

    <?php include 'modules/_foot.inc.php'; ?>

</body>

</html>
