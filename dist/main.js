let stream = null;
let audio = null;
let mixedStream = null;
let chunks = [];
let recorder = null;
let startButton = null;
let stopButton = null;
let downloadButton = null;
let recorderVideo = null;

async function setupStrean() {
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

    audio = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
      },
    });

    setupVideoFeedback();
  } catch (err) {
    console.error(err);
  }
}

function setupVideoFeedback() {
  if (!stream) {
    console.warn('No stream available');
    return;
  }

  const video = document.querySelector('.video-feedback');
  video.srcObject = stream;
  video.play();
}

async function startRecording() {
  await setupStrean();

  if (stream && audio) {
    mixedStream = new MediaStream([
      ...stream.getTracks(),
      ...audio.getTracks()
    ]);
    recorder = new MediaRecorder(mixedStream);
    recorder.ondataavailable = handleDataAvailable;
    recorder.onstop = handleStop;
    recorder.start(2);

    startButton.disabled = true;
    stopButton.disabled = false;

    console.log('Recording has started...');
  } else {
    console.warn('No stream available');
  }
}

function handleDataAvailable(e) {
  chunks.push(e.data);
}

function stopRecording() {
  recorder.stop();
  startButton.disabled = false;
  stopButton.disabled = true;
  
  console.log('Recording has stopped...');
}

function handleStop(e) {
  const blob = new Blob(chunks, { type: 'video/mp4' });
  chunks = [];

  downloadButton.href = URL.createObjectURL(blob);
  downloadButton.download = 'video.mp4';
  downloadButton.disabled = false;

  recorderVideo.src = URL.createObjectURL(blob);
  recorderVideo.load();
  recorderVideo.onloadeddata = () => {
    recorderVideo.play();

    const rc = document.querySelector('.recorded-video-wrap');  
    rc.classList.remove('hidden');
    rc.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  stream.getTracks().forEach((track) => track.stop());
  audio.getTracks().forEach((track) => track.stop());

  console.log('Recording has prepared...');
}

window.addEventListener('load', () => {
  startButton = document.querySelector('.start-recording');
  stopButton = document.querySelector('.stop-recording');
  downloadButton = document.querySelector('.download-video');
  recorderVideo = document.querySelector('.recorded-video');

  startButton.addEventListener('click', startRecording);
  stopButton.addEventListener('click', stopRecording);
});