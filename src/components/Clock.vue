<template>
  <div class="clock-box">
    <canvas :id="canvasIdVal" class="canvas" :canvas-id="canvasIdVal" width="300" height="300"></canvas>
  </div>
</template>

<script>
export default {
  name: 'Clock',
  props: {
    canvasId: {
      type: Number,
      default: 1
    }
  },
  computed: {
    canvasIdVal() {
      return `canvas${this.canvasId}`
    }
  },
  data() {
    return {
    }
  },
  mounted() {
    this.initClock()
  },
  methods: {
    initClock() {
      const canvasEl = document.getElementById(this.canvasIdVal)
      const ctx = canvasEl.getContext('2d')
      function drawBg() {
        ctx.save()

        ctx.translate(150, 150)
        ctx.fillStyle="#fff"

        ctx.beginPath()
        ctx.arc(0, 0, 130, 0, Math.PI * 2)
        ctx.fill()
        ctx.closePath()

        ctx.restore()
      }

      function drawNumber() {
        ctx.save()

        const numbers = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2]

        ctx.translate(150, 150)
        ctx.font="30px fangsong";

        ctx.textBaseline="middle"
        ctx.textAlign="center"

        for(let i =0; i < numbers.length; i++) {
          ctx.fillText(numbers[i],
              Math.cos(Math.PI / 6 * i) * 100,
              Math.sin(Math.PI / 6 * i) * 100
          )
        }

        ctx.restore()
      }

      function drawCricle() {
        ctx.save()

        ctx.translate(150, 150)

        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.arc(0, 0, 8, 0, Math.PI * 2)
        ctx.fill()
        ctx.closePath()

        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.arc(0, 0, 5, 0, Math.PI * 2)
        ctx.fillStyle = "gray"
        ctx.fill()
        ctx.closePath()

        ctx.restore()
      }

      function drawHands() {
        ctx.save()

        const date = new Date()
        const hours = date.getHours()
        const minutes = date.getMinutes()
        const seconds = date.getSeconds()

        ctx.translate(150, 150)

        ctx.save()
        ctx.beginPath()
        ctx.lineWidth = 5
        ctx.lineCap = 'round'
        ctx.rotate(Math.PI * 2 / 12 * hours + Math.PI * 2 / 12 / 60 * minutes + Math.PI * 2 / 12 / 60 / 60 * seconds)
        ctx.moveTo(0, 0)
        ctx.lineTo(0, -50)
        ctx.stroke()
        ctx.closePath()
        ctx.restore()

        ctx.save()
        ctx.beginPath()
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.rotate(Math.PI * 2 / 60 * minutes + Math.PI * 2 / 60 / 60 * seconds)
        ctx.moveTo(0, 0)
        ctx.lineTo(0, -65)
        ctx.stroke()
        ctx.closePath()
        ctx.restore()

        ctx.save()
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.rotate(Math.PI * 2 / 60 * seconds)
        ctx.strokeStyle="#f00"
        ctx.lineCap = 'round'
        ctx.lineTo(0, -85)
        ctx.stroke()
        ctx.closePath()
        ctx.restore()

        ctx.restore()
      }

      function drawHourScale() {
        ctx.save()

        ctx.translate(150, 150)

        for(let i = 0; i < 12; i++) {
          ctx.rotate(Math.PI * 2 / 12)
          ctx.beginPath()
          ctx.lineWidth = 3
          ctx.moveTo(0, -130)
          ctx.lineTo(0, -122)
          ctx.stroke()
          ctx.closePath()
        }

        ctx.restore()
      }

      function drawMinuteScale() {
        ctx.save()

        ctx.translate(150, 150)

        for(let i = 0; i < 60; i++) {
          ctx.rotate(Math.PI * 2 / 60)
          ctx.beginPath()
          ctx.moveTo(0, -130)
          ctx.lineTo(0, -125)
          ctx.stroke()
          ctx.closePath()
        }

        ctx.restore()
      }

      function draw() {
        ctx.clearRect(0, 0, 300, 300)

        drawBg()
        drawNumber()
        drawHands()
        drawCricle()
        drawHourScale()
        drawMinuteScale()

        requestAnimationFrame(draw)
      }
      draw()
    },
  }
}
</script>

<style lang="less" scoped>
.clock-box {
  width: 300px;
  height: 300px;
  background-color: black;
  border-radius: 50px;
}
</style>
