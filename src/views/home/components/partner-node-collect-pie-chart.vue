<template>
  <div id="chartTop" ref="EcharRef" class="monitorContainer"></div>
</template>

<script setup>
import * as echarts from 'echarts'
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  chartOption: {
    type: Object,
    default: () => ({ seriesData: [] })
  }
})

const EcharRef = ref(null)
let myChart = null

// 监听数据变化
watch(() => props.chartOption, (newVal) => {
  initChart()
}, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (myChart) {
    myChart.dispose()
  }
})

const initChart = () => {
  if (myChart) myChart.dispose()
  
  myChart = echarts.init(EcharRef.value)
  setOption()
}

const handleResize = () => {
  if (myChart) {
    myChart.resize()
  }
}

const setOption = () => {
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}<br />点位数：{c}',
      backgroundColor: '#FFFFFF',
      borderColor: '#eef3f8',
      borderWidth: 1,
      textStyle: {
        color: '#8C8C8C',
      },
      padding: 12,
    },
    label: {
      formatter: ['{name|{b}}', '{value|{c}个}'].join('\n'),
      rich: {
        name: {
          color: '#333333',
          fontWeight: 'bolder',
          align: 'left',
          fontSize: 12
        },
        value: {
          color: '#666',
          lineHeight: 15,
          align: 'left',
          fontSize: 12
        },
      },
    },
    labelLine: {
      lineStyle: {
        color: '#BFBFBF',
      },
      length: 10,  // 调整连接线长度
    },
    series: [{
      type: 'pie',
      roseType: 'radius',
      radius: [33, 100],
      center: ['50%', '50%'],
      data: props.chartOption.seriesData,
      animationEasing: 'cubicInOut',
      animationDuration: 2600,
      itemStyle: {
        borderRadius: 5,  // 添加圆角
        borderColor: '#fff',
        borderWidth: 2
      }
    }],
    color: ['#85A7FF', '#99EBBD', '#FFB18B', '#C6EBFF', '#BECCE6'],
  }
  
  myChart.setOption(option)
}
</script>