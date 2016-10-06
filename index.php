<?php
	require_once 'modules/site-prefs.php';
	
	echo ' approot='.$appRoot . ' mediapath='. MEDIAPATH;
	
	$bioId = undefined;
	$portId = undefined;
	
	if($appRoot !== '/' ) $appRoot = $appRoot.'/'; //-- needs trailing slash
	
	require_once("modules/_methods.inc.php");

	function getCurrentUri($root)
	{
		$uri = substr($_SERVER['REQUEST_URI'], strlen($root));
		return $uri;
	}
 
 	$actual_link = $_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
	$base_url = getCurrentUri($appRoot);
	
	//temp fix
	$onDev= strpos($base_url , 'mb-website_relaunch_2016/');
	if ($onDev) {
		str_replace("'mb-website_relaunch_2016/","/",$base_url);
	}
	
	echo ' $base_url=' . $base_url;
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
			$isLeaderBio = strpos($base_url , 'global-leadership/');
			$isPeopleBio = strpos($base_url , 'people/');
			$isCaseStudy = strpos($base_url , 'work/');
			
			if ($isLeaderBio === 0) {
				include_once("modules/leader-bio.php");
			}else if ($isPeopleBio === 0){
				include_once("modules/people-bio.php");
			}else if ($isCaseStudy === 0){
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
			
			//global leadership
			if ($('#globalLeadershipWrapper').length) mgbInternalContent.addAllCultureListeners();
			
			//global leadership
			if ($('#allNewsWrapper').length) mgbInternalContent.addAllNewsListeners();
			
			
			setTimeout(function(){mgbMainSys.checkInView('.ll-all');/*$('footer').removeClass('tempHide')*/},1000);
			mgbInternalContent.resize();
		</script>
	<?php } ?>
	
	
</body>

</html>
