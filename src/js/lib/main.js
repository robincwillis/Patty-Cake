import fs from 'fs';
import path from 'path';

//=======
//Util
//=======

//Pad string
function pad(n) {
		return (n < 10) ? ('0' + n) : n;
}

//TODO Setup output dir

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

//Remove everything from the output directory
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
//=======

//=======
//Get the duration(filename) for an mp3
//=======
export const getDuration = (filePath) => {
	return new Promise( (resolve, reject) => {
		taglib.read(filePath, function (err, res, props) {
				if(err) {
					//fail silently
					resolve(err);
				} else {
					let minutes = Math.floor(props.length / 60);
					let seconds = pad(props.length - minutes * 60);
					resolve({ duration: minutes+"-"+seconds+'.mp3', file : filePath } );
				}
		});
	});
};

//=======
//Recursively loop though all input directories and create list of mp3 files found
//=======
export function getFileList (dir, filelist) {

	let files = fs.readdirSync(dir);
	filelist = filelist || [];
	files.forEach(function(file) {

		if (fs.statSync(dir + '/' + file).isDirectory()) {
			filelist = getFileList(dir + '/' + file, filelist);
		}
		else {
			filelist.push({dir:dir, file:file});
		}
	});
	return filelist;
}

//=======
//Build a map for each of our files depending on duration
//=======
export function buildSignalQue (files) {
	return new Promise( (resolve, reject) => {

		var signalQue = {};
		let durationPromises = [];

		files.forEach( (file) => {
			let getDurationPromise = getDuration(path.resolve(file.dir, file.file));
			durationPromises.push(getDurationPromise);
		});
		return Promise.all(durationPromises).then( (durations) => {
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
			console.log(error);
		});
	});
}

//=======
// Process each individual signal
//=======
export function processSignal (signal, inputDir, outputDir) {
	return new Promise( (resolve, reject) => {
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
			var entry = {
				id : new Date().valueOf(),
				input : signal.inputFiles,
				output : outputFile,
				status : 'MERGE_START'
			};
			window.state.actions.setLog(entry);
			//Update Progress
			//console.log('ffmpeg started');
		})
		.on('error', (error) => {
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
		console.log(signals);
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
			window.state.actions.finish();
		}


	});

}

export default function main (inputDir, outputDir) {
	cleanDirectory(outputDir);
	setupDirectory(outputDir);

	let fileList = getFileList(inputDir);
	var quePromise = buildSignalQue(fileList);

	quePromise.then( (signalQue) =>{
		console.log('========== que is ============');
		console.log(signalQue);
		window.state.actions.setTotal(Object.keys(signalQue).length);
		processSignals(signalQue, inputDir, outputDir);
	});
}

