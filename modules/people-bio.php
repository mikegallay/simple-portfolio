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
			
			$currBio = getIndexFromBioId($id,$people_arr);
			$bioContent = getExtendedBio("content/templates/extended-bio.html", "people-bios", $id);
			$bioId = undefined;
		?>
	</div>
	<div class="subnav cs-subnav"><a href="/people/<?php getPrevBio($currBio,true,$people_arr); ?>" id="subnav-prev"><span class="prev_arrow"><?php addIcon('menu_dropdown_arrow'); ?></span><?php getPrevBio($currBio,false,$people_arr); ?></a> | <a class="view-all" href="/culture">All Culture</a> | <a href="/people/<?php getNextBio($currBio,true,$people_arr); ?>" id="subnav-prev"><?php getNextBio($currBio,false,$people_arr); ?><span class="next_arrow"><?php addIcon('menu_dropdown_arrow'); ?></span></a></div>
</section>
