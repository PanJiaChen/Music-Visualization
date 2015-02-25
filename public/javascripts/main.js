var musicList=$("#list");
var source=null;
var xhr = new XMLHttpRequest();
var count=0;
window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;//兼容游览器
var audioContext=new window.AudioContext();
var gainNode=audioContext[audioContext.createGain?"createGain":"createGainNode"]();
gainNode.connect(audioContext.destination);
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
            bufferSource.connect(gainNode);//将source和context's destination连接 相当于扬声器
            bufferSource[bufferSource.start?"start":"noteOn"](0);//noteOn兼容老版本
            source=bufferSource;

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
$("#volume").on('mousedown', function(event) {
    $(this).on('mousemove', function(event) {
        changevolume($(this).val()/100);
    });
    
});
