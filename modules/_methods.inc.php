<?php
// require_once $_SERVER['lib/Handlebars/Autoloader.php'];
require_once 'lib/Handlebars/Autoloader.php';
Handlebars\Autoloader::register();
use Handlebars\Handlebars;

$siteData = 'content/data/merged.json';
$tempData = "";
$fullData = "";
$portfolio_arr = array();
$leadership_arr = array();
$people_arr = array();

//portfolio array control content

function pushToPortFolioArray($data){
	global $portfolio_arr;
	
	$tempData = $data;
	
	for($i=0; $i < count($tempData); $i++) {
		array_push($portfolio_arr, $tempData[$i]);
	}
}

function getPrevPortfolio($currPort,$linkReady){
	global $portfolio_arr;
	$prevPort = $currPort-1;
	if ($prevPort < 0) $prevPort = count($portfolio_arr) - 1;
	
	$port = $portfolio_arr[$prevPort]['clientName'];

	if ($linkReady) {
		echo convertToLinkReady($port);
	}else{
		echo $port;
	}
}

function getNextPortfolio($currPort,$linkReady){
	global $portfolio_arr;
	$nextPort = $currPort+1;
	if ($nextPort > count($portfolio_arr) - 1) $nextPort = 0;
	
	// $port = $portfolio_arr[$nextPort]['clientName'];
	if ($linkReady) {
		
		$port = $portfolio_arr[$nextPort]['id'];
		echo $port;//convertToLinkReady($port);
	}else{
		$port = $portfolio_arr[$nextPort]['clientName'];
		echo $port;
	}
}

function getIndexFromPortId($id){
	global $portfolio_arr;
	foreach ($portfolio_arr as &$port) {
		$lowercase = strtolower($port['id']);
		if ($lowercase == $id){
			return $port['index'];
		}
	}
}

//end portfolio control content

function convertToLinkReady($link){
	$lowercase = strtolower($link);
	$linkReady = preg_replace('/\s+/', '-', $lowercase);
	
	return $linkReady;
}

//bio array control content

function pushToBiosArray($data,&$arr){
	// global $arr;
	$tempData = $data;
	
	for($i=0; $i < count($tempData); $i++) {
		array_push($arr, $tempData[$i]);
	}
}



function getIndexFromBioId($id,&$arr){
	foreach ($arr as &$bio) {
		
		if ($bio['id'] == $id){
			return $bio['index'];
		}
	}
}

function getPrevBio($currBio,$linkReady,&$arr){
	/*
	global $leadership_arr;
		global $people_arr;
		
		$arr = $leadership_arr;
		if ($biotype == "people") $arr = $people_arr;*/
	
	
	$prevLeader = $currBio-1;
	if ($prevLeader < 0) $prevLeader = count($arr) - 1;
	
	$leader = $arr[$prevLeader]['name'];
	if ($linkReady) {
		echo convertToLinkReady($leader);
	}else{
		echo $leader;
	}
}

function getNextBio($currBio,$linkReady,&$arr){
	/*
	global $leadership_arr;
		global $people_arr;
		
		$arr = $leadership_arr;
		if ($biotype == "people") $arr = $people_arr;*/
	
	
	$nextLeader = $currBio+1;
	if ($nextLeader > count($arr) - 1) $nextLeader = 0;
	
	$leader = $arr[$nextLeader]['name'];
	if ($linkReady) {
		echo convertToLinkReady($leader);
	}else{
		echo $leader;
	}
}

//end bio control content

function preloadData(&$tempData, &$fullData, &$siteData){
	$tempData = file_get_contents($siteData);
	$fullData = json_decode($tempData, true); 
	
	global $leadership_arr;
	global $people_arr;
	
	// $tempDataArray = $fullData["portfolio-data"];
	
	pushToPortFolioArray($fullData["portfolio-data"]);
	pushToBiosArray($fullData["leadership-bios"],$leadership_arr);
	pushToBiosArray($fullData["people-bios"],$people_arr);
}

preloadData($tempData, $fullData, $siteData);

