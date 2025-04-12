<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="订单编号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="创建时间" style="width: 308px">
        <el-date-picker
          v-model="dateRange"
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

    <el-table v-loading="loading" :data="orderList" @selection-change="handleSelectionChange">
      <el-table-column label="序号" type="index" align="center" width="80" />
      <el-table-column label="订单编号" align="center" prop="orderNo" show-overflow-tooltip />
      <el-table-column label="商品名称" align="center" prop="skuName" />
      <el-table-column label="订单状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag v-if="scope.row && scope.row.status" :options="order_status" :value="scope.row.status" />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="订单金额" align="center" prop="price">
        <template #default="scope">
          ¥{{ (scope.row && (scope.row.price * scope.row.amount) ? (scope.row.price * scope.row.amount) : 0).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column label="订单时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span v-if="scope.row && scope.row.createTime">{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button v-if="scope.row" link type="primary" @click="handleUpdate(scope.row)" v-hasPermi="['manage:order:query']">查看详情</el-button>
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

    <!-- 查看详情对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="orderRef" :model="form" label-width="120px">
        <!-- 订单基础信息 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单编号：" prop="orderNo">
              <el-tag>{{ form.orderNo || '无' }}</el-tag>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品名称：" prop="skuName">
              <span>{{ form.skuName || '无' }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 金额与状态 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单金额：" prop="price">
              <span>¥{{ (form.amount * form.price || 0).toFixed(2) }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单状态：" prop="status">
              <dict-tag v-if="form.status !== ''" :options="order_status" :value="form.status" />
              <span v-else>-</span>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 设备信息 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备编号：" prop="innerCode">
              <span>{{ form.innerCode || '无' }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备位置：" prop="addr">
              <span>{{ form.addr || '无' }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 时间信息 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="创建时间：" prop="createTime">
              <span>{{ parseTime(form.createTime) }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="更新时间：" prop="updateTime">
              <span>{{ parseTime(form.updateTime) }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 支付信息 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="支付方式：" prop="payType">
              <dict-tag v-if="form.payType !== ''" :options="order_pay_type" :value="form.payType" />
              <span v-else>-</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="交易单号：" prop="thirdNo">
              <span>{{ form.thirdNo || '无' }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="操作：">
              <el-button 
                v-if="form.status === 0" 
                type="danger" 
                @click="handleCancelOrder"
              >取消订单</el-button>
              <el-button 
                v-if="form.payStatus === 1 && form.status === 1" 
                type="warning" 
                @click="handleRefund"
              >申请退款</el-button>
              <el-button 
                v-if="form.payStatus === 2" 
                type="info" 
                @click="handleCancelRefund"
              >撤销退款</el-button>
              <!-- 如果没有按钮，则显示“无” -->
              <span v-if="showNoButton">无</span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Order">
import { listOrder, cancelOrder, applyRefund, cancelRefund } from "@/api/manage/order";
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, getCurrentInstance, computed } from 'vue';

const { proxy } = getCurrentInstance();
const { order_status, order_pay_type } = proxy.useDict('order_status', 'order_pay_type');

const orderList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);

const form = ref({
  orderNo: '',
  skuName: '',
  amount: 0,
  price: 0,
  status: '',
  payStatus: '',
  payType: '',
  innerCode: '',
  addr: '',
  createTime: '',
  uploadTime: '',
  thirdNo: '',
});

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  orderNo: null,
  status: null,
  payStatus: null,
  beginTime: null,
  endTime: null,
});

/** 查询订单列表 */
function getList() {
  loading.value = true;
  listOrder(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    console.log('Fetched order list:', response.rows);
    orderList.value = response.rows || [];
    total.value = response.total;
    loading.value = false;
  }).catch(() => {
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    orderNo: '',
    skuName: '',
    amount: 0,
    price: 0,
    status: '',
    payStatus: '',
    payType: '',
    innerCode: '',
    addr: '',
    createTime: '',
    uploadTime: '',
    thirdNo: '',
  };
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 订单详情 */
function handleUpdate(row) {
  reset();
  listOrder({ orderId: row.id }).then(response => {
    form.value = response.rows[0] || {};
    open.value = true;
  });
}

// 取消订单操作
function handleCancelOrder() {
  ElMessageBox.confirm('确认要取消该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    cancelOrder(form.value.id).then(() => {
      ElMessage.success('取消成功');
      getList();
      open.value = false;
    });
  }).catch(() => {});
}

// 申请退款操作
function handleRefund() {
  ElMessageBox.confirm('确认要申请退款吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    applyRefund(form.value.id).then(() => {
      ElMessage.success('退款申请已提交');
      getList();
      open.value = false;
    });
  }).catch(() => {});
}

// 撤销退款操作
function handleCancelRefund() {
  ElMessageBox.confirm('确认要撤销退款申请吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    cancelRefund(form.value.id).then(() => {
      ElMessage.success('退款申请已撤销');
      getList();
      open.value = false;
    });
  }).catch(() => {});
}

const showNoButton = computed(() => {
  return !(
    form.value.status === 0 ||
    (form.value.payStatus === 1 && form.value.status === 1) ||
    form.value.payStatus === 2
  );
});

getList();
</script>