tash.namespace( 'mindcandy' );

/*
 * Bridge through the YouTube API
 */
mindcandy.Player = (function(){
	//Unique player ID generator.
	var uniquePlayerId = 0,
		players = [];

	function next() {
		return ++uniquePlayerId;
	}

	return {

		create: function( config ) {

			var cfg = $.extend( { width:'0', height:'0' }, config ),
				params = { allowScriptAccess: 'always' },
				attrs = { },
				id = next(),
				meta,
				el; //jQuery element wrapping the player

			/*--------------------------------
			* Private functions
			*--------------------------------*/

			function getVideoMeta() {
				//step 1. inject script tag
				$(document.body).append( '<script src="https://gdata.youtube.com/feeds/api/videos/' +
					cfg.videoId +
					'?v=2&alt=json-in-script&callback=' + 'mindcandy.Player.all[' + id + '].info'  + '"></script>' );
			}


			/*--------------------------------
			* Exposed privieged API
			*--------------------------------*/

			function _getPlayerId() {
				return id;
			}

			function _getPlayerMarkupId() {
				return 'player-' + id;
			}

			function _onReady() {
				el = $('#' + _getPlayerMarkupId(), cfg.containerSelector );
				console.log( el.get(0).getDuration() );
				getVideoMeta();
			}

			function _info( data ) {
				console.log( data.entry );
				meta = data.entry;

				//display meta
				$('header', cfg.containerSelector ).empty().append( '<h1>' + meta.title.$t + '</h1>' );
				//$('.description', cfg.containerSelector).empty().append( '<p>' + meta.media$group.media$description.$t + '</p>' );
				$('.description', cfg.containerSelector ).empty().append( mindcandy.util.template( mindcandy.Player.templates.description, {
						publishDate: meta.published.$t,
						publishUser: meta.author[0].name.$t,
						description: meta.media$group.media$description.$t,
						length: mindcandy.util.Time.fromValue( el.get(0).getDuration() ),
						viewCount: meta.yt$statistics.viewCount
					} ) );
			}

			/*--------------------------------
			* Main logic
			*--------------------------------*/

			if( !cfg.videoId || !cfg.containerSelector ) {
				throw mindcandy.errors.create( mindcandy.errors.ENOARGS );
			}

			//remove the no-flash message in the container
			$('> .no-params', cfg.containerSelector ).remove();

			//create the player element into the container markup
			$(cfg.containerSelector).append( mindcandy.util.template( mindcandy.Player.templates.player, { playerId: _getPlayerMarkupId() } ) );

			attrs = {
				id: _getPlayerMarkupId()
			};

			//if there are no dimensions, infer them from the container markup element
			if( cfg.width === "0" ) {
				cfg.width = $('div.player', cfg.containerSelector).css('width');
				cfg.height = $('div.player', cfg.containerSelector).css('height');
			}

			swfobject.embedSWF('http://www.youtube.com/v/' + cfg.videoId + '?version=3&enablejsapi=1&playerapiid=' + id,
					_getPlayerMarkupId(), cfg.width, cfg.height, "9", null, null, params, attrs );

			//return the exposed player API
			players[id] = {
				getPlayerId: _getPlayerId,
				getPlayerMarkupId: _getPlayerMarkupId,
				onReady: _onReady,
				info: _info
			};

			return players[id];
		},

		find: function( id ) {
			//find player by Id
			return ( id < players.length ? players[id] : null );
		},

		//hook for all the players. used by the google callback
		all: players
	};
}());

//templates used when rendering the player. This could be provided by a REST API
mindcandy.Player.templates = {
	player: [
		"<article id='{{playerId}}-wrapper' class='player-wrapper' >",
		"<header></header>",
		"<div id='{{playerId}}' class='player'>",
			"<div class='no-flash'>",
				"<p>Download and Install Flash Player</p>",
				"<p>You do not have Adobe Flash Player installed. It is required to use this feature.</p>",
				"<p><a href='http://get.adobe.com/flashplayer/' target='_blank'>Click here</a> to download and install from ",
					"<a href='http://www.adobe.com/' target='_blank'>Adobe.</a></p>",
			"</div>",
		"</div>",
		"<div class='description'></div>",
		"</article>" ].join(''),

	description: [
		"<div class='published-on'><span>Published on {{publishDate}} by <em>{{publishUser}}</em></span></div>",
		"<div class='additional-info'><span>total length: {{length}}</span><span class='view-count'>{{viewCount}}</span></div>",
		"<p class='description'>{{description}}</p>"
	].join('')
};