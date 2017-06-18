import React, { Component } from 'react';

import 'sass/components/debug';

import View from './Common/View';
import Log from './Common/Log';
import Button from './Common/Button';

export default class Debug extends Component {

	constructor (props) {
		super(props);
	}

	content () {
		return (
			<div>
				<h1>P A T T Y C A K E</h1>
				<div className="block debug">
					<h2>{this.props.inputDir}</h2>
					<h2>{this.props.outputDir}</h2>
					<Log {...this.props} />
				</div>
			</div>
		);
	}

	render () {
		return (
			<div>
				<View content={this.content()} {...this.props} />
			</div>
		);
	}
}