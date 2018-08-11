const w : number = window.innerWidth, h : number = window.innerHeight
const nodes : number = 5
class LinkedCircleToSquareStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    lcts : LinkedCTS = new LinkedCTS()
    animator : Animator = new Animator()

    constructor() {
        this.initCanvas()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
        this.lcts.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.lcts.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.lcts.update(() => {
                        this.animator.stop()
                        this.render()
                    })
                })
            })
        }
    }

    static init() {
        const stage : LinkedCircleToSquareStage = new LinkedCircleToSquareStage()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += 0.05 * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {
    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(() => {
                cb()
            }, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class CTSNode {
    state : State = new State()
    next : CTSNode
    prev : CTSNode

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new CTSNode(this.i + 1)
            this.next.prev = this
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    draw(context : CanvasRenderingContext2D) {
        context.lineWidth = Math.min(w, h) / 60
        context.lineCap = 'round'
        context.strokeStyle = '#4CAF50'
        const index : number = this.i % 2
        var sc1 : number = Math.min(0.5, this.state.scale) * 2
        const sc2 : number = Math.min(0.5, Math.max(this.state.scale - 0.5, 0)) * 2
        sc1 = (1 - sc1) * index + (1 - index) * sc1
        const gap : number = w / nodes
        const r : number = gap / 3
        const a : number = r * Math.cos(Math.PI/4)
        context.save()
        context.translate(gap * this.i + gap / 2 + gap * sc2, h/2)
        for(var j = 0; j < 4; j++) {
            context.save()
            context.rotate(Math.PI/2 * j)
            context.beginPath()
            for (var k = 45; k <= 45 + 90; k++) {
                const x = r * Math.cos(k * Math.PI/180), y = a * (1 - sc1) + r * sc1 * Math.sin(k * Math.PI/180)
                if (k == 45) {
                    context.moveTo(x, y)
                } else {
                    context.lineTo(x, y)
                }
            }
            context.stroke()
            context.restore()
        }
        context.restore()
        if (this.next) {
            this.next.draw(context)
        }
    }

    getNext(dir : number, cb : Function) : CTSNode {
        var curr : CTSNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class LinkedCTS {

    curr : CTSNode = new CTSNode(0)
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}
