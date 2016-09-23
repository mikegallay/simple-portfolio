<!-- <div class="subpageHeader parallaxHeader">
	<div id="heroImage">
		<?php
		//pictureFillImage($appRoot.'assets/img/work_pages/intel','alt copy goes here')

		?>
	</div>
</div> -->

<section class="contentWrapper" id="extendedBioWrapper" style="background:#ffffff;">
	<div class="container">
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
	<div class="subnav"><a href="../global-leadership/<?php getPrevGlobalLeader($currLeader,true); ?>" id="subnav-prev"><span class="prev_arrow"><?php addIcon('menu_dropdown_arrow'); ?></span><?php getPrevGlobalLeader($currLeader,false); ?></a> | <a class="view-all" href="/culture">All Culture</a> | <a href="../global-leadership/<?php getNextGlobalLeader($currLeader,true); ?>" id="subnav-prev"><?php getNextGlobalLeader($currLeader,false); ?><span class="next_arrow"><?php addIcon('menu_dropdown_arrow'); ?></span></a></div>
</section>
