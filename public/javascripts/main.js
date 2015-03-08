var size      = 64;
var height = $('#box').height();
var width = $('#box').width();
var canvasHeight;
var canvasWidth;
var canvas    = document.createElement("canvas");
var ctx       = canvas.getContext("2d");
var line;
var dots      = [];
var colorList = ["gold","cyan","magenta"];
$('#box').append(canvas);



/************************************************************************/
/* 3d*/
function init3D(){}
    var scene=new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    render = new THREE.WebGLRenderer({antialias: true});
    render.setSize(width, height);
   
    var _3dWidth= 4;
    var MTHICKNESS = 1;
    var gap = 1;
    var METERNUM = Math.round(100 / (this._3dWidth + this.gap)); // calculated by 200/(_3dWidth+gap),200 is the width of the visualizer area
    //创建绿色柱条的形状
    var cubeGeometry = new THREE.CubeGeometry(_3dWidth, 1, MTHICKNESS);
    //创建绿色柱条的材质
    var cubeMaterial = new THREE.MeshPhongMaterial({
            color: "cyan",
            ambient: "cyan",
            specular: "cyan",
            shininess: 20,
            reflectivity: 5.5
        });
    //创建白色盖子的形状
    var capGeometry = new THREE.CubeGeometry(_3dWidth, 0.5, MTHICKNESS);
    //创建白色盖子的材质
    var capMaterial = new THREE.MeshPhongMaterial({
            color: "magenta",
            ambient: "magenta",
            specular: "magenta",
            shininess: 20,
            reflectivity: 5.5
        });
    var spotLight = new THREE.SpotLight(0xffffff);
    var ambientLight = new THREE.AmbientLight(0x0c0c0c);
    //控制
    orbitControls = new THREE.OrbitControls(camera);
    orbitControls.minDistance = 50;
    orbitControls.maxDistance = 200;
    orbitControls.maxPolarAngle = 1.5;
    orbitControls.noPan = true;
    clock = new THREE.Clock();
    for (var i = 32; i >= 0; i--) {
            var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
            cube.position.x =-80+(_3dWidth + gap) * i;
            cube.position.y = -1;
            cube.position.z = 0.5;
            cube.castShadow = true;
            cube.name = 'cube' + i;
            scene.add(cube);
            var cap = new THREE.Mesh(capGeometry, capMaterial);
            cap.position.x =  -80+(_3dWidth + gap) * i;
            cap.position.y = 0.5;
            cap.position.z = 0.5;
            cap.castShadow = true;
            cap.name = 'cap' + i;
            scene.add(cap);  
            //the camera
            camera.position.x = 0;
            camera.position.y = 10;
            camera.position.z = 100;
            camera.lookAt(scene.position);
            //add an ambient light for a better look
            scene.add(ambientLight);
            //the spot light
            spotLight.position.set(0, 60, 40);
            //spotLight.castShadow = true;
            scene.add(spotLight);
            var directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
            directionalLight.castShadow = true;
            directionalLight.position.set(0, 10, 10);
            scene.add(directionalLight); 
    };
    render.render(scene, camera);
  


/************************************************************************/
//初始化MusicVisualizer
var mv = new MusicVisualizer({
    size: size,
    visualizer: draw,
    scene:scene,
    camera:camera,
    clock:clock

})





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
            ctx.fillStyle = 'rgba(255,255,255,' + o.alpha + ')';
            ctx.fill();
            ctx.shadowBlur = o.shadowBlur;
            ctx.shadowColor = o.color;
            o.x+=o.dx;
            o.x=o.x>width?0:o.x;
            ctx.closePath();
        }
    }else if(draw.type == '3D'){
       var step = Math.round(arr / size);
       var delta=this.clock.getDelta();
        for (var i = 0; i < METERNUM; i++) {
            var value = arr[i] / 4;
            value = value < 1 ? 1 : value;
            var meter = this.scene.getObjectByName('cube' + i, true),
                cap = this.scene.getObjectByName('cap' + i, true);
            meter.scale.y = value;
            //计算柱条边沿尺寸以获得高度
            meter.geometry.computeBoundingBox();
            height = (meter.geometry.boundingBox.max.y - meter.geometry.boundingBox.min.y) * value;
            if (height / 2 > cap.position.y) {
                cap.position.y = (height / 2-0.5)>0?(height / 2-0.5):0.5;
            } else {
                cap.position.y -= 0.1;
            };

        } 
    render.render(this.scene, this.camera);
    }

}

//选择可视化的类型
$('#typeList').on("click", "li", function() {
    $(this).siblings().removeClass('selected');
    $(this).addClass('selected');
    draw.type = $(this).attr('data-type');
    if(draw.type=="3D"){
        $('#box').empty().append(render.domElement);
    }else{
        reSize();
        $('#box').empty().append(canvas);
    }
})

function reSize() {
    height = $('#box').height();
    width = $('#box').width();
    canvas.height = height;
    canvas.width = width;
    line = ctx.createLinearGradient(0, 0, 0, height);

    getDots();
    init3D();
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
//添加本地文件
$('#add').on('click',function(){
    $('#loadMusic').click();
})
$("#loadMusic").on('change',function(){
    var file=this.files[0];
    var fr=new FileReader();
    fr.onload=function(e){
        mv.play(e.target.result);
    }
    fr.readAsArrayBuffer(file);
    $(".play")&&($('.play').className='')
})