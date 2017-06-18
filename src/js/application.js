import 'sass/reset';

import React from 'react';
import ReactDOM from 'react-dom';
import App from 'Components/App';

window.state = {
	app : {
		debug : false,
		reset : false,
		currentView : 0,
		views : [0,1],
		progress : 0,
		log : '',
		inputDir : '',
		outputDir : '',
		merges : []
	},
	actions : {
		setCurrentView : null,
		setLog : null,
		finish: null,
		reset: null
	}
};

ReactDOM.render(<App {...state} />, document.getElementById('root'));