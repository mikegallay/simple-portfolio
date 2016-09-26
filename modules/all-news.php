<!-- <div class="subpageHeader parallaxHeader">
	<div id="heroImage">
		<?php
		//pictureFillImage($appRoot.'assets/img/work_pages/intel','alt copy goes here')

		?>
	</div>
</div> -->

<section class="contentWrapper" id="allNewsWrapper" style="background:#ffffff;">
	<div class="container">
		
		<h1 class="sectionHeading">ALL <span class="blueFont">NEWS</span></h1>

		<div class="newsContent">
			<?php
				$cultureData = HTMLfromTemplateAndJSON("content/templates/all-news-template.html", "news-data");
				echo $cultureData; 
			?>
		</div>
	</div>
</section>
