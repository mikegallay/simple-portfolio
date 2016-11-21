<?php
	require_once 'modules/site-prefs.php';
	
	// echo ' approot='.$appRoot . ' mediapath='. MEDIAPATH;
	
	$vnum = "1.05";
	
	$bioId = undefined;
	$portId = undefined;
	
	// if($appRoot !== '/' ) $appRoot = $appRoot.'/'; //-- needs trailing slash
	
	require_once("modules/_methods.inc.php");

	function getCurrentUri($root)
	{
		$uri = substr($_SERVER['REQUEST_URI'], strlen($root));
		return $uri;
	}
 
 	$actual_link = $_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
	$base_url = getCurrentUri($appRoot);
	
	//temp fix
	$onDev = strpos($base_url , 'mb-website_relaunch_2016/');
	// echo '$onDev='.$onDev.' $base_url='.$base_url;
	if ($onDev === 0) {
		echo 'ondev ';
		$trimmedBase = str_replace("mb-website_relaunch_2016/","/",$base_url);
		$base_url = $trimmedBase;
	}
	
	// echo ' $$trimmedBase=' . $trimmedBase . ' base='.$base_url;
	
	$new_url = '';
	$routes = array();
	$routes = explode('/', $base_url);
	
	$ishome = false;
	
	if ($routes[0] == null || $routes[0] == 'index.php' || $routes[0] == 'index.php?ajax=1'){
		$ishome = true;
	}
	
	
	if (isset($_GET['ajax'])) {
		
		if (!$ishome){ // not the homepage
			
			//check to see if there are other queries associated with the ajax url. 
			//used for the bio and portfolio pages
			
			$hasOtherQuery = strpos($base_url , '?ajax=1&'); //passing more than one query through page?
			$new_urlArray = explode("?", $base_url);
			if ($hasOtherQuery) {
				$isBioLink = strpos($new_urlArray[1] , 'bio');
				
				if ($isBioLink){
					$bioIdArray = explode("=", $new_urlArray[1]); 
					$bioId = $bioIdArray[count($bioIdArray)-1]; //get last query "bio"
				}else{
					$portIdArray = explode("=", $new_urlArray[1]); 
					$portId = $portIdArray[count($portIdArray)-1]; //get last query "port"
				}
				
				
				// $new_url = $new_urlArray[0]; //define new_url without queries for php include
				
			}

			$new_url = $new_urlArray[0];  //define new_url without queries for php include
			
			$new_url = "modules/" . $new_url;
			
		}else{
			$new_url = "modules/_home.php";
			
		}
		// echo $new_url;
		include($new_url);
	  
		return;
		
	} 
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
	
	<div id="internalContent">
		<?php 
		if (!$ishome) { 
			$isCaseStudy = strpos($base_url , 'work/');
			
			if ($isCaseStudy === 0){
				include_once("modules/case-study.php");
			}else{
				include_once("modules/" . $base_url . ".php");
			}
			
		}
		?>
	</div>
	
	<?php include_once("modules/_footer.inc.php");?>
	
	<?php include_once("modules/_foot.inc.php");?>
	
	<?php if (!$ishome) { 
		//if ($base_url == "global-leadership") { ?>
		<script type="text/javascript">
			
			$('#header').addClass('settle');
			
			
			setTimeout(function(){mgbMainSys.checkInView('.ll-all'); /*$('footer').removeClass('tempHide');*/},1000);
			mgbInternalContent.resize();
		</script>
	<?php } ?>
	
	
</body>

</html>
