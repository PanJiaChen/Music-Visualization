var size      = 64;
var canvasHeight;
var canvasWidth;
var canvas    = document.createElement("canvas");
var ctx       = canvas.getContext("2d");
var line;
var dots      = [];
var colorList = ["gold","cyan","magenta"];
$('#box').append(canvas);

//初始化MusicVisualizer
var mv = new MusicVisualizer({
    size: size,
    visualizer: draw
})

/************************************************************************/
/* 3d*/
var scene=new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
render = new THREE.WebGLRenderer({antialias: true});
render.setSize(window.canvasWidth, window.canvasHeight);
document.body.appendChild(render.domElement);
var MWIDTH = 2;
var MTHICKNESS = 1;
var GAP = 1;
var METERNUM = Math.round(100 / (this.MWIDTH + this.GAP)); // calculated by 200/(MWIDTH+GAP),200 is the width of the visualizer area
//创建绿色柱条的形状
var cubeGeometry = new THREE.CubeGeometry(MWIDTH, 1, MTHICKNESS);
//创建绿色柱条的材质
var cubeMaterial = new THREE.MeshPhongMaterial({
    color: 0x01FF00,
    ambient: 0x01FF00,
    specular: 0x01FF00,
    shininess: 20,
    reflectivity: 5.5
});
//创建白色盖子的形状
var capGeometry = new THREE.CubeGeometry(MWIDTH, 0.5, MTHICKNESS);
//创建白色盖子的材质
var capMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    ambient: 0x01FF00,
    specular: 0x01FF00,
    shininess: 20,
    reflectivity: 5.5
});

//创建一字排开的柱条和盖子，并添加到场景中
for (var i = METERNUM - 1; i >= 0; i--) {
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.x = -45 + (MWIDTH + GAP) * i;
    cube.position.y = -1;
    cube.position.z = 0.5;
    cube.castShadow = true;
    cube.name = 'cube' + i;
    scene.add(cube);
    var cap = new THREE.Mesh(capGeometry, capMaterial);
    cap.position.x = -45 + (MWIDTH + GAP) * i;
    cap.position.y = 0.5;
    cap.position.z = 0.5;
    cap.castShadow = true;
    cap.name = 'cap' + i;
    scene.add(cap);
};
 var renderAnimation = function() {
    if (mv.analyser) {
        var array = new Uint8Array(mv.analyser.frequencyBinCount);
        mv.analyser.getByteFrequencyData(array);
        var step = Math.round(array.length / METERNUM);
        for (var i = 0; i < METERNUM; i++) {
            var value = array[i * step] / 4;
            value = value < 1 ? 1 : value;
            var meter = scene.getObjectByName('cube' + i, true),
                cap = scene.getObjectByName('cap' + i, true);
            meter.scale.y = value;
            //计算柱条边沿尺寸以获得高度
            meter.geometry.computeBoundingBox();
            height = (meter.geometry.boundingBox.max.y - meter.geometry.boundingBox.min.y) * value;
            //将柱条高度与盖子高度进行比较
            if (height / 2 > cap.position.y) {
                cap.position.y = height / 2;
            } else {
                cap.position.y -= controls.dropSpeed;
            };
        }
    };
    //重新渲染画面
    render.render(scene, camera);
    requestAnimationFrame(renderAnimation);
};
requestAnimationFrame(renderAnimation);
/************************************************************************/





//选择歌曲
$("#list").on("click", "li", function() {
    $(".loading").show();
    $(this).siblings().removeClass('selected');
    $(this).addClass('selected');
    mv.play('media/' + $(this).attr('title'));
})

//变化音量
$("#volume").on('mousedown', function(event) {
    $(this).on('mousemove', function(event) {
        mv.changeVolume($(this).val() / 100);
    });
});

//随机函数 整数
function random(min, max) {
        min = min || 0;
        max = max || 1;
        return max >= min ? Math.round(Math.random()*(max - min) + min) : 0;
}
// //随机函数 带小数
// function randomFloat(min, max) {
//         min = min || 0;
//         max = max || 1;
//         return max >= min ? (Math.random()*(max - min) + min).toFixed(1) : 0;
// }
//随机生成点
function getDots() {
    dots = []
    for (var i = 0; i < size; i++) {
        var x = random(0, width);
        var y = random(0, height);
        var color = colorList[random(0,colorList.length-1)];
        var shadowBlur = Math.floor(Math.random() * 30) + 15;
        var alpha = random(0,1);
        dots.push({
            x: x,
            y: y,
            dx:random(1,2),
            color: color,
            cap:0,
            shadowBlur:shadowBlur,
            alpha:alpha
        });
    }
}

draw.type = "column"; //初始化draw的类型
function draw(arr) {
    ctx.clearRect(0, 0, width, height);
     
    if (draw.type == 'column') {

        line.addColorStop(0, "gold");
        line.addColorStop(0.5, "cyan");
        line.addColorStop(1, "magenta");
        ctx.fillStyle = line;
        ctx.shadowBlur = 0;
        var w = width / size;
        var cw=w*0.6;
        var capH=cw>10?cw:10;
        for (var i = 0; i < size; i++) {
            ctx.beginPath();
            var h = arr[i] / 256 * height;
            var o = dots[i];
            ctx.fillRect(w * i, height - h, cw, h);
            ctx.fillRect(w * i, height - o.cap-capH, cw, capH);
            ctx.closePath();
            o.cap--;
            if(o.cap<0){
                o.cap=0;
            }
            if(h>0&&o.cap<(h+40)){
                o.cap=h+40>height-capH?height-capH:h+40;
            }
        }
    } else if(draw.type == 'dot') {
        for (var i = 0; i < size; i++) {
            ctx.beginPath();
            var o = dots[i];
            var r = 10+arr[i] / 256 * (height>width?width:height)/10;
            ctx.arc(o.x, o.y, r, 0, Math.PI * 2, true);
            // var circle = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
            // circle.addColorStop(0, "#fff");
            // circle.addColorStop(1, o.color);
            ctx.fillStyle = 'rgba(255,255,255,' + o.alpha + ')';
            ctx.fill();
            ctx.shadowBlur = o.shadowBlur;
            ctx.shadowColor = o.color;
            o.x+=o.dx;
            o.x=o.x>width?0:o.x;
            ctx.closePath();
        }
    }

}

//选择可视化的类型
$('#typeList').on("click", "li", function() {
    $(this).siblings().removeClass('selected');
    $(this).addClass('selected');
    draw.type = $(this).attr('data-type');
})

function reSize() {
    height = $('#box').height();
    width = $('#box').width();
    canvas.height = height;
    canvas.width = width;
    line = ctx.createLinearGradient(0, 0, 0, height);

    getDots();
};
reSize()

$(window).resize(function() {
    reSize()
});

//移动端
$(document).ready(function(){
    prepareForMobile();
});

function prepareForMobile(){
    if (window.screen.availWidth<500) {
       size=16;
    };
}