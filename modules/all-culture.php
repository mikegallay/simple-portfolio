<!-- <div class="subpageHeader parallaxHeader">
	<div id="heroImage">
		<?php
		//pictureFillImage($appRoot.'assets/img/work_pages/intel','alt copy goes here')

		?>
	</div>
</div> -->

<div class="contentWrapper" id="allCultureWrapper" style="background:#37383a;">
	<div class="cultureHeadline">
		<h1>ALL CULTURE</h1>
	</div>	
		
	<div class="cultureContent">
		
		 <div>
			<input class="cityFilter" id="select-all" name="radio-select" type="radio"><label for="select-ams">All</label>
			<input class="cityFilter" id="select-ams" name="radio-select" type="radio"><label for="select-ams">Amsterdam</label>
			<input class="cityFilter" id="select-chi" name="radio-select" type="radio"><label for="select-chi">Chicago</label>
			<input class="cityFilter" id="select-hk" name="radio-select" type="radio"><label for="select-hk">Hong Kong</label>
			<input class="cityFilter" id="select-ldn" name="radio-select" type="radio"><label for="select-ldn">London</label>
			<input class="cityFilter" id="select-ny" name="radio-select" type="radio"><label for="select-ny">New York</label>
			<input class="cityFilter" id="select-par" name="radio-select" type="radio"><label for="select-par">Paris</label>
			<input class="cityFilter" id="select-sf" name="radio-select" type="radio"><label for="select-ams">San Francisco</label>
			<input class="cityFilter" id="select-sao" name="radio-select" type="radio"><label for="select-sao">Sau Paulo</label>
			<input class="cityFilter" id="select-sg" name="radio-select" type="radio"><label for="select-ams">Shanghai</label>
		</div>
						
		<?php
			$cultureData = HTMLfromTemplateAndJSON("content/templates/all-culture-template.html", "culture-data",true);
			echo $cultureData; 
		?>
	</div>
</div>
