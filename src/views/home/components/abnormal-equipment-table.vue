<template>
  <div class="box abnormal-equipment">
    <div class="header">
      <div class="title">异常设备监控</div>
      <el-icon @click="handleMore"><MoreFilled /></el-icon>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading"><Loading /></el-icon>
      数据加载中...
    </div>

    <!-- 数据展示 -->
    <template v-else>
      <el-scrollbar v-if="listData.length" class="scrollbar body">
        <el-table
          :data="listData"
          fit
          highlight-current-row
          style="width: 100%"
          :header-cell-style="{
            padding: '7px 0 6px',
            background: '#EFF0F2',
            'font-weight': '400',
            'text-align': 'left',
            color: '#333333',
          }"
          :cell-style="{
            padding: '15px 0',
            'text-align': 'left',
            color: '#999999',
          }"
        >
          <el-table-column label="故障时间" width="160px">
            <template #default="scope">
              <span>{{ formatTime(scope.row.updateTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="设备地址" show-overflow-tooltip>
            <template #default="scope">
              <span>{{ scope.row.addr }}</span>
            </template>
          </el-table-column>
          <el-table-column label="设备编号" width="120px">
            <template #default="scope">
              <span>{{ scope.row.innerCode }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-scrollbar>
      
      <!-- 空数据提示 -->
      <div v-else class="empty">
        <img src="@/assets/images/empty.png" />
        <div class="tips">暂无异常设备数据</div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAbnormalDeviceMonitoring } from '@/api/manage/report'
import { Loading, MoreFilled } from '@element-plus/icons-vue'

const router = useRouter()
const listData = ref([])
const loading = ref(true)

// 格式化时间显示
const formatTime = (timeString) => {
  try {
    return new Date(timeString).toLocaleString().replace(/\//g, '-')
  } catch {
    return timeString // 保持原始格式
  }
}

// 获取数据
const fetchData = async () => {
  try {
    loading.value = true
    const { data } = await getAbnormalDeviceMonitoring()

    // 转换数据格式
    const timeList = data.updateTimeList?.split(',') || []
    const codeList = data.innerCodeList?.split(',') || []
    const addrList = data.addrList?.split(',') || []

    // 合并数据并截取前4条
    listData.value = timeList.map((time, index) => ({
      updateTime: time.trim(),
      innerCode: codeList[index]?.trim() || '未知编号',
      addr: addrList[index]?.trim() || '未知地址'
    })).slice(0, 4) // 最多显示4条

  } catch (error) {
    console.error('获取异常设备数据失败:', error)
    listData.value = []
  } finally {
    loading.value = false
  }
}

// 点击更多
const handleMore = () => {
  router.push({ path: 'vm/vmStatus' })
}

// 生命周期钩子
onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.module.scss';

.abnormal-equipment {
  display: flex;
  flex-direction: column;
  height: calc((100vh - 120px) * 0.4);
  min-height: 353px;
  background: #ffffff;
  border-radius: 20px;

  .loading-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: $--color-primary;
    
    .is-loading {
      animation: rotating 2s linear infinite;
      margin-bottom: 8px;
      font-size: 24px;
    }
  }

  .more {
    color: $--color-primary;
    cursor: pointer;
  }

  .empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .tips {
      margin-top: 25px;
      color: #20232a;
      font-size: 14px;
    }
  }

  .body {
    flex: 1;
    margin-top: 20px;
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>