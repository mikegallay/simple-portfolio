<section class="contentWrapper" id="extendedBioWrapper" style="background:#ffffff;">
	
	<div class="container">
		<div class="subnav left"><a href="/culture" id="subnav-prev"><span class="prev_arrow"><?php addIcon('menu_dropdown_arrow'); ?></span>View Culture</a></div>
		<?php
			$url = $_SERVER['REQUEST_URI'];
			
			if ($bioId == undefined) {
				$urlArray = explode("/", $url);
				$id = $urlArray[count($urlArray)-1];
			}else{
				$id = $bioId;
			}
			
			$currLeader = getIndexFromBioId($id);
			// echo '$currLeader' . $currLeader;
			$bioContent = getExtendedBio("content/templates/extended-bio.html", "extended-bios", $id);
			$bioId = undefined;
		?>
	</div>
	<div class="subnav cs-subnav"><a href="/global-leadership/<?php getPrevGlobalLeader($currLeader,true); ?>" id="subnav-prev"><span class="prev_arrow"><?php addIcon('menu_dropdown_arrow'); ?></span><?php getPrevGlobalLeader($currLeader,false); ?></a> | <a class="view-all" href="/culture">All Culture</a> | <a href="/global-leadership/<?php getNextGlobalLeader($currLeader,true); ?>" id="subnav-prev"><?php getNextGlobalLeader($currLeader,false); ?><span class="next_arrow"><?php addIcon('menu_dropdown_arrow'); ?></span></a></div>
</section>
