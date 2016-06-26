<span class="hidden" id="svgsprites"><?php include_once("assets/img/svg/icon-sprite-def.svg"); ?>	
	<svg xmlns="http://www.w3.org/2000/svg" version="1.1" class="svg-distortFilter">
		<defs>
			<filter id="distortFilter">
				<feTurbulence type="fractalNoise" baseFrequency="0 0.15" numOctaves="1" result="warp" />
				<feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="40" in="SourceGraphic" in2="warp" />
			</filter>
		</defs>
	</svg>
</span>

<header id="Home">
	<nav id="mainNav">
		<div class="container">
			<a href="#" id="homeLogo" data-tracking-label="Nav|Click|Logo">
				<div id="mbLogo">
					<svg version="1.1" baseProfile="tiny" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" xml:space="preserve"><rect x="1" y="1" fill="none" stroke="#46ccc5" stroke-linecap="square" stroke-width="3" width="62" height="62" id="rect" /></svg>
					<div id="mcgarryTXT">
						<div id="m"><?php addIcon('logo-m')?></div>
						<div id="cgarryContainer">
							<div id="cgarry"><?php addIcon('logo-cgarry')?></div>
						</div>
					</div>
					<div id="bowenTXT">
						<div id="b"><?php addIcon('logo-b')?></div>
						<div id="owenContainer">
							<div id="owen"><?php addIcon('logo-owen')?></div>
						</div>
					</div>
				</div>
			</a>
			<div id="navWrapper">
				<ul class="menu">
					<li>
						<a id="nav-work" href="work" aria-label="" data-tracking-label="Nav|Click|Work">WORK</a>
					</li>
					<li>
						<a id="nav-culture" href="culture" aria-label="" data-tracking-label="Nav|Click|Culture">CULTURE</a>
					</li>
					<li>
						<a id="nav-offices" href="offices" aria-label="" data-tracking-label="Nav|Click|Office">OFFICES</a>
					</li>
					<li>
						<a href="https://mcgarrybowen-dentsuaegisnetwork.icims.com/jobs/intro?hashed=-435684868&mobile=false&width=1279&height=500&bga=true&needsRedirect=false&jan1offset=-300&jun1offset=-240" target="_blank" aria-label="" data-tracking-label="Nav|Click|Careers">CAREERS</a>
					</li>	
				</ul>
				<div class="flag us"></div>
				<select id="office-selector" dir="">
					<option value="us-glo-en">Global</option>
					<option value="us-nyc-en">New York - EN</option>
					<option value="us-chi-en">Chicago - EN</option>
					<option value="us-sfo-en">San Francisco - EN</option>
					<option value="fr-par-en">Paris - EN</option>
					<option value="fr-par-fr">Paris - FR</option>
					<option value="nl-ams-en">Amsterdam - EN</option>
					<option value="nl-ams-nl">Amsterdam - NL</option>
				</select>
				<div id="menuToggleHolder">
					<div id="menuToggle">			
						<div id="ham1"><div class="hamDot"></div></div>
						<div id="ham2"><div class="hamDot"></div></div>
						<div id="ham3"><div class="hamDot"></div></div>	
					</div>
				</div>
				
			</div>
			
		</div>
	</nav>
	

</header> 
