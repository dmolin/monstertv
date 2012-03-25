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

	var idmatch = document.location.search.match(/video_id=(\w+)/),
		videoId = idmatch && idmatch.length > 1 ? idmatch[1] : '',
		player;

	$( '.no-js').hide();

	if( !videoId ) {
		$('.no-params').html( mindcandy.util.template( $('.no-params').html(), { url: document.location.href } ) );
		$('.no-params' ).fadeIn();
	}

	try {
		player = mindcandy.Player.create( { containerSelector:'#player-container', videoId:videoId } );
	} catch( error ) {
		console.log( error );
	}

});
