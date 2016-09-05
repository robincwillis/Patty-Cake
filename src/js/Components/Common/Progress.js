import 'sass/components/common/progress';


import React, { Component } from 'react';

export default class Progress extends Component {

	constructor (props) {
		super(props);

	}

	render () {
		console.log('rerender progress');
		let progress = (1 - (this.props.outstanding / this.props.total)) * 100;

		console.log(this.props);
		console.log(progress);

		let styles = {
			width: progress+'%'
		};

		return (
			<div className="progress">
				<div style={styles} className="progress-bar">
				</div>
			</div>
		);
	}
}
