// Helper functions
function hzToMel(hz) {
	return 2595 * Math.log10(1 + hz / 700);
  }
  
  function melToHz(mel) {
	return 700 * (Math.pow(10, mel / 2595) - 1);
  }
  
  function createMelFilterBank(numFilters, fftSize, sampleRate, minFreq = 0, maxFreq = sampleRate / 2) {
	const melMin = hzToMel(minFreq);
	const melMax = hzToMel(maxFreq);
	const melPoints = [];
	
	for (let i = 0; i < numFilters + 2; i++) {
	  melPoints.push(melMin + (i / (numFilters + 1)) * (melMax - melMin));
	}
  
	const hzPoints = melPoints.map(melToHz);
	const binFrequencies = hzPoints.map(freq => Math.floor((fftSize + 1) * freq / sampleRate));
  
	const filterBank = [];
  
	for (let i = 0; i < numFilters; i++) {
	  const start = binFrequencies[i];
	  const center = binFrequencies[i + 1];
	  const end = binFrequencies[i + 2];
  
	  const filter = new Array(fftSize / 2).fill(0);
  
	  for (let j = start; j < center; j++) {
		filter[j] = (j - start) / (center - start);
	  }
	  for (let j = center; j < end; j++) {
		filter[j] = (end - j) / (end - center);
	  }
  
	  filterBank.push(filter);
	}
  
	return filterBank;
  }
  
  // Main function
  async function setupAudioMelAnalysis() {
	const audioContext = new (window.AudioContext || window.webkitAudioContext)();
	const analyser = audioContext.createAnalyser();
	analyser.fftSize = 2048;
  
	const source = await navigator.mediaDevices.getUserMedia({ audio: true });
	const mic = audioContext.createMediaStreamSource(source);
	mic.connect(analyser);
  
	const bufferLength = analyser.frequencyBinCount; // fftSize / 2
	const freqData = new Float32Array(bufferLength);
	const melBands = 40; // e.g., 40 Mel bands
	const melFilters = createMelFilterBank(melBands, analyser.fftSize, audioContext.sampleRate);
  
	function draw() {
	  analyser.getFloatFrequencyData(freqData); // dB values
	  const magnitudes = freqData.map(val => Math.pow(10, val / 20)); // Convert dB to linear
  
	  // Apply Mel filter bank
	  const melEnergies = melFilters.map(filter =>
		filter.reduce((sum, weight, i) => sum + weight * magnitudes[i], 0)
	  );
  
	  // Log or visualize melEnergies
	  console.log(melEnergies);
  
	  requestAnimationFrame(draw);
	}
  
	draw();
  }
  
  setupAudioMelAnalysis();
  