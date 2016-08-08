<!-- <div class="subpageHeader parallaxHeader">
	<div id="heroImage">
		<?php
		//pictureFillImage($appRoot.'assets/img/work_pages/intel','alt copy goes here')

		?>
	</div>
</div> -->

<div class="contentWrapper" style="background:#37383a;">
	<div class="cultureHeadline">
		<h1>ALL CULTURE</h1>
	</div>	
		
	<div class="cultureContent">				
		<?php
			$cultureData = HTMLfromTemplateAndJSON("content/templates/all-culture-template.html", "culture-data",true);
			echo $cultureData; 
		?>
	</div>
</div>
