import 'sass/components/main';

import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import View from './Common/View';
import Button from './Common/Button';
import Player from './Common/Player';

const { dialog } = require('electron').remote;

export default class ConversionInput extends Component {

	constructor (props) {
		super(props);
	}

	componentDidMount () {
	}

	handleClickGetStarted () {
		this.props.setStage('INPUT');
	}


	handleFileSelection = (inputDir) => {
		this.props.setInputDir(inputDir[0]);
	}

	handleFileSave = (outputDir) => {
		this.props.setOutputDir(outputDir[0]);
	}

	handleClickInput () {
		dialog.showOpenDialog({
			defaultPath: './',
			properties: ['openDirectory']
		}, this.handleFileSelection);
	}

	handleClickOutput () {
		dialog.showOpenDialog({
			defaultPath: './',
			properties: ['openDirectory']
		}, this.handleFileSave);
	}

	renderProcessButton () {
		if (this.props.inputDir && this.props.outputDir) {
			return (<Button
					clickHandler={this.props.go}
					className="process-button"
					label=""
				/>);
		} else {
			return false;
		}
	}

	inputLabel () {
		return this.props.inputDir ? this.props.inputDir : 'CHOOSE A FOLDER WITH SOME AUDIO FILES';
	}

	outputLabel () {
		return this.props.outputDir ? this.props.outputDir : 'CHOOSE A FOLDER TO SAVE THE CONVERTED FILES';
	}

	content () {

		return (
			<div className={"main " + this.props.stage}>

			{/* GET STARTED */}
			<div className="block get-started">
			 <Button
				className="get-started-button fixed"
				clickHandler={this.handleClickGetStarted.bind(this)}
				label=""
				x="510"
				y="370"
			 />
			</div>

			{/* INPUT DIR */}
			<div className="block input-dir">
				<div className="file-input">
					<div onClick={this.handleClickInput.bind(this)} className="file-button button input-button" />
					<h2>{this.inputLabel()}</h2>
				</div>
			</div>

			{/* OUTPUT DIR */}
			<div className="block output-dir">
				<div className="file-input">
					<div onClick={this.handleClickOutput.bind(this)} className="file-button button output-button" />
					<h2>{this.outputLabel()}</h2>
				</div>
			</div>

			{/* PROCESS */}
				<div className="block process">
					{this.renderProcessButton()}
				</div>

			{/* IN_PROGRESS */}
			<div className="block in-progress">
				<div className="patty-cake">
				</div>
			</div>

			{/* PLAY */}
			<div className="block play">
				<Player {...this.props} />
			</div>
			</div>
		);
	}

	render () {
		return (
			<div>
				<View content={this.content()} {...this.props} />
				<Button
					className="fixed reset-button"
					x="690"
					y="735"
					clickHandler={this.props.reset}
				/>
				<div className="mole" />
			</div>
		);
	}
}

