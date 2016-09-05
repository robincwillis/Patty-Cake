import 'sass/components/common/button';

import React, { Component } from 'react';

export default class Button extends Component {

	constructor (props) {
		super(props);

		let x = this.props.x ? this.props.x : 0;
		let y = this.props.y ? this.props.y : 0;

		let styles = {
			left: x,
			top : y
		};

		this.state = {
			styles:styles
		};
	}

	handleClick (event) {
		if(this.props.clickHandler) {
			this.props.clickHandler(event);
		} else {
			console.log('shit, do some default action');
		}
	}

	getClassName () {
		if(this.props.className) {
			return 'button ' + this.props.className;
		} else {
			return 'button';
		}
	}

	render () {
		return (
			<button style={this.state.styles} className={this.getClassName()} onClick={this.handleClick.bind(this)}  >{this.props.label}</button>
		);
	}

}