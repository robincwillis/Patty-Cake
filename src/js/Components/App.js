import 'sass/components/app';
import React, { Component } from 'react';

import Main from './Main';
import Debug from './Debug';
import Button from './Common/Button';
import { state } from 'application';
import { main, reset } from '../lib/main';

const initialState = {
	currentView : 0,
	views : [0,1],
	inputDir : null,
	outputDir : null,
	stage : 'GET_STARTED',
	total : 1,
	outstanding : 1,
	log : []
};

export default class App extends Component {

	constructor (props) {
		super(props);

		this.state = initialState;

		window.state.actions.setProgress = (data) => {
			this.setState({
				progress : data.progress
			});
		};

		window.state.actions.setLog = (total) => {

		};

		window.state.actions.finish = (result) => {
			console.log('finished');
			this.setState({
				stage : 'PLAY'
			});
		};

		window.state.actions.setTotal = (total) => {
			this.setState({
				total : total,
				outstanding : total
			});
		};

		window.state.actions.setOutstanding = (outstanding) => {
			this.setState({
				outstanding : outstanding
			});
		};

		window.state.actions.decreaseOutstanding = () => {
			var outstanding = this.state.outstanding;
			var newOustanding = outstanding-1;
			this.setState({
				outstanding : newOustanding
			});
		};

		window.state.actions.setLog = (entry) => {
			var log = this.state.log;
			log.push(entry);
			this.setState({
				log : log
			});
		};

	}

	reset () {
		this.setState(initialState);
		reset();
		window.location.reload()
	}

	handleKeyPress = (event) => {
		if(event.keyCode === 106){
			this.switchView();
		}
	}

	componentDidMount () {
		document.addEventListener("keypress", this.handleKeyPress);
	}

	setStage (stage) {
		this.setState({
			stage : stage
		});
	}

	setInputDir (inputDir) {
		this.setState({
			inputDir : inputDir.value,
			stage: 'OUTPUT'
		});
	}

	setOutputDir (outputDir) {
		this.setState({
			outputDir : outputDir.value,
			stage : 'PROCESS'
		});
	}


	go () {
		var input = this.state.inputDir;
		var output = this.state.outputDir;
		main(input, output);
		this.setState({
			stage : 'IN_PROGRESS'
		});
	}

	switchView () {
		console.log(this.state.stage);
		let currentView = this.state.currentView;
		if ( currentView === this.props.app.views.length -1) {
			currentView = 0;
		} else {
			currentView++;
		}

		this.setState({
			currentView : currentView
		});

	}

	renderCurrentView () {
		switch (this.state.currentView) {
			case 0 :
				return (<Main
					inputDir={this.state.inputDir}
					outputDir={this.state.outputDir}
					stage={this.state.stage}
					total={this.state.total}
					outstanding={this.state.outstanding}
					setStage={this.setStage.bind(this)}
					setInputDir={this.setInputDir.bind(this)}
					setOutputDir={this.setOutputDir.bind(this)}
					go={this.go.bind(this)}
					reset={this.reset.bind(this)}
					{...this.props}
				/>);
			case 1 :
				return (<Debug
					inputDir={this.state.inputDir}
					outputDir={this.state.outputDir}
					setInputDir={this.setInputDir.bind(this)}
					setOutputDir={this.setOutputDir.bind(this)}
					stage={this.state.stage}
					go={this.go.bind(this)}
					log={this.state.log}
					total={this.state.total}
					outstanding={this.state.outstanding}
					{...this.props}
				/>);
			default:
				return (<Main {...this.props} />);
		}
	}

	render () {
		return (
			<div>
				{this.renderCurrentView()}
				<Button className="pull-right switch-view" clickHandler={this.switchView.bind(this)} label="Switch View" />
				{this.state.progress}
			</div>
		);
	}
}