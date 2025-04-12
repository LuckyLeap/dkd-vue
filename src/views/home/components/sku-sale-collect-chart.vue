<template>
  <div class="box sku-sale-collect">
    <div class="header">
      <div class="title">
        销售数据<span class="sub-title"
          >{{ datePickerFormat[0] }} ~ {{ datePickerFormat[1] }}</span
        >
      </div>
    </div>
    <div class="charts">
      <sku-sale-collect-line-chart
        id="amount-collect"
        title="销售额趋势图"
        :chart-option="lineChartOption"
      />
      <sku-sale-collect-bar-chart
        id="region-collect"
        title="销售额分布"
        :chart-option="barChartOption"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import dayjs from 'dayjs';
import SkuSaleCollectLineChart from './sku-sale-collect-line-chart.vue';
import SkuSaleCollectBarChart from './sku-sale-collect-bar-chart.vue';
import { getOrdersStatistics, getRegionReportOrders } from '@/api/manage/report';

const datePickerFormat = ref([]);
const radioGroupSel = ref('week');

const lineChartOption = ref({
  xAxisData: [],
  seriesData: [],
  yAxisName: '单位：元',
});

const barChartOption = ref({
  xAxisData: [],
  seriesData: [],
  yAxisName: '单位：元',
});

let isDestroying = false;

// 获取图表数据
const fetchChartData = async (begin, end) => {
  if (isDestroying) return;

  try {
    const [ordersResponse, regionResponse] = await Promise.allSettled([
      getOrdersStatistics({ 
        begin: dayjs(begin).format('YYYY-MM-DD'),
        end: dayjs(end).format('YYYY-MM-DD')
      }),
      getRegionReportOrders({
        begin: dayjs(begin).format('YYYY-MM-DD'),
        end: dayjs(end).format('YYYY-MM-DD')
      })
    ]);

    const ordersData = ordersResponse.status === 'fulfilled' ? ordersResponse.value.data : {};
    const regionData = regionResponse.status === 'fulfilled' ? regionResponse.value.data : {};

    lineChartOption.value = {
      xAxisData: ordersData.dateList?.split?.(',') || [],
      seriesData: (ordersData.orderMoneyList?.split?.(',') || []).map(v => Number(v) || 0),
      yAxisName: '单位：元'
    };

    barChartOption.value = {
      xAxisData: regionData.nameList?.split?.(',') || [],
      seriesData: (regionData.moneyList?.split?.(',') || []).map(v => Number(v) || 0),
      yAxisName: '单位：元'
    };
  } catch (error) {
    console.error('数据获取失败:', error);
  }
};

// 处理日期选择变化
const handleRadioGroupSelChange = async (radioGroup) => {
  if (isDestroying) return;

  radioGroupSel.value = radioGroup;
  const begin = dayjs().startOf(radioGroup);
  const end = dayjs().endOf('day');
  
  datePickerFormat.value = [
    begin.format('YYYY.MM.DD'),
    end.format('YYYY.MM.DD')
  ];

  await fetchChartData(begin.toDate(), end.toDate());
};

onMounted(() => {
  handleRadioGroupSelChange(radioGroupSel.value);
});

onBeforeUnmount(() => {
  isDestroying = true;
});
</script>

<style lang="scss" scoped>
.sku-sale-collect {
  display: flex;
  flex-direction: column;
  height: calc((100vh - 120px) * 0.45);
  min-height: 400px;
  margin-top: 20px;
  background: #FFFFFF;
  border-radius: 20px;

  .charts {
    flex: 1;
    display: flex;
    gap: 15px;
    
    > div {
      flex: 1;
      min-width: 0;
    }
  }
}

.echarts-tooltip {
  max-width: 300px !important;
  white-space: pre-wrap !important;
  word-break: break-all !important;
}

.echarts-axis-label {
  line-height: 1.5;
}
</style>