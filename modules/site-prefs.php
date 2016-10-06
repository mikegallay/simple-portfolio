<?php
	// error_reporting(E_ALL ^ E_NOTICE);

	//$rootpath = "";
	$appRoot = ""; //dirname($_SERVER["PHP_SELF"]);
	$location = empty($_SERVER['SERVER_NAME']) ? '' : $_SERVER['SERVER_NAME'];
	//$serverip = empty($_SERVER['SERVER_ADDR']) ? '' : $_SERVER['SERVER_ADDR'];

	switch( $location ){
		case 'mb-website.com':
			$DEBUG = true;
			error_reporting(E_ALL ^ E_NOTICE);
			//error_reporting(E_ALL);
			ini_set('display_errors', '1');
			//dev and staging

			$appRoot = "/";
			break;
		case 'dev-mb.com':
		case 'stage.dev-mb.com':
			$DEBUG = true;
			error_reporting(E_ALL ^ E_NOTICE);
			//error_reporting(E_ALL);
			ini_set('display_errors', '1');
			//dev and staging

			define(MEDIAPATH, "./assets/img/");
			$appRoot = "/mb-website_relaunch_2016";
			break;
		case "mcgarrybowen.com":
			$DEBUG = true;
			error_reporting(E_ALL ^ E_NOTICE);
			//error_reporting(E_ALL);
			ini_set('display_errors', '1');

			define(MEDIAPATH, "");
			$appRoot = "/";
			break;
		default:
			error_reporting(0);
			define(MEDIAPATH, "./media/");
			break;
	}
	
	define(MEDIAPATH, "./assets/img/");
	$appRoot = "/";
	
	//define(TEMPLATESPATH, "./templates/");


?>
