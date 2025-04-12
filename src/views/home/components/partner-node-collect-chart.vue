<template>
  <div class="box partner-node-collect">
    <div class="header">
      <div class="title">合作商点位数Top5</div>
      <svg-icon name="more" class="more" @click="handleMoreClick" />
    </div>
    <el-row :gutter="20" type="flex" align="middle" class="body">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">数据加载中...</div>
      
      <!-- 数据展示 -->
      <template v-else>
        <el-col :span="17">
          <partner-node-collect-pie-chart 
            :chart-option="pieChartOption" 
            :key="chartKey"
          />
        </el-col>
        <el-col :span="7">
          <div class="collect">
            <div class="count">
              {{ nodeSum }}
            </div>
            <div class="name">点位数</div>
            <div class="count count2">
              {{ partnerSum }}
            </div>
            <div class="name">合作商数</div>
          </div>
        </el-col>
      </template>
    </el-row>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { getPartnerTop5 } from '@/api/manage/report'
import PartnerNodeCollectPieChart from './partner-node-collect-pie-chart.vue'

// 响应式数据
const pieChartOption = ref({ seriesData: [] })
const partnerSum = ref(0)
const nodeSum = ref(0)
const loading = ref(true)
const chartKey = ref(0) // 用于强制刷新图表组件

// 获取数据
const fetchData = async () => {
  try {
    loading.value = true
    const { data } = await getPartnerTop5()

    // 处理饼图数据
    const names = data.nameList?.split(',') || []
    const counts = data.countList?.split(',') || []
    
    pieChartOption.value.seriesData = names.map((name, index) => ({
      name: name.trim(),
      value: parseInt(counts[index] || 0)
    })).slice(0, 5) // 确保最多5条数据

    // 更新统计数字
    partnerSum.value = data.partnerSum || 0
    nodeSum.value = data.nodeSum || 0

    // 强制刷新图表组件
    chartKey.value++

  } catch (error) {
    console.error('获取合作商数据失败:', error)
    pieChartOption.value.seriesData = []
    partnerSum.value = 0
    nodeSum.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>
<style scoped>
.loading-container {
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 16px;
}

.partner-node-collect {
  display: flex;
  flex-direction: column;
  height: calc(40vh - 48px);
  min-height: 353px;
  background: #fff;
  border-radius: 20px
}

.partner-node-collect .body{
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1
}

.partner-node-collect .body .chart{
    padding-top: 16px
}

.partner-node-collect .body .collect{
    width: 154px;
    height: 230px;
    padding-top: 47px;
    padding-left: 38px;
    background: linear-gradient(135deg,transparent,#f8f8f9 0) 0 0,linear-gradient(-135deg,transparent 12px,#f8f8f9 0) 100% 0,linear-gradient(-45deg,transparent,#f8f8f9 0) 100% 100%,linear-gradient(45deg,transparent 12px,#f8f8f9 0) 0 100%;
    background-size: 50% 50%;
    background-repeat: no-repeat
}

.partner-node-collect .body .collect .count{
    height: 33px;
    font-size: 24px;
    font-family: PingFangSC-Semibold,PingFang SC;
    font-weight: 600;
    color: #072074;
    line-height: 33px
}

.partner-node-collect .body .collect .count2{
    margin-top: 20px
}

.partner-node-collect .body .collect .name{
    height: 17px;
    margin-top: 6px;
    font-size: 12px;
    font-family: PingFangSC-Regular,PingFang SC;
    font-weight: 400;
    color: #000412;
    line-height: 17px
}

.partner-node-collect .more {
    color: #5f84ff;
    cursor: pointer
}
</style>