<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="合作商" prop="partnerId">
        <el-select v-model="queryParams.partnerId" placeholder="请选择合作商" clearable>
          <el-option
            v-for="item in partnerList"
            :key="item.id"
            :label="item.partnerName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="日期" style="width: 308px">
        <el-date-picker
          v-model="daterange"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="body">
      <div class="stats">
        <div class="item">
          <div class="text color2">总销售额</div>
          <div class="num color1 text-shadow1">
            {{ orderCollectData.totalMoney }}
          </div>
        </div>
      </div>
      <div class="stats">
        <div class="item">
          <div class="text color2">总订单量</div>
          <div class="num color1 text-shadow1">
            {{ orderCollectData.totalOrderCount }}
          </div>
        </div>
      </div>
      <div class="stats">
        <div class="item">
          <div class="text color2">总分成金额</div>
          <div class="num color1 text-shadow1">
            {{ orderCollectData.totalBill }}
          </div>
        </div>
      </div>
    </div>

    <el-table v-loading="loading" :data="orderCollectList">
      <el-table-column label="日期" align="center" prop="orderDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.orderDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="合作商" align="center" prop="partnerName" />
      <el-table-column label="分成比例" align="center" prop="ratio" />
      <el-table-column label="收入（元）" align="center" prop="orderTotalMoney" />
      <el-table-column label="订单数" align="center" prop="orderCount" />
      <el-table-column label="分成金额" align="center" prop="totalBill" />
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>
<script setup name="OrderCollect">
import { onMounted, reactive, toRefs, ref } from "vue";
import { listOrderCollect, getOrderCollectDto } from "@/api/manage/orderCollect";
import { listPartner } from "@/api/manage/partner";
import { loadAllParams } from "@/api/page";

const orderCollectList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const daterange = ref([]);

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    partnerId: null,
    startDate: null,
    endDate: null,
  }
});

const orderCollectData = reactive({
  totalMoney: 0,
  totalOrderCount: 0,
  totalBill: 0
});

const { queryParams } = toRefs(data);

/** 查询对帐统计列表 */
async function getList() {
  loading.value = true;
  listOrderCollect({
    ...queryParams.value,
    startDate: queryParams.value.startDate,
    endDate: queryParams.value.endDate
  }).then(response => {
    orderCollectList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 统计在条件下的账单详情 */
async function getDataDetail() {
  getOrderCollectDto({
    ...queryParams.value,
    startDate: queryParams.value.startDate,
    endDate: queryParams.value.endDate
  }).then(response => {
    orderCollectData.totalMoney = response.data.totalMoney;
    orderCollectData.totalOrderCount = response.data.totalOrderCount;
    orderCollectData.totalBill = response.data.totalBill;
    loading.value = false;
  });
}

// 表单重置
function reset() {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    partnerId: null,
    startDate: null,
    endDate: null,
  };
}

/** 搜索按钮操作 */
function handleQuery() {
  // 绑定日期范围到查询参数
  if (daterange.value && daterange.value.length === 2) {
    queryParams.value.startDate = daterange.value[0];
    queryParams.value.endDate = daterange.value[1];
  } else {
    queryParams.value.startDate = null;
    queryParams.value.endDate = null;
  }
  queryParams.value.pageNum = 1;
  getList();
  getDataDetail();
}

/** 重置按钮操作 */
function resetQuery() {
  daterange.value = []; // 清空日期选择器
  reset();
  handleQuery();
}

/** 查询合作商列表 */
const partnerList = ref([]);
function getPartnerList() {
  listPartner(loadAllParams).then(response => {
    partnerList.value = response.rows;
  });
}
getPartnerList();

onMounted(() => {
  getList()
  getDataDetail()
})
</script>
<style lang="scss" scoped>
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

        .text-shadow1 {
          text-shadow: 2px 4px 7px rgba(85, 132, 255, 0.5);
        }
      }
    }
  }
</style>