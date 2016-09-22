<!-- <div class="subpageHeader parallaxHeader">
	<div id="heroImage">
		<?php
		//pictureFillImage($appRoot.'assets/img/work_pages/intel','alt copy goes here')

		?>
	</div>
</div> -->

<section class="contentWrapper" id="globalLeadershipWrapper" style="background:#fffff;">
	<div class="bioContent">
		<?php
			$bioContent = getExtendedBio("content/templates/extended-bio.html", "extended-bios", "gordon-bowen");
			echo $bioContent;
		?>
	</div>
	<div class="subnav"><a href="<?php getPrevPortfolio(0) ?>" id="subnav-prev"><span class="prev_arrow"><?php addIcon('menu_dropdown_arrow'); ?></span><?php getPrevPortfolio(0) ?></a> | <a class="all-work" href="/work">View All Work</a> | <a href="<?php getNextPortfolio(0) ?>" id="subnav-prev"><?php getNextPortfolio(0) ?><span class="next_arrow"><?php addIcon('menu_dropdown_arrow'); ?></span></a></div>
</section>
