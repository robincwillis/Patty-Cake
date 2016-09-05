import React, { Component } from 'react';

import Button from './Button';
import { getFileList } from '../../lib/main';

export default class Player extends Component {

	constructor (props) {
		super(props);
		this.state = {
			rightIndex : 0,
			leftIndex : 0,
		}

	}

	setTrack (player, playlist, index) {
		var track = playlist[index];
		var src = "file:///" + track.dir + '/' + track.file;
		player.src = src;

	}

	play() {
    const right = this.refs.right;
    const left = this.refs.left;

		var rightPlaylist = getFileList(this.props.outputDir + '/right');
		var leftPlaylist = getFileList(this.props.outputDir + '/left');

		console.log(rightPlaylist);
		var leftIndex = this.state.leftIndex;
		var rightIndex = this.state.rightIndex;

		this.setTrack(left, leftPlaylist, leftIndex );
		this.setTrack(right, rightPlaylist, rightIndex);

		leftIndex ++;
		rightIndex ++;
		this.setState({
			rightIndex : rightIndex,
			leftIndex : leftIndex
		});

		//bump up the index

    //on playend change to the next track
		left.addEventListener('ended', (e) => {
			this.setTrack(left, leftPlaylist, leftIndex);
			if ( leftIndex > leftPlaylist.length ) {
				leftIndex = 0;
			} else {
				leftIndex ++;
			}
			this.setState({
				leftIndex : leftIndex
			});
			left.play();

    });

		right.addEventListener('ended', (e) => {
    	this.setTrack(right, rightPlaylist, rightIndex);
			if ( rightIndex > leftPlaylist.length ) {
				rightIndex = 0;
			} else {
				rightIndex ++;
			}
			this.setState({
				rightIndex : rightIndex
			});
			right.play();
    });

    left.play();
		right.play();

  }

	// play () {
 //    const right = this.refs.right;
 //    const left = this.refs.left;

	// }


	render () {
		console.log(this.props);

		return (
			<div>
			<audio ref="right">
				Your machine does not support the audio element.
			</audio>
			<audio ref="left">
				Your machine does not support the audio element.
			</audio>

			<Button
				className=" fixed play-button"
				x="40"
				y="390"
				clickHandler={this.play.bind(this)}
			/>
			</div>
		);
	}
}
