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
	<div id="filterOptions">
		<!-- <input class="cityFilter" id="select-all" value="all" name="radio-select" type="radio"><label id="label-select-all" for="select-ams">All</label> -->
		<input class="cityFilter" id="select-ams" value="ams" name="radio-select" type="checkbox"><label id="label-select-ams" for="select-ams">Amsterdam</label>
		<input class="cityFilter" id="select-chi" value="chi" name="radio-select" type="checkbox"><label id="label-select-chi" for="select-chi">Chicago</label>
		<input class="cityFilter" id="select-hk" value="hk" name="radio-select" type="checkbox"><label id="label-select-hk" for="select-hk">Hong Kong</label>
		<input class="cityFilter" id="select-ldn" value="ldn" name="radio-select" type="checkbox"><label id="label-select-ldn" for="select-ldn">London</label>
		<input class="cityFilter" id="select-ny" value="ny" name="radio-select" type="checkbox"><label id="label-select-ny" for="select-ny">New York</label>
		<input class="cityFilter" id="select-par" value="par" name="radio-select" type="checkbox"><label id="label-select-par" for="select-par">Paris</label>
		<input class="cityFilter" id="select-sf" value="sf" name="radio-select" type="checkbox"><label id="label-select-sf" for="select-sf">San Francisco</label>
		<input class="cityFilter" id="select-sao" value="sao" name="radio-select" type="checkbox"><label id="label-select-sao" for="select-sao">Sau Paulo</label>
		<input class="cityFilter" id="select-sg" value="sg" name="radio-select" type="checkbox"><label id="label-select-sg" for="select-sg">Shanghai</label>
	</div>	
	<div class="cultureContent">
		<?php
			$cultureData = HTMLfromTemplateAndJSON("content/templates/all-culture-template.html", "culture-global-data",false);
			echo $cultureData; 
		?>
	</div>
</div>
