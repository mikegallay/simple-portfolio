<?php
	$url = $_SERVER['REQUEST_URI'];
	
	if ($portId == undefined) {
		$urlArray = explode("/", $url);
		$id = $urlArray[count($urlArray)-1];
	}else{
		$id = $portId;
	}
	
	$currPort = getIndexFromPortId($id);
	$portContent = getExtendedBio("content/templates/case-study.html", "portfolio-data", $id);
	$portId = undefined;
?>
	<div class="subnav"><a href="/work/<?php getPrevPortfolio($currPort,true); ?>" id="subnav-prev"><span class="prev_arrow"><?php addIcon('menu_dropdown_arrow'); ?></span><?php getPrevPortfolio($currPort,false); ?></a> | <a class="view-all" href="/work">View All Work</a> | <a href="/work/<?php getNextPortfolio($currPort,true); ?>" id="subnav-prev"><?php getNextPortfolio($currPort,false); ?><span class="next_arrow"><?php addIcon('menu_dropdown_arrow'); ?></span></a></div>
