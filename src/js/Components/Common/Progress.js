import 'sass/components/common/progress';


import React, { Component } from 'react';

export default class Progress extends Component {

	constructor (props) {
		super(props);

	}

	progress () {
		let progress = 0;
		if(this.props.outstanding && this.props.total) {
			progress = (1 - (this.props.outstanding / this.props.total)) * 100;

		}
		return Math.round(progress);
	}

	render () {
		console.log('Render progress');
		console.log(this.progress());

		let styles = {
			width: this.progress()+'%'
		};

		return (
			<div className="progress">
				<div style={styles} className="progress-bar">
				</div>
			</div>
		);
	}
}
