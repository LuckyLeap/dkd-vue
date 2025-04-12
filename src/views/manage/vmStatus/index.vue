<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="设备编号" prop="innerCode">
        <el-input
          v-model="queryParams.innerCode"
          placeholder="请输入设备编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="vmList" @selection-change="handleSelectionChange">
      <el-table-column label="序号" type="index" width="55" align="center" />
      <el-table-column label="设备编号" align="center" prop="innerCode" />
      <el-table-column label="设备型号" align="center" prop="vmTypeId">
        <template #default="scope">
          <span>{{ getVmTypeName(scope.row.vmTypeId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="详细地址" align="left" prop="addr" show-overflow-tooltip />
      <el-table-column label="运营状态" align="center" prop="vmStatus">
        <template #default="scope">
          <dict-tag :options="vm_status" :value="scope.row.vmStatus" />
        </template>
      </el-table-column>
      <el-table-column label="设备状态" align="center" prop="runningStatus">
        <template #default="scope">
          {{ scope.row.runningStatus ? (JSON.parse(scope.row.runningStatus).status ? '正常' : '异常') : '异常' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" @click="getVmInfo(scope.row)" v-hasPermi="['manage:vm:query']">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-descriptions title="设备状态" :column="2" border>
        <el-descriptions-item label="运营状态">
          <dict-tag :options="vm_status" :value="form.vmStatus" />
        </el-descriptions-item>
        <el-descriptions-item label="设备状态">
          {{ form.runningStatus ? (JSON.parse(form.runningStatus).status ? '正常' : '异常') : '异常' }}
        </el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <el-descriptions title="运营信息" :column="2" border>
        <el-descriptions-item label="销售量">{{ form.salesCount || 100 }}</el-descriptions-item>
        <el-descriptions-item label="销售额">{{ form.amount || 500 }}</el-descriptions-item>
        <el-descriptions-item label="补货次数">{{ form.supplyCount || 10 }}</el-descriptions-item>
        <el-descriptions-item label="维修次数">{{ form.repairCount || 3 }}</el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <div class="sales-header">
        <span class="title">商品销量（月）</span>
        <el-button 
          type="primary" 
          @click="goToChannelManagement(form.innerCode)"
          v-hasPermi="['manage:channel:edit']"
        >
          查看货道
        </el-button>
      </div>

      <el-table :data="salesData" v-loading="salesLoading">
        <el-table-column prop="name" label="商品名称" align="center" />
        <el-table-column prop="sales" label="销量" align="center">
          <template #default="{ row }">
            <span :class="{ 'low-sales': isLowSales(row.sales, row.skuId) }">
              {{ row.sales }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 新增调整货道对话框 -->
    <el-dialog title="查看货道" v-model="adjustChannelOpen" width="600px" append-to-body>
      <el-table :data="channelData" v-loading="channelLoading">
        <el-table-column prop="channelCode" label="货道编号" align="center" />
        <el-table-column prop="sku.skuName" label="商品" align="center" />
        <el-table-column prop="currentCapacity" label="当前容量" align="center" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup name="Vm">
import { listVm, getVm } from "@/api/manage/vm";
import { listVmType } from "@/api/manage/vmType";
import { listByInnerCode } from "@/api/manage/channel";
import { ref, reactive, toRefs, getCurrentInstance } from "vue";

const { proxy } = getCurrentInstance();
const { vm_status } = proxy.useDict('vm_status');

// 响应式数据
const vmList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const title = ref("");
const salesData = ref([]);
const lowSalesSkus = ref(new Set());
const salesLoading = ref(false);
const adjustChannelOpen = ref(false);
const channelData = ref([]);
const channelLoading = ref(false);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    innerCode: null,
  },
});

const { queryParams, form } = toRefs(data);

/** 查询设备管理列表 */
function getList() {
  loading.value = true;
  listVm(queryParams.value).then(response => {
    vmList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 查看详情按钮操作 */
function getVmInfo(row) {
  const _id = row.id;
  getVm(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "设备详情";

    // 获取货道销售数据
    salesLoading.value = true;
    listByInnerCode(form.value.innerCode)
      .then(res => {
        processSalesData(res.data);
      })
      .finally(() => {
        salesLoading.value = false;
      });
  });
}

/** 查询设备类型列表 */
const vmTypeList = ref([]);
function getVmTypeList() {
  listVmType({}).then(response => {
    vmTypeList.value = response.rows;
  });
}
getVmTypeList();

// 获取设备型号名称
function getVmTypeName(vmTypeId) {
  const item = vmTypeList.value.find(item => item.id === vmTypeId);
  return item ? item.name : '';
}

// 处理销售数据
function processSalesData(channels) {
  const salesMap = new Map();

  channels.forEach(channel => {
    const skuId = channel.skuId;
    if (!skuId) return;

    const skuName = channel.sku?.skuName || `商品${skuId}`;
    const sales = (salesMap.get(skuId)?.sales || 0) + (channel.sales || 0);

    salesMap.set(skuId, { skuId, name: skuName, sales });
  });

  salesData.value = Array.from(salesMap.values()).sort((a, b) => b.sales - a.sales);

  // 取销量最低的2个商品
  const sortedBySales = [...salesData.value].sort((a, b) => a.sales - b.sales);
  const lowestTwo = sortedBySales.slice(0, 2);
  lowSalesSkus.value = new Set(lowestTwo.map(item => item.skuId));
}

// 判断是否低销量
function isLowSales(sales, skuId) {
  return lowSalesSkus.value.has(skuId);
}

// 跳转货道管理
function goToChannelManagement(innerCode) {
  channelLoading.value = true;
  listByInnerCode(innerCode)
    .then(res => {
      channelData.value = res.data;
      adjustChannelOpen.value = true;
    })
    .finally(() => channelLoading.value = false);
}

getList();
</script>

<style scoped>
.sales-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.title {
  font-size: 16px;
  font-weight: bold;
}

.low-sales {
  color: #ff4d4f;
  font-weight: 500;
}
</style>