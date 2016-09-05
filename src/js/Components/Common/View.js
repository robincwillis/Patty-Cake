import 'sass/components/common/view';

import React, { Component } from 'react';

export default class View extends Component {

	render () {
		return (
			<div className="view" >{this.props.content}</div>
		);
	}

}