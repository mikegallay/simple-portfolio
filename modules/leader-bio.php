<section class="contentWrapper" id="extendedBioWrapper" style="background:#ffffff;">
	
	<div class="container">
		<div class="subnav left"><a href="/global-leadership" id="subnav-prev"><span class="prev_arrow"><?php addIcon('menu_dropdown_arrow'); ?></span>View All Leadership</a></div>
		<?php
			$url = $_SERVER['REQUEST_URI'];
			
			if ($bioId == undefined) {
				$urlArray = explode("/", $url);
				$id = $urlArray[count($urlArray)-1];
			}else{
				$id = $bioId;
			}
			
			$currBio = getIndexFromBioId($id,$leadership_arr);
// > 			echo '$$currBio' . $currBio;
			$bioContent = getExtendedBio("content/templates/extended-bio.html", "culture-global-data", $id);
			$bioId = undefined;
		?>
	</div>
	<div class="subnav cs-subnav"><a href="/global-leadership/<?php getPrevBio($currBio,true,$leadership_arr); ?>" id="subnav-prev"><span class="prev_arrow"><?php addIcon('menu_dropdown_arrow'); ?></span><?php getPrevBio($currBio,false,$leadership_arr); ?></a> | <a class="view-all" href="/culture"><?php addIcon('menu_grid'); ?></a> | <a href="/global-leadership/<?php getNextBio($currBio,true,$leadership_arr); ?>" id="subnav-prev"><?php getNextBio($currBio,false,$leadership_arr); ?><span class="next_arrow"><?php addIcon('menu_dropdown_arrow'); ?></span></a></div>
</section>
