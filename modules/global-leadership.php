<!-- <div class="subpageHeader parallaxHeader">
	<div id="heroImage">
		<?php
		//pictureFillImage($appRoot.'assets/img/work_pages/intel','alt copy goes here')

		?>
	</div>
</div> -->

<section class="contentWrapper" id="globalLeadershipWrapper" style="background:#ffffff;">
	<div class="container">
		
		<h1 class="sectionHeading">GLOBAL <span class="blueFont">LEADERSHIP</span></h1>

		<div id="filterOptions">
			<select>
				<option value="all">All</option>
				<option value="ams">Amsterdam</option>
				<option value="chi">Chicago</option>
				<option value="hk">Hong Kong</option>
				<option value="ldn">London</option>
				<option value="mex">Mexico City</option>
				<option value="ny">New York</option>
				<option value="par">Paris</option>
				<option value="sa">San Antonia</option>
				<option value="sf">San Francisco</option>
				<option value="sao">Sau Paulo</option>
				<option value="sg">Shanghai</option>
				<option value="sng">Singapore</option>
			</select>
			
			<input class="cityFilter" id="select-all" value="all" name="radio-select" type="checkbox"><label class="active" id="label-select-all" for="select-all">All</label>
			<input class="cityFilter" id="select-ams" value="ams" name="radio-select" type="checkbox"><label id="label-select-ams" for="select-ams">Amsterdam</label>
			<input class="cityFilter" id="select-chi" value="chi" name="radio-select" type="checkbox"><label id="label-select-chi" for="select-chi">Chicago</label>
			<input class="cityFilter" id="select-hk" value="hk" name="radio-select" type="checkbox"><label id="label-select-hk" for="select-hk">Hong Kong</label>
			<input class="cityFilter" id="select-ldn" value="ldn" name="radio-select" type="checkbox"><label id="label-select-ldn" for="select-ldn">London</label>
			<input class="cityFilter" id="select-mex" value="mex" name="radio-select" type="checkbox"><label id="label-select-mex" for="select-mex">Mexico City</label>
			<input class="cityFilter" id="select-ny" value="ny" name="radio-select" type="checkbox"><label id="label-select-ny" for="select-ny">New York</label>
			<input class="cityFilter" id="select-par" value="par" name="radio-select" type="checkbox"><label id="label-select-par" for="select-par">Paris</label>
			<input class="cityFilter" id="select-sa" value="sa" name="radio-select" type="checkbox"><label id="label-select-sa" for="select-sa">San Antonio</label>
			<input class="cityFilter" id="select-sf" value="sf" name="radio-select" type="checkbox"><label id="label-select-sf" for="select-sf">San Francisco</label>
			<input class="cityFilter" id="select-sao" value="sao" name="radio-select" type="checkbox"><label id="label-select-sao" for="select-sao">Sau Paulo</label>
			<input class="cityFilter" id="select-sng" value="sng" name="radio-select" type="checkbox"><label id="label-select-sng" for="select-sng">Singapore</label>
			<input class="cityFilter" id="select-sg" value="sg" name="radio-select" type="checkbox"><label id="label-select-sg" for="select-sg">Shanghai</label>
		</div>	
		<div class="cultureContent">
			<?php
				$cultureData = HTMLfromTemplateAndJSON("content/templates/global-leadership-template.html", "culture-global-data",false);
				echo $cultureData; 
			?>
		</div>
	</div>
</section>
