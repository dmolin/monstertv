//let's create a namespace
tash.namespace( 'mindcandy' );

mindcandy.util = {
		/**
		* Microtemplating facility
		*/
		template: function( tmpl, obj ) {
			var i,
				matches = tmpl.match(/\{\{(\w+)\}\}/g);
			for( i = 0; i < matches.length; i++ ) {
				var matched = matches[i];
				if( matched.charAt(0) !== '{' ) {
					return; //skip non matching elements
				}
				tmpl = tmpl.replace( matched, obj[matched.substr(2, matched.length-4)]||matched );
			}
			return tmpl;
		}
};

mindcandy.util.Time = {
	/**
	* convert the passed in value in a time format
	* input: interval in seconds (number or string)
	* output: { hh:xx, mm:xx, ss:xx }
	*/
	fromValue: function( secs ) {
		var outcome = { hh:0, mm:0, ss:0 },
			SECS_IN_HOUR = 60 * 60,
			SECS_IN_MIN = 60;

		secs = parseInt( secs, 10 );

		outcome.hh = Math.floor(secs / SECS_IN_HOUR);
		outcome.mm = Math.floor( (secs % SECS_IN_HOUR) / SECS_IN_MIN );
		outcome.ss = Math.ceil( (secs % SECS_IN_HOUR) % SECS_IN_MIN );
		outcome.toString = function() {
			return  (this.hh > 0 ? this.hh + 'h ' :'') +
					(this.mm > 0 ? this.mm + 'm ' :'') +
					this.ss + 's';
		};

		return outcome;
	}
};

/**
 * very basic exception classes
 */
mindcandy.errors = {
	create: function( errId ) {
		return {
			id: errId,
			message: this[errId]
		};
	},

	ENOARGS: 'Not enough arguments or arguments not initialized'
};