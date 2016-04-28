
<?php

require_once './lib/Handlebars/Autoloader.php';
Handlebars\Autoloader::register();
use Handlebars\Handlebars;

$tempData;
$fullData;
$siteData = './content/data/merged.json';

function preloadData(){
	global $fullData, $siteData;
	$tempData = file_get_contents($siteData);
	$fullData = json_decode($tempData, true); 
}

preloadData();



function shuffleCulture($data){
	
	$evenOddToggle = 1;
	
	$tempData = $data;
	shuffle($tempData);
	
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
	
	shuffle($singleArr);
	shuffle($doubleArr);
	
	$randPush = rand(0, 10);
	
	while((count($doubleArr) > 0) || (count($singleArr) > 0)) {
		
		if(($randPush % 2 == 0) || ($randPush < 5)) {
			array_push($compositeArr, array_pop($doubleArr));
		}
		
		for($i = 0; $i < 8; $i++) {
			array_push($compositeArr, array_pop($singleArr));
		}
		
		if(($randPush % 2) || ($randPush >= 5)) {
			array_push($compositeArr, array_pop($doubleArr));
		}
		
		if(empty($doubleArr)  && (count($singleArr) !== 0)) {
			// push remaining single elements into composite array
			$compositeArr = array_merge($compositeArr, $singleArr);
			unset($singleArr);
		} 
		
		if(empty($singleArr) && (count($doubleArr) !== 0)) {
			// push remaining double elements into composite array
			$compositeArr = array_merge($compositeArr, $doubleArr);
			unset($doubleArr);
		}	
	}
	

		
	// for ($i = 0; $i < count($tempData); $i++) {
	//
	// 	$isDoub = ($tempData[$i]['isDouble'] == 'true') ? true : false;
	// 	// echo $tempData[$i]['isDouble'].$isDoub;
	//    if ($isDoub){
	// 	   // if ($tempData[$i]['isDouble'] == 'true'){
	// 	   //change the index of the double to an even index
	// 	   // echo $i.' - ';
	// 	  $evenOdd = evalEvenOdd($i,$evenOddToggle);
	// 	  // echo $i.' - '.$evenOdd.','.$isDoub.'; ';
	// 	  // echo 'asdf '.$evenOdd;
	// 	  if ($i > 0 && $evenOdd){
	// 		  // echo $i.' true;';
	// 		  // $tempData[$i]['isDouble'] = '';
	// 	      $out = array_splice($tempData, $i-1, 1);
	// 	       array_splice($tempData, count($tempData)-1, 0, $out);
	// 		   $evenOddToggle *= -1;
	// 	  }
	//    }
	// }
	
	for ($i = 0; $i < count($compositeArr); $i++) {
		
	   if ($compositeArr[$i]['info'] != ''){
		   if ($i%2==0){
			   $compositeArr[$i]['dir'] = $dir1;
		   } else{
			   $compositeArr[$i]['dir'] = $dir2;
		   }
	   }
	   
	   if ($compositeArr[$i]['isDouble'] == 'true'){
		   $tempDir = $dir2;
		   $dir2 = $dir1;
		   $dir1 = $tempDir;
	   }
	   
	}
	   
	return $compositeArr;
	
}

/*function evalEvenOdd($num,$toggle){
	// echo 'i'.$num.' '.$toggle.'; ';
	if ($num%2 != 0 && $toggle == 1) return true;
	if ($num%2 == 0 && $toggle == -1) return true;
	
	return false;
}*/

function HTMLfromTemplateAndJSON($tempname, $jsonfile, $shuffle) {
	global $fullData;
	$templateStr = file_get_contents($tempname);
	//$fullData = file_get_contents('./content/data/merged.json');
	
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
            <source srcset="' . $path . '-large.jpg, ' . $path . '-large@2x.jpg 2x" media="(min-width: 1200px)">
			<source srcset="' . $path . '-medium.jpg, ' . $path . '-medium@2x.jpg 2x" media="(min-width: 768px)">
			<source srcset="' . $path . '.jpg, ' . $path . '@2x.jpg 2x">
            <!--[if IE 9]></video><![endif]-->
            <!--[if !lte IE 9]> -->
            <img srcset="' . $path . '.jpg" src="img/common/blank.png" alt="' . $alt . '">
            <!-- <![endif]-->
            <!--[if lte IE 9 ]><img src="' . $path . '-large.jpg, ' . $path . '-large@2x.jpg 2x" alt="' . $alt . '"><![endif]-->
        </picture>';
}

?>
<span class="hidden"><?php include_once("assets/img/svg/icon-sprite-def.svg"); ?></span>