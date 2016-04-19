
<?php

require_once './lib/Handlebars/Autoloader.php';
Handlebars\Autoloader::register();
use Handlebars\Handlebars;



function HTMLfromTemplateAndJSON($tempname, $jsonfile) {
	$templateStr = file_get_contents($tempname);
	$str = file_get_contents($jsonfile);
	
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