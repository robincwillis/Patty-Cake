import 'sass/components/main';

import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import View from './Common/View';
import Button from './Common/Button';
import Player from './Common/Player';
import Progress from './Common/Progress';

export default class ConversionInput extends Component {

	constructor (props) {
		super(props);
	}

	componentDidMount () {
		let inputDir = ReactDOM.findDOMNode(this.refs.inputDir);

		inputDir.setAttribute('nwdirectory', '');
		inputDir.addEventListener("change", (event) => {
					this.props.setInputDir(inputDir);
		}, false);

		let outputDir = ReactDOM.findDOMNode(this.refs.outputDir);

		outputDir.setAttribute('nwdirectory', '');
		outputDir.addEventListener("change", (event) => {
			this.props.setOutputDir(outputDir);
			}, false);
	}

	handleClickGetStarted () {
		this.props.setStage('INPUT');
	}

	handleClickReset () {
		//this.props.setStage('GET_STARTED');
		this.props.reset();
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

		//if processing done
			// render play button

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
					<input id="inputDir" type="file" ref="inputDir" name="inputDir" />
					<label className="button input-button" htmlFor="inputDir"></label>
					<h2>{this.inputLabel()}</h2>
				</div>
			</div>

			{/* OUTPUT DIR */}
			<div className="block output-dir">
				<div className="file-input">
					<input id="outputDir" className="file-input" type="file" ref="outputDir" name="outputDir"/>
					<label className="button output-button" htmlFor="outputDir"></label>
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
				<Progress {...this.props} />
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
					label=""
					clickHandler={this.props.reset}
				/>
				<div className="mole"></div>
				<div onClick={this.handleClickReset.bind(this)} className="reset"></div>
				<div className="preload-images">
					<div className="pk-frame frame-1"></div>
					<div className="pk-frame frame-2"></div>
					<div className="pk-frame frame-3"></div>
					<div className="pk-frame frame-4"></div>
					<div className="pk-frame frame-5"></div>
					<div className="pk-frame frame-6"></div>
					<div className="pk-frame frame-7"></div>
					<div className="pk-frame frame-8"></div>
					<div className="pk-frame frame-9"></div>
				</div>
			</div>
		);
	}
}

