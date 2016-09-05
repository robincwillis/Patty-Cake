var fs = require('fs');

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

//=======
//If signal has multiple audio then normalize audio before mixing
//=======
export function normalizeAudioFiles (signalQue) {

	return new Promise ( (resolve, reject) => {
		var volumePromises = [];
		var keys = Object.keys(signalQue);

		//Todo chunk this into groups of 10
		keys.forEach( (key)=> {
			signalQue[key].inputFiles.forEach( (file) => {
				var volumePromise = volumeDetect(file);
				volumePromises.push(volumePromise);
			});

			//TODO we really want to resolve this when everything is done
			Promise.all(volumePromises).then( (volumes)=> {
				console.log(volumes);
				signalQue[key].volumes = volumes;
				resolve(signalQue);
			});

		});

	});

}

//=======
//
//=======
function buildNormalizationFilter (inputFiles, volumes) {

	var options = inputFiles.map( (file, index) => {
		var volume = volumes.find( (volume) => {return volume.file === file});
		console.log(volume.volume);
		var gain = 0 -  Number( volume.volume.max_volume.split(" ")[0]);
		console.log(gain);
		return '['+index+']'+'volume='+gain+';';
	});

	var volumeFilter = {
		filter : 'volume',
		options : '2',
		inputs : '0',
		outputs : '0'
		//options.join(" "),
		//outputs : inputFiles.length
	};

	return volumeFilter;


}

export default function volumeDetect (file) {
	return new Promise ( (resolve, reject) => {
		var uuid = guid();
		var output ='./temp/'+uuid+'.mp3';

		ffmpeg(file)
		.withAudioFilter('volumedetect')
		.on('error', (err) => {
				console.log('An error occurred: ' + err.message);
		})
		.on('end', (stdout, stderr) => {
				var volumeDetectObj = {};
				stderr.split("\n").filter ( (x) => {
					return x.indexOf('Parsed_volumedetect') !== -1;
				}).forEach ( (x) => {
					x = x.substring ( 2 + x.indexOf('] '));
					x = x.split(': ');
					volumeDetectObj[x[0]] = x[1];
				});
				if (fs.existsSync(output) ) {
					fs.unlinkSync(output);
				}

				var obj = {
					file : file,
					volume : volumeDetectObj
				};
				resolve(obj);
		})
		.saveToFile( output )
		.run();
	});
}

// ========================
// Everything below here is totally experimental
// ========================

var ffmpeg = require('fluent-ffmpeg');
//var command = ffmpeg();

//var input ='/Users/rwillis/Documents/input/b2.mp3';
var input ='/Users/rwillis/Documents/input/c2.mp3';

//var out ='/Users/rwillis/Documents/output/b.mp3';
var out ='/Users/rwillis/Documents/output/c.mp3';

var channel =0;

// var filterGraph = [
// 	// {
// 	// 	filter : 'volume',
// 	// 	options : 10,
// 	// 	inputs : ['0'],
// 	// 	//outputs : ['a0']
// 	// },
// 	// {
// 	// 	filter : 'volume',
// 	// 	options : -10,
// 	// 	inputs : ['1'],
// 	// //	outputs : ['a1']
// 	// }
// 	{
// 		filter : 'compand',
// 		options : 'points=-80/-105|-62/-80|-15.4/-15.4|0/-12|20/-7.6'
// 		//options : '.3|.3:1|1:-90/-60|-60/-40|-40/-30|-20/-20:6:0:-90:0.2'
// 	}
// ];

// filterGraph.push({
// 	inputs : ['a0','a1'],
// 	filter : 'amix',
// 	//options : {inputs: 2},
// 	outputs: 'aud0'
// });

// filterGraph.push({
// 	filter : 'pan',
// 	options : 'stereo|c'+channel+'=FR|c'+channel+'=FL',
// 	inputs : 'aud0'
// });

// ffmpeg()
// .addInput(input)
// //.addInput(input2)
// //.output(out)
// .addOutput(out)
// //.addOutput(out2)
// .complexFilter(filterGraph)
// //.audioChannels(2)
// .audioCodec('libmp3lame')
// // .outputOptions([
// //   '-map a0:0'
// // ])
// .on('start', function () {
// 	console.log('started');
// })
// .on('error', function (error) {
// 	console.log(error);
// })
// .on('end', function () {
// 	console.log('all done');
// })
// .run();
// var path = '/Users/rwillis/Documents/test.mp3';


// b2
// [Parsed_volumedetect_0 @ 0x7f8982f026c0] mean_volume: -21.3 dB
// [Parsed_volumedetect_0 @ 0x7f8982f026c0] max_volume: -2.1 dB

// c2
// [Parsed_volumedetect_0 @ 0x7fc0a96037e0] mean_volume: -10.8 dB
// [Parsed_volumedetect_0 @ 0x7fc0a96037e0] max_volume: 0.0 dB



//ffmpeg -i INPUT.mp4  -af "volumedetect" -f null /dev/null


