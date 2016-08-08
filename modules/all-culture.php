<section class="content">
	<div class="overlayHeadline">
		ALL CULTURE
	</div>	
		
	<div class="cultureContent">				
		<?php
			$cultureData = HTMLfromTemplateAndJSON("content/templates/all-culture-template.html", "culture-data",true);
			echo $cultureData; 
		?>
	</div>
</section>
