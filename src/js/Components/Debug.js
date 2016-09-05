import 'sass/components/debug';

import React, { Component } from 'react';
import View from './Common/View';

import Log from './Common/Log';
import Progress from './Common/Progress';
import Button from './Common/Button';

export default class Debug extends Component {

	constructor (props) {
		super(props);


		this.state = {
			inputDir : null,
			outputDir : null
		};
	}

	componentDidMount () {

		//for debug
		this.props.setInputDir({value:'/Users/rwillis/Documents/input'});
		this.props.setOutputDir({value:'/Users/rwillis/Documents/output'});

	}

	content () {
		return (
			<div>
				<h1>P A T T Y C A K E</h1>
				<div className="block debug">
					<Button
						label="GO"
						clickHandler={this.props.go}
					/>
					<h2>{this.props.inputDir}</h2>
					<h2>{this.props.outputDir}</h2>
					<Progress {...this.props} />
					<Log {...this.props} />
				</div>
			</div>
		);
	}

	render () {

//
//

		console.log('props are');
		console.log(this.props);

		return (
			<div>
				<View content={this.content()} {...this.props} />
			</div>
		);
	}
}