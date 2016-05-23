<?php
	require_once("modules/_methods.inc.php");

	$appRoot = dirname($_SERVER["PHP_SELF"]);
	if($appRoot !== '/' ) $appRoot = $appRoot.'/'; //-- needs trailing slash

	function getCurrentUri()
	{
		$basepath = implode('/', array_slice(explode('/', $_SERVER['SCRIPT_NAME']), 0, -1)) . '/';
		$uri = substr($_SERVER['REQUEST_URI'], strlen($basepath));
		//if (strstr($uri, '?')) $uri = substr($uri, 0, strpos($uri, '?'));
		//$uri = '/' . trim($uri, '/');
		
		return $uri;
	}
 
	$base_url = getCurrentUri();
	$new_url = '';
	$routes = array();
	$routes = explode('/', $base_url);
	$ishome = true;
	
	//check to see if this requires an overlay? i.e. contains 'work'
	foreach($routes as $route)
	{
		
		if(trim($route) == 'work')
			
			$ishome = false;
			break;
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
	}
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