function formatCulture($data,$shuffle){
	
	$evenOddToggle = 1;
	
	$tempData = $data;
	
	//pull the first item in the array out.
	//this will be inserted into the shuffled array in the top 5
	//in order to have an item to base the height on
	
	
	if ($shuffle == true) {
		$staticItem = array_splice($tempData, 0, 1);
		shuffle($tempData);
	}
	
	/*try {	
		shuffle($tempData);
	} catch ( Exception $e) {
		die("Cannot shuffle the data");
	}*/
	
	$dir1 = 'pushRight';
	$dir2 = 'pushLeft';
		
	$doubleArr = [];
	$singleArr = [];
	$compositeArr = [];
	
	
	// first split content into 1x1 and 2x1 arrays
	for($i=0; $i < count($tempData); $i++) {
		if(strcmp($tempData[$i]['isDouble'], "true") == 0) {
			array_push($doubleArr, $tempData[$i]);
		} else {
			array_push($singleArr, $tempData[$i]);
		}
	}
	
	if ($shuffle == true){
		shuffle($singleArr);
		shuffle($doubleArr);
		
		//random number to insert the static array back in
		$staticIndex = rand( 1 , 4);
		array_splice($singleArr, $staticIndex, 0, $staticItem);
	}
	
	
	
	
	/*try {
		shuffle($singleArr);
		shuffle($doubleArr);
	} catch (Exception $e) {
		die("Cannot shuffle the data");
	}*/
	
	//$firstTime = true;
	$buildInterval = 0;
	
	while(count($doubleArr) > 0 || count($singleArr) > 0) {
		
		$randPush = 2;
		
		if ($buildInterval%2 == 0) $randPush = 0;

		for($i = 0; $i < 7; $i++) {
			if ($randPush == $i){
				if (count($doubleArr) > 0 && count($singleArr) > 0){
					array_push($compositeArr, array_pop($doubleArr));
				}else{
					array_pop($doubleArr); //remove the remaining doubles if there are no more singles
				}
				 
			}else{
				if (count($singleArr) > 0) array_push($compositeArr, array_shift($singleArr));
			}
			
		}
		
		$buildInterval++;
	}
	
	
	for ($i = 0; $i < count($compositeArr); $i++) {
		
		$compositeArr[$i]['index'] = $i;
		
		if ($compositeArr[$i]['info'] != ''){
		   if ($i%2==0){
			   $compositeArr[$i]['dir'] = $dir1;
		   } else{
			   $compositeArr[$i]['dir'] = $dir2;
		   }
		} else if ($compositeArr[$i]['isDouble'] != 'true'){
			$compositeArr[$i]['dir'] = 'static';
		}

		if ($compositeArr[$i]['isDouble'] == 'true'){
		   $tempDir = $dir2;
		   $dir2 = $dir1;
		   $dir1 = $tempDir;
		}
	   
	}
	
	return $compositeArr;
	
}


function getExtendedBio($tempname, $jsonfile,$id){
	
	global $fullData;

	$templateStr = file_get_contents($tempname);

	$tempDataArray = $fullData[$jsonfile];
	
	$singleBio = $tempDataArray;
	
	foreach ($tempDataArray as &$bio) {
		if ($bio['id'] == $id){
			$singleBio = $bio;
		}
	}
	
	$dataArray = $singleBio;

	$str = json_encode($dataArray);
	
	$wrapper = '{ "objects": {"bio":' . $str . ' }}';
	
	$objects = json_decode($wrapper, true); 
	
	$engine = new Handlebars();

	$renderedHTML = $engine->render($templateStr, $objects);
	echo $renderedHTML;
	
}


function HTMLfromTemplateAndJSON($tempname, $jsonfile) {
	global $fullData;
	
	$templateStr = file_get_contents($tempname);
	
	$tempDataArray = $fullData[$jsonfile];
	$dataArray = $tempDataArray;
	
	
	if ($jsonfile == "culture-data") $dataArray = formatCulture($tempDataArray,true);
	if ($jsonfile == "culture-global-data") $dataArray = formatCulture($tempDataArray,false);
	// if ($shuffle) $dataArray = shuffleCulture($dataArray);
	
	$str = json_encode($dataArray);
	
	$wrapper = '{ "objects": ' . $str . ' }';
	$objects = json_decode($wrapper, true); 
			
	$engine = new Handlebars();

	$renderedHTML = $engine->render($templateStr, $objects);
	return $renderedHTML;
}

function addIcon($str) {
    echo '<svg class="icon ' . $str . '-inline" role="img" aria-labelledby="title">
  <use xlink:href="#' . $str . '"></use>
  <!--[if lt IE 9]> <img src="assets/img/svg/ie8-fallback/' . $str . '.png" alt="' . $str . ' icon"> <!--<![endif]-->
</svg>';
}

function pictureFillImage($path,$alt) {
    echo '<picture>
            <!--[if IE 9]><video style="display: none;"><![endif]-->
            <source srcset="' . $path . '_large.jpg, ' . $path . '_large@2x.jpg 2x" media="(min-width: 768px)">
			<source srcset="' . $path . '.jpg, ' . $path . '@2x.jpg 2x">
            <!--[if IE 9]></video><![endif]-->
            <!--[if !lte IE 9]> -->
            <img srcset="' . $path . '.jpg" src="img/common/blank.png" alt="' . $alt . '">
            <!-- <![endif]-->
            <!--[if lte IE 9 ]><img src="' . $path . '-large.jpg, ' . $path . '-large@2x.jpg 2x" alt="' . $alt . '"><![endif]-->
        </picture>';
}

?>