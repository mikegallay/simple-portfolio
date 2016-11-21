<?php
	$url = $_SERVER['REQUEST_URI'];
	
	if ($portId == undefined) {
		$urlArray = explode("/", $url);
		$id = $urlArray[count($urlArray)-1];
	}else{
		$id = $portId;
	}
	
	$currPort = getIndexFromPortId($id);
?>
<div class="subnavFixed parallaxHeader">
	<div class="subnav"><a data-tracking-label='Nav|Click|Home' class="view-all" href="/"><span class="prev_arrow"><?php addIcon('menu_double_arrow'); ?>&nbsp;</span></a>  <a data-tracking-label='Nav|Click|<?php getNextPortfolio($currPort,false); ?>' href="/work/<?php getNextPortfolio($currPort,true); ?>" id="subnav-next"><?php getNextPortfolio($currPort,false); ?><span class="next_arrow">&nbsp;<?php addIcon('menu_dropdown_arrow'); ?></span></a><a data-tracking-label='Nav|Click|<?php getPrevPortfolio($currPort,false); ?>'href="/work/<?php getPrevPortfolio($currPort,true); ?>" id="subnav-prev"><span class="prev_arrow"><?php addIcon('menu_dropdown_arrow'); ?>&nbsp;</span><?php getPrevPortfolio($currPort,false); ?>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a></div>
	
</div>


<?php
	$portContent = getExtendedBio("content/templates/case-study.html", "portfolio-data", $id);
	// echo "id ". $id.' - '.$currPort;
	$portId = undefined;
?>

</section></div>