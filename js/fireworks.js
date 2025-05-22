// 初始化烟花特效的函数
function initfirework() {

    // 更新鼠标或触摸点的坐标
    function updateCoords(e) {
        pointerX = (e.clientX || e.touches[0].clientX) - canvasEl.getBoundingClientRect().left,
            pointerY = e.clientY || e.touches[0].clientY - canvasEl.getBoundingClientRect().top
    }

    // 设置粒子的运动方向
    function setParticuleDirection(e) {
        var t = anime.random(0, 360) * Math.PI / 180  // 随机角度
            , a = anime.random(50, 180)  // 随机距离
            , n = [-1, 1][anime.random(0, 1)] * a;  // 随机正负方向
        return {
            x: e.x + n * Math.cos(t),  // 计算x方向的位置
            y: e.y + n * Math.sin(t)  // 计算y方向的位置
        }
    }

    // 创建单个粒子
    // 创建单个粒子
    function createParticule(e, t) {
    var a = {};
    return a.x = e,
        a.y = t,
        a.color = colors[anime.random(0, colors.length - 1)],  // 随机颜色
        a.radius = anime.random(4, 8),  // 随机半径
        a.endPos = setParticuleDirection(a),  // 粒子的最终位置
        a.alpha = 1,  // 初始透明度
        a.draw = function () {  // 绘制对称的四角星形状
            ctx.globalAlpha = a.alpha;
            ctx.beginPath();
            var outerRadius = a.radius;
            var innerRadius = outerRadius * 0.5;  // 内部尖角的长度
            var spikes = 4;  // 四角星的尖角数量
            var rot = Math.PI / 2 * 3;  // 旋转角度，使星形对称
            var step = Math.PI / spikes;  // 每个尖角之间的角度

            ctx.moveTo(a.x, a.y);  // 从中心点开始
            for (var i = 0; i < spikes * 3; i++) {
                var radius = i % 2 === 0 ? outerRadius : innerRadius;
                var angle = rot + i * step;
                var x = a.x + radius * Math.cos(angle);
                var y = a.y - radius * Math.sin(angle);
                ctx.lineTo(x, y);
            }
            ctx.closePath();

            ctx.fillStyle = a.color;
            ctx.fill();
            ctx.globalAlpha = 1;  // 恢复透明度以便其他绘制操作
        },
        a
}

    // 渲染粒子
    function renderParticule(e) {
        for (var t = 0; t < e.animatables.length; t++)
            e.animatables[t].target.draw()
    }

    // 动画效果
    function animateParticules(e, t) {
        // 创建1到10个粒子
        var numberOfStars = anime.random(1, 5);
        var n = [];
        for (var i = 0; i < numberOfStars; i++) {
            var star = createParticule(e, t);
            n.push(star);
        }
        
        // 创建时间线动画
        anime.timeline().add({
            targets: n,
            x: function (e) {
                return e.endPos.x  // 粒子的最终x位置
            },
            y: function (e) {
                return e.endPos.y  // 粒子的最终y位置
            },
            alpha: {
                value: 0,  // 透明度变化
                easing: "linear",
                duration: anime.random(1000, 2000)  // 随机持续时间
            },
            duration: anime.random(1200, 1800),  // 随机持续时间
            easing: "easeOutExpo",  // 缓动效果
            update: renderParticule  // 更新渲染
        })
    }

    // 防抖函数，优化性能
    function debounce(fn, delay) {
        var timer
        return function () {
            var context = this
            var args = arguments
            clearTimeout(timer)
            timer = setTimeout(function () {
                fn.apply(context, args)
            }, delay)
        }
    }

    // 创建canvas元素
    var div = document.createElement('canvas');
    div.className = 'fireworks';
    div.style="position:fixed;left:0;top:0;z-index:99999999;pointer-events:none;"

    // 将canvas添加到body中
    document.body.appendChild(div);

    var canvasEl = document.querySelector(".fireworks");
    if (canvasEl) {
        var ctx = canvasEl.getContext("2d")  // 获取canvas绘图上下文
            , numberOfParticules = 30  // 粒子数量
            , pointerX = 0  // 鼠标x坐标
            , pointerY = 0  // 鼠标y坐标
            , tap = "mousedown"  // 点击事件类型
            , colors = [ "#FFFFFF","#000000", "#FFFFFF", "#000000"] // 烟花颜色数组
            , setCanvasSize = debounce(function () {  // 动态调整canvas尺寸
                canvasEl.width = 2 * window.innerWidth,
                    canvasEl.height = 2 * window.innerHeight,
                    canvasEl.style.width = window.innerWidth + "px",
                    canvasEl.style.height = window.innerHeight + "px",
                    canvasEl.getContext("2d").scale(2, 2)
            }, 500)
            , render = anime({  // 渲染循环
                duration: 1 / 0,
                update: function () {
                    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)  // 清空画布
                }
            });

        // 添加点击事件监听器
        document.addEventListener(tap, function (e) {
            "sidebar" !== e.target.id && "toggle-sidebar" !== e.target.nodeName && "A" !== e.target.nodeName && "IMG" !== e.target.nodeName && (render.play(),
                updateCoords(e),
                animateParticules(pointerX, pointerY))  // 触发烟花动画
        }, !1),
            setCanvasSize(),  // 初始化画布尺寸
            window.addEventListener("resize", setCanvasSize, !1)  // 监听窗口大小变化
    }
}

// 确保DOM加载完成后初始化特效
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initfirework);
}
else {
    initfirework() // DOMContentLoaded 已经发生
}