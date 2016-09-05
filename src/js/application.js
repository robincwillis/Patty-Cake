import 'sass/reset';

import React from 'react';
import ReactDOM from 'react-dom';
import App from 'Components/App';

window.state = {
	app : {
		debug : false,
		currentView : 0,
		views : [0,1],
		progress : 0,
		log : '',
		converstionStarted : false,
		conversionInProgress : false,
		conversionFinished : false,
		converstionState : 0,
		conversionStateCodes : [0,1,2],
		inputDir : '',
		outputDir : '',
		merges : []
	},
	actions : {
		setCurrentView : null,
		setProgress : null,
		setLog : null,
		setConverstionState : null,
		finish: null
	}
};

ReactDOM.render(<App {...state} />, document.getElementById('root'));