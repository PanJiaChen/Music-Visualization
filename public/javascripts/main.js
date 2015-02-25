var musicList=$("#list");
var source=null;
var xhr = new XMLHttpRequest();
var count=0;
var isAnalysis=false;
window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;//兼容游览器
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;
var start = null;
var audioContext=new window.AudioContext();
var gainNode=audioContext[audioContext.createGain?"createGain":"createGainNode"]();
var analyser=audioContext.createAnalyser();

gainNode.connect(audioContext.destination);
var size=128;
analyser.fttSize=size*2;
analyser.connect(gainNode);
musicList.on("click","li",function(){
    $(this).siblings().removeClass('selected');
    $(this).addClass('selected');
    loadMusic('media/'+$(this).attr('title'));
})

function loadMusic(url){
    var n=++count;
    source&&source[source.stop? "stop" : "noteOff"]();
    xhr.abort();
    xhr.open("GET",url);
    xhr.responseType="arraybuffer";//配置数据返回类型 arraybuffer 音频以二进制传输

   xhr.onload=function(){//请求成功 
         if(n != count){
                return;
            }
        audioContext.decodeAudioData(xhr.response,function(buffer){
            if(n != count){
                return;
            }
            var  bufferSource=audioContext.createBufferSource();//创建一个音频source
            bufferSource.buffer=buffer;//告诉source是哪个音频
            bufferSource.connect(analyser);//将source和context's destination连接 相当于扬声器
            bufferSource[bufferSource.start?"start":"noteOn"](0);//noteOn兼容老版本
            source=bufferSource;
            visualizer();
        },function(err){
            console.log(err)
        })
   }
   xhr.send();
}

//改变音量大小
function changevolume(targetvolume){
    gainNode.gain.value=targetvolume;
}
//分析音频
function visualizer(){
    var arr=new Uint8Array(analyser.frequencyBinCount);
    // analyser.getByteFrequencyData(arr);
    
    function show(){
        analyser.getByteFrequencyData(arr);
        draw(arr);
        window.requestAnimationFrame(show);
    };
     window.requestAnimationFrame(show);
};


$("#volume").on('mousedown', function(event) {
    if(!isAnalysis){
        visualizer();
        isAnalysis=true;
    }
    $(this).on('mousemove', function(event) {
        changevolume($(this).val()/100);
    });
});

var canvasHeight;
var canvasWidth;
var canvas=document.createElement("canvas");

var ctx=canvas.getContext("2d");
$('#box').append(canvas);

function draw(arr){
    ctx.clearRect(0,0,width,height)
    var w=width/size;
    for(var i=0;i<size;i++){
        var h=arr[i]/256*height;
        ctx.fillRect(w*i,height-h,w*0.6,h)
    }
}
function reSize(){
    height=$('#box').height();
    width=$('#box').width();
    canvas.height=height;
    canvas.width=width;
    var line=ctx.createLinearGradient(0,0,0,height);
    line.addColorStop(0,"red");
    line.addColorStop(0.5,"yellow");
    line.addColorStop(1,"green");
    ctx.fillStyle=line;
};
reSize()

$(window).resize(function() {
  reSize()
});