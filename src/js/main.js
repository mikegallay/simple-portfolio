$(function() {
  
  $("#clientToggle").on('click', function(){
	  $('#clientList').toggle();
  });
  
  $(".cultureTile").on('click', function(){
	  if($(this).children('a').length !== 0){
		  $(this).toggleClass('growBasis');
	  }
  });
  
});
