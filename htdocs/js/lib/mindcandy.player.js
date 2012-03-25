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
				playerEl,	//element for the player object
				meta;

			/*--------------------------------
			* Private functions
			*--------------------------------*/

			function getVideoMeta() {
				var info = document.createElement( 'script' );
				$(info).attr('src', 'https://gdata.youtube.com/feeds/api/videos/' +
							cfg.videoId +
							'?v=2&alt=json-in-script&callback=' + 'mindcandy.Player.all[' + id + ']._api.onInfo' );
				$(document.body).append( info );
			}

			function getRelatedVideos() {
				var rel = document.createElement('script');

				//create the container for the related videos
				cfg.relatedEl = $("<aside class='related-container'></aside>");
				$(cfg.el).append( cfg.relatedEl );

				//include the script for loading the feeds
				$(rel).attr('src',
							'https://gdata.youtube.com/feeds/api/videos/' +
							cfg.videoId +
							'/related?v=2&alt=json-in-script&callback=mindcandy.Player.all[' + id + ']._api.onRelated' );
				$(document.body).append( rel );

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
				if( playerEl ) {
					//already inited
					return;
				}

				playerEl = $('#' + _getPlayerMarkupId(), cfg.el );

				//get the data describing this video
				getVideoMeta();

				//get the information for the related content
				getRelatedVideos();
			}

			function _onInfo( data ) {
				console.log( data.entry );
				meta = data.entry;

				//set the header
				$( '> header', cfg.el ).replaceWith( mindcandy.util.template( mindcandy.Player.templates.header, { title: meta.title.$t } ) );

				//display meta
				$('.description', cfg.el ).empty().append( mindcandy.util.template( mindcandy.Player.templates.description, {
						publishDate: moment(meta.published.$t.split('T')[0]).format('dddd MMMM Do, YYYY'),
						publishUser: meta.author[0].name.$t,
						description: meta.media$group.media$description.$t,
						length: mindcandy.util.Time.fromValue( playerEl.get(0).getDuration() ),
						viewCount: meta.yt$statistics.viewCount
					} ) );
			}

			/**
			* This function gets called when the feed for related video is ready
			*/
			function _onRelated( data ){
				console.log( data.feed );

				var feed,
					idx, //used in the for loop. declaring here for coherency with hoisting behavior
					iterations = (data.feed.entry.length >= 5 ? 5 : data.feed.entry.length), //default is to show the last 5 entries
					articlesContainer = $('<ul></ul>');

				cfg.relatedEl.empty();

				//add title
				//cfg.relatedEl.append( '<header><H2>' + data.feed.title.$t + '</H2></header>' );
				cfg.relatedEl.append( '<header><H2>More Videos</H2></header>' );
				cfg.relatedEl.append( articlesContainer );

				//for each entry, generate the markup for the related video. only the last 5 entries..
				for( idx = 0; idx < iterations; idx++ ) {
					if( data.feed.entry.hasOwnProperty( idx ) ) {
						feed = data.feed.entry[idx];
						//console.log( "adding " + feed.title.$t );
						articlesContainer.append(
							'<li>' +
							mindcandy.util.template( mindcandy.Player.templates.related, {
								url: feed['media$group']['yt$videoid'].$t,
								title: mindcandy.util.trimAt( feed.title.$t, 25 ),
								thumbnail: mindcandy.util.template( mindcandy.Player.templates.thumbnail, {
									url: feed[ "media$group" ][ "media$thumbnail" ][ 0 ].url,
									width: feed[ "media$group" ][ "media$thumbnail" ][ 0 ].width,
									height: feed[ "media$group" ][ "media$thumbnail" ][ 0 ].height
								}),
								length: mindcandy.util.Time.fromValue( feed[ "media$group" ].yt$duration.seconds ),
								viewCount: feed['yt$statistics'].viewCount
							} ) +
							'</li>' );

					}
				}
			}

			/*--------------------------------
			* Main logic
			*--------------------------------*/

			if( !cfg.videoId || !cfg.el ) {
				throw mindcandy.errors.create( mindcandy.errors.ENOARGS );
			}

			$('> .no-params', cfg.el ).remove();
			$('> .no-js', cfg.el ).remove();

			//create the player element into the container markup
			$(cfg.el).append( mindcandy.util.template( mindcandy.Player.templates.header, { title: '&nbsp;' } ) );
			$(cfg.el).append( mindcandy.util.template( mindcandy.Player.templates.player, { playerId: _getPlayerMarkupId() } ) );

			attrs = {
				id: _getPlayerMarkupId(),
				'class': 'player'
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
				//I have to expose this functions because of the way
				//the Youtube API works with global callbacks
				_api: {
					onInfo: _onInfo,
					onRelated: _onRelated
				}
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
	header: ["<header><H1>{{title}}</H1></header>"].join(''),

	player: [
		"<article id='{{playerId}}-wrapper' class='player-wrapper' >",
		"<div id='{{playerId}}' class='player'>",
			"<div class='no-flash'>",
				"<p>Download and Install Flash Player</p>",
				"<p>You do not have Adobe Flash Player installed. It is required to use this feature.</p>",
				"<p><a href='http://get.adobe.com/flashplayer/' target='_blank'>Click here</a> to download and install from ",
					"<a href='http://www.adobe.com/' target='_blank'>Adobe.</a></p>",
			"</div>",
		"</div>",
		"<div class='description'></div>",
		"</article>"
		].join(''),

	description: [
		"<p class='published-on'>Posted on {{publishDate}} <strong>by {{publishUser}}</strong></p>",
		"<div class='additional-info'><span>Total Length: {{length}}</span><span class='view-count'>{{viewCount}} Views</span></div>",
		"<p class='description'>{{description}}</p>"
	].join(''),

	related: [
		"<a href='?video_id={{url}}' class='related'>",
		"<article class='related-video'>",
			"<span class='thumbnail'>{{thumbnail}}<span class='video-length'>{{length}}</span></span>",
			"<span class='details'>",
				"<h3>{{title}}</h3>",
				"<div class='additional-info'><span class='view-count'>{{viewCount}} Views</span></div>",
			"</span>",
		"</article>",
		"</a>"
	].join(''),

	thumbnail: [
		'<img src="{{url}}" alt="Default Thumbnail" />'
	].join('')

};