<template>
  <div class="box home-sku-sale-stats bgc2">
    <div class="header">
      <div class="title">
        销售统计<span class="sub-title">{{ start }} ~ {{ end }}</span>
      </div>
    </div>
    <div class="body">
      <div class="stats">
        <div class="item">
          <div class="num color3 text-shadow2">
            {{ totalOrderCount }}
          </div>
          <div class="text color4">订单量（个）</div>
        </div>
      </div>
      <div class="stats">
        <div class="item">
          <div class="num color3 text-shadow2">
            {{
              totalMoney > 10000
                ? (totalMoney / 10000).toFixed(2)
                : totalMoney
            }}
          </div>
          <div class="text color4">
            销售额（{{ totalMoney > 10000 ? '万元' : '元' }}）
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { getOrderCollectDto } from "@/api/manage/orderCollect";
import dayjs from 'dayjs';
// 定义变量
const start = dayjs().startOf('month').format('YYYY-MM-DD');
const end = dayjs().endOf('day').format('YYYY-MM-DD');

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    partnerId: null,
    startDate: start,
    endDate: end,
  }
});
const { queryParams } = toRefs(data);

const loading = ref(true)
const totalOrderCount = ref(0)
const totalMoney = ref(0)

/** 统计账单详情 */
async function getDataDetail() {
  loading.value = true;
  try {
    await getOrderCollectDto({
      ...queryParams.value,
      startDate: queryParams.value.startDate,
      endDate: queryParams.value.endDate
    }).then(response => {
      if (response && response.data) {
        totalMoney.value = response.data.totalMoney || 0; // 使用 .value 更新 ref 数据
        totalOrderCount.value = response.data.totalOrderCount || 0;
      } else {
        console.error("接口返回数据异常:", response);
      }
    });
  } catch (error) {
    console.error("获取数据失败:", error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  getDataDetail()
})
</script>
<style lang="scss" scoped>
.home-sku-sale-stats {
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
        display: inline-flex;
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
</style>