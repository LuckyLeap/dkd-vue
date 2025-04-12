<template>
  <div class="chart">
    <div
      :id="id"
      class="monitorContainer"
      :style="{ height: chartHeight }"
    />
    <empty-data-chart :is-empty="chartOption.xAxisData.length === 0" />
  </div>
</template>

<script setup>
import * as echarts from 'echarts';
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  chartOption: {
    type: Object,
    required: true,
    default: () => ({
      xAxisData: [],
      seriesData: [],
      yAxisName: ''
    })
  },
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: '销售额趋势图'
  }
});

const myChart = ref(null);
const chartHeight = ref('400px');
const axisStyleColor1 = ref('#D9D9D9');
const axisStyleColor2 = ref('#999999');
const lineStyleColor = ref('#FF5757');
const areaStyleColor = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
  { offset: 0, color: 'rgba(255, 87, 87, 0.5)' },
  { offset: 0.3, color: 'rgba(255, 169, 169, 0.3)' },
  { offset: 1, color: 'rgba(255, 169, 169, 0)' }
]);

const isDestroying = ref(false);
let resizeTimer = null; // 提升 resizeTimer 到组件级别

watch(() => props.chartOption, (newVal) => {
  if (!Array.isArray(newVal.xAxisData) || !Array.isArray(newVal.seriesData)) {
    console.error('chartOption 数据格式错误:', newVal);
    return;
  }
  if (!isDestroying.value && myChart.value) {
    setOption(newVal);
  } else {
    console.warn('跳过图表更新: 组件未挂载或已销毁');
  }
}, { deep: true });

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  isDestroying.value = true;
  window.removeEventListener('resize', handleResize);
  if (myChart.value) {
    try {
      myChart.value.dispose();
    } catch (error) {
      console.error('图表销毁失败:', error);
    }
    myChart.value = null;
  }
  clearTimeout(resizeTimer); // 清理 resize 定时器
});

const initChart = () => {
  const chartDom = document.getElementById(props.id);
  if (!chartDom) {
    console.error('图表容器不存在:', props.id);
    return;
  }

  try {
    myChart.value = echarts.init(chartDom);
    setOption(props.chartOption);
  } catch (error) {
    console.error('图表初始化失败:', error);
  }
};

const handleResize = () => {
  if (myChart.value && !isDestroying.value) {
    try {
      // 节流处理
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (myChart.value) {
          myChart.value.resize({
            width: 'auto',
            height: 'auto',
            animation: { duration: 300 }
          });
        }
      }, 200);
    } catch (error) {
      console.error('图表调整大小失败:', error);
    }
  }
};

const setOption = (optionData) => {
  if (!myChart.value || isDestroying.value) {
    console.warn('跳过图表更新: 组件未挂载或已销毁');
    return;
  }

  try {
    const xAxisData = Array.isArray(optionData?.xAxisData) ? optionData.xAxisData : [];
    const safeSeriesData = Array.isArray(optionData?.seriesData) ? optionData.seriesData : [];

    // 统一空数据处理逻辑
    if (xAxisData.length === 0 || safeSeriesData.length === 0) {
      myChart.value.setOption({
        title: { text: props.title },
        xAxis: { data: [] },
        yAxis: {},
        series: []
      }, true); // 使用 notMerge: true 完全替换配置
      return;
    }

    const option = {
      title: {
        text: props.title,
        left: 'center',
        top: '10',
        textStyle: {
          color: '#333333',
          fontWeight: 'bolder',
          fontSize: 14
        }
      },
      grid: {
        left: '5%',
        right: '5%',
        top: '18%',
        bottom: '15%',
        containLabel: true
      },
      tooltip: {
        formatter: (params) => {
          if (!params || params.length === 0) {
            return '';
          }
          const originalValue = params[0].axisValue; // 获取原始数据
          const value = params[0].value;
          return `销售额：${value}<br />${originalValue}`;
        }
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          align: 'center',
          color: axisStyleColor2.value,
          rotate: 45,
          fontSize: 12,
          margin: 15,
          formatter: (value) => {
            // 日期格式化处理
            if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
              return value.slice(5); // 截取 MM-DD
            }
            return value.length > 6 ? `${value.slice(0, 6)}...` : value;
          }
        }
      },
      yAxis: {
        type: 'value',
        name: optionData.yAxisName || '',
        nameTextStyle: {
          color: axisStyleColor2.value
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: axisStyleColor2.value
        },
        splitLine: {
          lineStyle: {
            color: axisStyleColor1.value
          }
        }
      },
      series: [
        {
          type: 'line', // 明确指定类型
          data: safeSeriesData,
          smooth: true,
          lineStyle: {
            color: lineStyleColor.value,
            width: 3,
            shadowColor: 'rgba(222, 115, 127, 0.23)',
            shadowBlur: 10,
            shadowOffsetY: 8
          },
          areaStyle: {
            color: areaStyleColor
          },
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: lineStyleColor.value,
            borderColor: '#fff',
            borderWidth: 2
          }
        }
      ]
    };

    myChart.value.setOption(option, {
      notMerge: true // 确保完全替换旧配置
    });
  } catch (error) {
    console.error('图表更新失败:', error);
  }
};
</script>

<style lang="scss" scoped>
.chart {
  position: relative;
  width: 100%;
  height: 100%;
}

.monitorContainer {
  width: 100%;
  height: 100%;
}
</style>