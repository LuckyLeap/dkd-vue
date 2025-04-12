<template>
  <div class="chart">
    <div 
      :id="id"
      class="monitorContainer"
      :style="{ height: calculateChartHeight() }"
    />
    <empty-data-chart 
      :is-empty="isEmpty"
    />
  </div>
</template>

<script setup>
import * as echarts from 'echarts';
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';

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
    default: '销售额分布'
  }
});

const myChart = ref(null);
const axisColor = ref('#D9D9D9');
const axisColor2 = ref('#999999');
const itemStyleColor = ref('#91B0FF');

const isMounted = ref(false);
const isDestroying = ref(false);

const isEmpty = computed(() => {
  return props.chartOption?.xAxisData !== undefined && 
         props.chartOption.xAxisData.length === 0;
});

const cleanupChart = () => {
  if (myChart.value) {
    try {
      myChart.value.dispose();
      myChart.value = null;
    } catch (error) {
      console.error('图表销毁失败:', error);
    }
  }
};

const initChart = () => {
  if (isDestroying.value || !isMounted.value) return;
  
  cleanupChart();
  
  const chartDom = document.getElementById(props.id);
  if (!chartDom) return;
  
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
      // 增加节流处理
      clearTimeout(resizeTimer);
      const resizeTimer = setTimeout(() => {
        myChart.value.resize({
          width: 'auto',
          height: 'auto',
          animation: { duration: 300 }
        });
      }, 200);
    } catch (error) {
      console.error('图表调整大小失败:', error);
    }
  }
};

const setOption = (optionData) => {
  if (!myChart.value || isDestroying.value || !isMounted.value) {
    console.warn('跳过图表更新: 组件未挂载或已销毁');
    return;
  }

  try {
    const safeData = {
      xAxisData: Array.isArray(optionData?.xAxisData) ? optionData.xAxisData : [],
      seriesData: Array.isArray(optionData?.seriesData) ? optionData.seriesData : [],
      yAxisName: optionData?.yAxisName || ''
    };

    if (safeData.xAxisData.length === 0 || safeData.seriesData.length === 0) {
      myChart.value.clear();
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
        left: '33',
        right: '30',
        top: '60',
        bottom: '5',
        containLabel: true
      },
      tooltip: {
        formatter: (params) => {
          const originalValue = params[0].axisValue; // 原始数据
          const value = params[0].value;
          return `销售额：${value}<br />${originalValue}`;
        }
      },
      xAxis: {
        type: 'category',
        data: safeData.xAxisData,
        axisLabel: {
          interval: 0,
          rotate: 30,
          fontSize: 12,
          formatter: (value) => {
            // 截取前3个字符
            const maxLength = 3;
            return value.length > maxLength ? 
              `${value.slice(0, maxLength)}...` : 
              value;
          }
        }
      },
      grid: {
        left: '3%',
        right: '3%',
        top: '15%',
        bottom: '15%', // 增加底部空间
        containLabel: true
      },
      yAxis: {
        type: 'value',
        name: safeData.yAxisName,
        nameTextStyle: { color: axisColor2.value },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: axisColor2.value },
        splitLine: { lineStyle: { color: axisColor.value } }
      },
      series: [
        {
          type: 'bar',
          data: safeData.seriesData,
          itemStyle: {
            color: itemStyleColor.value,
            barBorderRadius: [4, 4, 0, 0]
          },
          barWidth: 14,
          barGap: '100%',
          label: {
            show: true,
            position: 'top',
            color: '#333',
            formatter: '{c}'
          }
        }
      ]
    };

    myChart.value.setOption(option, {
      replaceMerge: ['series', 'xAxis', 'yAxis'],
      notMerge: true
    });
  } catch (error) {
    console.error('图表更新失败:', error);
  }
};

onMounted(() => {
  isMounted.value = true;
  initChart();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  isDestroying.value = true;
  window.removeEventListener('resize', handleResize);
  cleanupChart();
  isMounted.value = false;
});

watch(
  () => props.chartOption,
  (newVal) => {
    if (isMounted.value && !isDestroying.value) {
      console.log('图表数据更新:', newVal);
      setOption(newVal);
    } else {
      console.warn('跳过图表数据更新: 组件未挂载或已销毁');
    }
  },
  { deep: true }
);

// 在组件中添加
const calculateChartHeight = () => {
  const baseHeight = 400;
  const itemCount = props.chartOption.xAxisData.length;
  return `${Math.max(baseHeight, itemCount * 45)}px`; // 根据数据项动态计算高度
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

.show {
  visibility: visible;
}

.hidden {
  visibility: hidden;
}
</style>