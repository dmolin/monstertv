/**
* This unique global function will be called when the YouTube Player is ready
*/
function onYouTubePlayerReady( playerId ) {
	//route to related player
	var player = mindcandy.Player.find( playerId );
	if( !player || typeof player.onReady !== 'function' ) {
		return;
	}
	player.onReady();
}

//try with 1Kvl31g77Z8
$(document).ready( function(){

	var idmatch = document.location.search.match(/video_id=([^&]*)/),
		videoId = idmatch && idmatch.length > 1 ? idmatch[1] : '',
		player;

	//since Javascript is enabled, let's hide this message
	$( '.no-js').hide();

	//if no video_id is provided, tell the user how to use this page...
	if( !videoId.length ) {
		$('.no-params').html( mindcandy.util.template( $('.no-params').html(), { url: document.location.href } ) );
		$('.no-params' ).fadeIn();
	}

	try {
		//create a player
		player = mindcandy.Player.create( {
			el:$('#content .tv-content'),
			videoId:videoId
		} );
	} catch( error ) {
		console.log( error );
	}

});
