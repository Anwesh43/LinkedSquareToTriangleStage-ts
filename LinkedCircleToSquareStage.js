var w = window.innerWidth, h = window.innerHeight;
var nodes = 5;
var LinkedCircleToSquareStage = (function () {
    function LinkedCircleToSquareStage() {
        this.canvas = document.createElement('canvas');
        this.lcts = new LinkedCTS();
        this.animator = new Animator();
        this.initCanvas();
    }
    LinkedCircleToSquareStage.prototype.initCanvas = function () {
        this.canvas.width = w;
        this.canvas.height = h;
        this.context = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
    };
    LinkedCircleToSquareStage.prototype.render = function () {
        this.context.fillStyle = '#212121';
        this.context.fillRect(0, 0, w, h);
        this.lcts.draw(this.context);
    };
    LinkedCircleToSquareStage.prototype.handleTap = function () {
        var _this = this;
        this.canvas.onmousedown = function () {
            _this.lcts.startUpdating(function () {
                _this.animator.start(function () {
                    _this.render();
                    _this.lcts.update(function () {
                        _this.animator.stop();
                        _this.render();
                    });
                });
            });
        };
    };
    LinkedCircleToSquareStage.init = function () {
        var stage = new LinkedCircleToSquareStage();
        stage.render();
        stage.handleTap();
    };
    return LinkedCircleToSquareStage;
})();
var State = (function () {
    function State() {
        this.scale = 0;
        this.dir = 0;
        this.prevScale = 0;
    }
    State.prototype.update = function (cb) {
        this.scale += 0.05 * this.dir;
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir;
            this.dir = 0;
            this.prevScale = this.scale;
            cb();
        }
    };
    State.prototype.startUpdating = function (cb) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale;
            cb();
        }
    };
    return State;
})();
var Animator = (function () {
    function Animator() {
        this.animated = false;
    }
    Animator.prototype.start = function (cb) {
        if (!this.animated) {
            this.animated = true;
            this.interval = setInterval(function () {
                cb();
            }, 50);
        }
    };
    Animator.prototype.stop = function () {
        if (this.animated) {
            this.animated = false;
            clearInterval(this.interval);
        }
    };
    return Animator;
})();
var CTSNode = (function () {
    function CTSNode(i) {
        this.i = i;
        this.state = new State();
        this.addNeighbor();
    }
    CTSNode.prototype.addNeighbor = function () {
        if (this.i < nodes - 1) {
            this.next = new CTSNode(this.i + 1);
            this.next.prev = this;
        }
    };
    CTSNode.prototype.update = function (cb) {
        this.state.update(cb);
    };
    CTSNode.prototype.startUpdating = function (cb) {
        this.state.startUpdating(cb);
    };
    CTSNode.prototype.draw = function (context) {
        context.lineWidth = Math.min(w, h) / 60;
        context.lineCap = 'round';
        context.strokeStyle = '#4CAF50';
        var index = this.i % 2;
        var sc1 = Math.min(0.5, this.state.scale) * 2;
        var sc2 = Math.min(0.5, Math.max(this.state.scale - 0.5, 0)) * 2;
        sc1 = (1 - sc1) * index + (1 - index) * sc1;
        var gap = w / nodes;
        var r = gap / 3;
        var a = r * Math.cos(Math.PI / 4);
        context.save();
        context.translate(gap * this.i + gap / 2 + gap * sc2, h / 2);
        for (var j = 0; j < 4; j++) {
            context.save();
            context.rotate(Math.PI / 2 * j);
            context.beginPath();
            for (var k = 45; k <= 45 + 90; k++) {
                var x = r * Math.cos(k * Math.PI / 180), y = a * (1 - sc1) + r * sc1 * Math.sin(k * Math.PI / 180);
                if (k == 45) {
                    context.moveTo(x, y);
                }
                else {
                    context.lineTo(x, y);
                }
            }
            context.stroke();
            context.restore();
        }
        context.restore();
        if (this.next) {
            this.next.draw(context);
        }
    };
    CTSNode.prototype.getNext = function (dir, cb) {
        var curr = this.prev;
        if (dir == 1) {
            curr = this.next;
        }
        if (curr) {
            return curr;
        }
        cb();
        return this;
    };
    return CTSNode;
})();
var LinkedCTS = (function () {
    function LinkedCTS() {
        this.curr = new CTSNode(0);
        this.dir = 1;
    }
    LinkedCTS.prototype.draw = function (context) {
        this.curr.draw(context);
    };
    LinkedCTS.prototype.update = function (cb) {
        var _this = this;
        this.curr.update(function () {
            _this.curr = _this.curr.getNext(_this.dir, function () {
                _this.dir *= -1;
            });
            cb();
        });
    };
    LinkedCTS.prototype.startUpdating = function (cb) {
        this.curr.startUpdating(cb);
    };
    return LinkedCTS;
})();
