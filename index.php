<?php
	//include 'ChromePhp.php';
	
	
	$appRoot = dirname($_SERVER["PHP_SELF"]);
	
	if($appRoot !== '/' ) $appRoot = $appRoot.'/'; //-- needs trailing slash
	
	require_once("modules/_methods.inc.php");

	function getCurrentUri($root)
	{
		$uri = substr($_SERVER['REQUEST_URI'], strlen($root));
		return $uri;
	}
 
 	$actual_link = $_SERVER[HTTP_HOST].$_SERVER[REQUEST_URI];
	$base_url = getCurrentUri($appRoot);
	$new_url = '';
	$routes = array();
	$routes = explode('/', $base_url);
	
	$ishome = false;
	
	if ($routes[0] == null || $routes[0] == 'index.php' || $routes[0] == 'index.php?ajax=1'){
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

<body class="no-autoplay">
	
	<?php if ($ishome){ ?>
		
		<span id="homepage-flag" style="display: none"></span>
	<?php } ?>

    <?php include_once("modules/_header.inc.php");?>
	
	<div id="mainContent">
		<?php if ($ishome){ include_once("modules/_home.php"); } ?>
	</div>
	
	<div id="overlayCover"></div>
	
	<div id="overlayContent">
		<?php if (!$ishome){ 
			
			
			include_once("modules/" . $base_url . ".php");
		}?>
	</div>
	
	<?php include_once("modules/_footer.inc.php");?>
	
	<?php include_once("modules/_foot.inc.php");?>
	
</body>

</html>
