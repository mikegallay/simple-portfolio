<?php
error_reporting(E_ALL ^ E_NOTICE);

if (!isset($rootPath)) {
	$rootPath = "";
}

require_once "$rootPath../lib/Handlebars/Autoloader.php";
Handlebars\Autoloader::register();
use Handlebars\Handlebars;

define(GID, "1CcaLzPdhvIA9jzl7YktLNjYslhpU7Kpf-OCGiH3w_pQ");
/* https://docs.google.com/spreadsheets/d/1CcaLzPdhvIA9jzl7YktLNjYslhpU7Kpf-OCGiH3w_pQ/edit#gid=0 */

define(MEDIAPATH, "$rootPath../img/");
define(CONTENTPATH, "$rootPath../content/");

$GID = GID;
$filenames = "portfolio,culture,timeline,office,clientlist";
$filelist = explode(",", $filenames);
$sheetnumber = 1;
foreach($filelist as $filename) {
	$filename = $filename . "-data.json";
	updateJSONFromGoogleSheet($GID, $filename, $sheetnumber);
	$sheetnumber++;
	echo $filename  .  "...";
}


function getHTMLFromJSON($filename, $template, $sheetnumber=1, $action='show'){
	$GID = GID;
	
	$filename = CONTENTPATH . "data/raw2/" . $filename;
	$template = CONTENTPATH . "templates/" . $template;
	if ($action=='pull') {
		$json = updateJSONFromGoogleSheet($GID, $filename, $sheetnumber);
	} else {
		$json = getLocalJSOM($filename);
	}
	$htmlFromTemplate = HTMLfromTemplateAndJSON($template, $json);
	echo $htmlFromTemplate;	
}

function getLocalJSOM($filename) {		
	$json = file_get_contents($filename);
	return $json;
}

function updateJSONFromGoogleSheet($GID, $filename, $sheetnumber) {	
	$filename = CONTENTPATH . "data/raw2/" . $filename;	
	$GoogleSheetURL = "http://spreadsheets.google.com/feeds/list/$GID/$sheetnumber/public/values?alt=json";

	//$GoogleSheetURL = "https://spreadsheets.google.com/feeds/list/$GID/od6/public/values?alt=json-in-script";
	$json = file_get_contents($GoogleSheetURL);	
	$data = json_decode($json, TRUE);
	
	$lastupdated = $data['feed']['updated']['$t'];
	$lastupdated = substr($lastupdated, 0, strrpos( $lastupdated, '.') );
	$sheetdate =  date("U", strtotime($lastupdated));
	
	$rows = array();
	foreach ($data['feed']['entry'] as $item) {
		$row = explode(",", $item['content']['$t'] );
		$newRow = array();
		foreach($row as $colItem) {
			$tmp = explode(":", $colItem);
			$newRow[trim($tmp[0])] = trim($tmp[1]);
		}
		array_push($rows, (object)$newRow);
	}
	
	
	$rowsJSON = json_encode( $rows, FALSE );
	$JSONupdated = false;
	
	
	
	if (file_exists($filename)) {
		$filedate = date("U", filemtime($filename));
		//echo $filedate . ' > ' . $sheetdate;
		
		if ($filedate < $sheetdate)  {
			$JSONupdated = true;
			file_put_contents($filename, $rowsJSON);
		}
	} else {
		$JSONupdated = true;
		file_put_contents($filename, $rowsJSON);
	
	}
	return $rowsJSON;
}
	
function HTMLfromTemplateAndJSON($tempname, $json) {
	$templateStr = file_get_contents($tempname);
	//$str = file_get_contents($jsonfile);
	$str = $json;
	$wrapper = '{ "objects": ' . $str . ' }';
	$objects = json_decode($wrapper, true); 

	//add mediapath to image	
	for($lcv=0; $lcv < count($objects["objects"]); $lcv++) {
	    $objects["objects"][$lcv]['image'] = MEDIAPATH . $objects["objects"][$lcv]['image'];
	}
	$engine = new Handlebars();
	$renderedHTML = $engine->render($templateStr, $objects);
	return $renderedHTML;
}

?>