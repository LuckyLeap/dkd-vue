<template>
  <div class="box home-user-task-stats bgc1">
    <div class="header">
      <div class="title">
        工单统计<span class="sub-title">{{ start }} ~ {{ end }}</span>
      </div>
    </div>
    <div class="body">
      <div class="stats">
        <div class="item">
          <div class="num color1 text-shadow1">
            {{ totalSum }}
          </div>
          <div class="text color2">工单总数（个）</div>
        </div>
      </div>
      <div class="stats">
        <div class="item">
          <div class="num color1 text-shadow1">
            {{ totalFinish }}
          </div>
          <div class="text color2">完成工单（个）</div>
        </div>
      </div>
      <div class="stats">
        <div class="item">
          <div class="num color1 text-shadow1">
            {{ totalProgress }}
          </div>
          <div class="text color2">进行工单（个）</div>
        </div>
      </div>
      <div class="stats">
        <div class="item">
          <div class="num color1 text-shadow1">
            {{ totalCancel }}
          </div>
          <div class="text color2">取消工单（个）</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { listCollect } from "@/api/manage/collect"
import { listEmp } from "@/api/manage/emp"
import dayjs from 'dayjs';

//获取 当前日期所在月份的第一天 和 所在天的最后一时刻
const start = dayjs().startOf('month').format('YYYY.MM.DD');
const end = dayjs().endOf('day').format('YYYY.MM.DD');

const loading = ref(true)
const collectList = ref([])
const totalFinish = ref(0)
const totalProgress = ref(0)
const totalCancel = ref(0)
const totalSum = ref(0)

/** 获取统计列表 */
async function getList() {
  loading.value = true;
  try {
    // 1. 获取所有用户信息
    const empRes = await listEmp({
      pageSize: 1000
    });
    
    if (empRes.rows.length === 0) {
      collectList.value = [];
      return;
    }

    // 2. 构建用户ID到用户信息的映射表
    const empMap = new Map(empRes.rows.map(e => [e.id, e]));
    const userIds = [...empMap.keys()];

    // 3. 获取这些用户的统计数据
    const collectRes = await listCollect({
      userIds: userIds.join(','),
      pageSize: 1000
    });

    // 4. 计算统计总数
    totalFinish.value = 0;
    totalProgress.value = 0;
    totalCancel.value = 0;
    
    collectRes.rows.forEach(item => {
      totalFinish.value += item.finishCountY || 0;
      totalProgress.value += item.progressCountY || 0;
      totalCancel.value += item.cancelCountY || 0;
    });
    
    totalSum.value = totalFinish.value + totalProgress.value + totalCancel.value;
    
  } catch (error) {
    console.error("获取数据失败:", error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  getList()
})
</script>
<style lang="scss" scoped>
.home-user-task-stats {
  display: flex;
  flex-direction: column;
  height: calc((100vh - 120px) * 0.2);
  min-height: 166px;
  background: #E9F3FF;
  border-radius: 20px;

  .body {
    flex: 1;
    display: flex;

    .stats {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;

      .item {
        display: inline-flex; // 关键点
        flex-direction: column;

        .num {
          height: 50px;
          font-size: 36px;
          font-family: PingFangSC-Semibold, PingFang SC;
          font-weight: 600;
          line-height: 50px;
          text-shadow: 2px 4px 7px rgba(85, 132, 255, 0.5);
        }

        .text {
          height: 17px;
          margin-top: 3px;
          font-size: 12px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #91a7dc;
          line-height: 17px;
        }

        .color1 {
          color: #072074;
        }

        .color2 {
          color: #91a7dc;
        }

        .color3 {
          color: #ff5757;
        }

        .color4 {
          color: #de9690;
        }

        .text-shadow1 {
          text-shadow: 2px 4px 7px rgba(85, 132, 255, 0.5);
        }

        .text-shadow2 {
          text-shadow: 2px 4px 7px rgba(255, 99, 85, 0.5);
        }
      }
    }
  }
}

.bgc1 {
  background: #E9F3FF;
  background-image: url('@/assets/images/circle.png'), url('@/assets/images/task.png');
  background-repeat: no-repeat, no-repeat;
  background-position: 0 0, calc(100% - 12px) 100%;
}

.bgc2 {
  background: #FBEFE8 url('@/assets/images/sale.png') no-repeat calc(100% - 12px) 100%;
}
</style>