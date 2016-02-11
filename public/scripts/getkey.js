$(function(){
  $('#getkey').click(function(){
    $.get(
      "/key",
      function(data, status, xhr){
      	if (!data){
         $('#showkey').text("No more lines in file!");
      	} else {

         $('#showkey').text(data);
      	}
      })
	  .fail(function(xhr, status, err){
	  	if (xhr.status === 404){
	  		 $('#showkey').text("No file uploaded!");
	  	}
	  	else if(xhr.status === 304){
	  		 $('#showkey').text("No more lines in file!");
	  	}
	  });
  });
});