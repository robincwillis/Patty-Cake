import fs from 'fs';
import path from 'path';
const mp3Duration = require('mp3-duration');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

const logger = function(message) {
	if(window.state && window.state.app.debug) {
		console.log(message);
	}
};

logger('staticPath is');
logger(ffmpegStatic.path);
logger('ffmpegPath is... pretty hacky');

var ffmpegPath = path.resolve(__dirname, '..',ffmpegStatic.path);
var reset = false;

logger(ffmpegPath);

ffmpeg.setFfmpegPath(ffmpegPath);
//=======
//Util
//=======


//Pad string
function pad(n) {
	return (n < 10) ? ('0' + n) : n;
}

//=======
//Setup output dir
//=======
function setupDirectory (dir) {
	var right = '/right';
	var left = '/left';

	if (!fs.existsSync(dir)){
		fs.mkdirSync(dir);
	}

	if (!fs.existsSync(dir+right)){
		fs.mkdirSync(dir+right);
	}

	if (!fs.existsSync(dir+left)){
		fs.mkdirSync(dir+left);
	}
}

//=======
//Remove everything from the output directory
//=======
function cleanDirectory (dir) {
	if( fs.existsSync(dir) ) {
    fs.readdirSync(dir).forEach(function(file) {
      var curPath = dir + "/" + file;
        if(fs.statSync(curPath).isDirectory()) { // recurse
            cleanDirectory(curPath);
        } else { // delete file
            fs.unlinkSync(curPath);
        }
    });
    fs.rmdirSync(dir);
  }

}


export function triggerReset () {
	console.log('trigger reset');
	reset = true;
}

//=======

//=======

export function checkReset () {
	return reset;
}

//=======
//Get the duration(filename) for an mp3
//=======
export const getDuration = (filePath) => {

	logger('getDuration');
	logger(filePath);
	return new Promise( (resolve, reject) => {
		if(checkReset()) {
			resolve({});
			return;
		}

		mp3Duration(filePath, function (err, duration) {
		  if (err) {
				logger(err.message);
		  	//fail silently
		  	resolve(err);
		  } else {
			  logger('Your file is ' + duration + ' seconds long');
			  duration = Math.round(duration);
				let minutes = Math.floor(duration / 60);
				let seconds = pad(duration - minutes * 60);
				resolve({ duration: minutes+"-"+seconds+'.mp3', file : filePath } );
		  }

		});
	});
};

//=======
//Recursively loop though all input directories and create list of mp3 files found
//=======
export function getFileList (dir, filelist) {
	logger('getFileList');

	let files = fs.readdirSync(dir);
	filelist = filelist || [];
	files.forEach(function(file) {

		if (fs.statSync(dir + '/' + file).isDirectory()) {
			filelist = getFileList(dir + '/' + file, filelist);
		}
		//Dumb for now, should prob use glob to only include audio files
		else if(! /^\..*/.test(file)){
			filelist.push({dir:dir, file:file});
		}
	});

	logger(filelist);
	return filelist;
}

//=======
//Build a map for each of our files depending on duration
//=======
export function buildSignalQue (files) {
	return new Promise( (resolve, reject) => {

		if(checkReset()) {
			resolve({});
			return;
		}

		var signalQue = {};
		let durationPromises = [];

		files.forEach( (file) => {
			let getDurationPromise = getDuration(path.resolve(file.dir, file.file));
			durationPromises.push(getDurationPromise);
		});
		return Promise.all(durationPromises).then( (durations) => {
			if(checkReset()) {
				resolve({});
				return;
			}

			durations.forEach( (duration, index)=> {
				//has a duration and not an error
				if(duration.duration) {
					//is the duration in the signal que?
					if(signalQue[duration.duration]){
						signalQue[duration.duration].inputFiles.push(duration.file);
					} else {
						var signal = {
							duration : duration,
							status : 'pending',
							inputFiles : [duration.file],
							outputFile : ''
						};
						signalQue[duration.duration] = signal;

					}
				}
			});
			//resolve with the que when finished
			resolve(signalQue);
		}).catch( (error) => {
			logger(error);
		});
	});
}

