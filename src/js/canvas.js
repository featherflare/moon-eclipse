import Utils from './utils.js'

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const settings = {
  animate: true,
  duration: 3,
  dimensions: [1080, 1920],
  fps: 36,
}

canvas.width = innerWidth
canvas.height = innerHeight

const mouse = {
  x: innerWidth / 2,
  y: innerHeight / 2,
}

const colors = ['#ffffff', '#000000']

let cols
let rows
let moonRad = 40
cols = (canvas.width / moonRad) * 1.2
rows = (canvas.height / moonRad) * 1.5
let grid = []
let w = canvas.width / cols
let moonOffset = 5

// Compute center
const centerX = canvas.width / 2
const centerY = canvas.height / 2

// Compute max distance (diagonal distance from center to a corner)
const maxDist = Utils.distance(centerX, centerY, 0, 0)

// Create grid positions
for (let i = 0; i < cols; i++) {
  for (let j = 0; j < rows; j++) {
    let x =
      (canvas.width / cols) * i +
      canvas.width / cols / 2 +
      -moonRad / 1 +
      (moonRad / moonOffset) * i
    let y =
      (canvas.height / rows) * j +
      canvas.height / rows / 2 +
      (moonRad / moonOffset) * j

    let offset = j / cols

    let dist = Utils.distance(centerX, centerY, x, y) / maxDist
    offset = dist

    let angle = (Math.atan2(y - centerY, x - centerX) / Math.PI + 1) / 2
    offset = (dist * 1 + angle * 0.5) % 1

    if (j % 2 !== 0) {
      x += moonRad / 2
    }

    let rad = moonRad / 2
    // if (i < canvas.width / moonRad / 2) {
    //   let minimum = moonRad * 0.9
    //   let radOffset = (minimum * i) / (cols / 1.2 / 2)
    //   console.log(minimum, radOffset)

    //   rad = (moonRad - radOffset) / 2
    // } else {
    //   let minimum = moonRad * 0.9
    //   let radOffset = (minimum * (cols / 1.2 - i)) / (cols / 1.2 / 2)
    //   console.log(minimum, radOffset)
    //   rad = (moonRad - radOffset) / 2
    // }

    grid.push({ x, y, rad, offset })
  }
}

// Event Listeners
addEventListener('mousemove', (event) => {
  mouse.x = event.clientX
  mouse.y = event.clientY
})

addEventListener('resize', () => {
  canvas.width = innerWidth
  canvas.height = innerHeight

  init()
})

// Objects
class Moon {
  constructor(x, y, num, rad, offset) {
    this.x = x
    this.y = y
    this.playhead = 1
    this.num = num
    this.rad = rad
    this.offset = offset
  }

  draw() {
    let color1, color2
    this.playhead = (this.playhead + this.offset) % 1
    let p = this.playhead * 2

    if (p < 1) {
      color1 = colors[0]
      color2 = colors[1]
    } else {
      color1 = colors[1]
      color2 = colors[0]
      p = p - 1
    }

    c.save()
    c.translate(this.x, this.y)

    c.fillStyle = color1
    c.beginPath()
    for (let i = 0; i < this.num; i++) {
      let theta = (i / this.num) * 2 * Math.PI
      let x = this.rad * Math.sin(theta)
      let y = this.rad * Math.cos(theta)

      c.lineTo(x, y)
    }
    c.fill()

    c.fillStyle = color2
    c.beginPath()

    p = p * 2 - 1

    for (let i = 0; i < this.num; i++) {
      let theta = (i / this.num) * 2 * Math.PI
      let x = this.rad * Math.sin(theta)
      let y = this.rad * Math.cos(theta)

      if (theta > Math.PI) x *= p
      c.lineTo(x, y)
    }
    c.fill()
    c.closePath()

    c.restore()
  }

  update(playhead) {
    this.playhead = (playhead + this.offset) % 1
    this.draw()
  }
}

// Implementation
let objects

function init() {
  let num = 100

  objects = grid.map(({ x, y, rad, offset }, index) => {
    return new Moon(x, y, num, rad, offset)
  })
}

// Animation Loop
let startTime = null

function animate(time) {
  if (!startTime) startTime = time
  const elapsedTime = (time - startTime) / 1000

  let playhead = (elapsedTime % settings.duration) / settings.duration
  playhead = Utils.ease(playhead)

  c.fillStyle = `rgba(255,255,255,1)`
  c.fillRect(0, 0, canvas.width, canvas.height)

  objects.forEach((object) => {
    object.update(playhead)
  })

  if (settings.animate) {
    requestAnimationFrame(animate) // Continue the animation
  }
}

init()
animate(0)

function startCanvas() {}
export { startCanvas }
