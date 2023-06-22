//! download models
//!Sox set to envaironment
//! npx node@14.0.0 ./index.js
const DeepSpeech = require('deepspeech');
const Fs = require('fs');
const Sox = require('sox-stream');
const MemoryStream = require('memory-stream');
const Duplex = require('stream').Duplex;
const Wav = require('node-wav');
const rootPath = require('app-root-path');
const https = require('https');
const { execSync } = require('child_process');
const ffmpegStatic = require('ffmpeg-static');
const { translate } = require('@vitalets/google-translate-api');



let modelPath = './models/deepspeech-0.9.3-models.pbmm';

let model = new DeepSpeech.Model(modelPath);

let desiredSampleRate = model.sampleRate();

let scorerPath = './models/deepspeech-0.9.3-models.scorer';

model.enableExternalScorer(scorerPath);

// let audioFile = 'audio/4507-16021-0012.wav'
let audioFile = transcribeLocalVideo('deepgram.mp4')

if (!Fs.existsSync(audioFile)) {
	console.log('file missing:', audioFile);
	process.exit();
}

const buffer = Fs.readFileSync(audioFile);
const result = Wav.decode(buffer);

if (result.sampleRate < desiredSampleRate) {
	console.error('Warning: original sample rate (' + result.sampleRate + ') is lower than ' + desiredSampleRate + 'Hz. Up-sampling might produce erratic speech recognition.');
}

function bufferToStream(buffer) {
	let stream = new Duplex();
	stream.push(buffer);
	stream.push(null);
	return stream;
}

let audioStream = new MemoryStream();
bufferToStream(buffer).
	pipe(Sox({
		global: {
			'no-dither': true,
		},
		output: {
			bits: 16,
			rate: desiredSampleRate,
			channels: 1,
			encoding: 'signed-integer',
			endian: 'little',
			compression: 0.0,
			type: 'raw'
		}
	})).
	pipe(audioStream);

audioStream.on('finish', async () => {
	let audioBuffer = audioStream.toBuffer();
	const audioLength = (audioBuffer.length / 2) * (1 / desiredSampleRate);
	console.log('audio length', audioLength);
	let result = model.stt(audioBuffer);
	const { text } = await translate(result, { to: 'fa' });
	Fs.writeFileSync(`${rootPath}/test.txt`, text);
	// console.log('result:', text);
});





// transcribeRemoteVideo('https://www.w3schools.com/html/mov_bbb.mp4');

function transcribeLocalVideo(filePath) {
	ffmpeg(`-hide_banner -y -i ${filePath} ${filePath}.wav`);
	return `${filePath}.wav`
}




async function ffmpeg(command) {
	return new Promise((resolve, reject) => {
		execSync(`${ffmpegStatic} ${command}`, (err, stderr, stdout) => {
			if (err) reject(err);
			resolve(stdout);
		});
	});
}