//=======
// Process each individual signal
//=======
export function processSignal (signal, inputDir, outputDir) {


	logger('processSignal =============');

	return new Promise( (resolve, reject) => {

		if(checkReset()) {
			resolve();
			return;
		};


		let channel = signal.inputFiles.length === 1 ? 1 : 0;
		let dir = signal.inputFiles.length === 1 ? '/right' : '/left';
		let outputFile = path.resolve(outputDir+dir, signal.duration.duration);

		let filterGraph = [];

		if (signal.inputFiles.length > 0) {

			filterGraph.push({
				filter : 'compand',
				options : 'points=-80/-105|-62/-80|-15.4/-15.4|0/-12|20/-7.6',
				outputs : 'aud0'
			});

			filterGraph.push({
				inputs : 'aud0',
				filter : 'amix',
				options : {inputs: signal.inputFiles.length},
				outputs: 'aud1'
			});

			filterGraph.push({
				inputs : 'aud1',
				filter : 'pan',
				options : 'stereo|c'+channel+'=FR|c'+channel+'=FL'
			});

		} else {
			filterGraph.push({
				filter : 'pan',
				options : 'stereo|c'+channel+'=FR|c'+channel+'=FL'
			});
		}

		let command = ffmpeg();

		signal.inputFiles.forEach( (inputFile) => {
			command.addInput(inputFile);
		});

		command
		.output(outputFile)
		.complexFilter(filterGraph)
		.audioChannels(2)
		.audioCodec('libmp3lame')

		.on('start', () =>  {
			logger('ffmpeg started');
			var entry = {
				id : new Date().valueOf(),
				input : signal.inputFiles,
				output : outputFile,
				status : 'MERGE_START'
			};
			window.state.actions.setLog(entry);
			//Update Progress

		})
		.on('error', (error) => {
			logger('ffmpeg command error');
			var entry = {
				id : new Date().valueOf(),
				input : signal.inputFiles,
				output : error.message,
				status : 'ERROR',
				code : 21
			};
			window.state.actions.setLog(entry);
			window.state.actions.decreaseOutstanding();
			resolve({error : error});
		})
		.on('end', () => {
			logger('ffmpeg command ended');
			var entry = {
				id : new Date().valueOf(),
				input : signal.inputFiles,
				output : outputFile,
				status : 'MERGE_FINISH'
			};
			window.state.actions.setLog(entry);
			window.state.actions.decreaseOutstanding();
			resolve(signal);
		})
		.run();


	});
}

//=======
//Process all of the Signals in chunks so we don't crash
//=======
export function processSignals (signalQue, inputDir, outputDir) {

	let signalKeys = Object.keys(signalQue);
	let chunk = Math.min(10, signalKeys.length);
	let signalPromises = [];

	for(var i = 0; i < chunk; i++) {
		let signal = signalQue[signalKeys[i]];
		let signalPromise = processSignal(signal, inputDir, outputDir);
		signalPromises.push(signalPromise);
	}

	Promise.all(signalPromises).then( (signals)=> {
		logger(signals);
		signals.forEach( (signal)=> {
			delete signalQue[signal.duration.duration];
		});

		//re call function
		if( Object.keys(signalQue).length > 0) {
			processSignals(signalQue, inputDir, outputDir);
		} else {
			window.state.actions.setOutstanding(Object.keys(signalQue).length);
			var entry = {
				id : new Date().valueOf(),
				input : null,
				output : null,
				status : 'FINISHED'
			};
			window.state.actions.setLog(entry);
			if(!reset) {
				window.state.actions.finish();
			} else {
				window.state.actions.reset();
				reset = false;
			}
		}
	});
}

export default function main (inputDir, outputDir) {
	cleanDirectory(outputDir);
	setupDirectory(outputDir);

	let fileList = getFileList(inputDir);
	var quePromise = buildSignalQue(fileList);

	quePromise.then( (signalQue) =>{
		logger('========== que is ============');
		logger(signalQue);
		window.state.actions.setTotal(Object.keys(signalQue).length);
		processSignals(signalQue, inputDir, outputDir);
	});
}

