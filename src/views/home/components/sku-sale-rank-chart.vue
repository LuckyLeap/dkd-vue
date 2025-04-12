<template>
  <div class="box bgc3 sku-sale-rank">
    <div class="header">
      <div class="title">
        商品热榜<span class="sub-title">{{ start }} ~ {{ end }}</span>
      </div>
    </div>
    <div class="body">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">加载中...</div>
      
      <!-- 数据展示 -->
      <template v-else>
        <!-- 数据为空提示 -->
        <div v-if="skuSaleRank.length === 0" class="empty-data">
          暂无销售数据
        </div>
        
        <!-- 数据列表 -->
        <el-row v-for="(item, index) in skuSaleRank" :key="index">
          <el-col :span="5">
            <div :class="'top top' + (index + 1)">
              {{ index + 1 }}
            </div>
          </el-col>
          <el-col :span="13">
            <div class="sku-name" :title="item.skuName">
              {{ item.skuName }}
            </div>
          </el-col>
          <el-col :span="6">
            <div class="count">{{ item.count }}单</div>
          </el-col>
        </el-row>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import { getSalesTop10 } from '@/api/manage/report'

// 响应式数据
const skuSaleRank = ref([])
const loading = ref(true)
const start = ref('')
const end = ref('')

// 获取数据
const fetchData = async () => {
  try {
    loading.value = true
    // 设置日期范围（最近30天）
    const beginDate = dayjs().subtract(30, 'day').format('YYYY-MM-DD')
    const endDate = dayjs().format('YYYY-MM-DD')
    
    // 调用API
    const { data } = await getSalesTop10({ 
      begin: beginDate,
      end: endDate
    })

    // 转换数据格式
    const names = data.nameList?.split(',') || []
    const counts = data.numberList?.split(',') || []
    
    // 合并为对象数组
    skuSaleRank.value = names.map((name, index) => ({
      skuName: name.trim(),
      count: parseInt(counts[index] || 0)
    })).slice(0, 10) // 确保最多10条

    // 设置显示日期
    start.value = dayjs(beginDate).format('YYYY.MM.DD')
    end.value = dayjs(endDate).format('YYYY.MM.DD')
    
  } catch (error) {
    console.error('获取销量TOP10失败:', error)
    skuSaleRank.value = [] // 清空数据
  } finally {
    loading.value = false
  }
}

// 生命周期钩子
onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.loading-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}

.empty-data {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
  font-size: 16px;
}

@import '@/assets/styles/variables.module.scss';

.sku-sale-rank {
  display: flex;
  flex-direction: column;
  height: calc((100vh - 120px) * 0.6);
  min-height: 538px;
  background: #FFFFFF;
  border-radius: 20px;

  .body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-top: 20px;

    .top {
      display: inline-block;
      width: 16px;
      height: 20px;
      margin-left: 10px;
      background: url('@/assets/user-task-stats/top.png');
      text-align: center;
      font-size: 12px;
      font-weight: normal;
      color: $--color-text-primary;
      line-height: 14px;
    }

    .top1 {
      width: 21px;
      height: 20px;
      background: url('@/assets/user-task-stats/top1.png');
      color: #8E5900;
    }

    .top2 {
      width: 21px;
      height: 20px;
      background: url('@/assets/user-task-stats/top2.png');
      color: #494949;
    }

    .top3 {
      width: 21px;
      height: 20px;
      background: url('@/assets/user-task-stats/top3.png');
      color: #CF6D3D;
    }

    .sku-name {
      height: 20px;
      font-size: 14px;
      font-weight: 500;
      color: $--color-text-primary;
      line-height: 20px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .count {
      height: 20px;
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #737589;
      line-height: 20px;
      text-align: right;
    }
  }
}
</style>