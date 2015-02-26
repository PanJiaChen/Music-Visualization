var size = 64;
var canvasHeight;
var canvasWidth;
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
var line;
var dots = [];

$('#box').append(canvas);

//初始化MusicVisualizer
var mv = new MusicVisualizer({
    size: size,
    visualizer: draw
})

//选择歌曲
$("#list").on("click", "li", function() {
    $(this).siblings().removeClass('selected');
    $(this).addClass('selected');
    mv.play('media/' + $(this).attr('title'));
})

//变化音量
$("#volume").on('mousedown', function(event) {
    $(this).on('mousemove', function(event) {
        mv.changevolume($(this).val() / 100);
    });
});

//随机函数
function random(min, max) {
        return Math.round(Math.random() * (max - min) + min);
    }
    //随机生成点
function getDots() {
    dots = [];
    for (var i = 0; i < size; i++) {
        var x = random(0, width);
        var y = random(0, height);
        var color = "rgba(" + random(0, 255) + "," + random(0, 255) + "," + random(0, 255) +","+ 0.5+")";
        dots.push({
            x: x,
            y: y,
            dx:random(1,2),
            color: color,
            cap:0
        });
    }
}

draw.type = "column"; //初始化draw的类型
function draw(arr) {
    ctx.clearRect(0, 0, width, height);
     
    if (draw.type == 'column') {
        line.addColorStop(0, "red");
        line.addColorStop(0.5, "yellow");
        line.addColorStop(1, "green");
        ctx.fillStyle = line;
        var w = width / size;
        var cw=w*0.6;
        var capH=cw>10?cw:10;
        for (var i = 0; i < size; i++) {
            var h = arr[i] / 256 * height;
            var o = dots[i];
            ctx.fillRect(w * i, height - h, cw, h);
            ctx.fillRect(w * i, height - o.cap-capH, cw, capH);
            o.cap--;
            if(o.cap<0){
                o.cap=0;
            }
            if(h>0&&o.cap<(h+40)){
                o.cap=h+40>height-capH?height-capH:h+40;
            }
        }
    } else {
        for (var i = 0; i < size; i++) {
            ctx.beginPath();
            var o = dots[i];
            var r = 10+arr[i] / 256 * (height>width?width:height)/10;
            ctx.arc(o.x, o.y, r, 0, Math.PI * 2, true);
            var circle = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
            circle.addColorStop(0, "#fff");
            circle.addColorStop(1, o.color);
            ctx.fillStyle = circle;
            ctx.fill();
            o.x+=o.dx;
            o.x=o.x>width?0:o.x;
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
