window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;//兼容游览器
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;
audioContext=new window.AudioContext();

function MusicVisualizer(obj){
    var source=null;
    this.count=0;
    this.analyser=audioContext.createAnalyser();
    this.size=obj.size;
    this.scene=obj.scene;
    this.camera=obj.camera;
    this.clock=obj.clock;
    this.analyser.fftSize=this.size*2;
    this.gainNode=audioContext[audioContext.createGain?"createGain":"createGainNode"](0);
    this.gainNode.connect(audioContext.destination);
    this.analyser.connect(this.gainNode);
    this.xhr = new XMLHttpRequest();
    this.visualizer=obj.visualizer;
   
}


MusicVisualizer.prototype.load = function(url,fun) {
    this.xhr.abort();
    this.xhr.open("GET", url);
    this.xhr.responseType = "arraybuffer"; //配置数据返回类型 arraybuffer 音频以二进制传输
    var self=this;

    this.xhr.onload = function() { //请求成功 
        fun(self.xhr.response);
    }
    this.xhr.send();
}

MusicVisualizer.prototype.decode=function(arraybuffer,fun){
    audioContext.decodeAudioData(arraybuffer,function(buffer){
        fun(buffer);
        $(".loading").hide();
    },function(err){
        console.log(err);
    })
}
MusicVisualizer.prototype.play=function(url){
     this.visualize();
    var n=++this.count;
    var self=this;
    this.source&&this.stop();
    //判断哪种方式传入
    if(url instanceof ArrayBuffer ){
        self.decode(url,function(buffer){
                var  bufferSource=audioContext.createBufferSource();//创建一个音频source
                bufferSource.buffer=buffer;//告诉source是哪个音频
                bufferSource.connect(self.analyser);//将source和context's destination连接 相当于扬声器
                bufferSource[bufferSource.start?"start":"noteOn"](0);//noteOn兼容老版本
                self.source=bufferSource;
        })
    }
    if(typeof url==='string'){
        this.load(url,function(arraybuffer){
            if(n != self.count){
                    return;
                }
            self.decode(arraybuffer,function(buffer){
                var  bufferSource=audioContext.createBufferSource();//创建一个音频source
                bufferSource.buffer=buffer;//告诉source是哪个音频
                bufferSource.connect(self.analyser);//将source和context's destination连接 相当于扬声器
                bufferSource[bufferSource.start?"start":"noteOn"](0);//noteOn兼容老版本
                self.source=bufferSource;
            })
    })
    }
    
}
MusicVisualizer.prototype.stop=function(){
    this.source[this.source.stop? "stop" : "noteOff"](0);
}
//改变音量大小
MusicVisualizer.prototype.changeVolume=function(targetvolume){
   this.gainNode.gain.value=targetvolume;
}
//分析音频
MusicVisualizer.prototype.visualize = function() {
    var arr = new Uint8Array(this.analyser.frequencyBinCount); //长度
    var self = this;

    function show() {
        self.analyser.getByteFrequencyData(arr);
        self.visualizer(arr);
        window.requestAnimationFrame(show);
    };
    window.requestAnimationFrame(show);
}
