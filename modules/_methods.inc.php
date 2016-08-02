<?php
// require_once $_SERVER['lib/Handlebars/Autoloader.php'];
require_once 'lib/Handlebars/Autoloader.php';
Handlebars\Autoloader::register();
use Handlebars\Handlebars;

$siteData = 'content/data/merged.json';
$tempData = "";
$fullData = "";
$portfolio_arr = array();

//portfolio array control content

function pushToPortFolioArray($data){
	global $portfolio_arr;
	
	$tempData = $data;
	
	for($i=0; $i < count($tempData); $i++) {
		//echo count($portfolio_arr);
		array_push($portfolio_arr, $tempData[$i]['header']);
		// $portfolio_arr[] = $tempData[$i]['header'];
	}
}

function getPrevPortfolio($currPort){
	global $portfolio_arr;
	$prevPort = $currPort--;
	if ($prevPort == 0) $prevPort = count($portfolio_arr) - 1;
	echo $portfolio_arr[$prevPort];
	
}

function getNextPortfolio($currPort){
	global $portfolio_arr;
	$nextPort = $currPort++;
	if ($nextPort > count($portfolio_arr) - 1) $nextPort = 0;
	echo $portfolio_arr[$nextPort];
}

//end portfolio control content

function preloadData(&$tempData, &$fullData, &$siteData){
	$tempData = file_get_contents($siteData);
	$fullData = json_decode($tempData, true); 
	
	$tempDataArray = $fullData["portfolio-data"];
	pushToPortFolioArray($tempDataArray);
}

preloadData($tempData, $fullData, $siteData);

function shuffleCulture($data){
	
	$evenOddToggle = 1;
	
	$tempData = $data;
	
	try {	
		shuffle($tempData);
	} catch ( Exception $e) {
		die("Cannot shuffle the data");
	}
	
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
	
	try {
		shuffle($singleArr);
		shuffle($doubleArr);
	} catch (Exception $e) {
		die("Cannot shuffle the data");
	}
	
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
				if (count($singleArr) > 0) array_push($compositeArr, array_pop($singleArr));
			}
			
		}
		
		$buildInterval++;
	}
	
	
	for ($i = 0; $i < count($compositeArr); $i++) {
		
		$compositeArr[$i]['id'] = $i;
		
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





function HTMLfromTemplateAndJSON($tempname, $jsonfile, $shuffle = false) {
	global $fullData;
	
	$templateStr = file_get_contents($tempname);
	
	$tempDataArray = $fullData[$jsonfile];
	$dataArray = $tempDataArray;
	
	if ($shuffle) $dataArray = shuffleCulture($tempDataArray);
	
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