import 'sass/components/common/log';

import React, { Component } from 'react';

export default class Log extends Component {

	constructor (props) {
		super(props);

		this.state = {
			log : []
		};
	}

	getEntryClass (status) {
		switch (status) {
			case 'MERGE_STARTED':
				return 'merge-started';
			case 'MERGE_FINISHED':
				return 'merge-finished';
			case 'CREATED':
				return 'created';
			case 'ERROR':
				return 'error';
			case 'FINISHED':
				return 'finished';

		}
	}

	render () {
		return (
			<pre>
			<ul>
				{this.props.log.map( (entry) => {
					return (
						<li key={entry.id} className={this.getEntryClass(entry.status)} >
							<span className="status">{entry.status}</span>
							<span className="input">: {entry.input}</span>
							<span className="output">{entry.output}</span>
						</li> );
				})}
				</ul>
			</pre>
		);
	}

}