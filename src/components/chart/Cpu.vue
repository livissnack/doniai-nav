<template>
  <div id="app">
    <canvas id="YqOzZGsGMcWzKpWmoWIdwFfiRyteklYx" class="charts"/>
  </div>
</template>

<script>
import uCharts from '@qiun/ucharts'
// uCharts实例对象
var uChartsInstance = {};

export default {
  data() {
    return {

    };
  },
  mounted() {
    this.getServerData();
  },
  methods: {
    getServerData() {
      let res = {
        categories: [{"value":0.2,"color":"#1890ff"},{"value":0.8,"color":"#2fc25b"},{"value":1,"color":"#f04864"}],
        series: [
          {
            data: 0.5
          }
        ]
      }
      this.drawCharts('YqOzZGsGMcWzKpWmoWIdwFfiRyteklYx', res)
    },
    drawCharts(id,data){
      const canvas = document.getElementById(id);
      const ctx = canvas.getContext("2d");
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      uChartsInstance[id] = new uCharts({
        type: "gauge",
        context: ctx,
        width: canvas.width,
        height: canvas.height,
        categories: data.categories,
        series: data.series,
        animation: true,
        background: "#FFFFFF",
        color: ["#1890FF","#91CB74","#FAC858","#EE6666","#73C0DE","#3CA272","#FC8452","#9A60B4","#ea7ccc"],
        padding: undefined,
        title: {
          name: "CPU使用率",
          fontSize: 9,
          color: "#2fc25b",
          offsetY: 0
        },
        extra: {
          gauge: {
            type: "progress",
            width: 20,
            labelColor: "#666666",
            startAngle: 0.75,
            endAngle: 0.25,
            startNumber: 0,
            endNumber: 100,
            labelFormat: "",
            splitLine: {
              fixRadius: -10,
              splitNumber: 10,
              width: 15,
              color: "#FFFFFF",
              childNumber: 5,
              childWidth: 12
            },
          }
        }
      });
    },
  }
}
</script>

<style>

</style>
