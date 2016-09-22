<?php
	error_reporting(E_ALL & ~E_NOTICE);
	
	$appRoot = dirname($_SERVER["PHP_SELF"]);
	
	if($appRoot !== '/' ) $appRoot = $appRoot.'/'; //-- needs trailing slash
	
	require_once("modules/_methods.inc.php");

	function getCurrentUri($root)
	{
		$uri = substr($_SERVER['REQUEST_URI'], strlen($root));
		return $uri;
	}
 
 	$actual_link = $_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
	$base_url = getCurrentUri($appRoot);
	$new_url = '';
	$routes = array();
	$routes = explode('/', $base_url);
	$homeSections = array("work", "culture", "offices", "news"); // sections of home page that are linked in the navigation (NOT individual pages)
	
	$ishome = false;
	
	$isHomeSection = (count($routes) < 2 && (in_array($routes[0], $homeSections)));//(count($routes) < 2 && (in_array($routes[0], $homeSections)))
	
	if ($routes[0] == null || $routes[0] == 'index.php' || $routes[0] == 'index.php?ajax=1' || $isHomeSection){
		$ishome = true;
	}
	
	
	if (isset($_GET['ajax'])) {
		
		if (!$ishome){ // not the homepage
			$new_url = str_replace('?ajax=1', '', $base_url);
			$new_url = "modules/" . $new_url;
			
		}else{
			$new_url = "modules/_home.php";
			
		}
		
		include($new_url);
	  
		return;
		
	} /*else {
		echo 'base'.$base_url;
		if (!file_exists($appRoot . $base_url) || !file_exists($appRoot . "modules/" . $base_url)){
			//header("Location:" . $appRoot . "404.php" );
			//exit();
		}
	}*/
?>
<?php include_once("modules/_head.inc.php"); ?>

<body class="no-autoplay <?php if ($ishome){ ?>ishome<?php } else {?>nothome<?php } ?>">	

    <?php include_once("modules/_header.inc.php");?>
	
	<div id="mainContent">
		
		<?php 
		if ($ishome){ 
			include_once("modules/_home.php"); 
		}
		?>
	</div>
	
	<!-- <div id="overlayCover" class="<?php if ($base_url == "global-leadership") {?> white <?php } ?>">
	</div> -->
	
	<div id="internalContent">
		<?php 
		if (!$ishome) { 
			$isExtendedBio = strpos($base_url , 'global-leadership/');
			if ($isExtendedBio == 0) {
				$extendedArr = explode("/", $base_url);
				include_once("modules/extended-bio.php");
			}else{
				include_once("modules/" . $base_url . ".php");
			}
			
		}
		?>
		<div><?php echo 'base= ' . "modules/extended-bio.php?bio=" . $extendedArr[1]; ?>
			
		</div>
	</div>
	
	<?php include_once("modules/_footer.inc.php");?>
	
	<?php include_once("modules/_foot.inc.php");?>
	
	<?php if (!$ishome) { 
		//if ($base_url == "global-leadership") { ?>
		<script type="text/javascript">
			
			$('#header').addClass('settle');
			
			//global leadership
			if ($('#globalLeadershipWrapper').length) mgbInternalContent.addAllCultureListeners();
			//setTimeout(function(){mgbMainSys.checkInView('.ll-all');$('footer').removeClass('tempHide')},2000);
			mgbInternalContent.resize();
		</script>
	<?php } ?>
	
	
</body>

</html>
