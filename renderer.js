const { dialog } = require('electron').remote;

const ffmpegStatic = require('ffmpeg-static');
var ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegStatic.path)

// console.log('Renderer Running');
// console.log('realPath is');
// console.log(ffmpegStatic.path);

