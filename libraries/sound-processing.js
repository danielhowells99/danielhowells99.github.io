class MelFilter {
    constructor(sampleRate,fftSize,melBands){
        this.sampleRate = sampleRate
        this.fftSize = fftSize
        this.melBands = melBands
        this.melPoints = this.getMelPoints()
        this.hzPoints = this.getHzPoints()
        this.bins = this.getBins()
        this.freqTex = null
    }

    hzToMel(hz) {
        return 2595 * Math.log10(1 + hz / 700);
    }

    melToHz(mel) {
        return 700 * (Math.pow(10, mel / 2595) - 1);
    }

    getMelPoints(){
        const melPoints = [];
        const melMin = this.hzToMel(0);
        const melMax = this.hzToMel(this.sampleRate / 2);
        for (let i = 0; i < this.melBands + 2; i++) {
            melPoints.push(melMin + (i / (this.melBands + 1)) * (melMax - melMin));
        }
        return melPoints
    }

    getHzPoints(){
        return this.melPoints.map(this.melToHz);
    }

    getBins(){
        return this.hzPoints.map(freq => Math.floor((this.fftSize + 1) * freq / this.sampleRate));
    }
    
    getFreqTex(gl){
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, this.melBands, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, new Uint8Array(this.melBands));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        this.freqTex = tex;
        return tex;
    }
    

    applyFilter(freqData){
        const mags = freqData.map(dB => Math.pow(10, dB / 20));
        //const mags = freqData;
        const filters = [];
        for (let i = 0; i < this.melBands; i++) {
          let filter = 0;
          const start = this.bins[i];
          const center = this.bins[i + 1];
          const end = this.bins[i + 2];
          for (let j = start; j < center; j++) {
            filter += ((j - start) / (center - start))*mags[j];
          }
          for (let j = center; j < end; j++) {
            filter += ((end - j) / (end - center))*mags[j];
          }
          const norm = 255*Math.min(1, filter / 0.1)
          //const norm = filter
          filters.push(norm);
        }
        return filters;
    }
    
    updateFreqTex(gl,freqData){
        const melData = new Uint8Array(this.applyFilter(freqData))
        //console.log(melData)
        gl.bindTexture(gl.TEXTURE_2D,this.freqTex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, this.melBands, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, melData);
        return this.freqTex;
    }
}

export {MelFilter}