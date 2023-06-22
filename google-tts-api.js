const googleTTS = require('google-tts-api');
const fs = require('fs');
const https = require('https');

const t = async () => {

	async function tts() {
		return new Promise((resolve, reject) => {
				const url = googleTTS.getAudioUrl('Hello World', {
					lang: 'en-US',
					slow: false, // speed (number) is changed to slow (boolean)
					host: 'https://translate.google.com', // allow to change the host
				});
				resolve(url)
		})
	}






	await tts();	
	

}
t()