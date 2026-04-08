const audioElement = new Audio('/sounds/404.mp3');
const playButtonElement = document.getElementById('play-button');
let isAudioPlaying = false;

const labels = {
	play: '🎵 Play music',
	pause: '🔇 Pause music',
};

const updateButtonLabel = () => playButtonElement.textContent = isAudioPlaying ? labels.pause : labels.play;

const toggleAudioPlayback = async () => {
	try {
		if (isAudioPlaying) {
			audioElement.pause();
			isAudioPlaying = false;
		} else {
			await audioElement.play();
			isAudioPlaying = true;
		}
	} catch (err) {
		if (err.name === 'NotAllowedError') isAudioPlaying = false;
	} finally {
		updateButtonLabel();
	}
};

playButtonElement.addEventListener('click', toggleAudioPlayback);

(async () => {
	try {
		await audioElement.play();
		isAudioPlaying = true;
	} catch (err) {
		if (err.name === 'NotAllowedError') isAudioPlaying = false;
	} finally {
		updateButtonLabel();
	}
})();