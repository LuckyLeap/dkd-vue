<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="人员搜索" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入人员名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <el-form-item label="角色筛选" prop="roleCode">
        <el-radio-group v-model="queryParams.roleCode" @change="handleQuery">
          <el-radio-button
            v-for="role in roleOptions"
            :key="role.value"
            :label="role.value"
          >{{ role.label }}</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮和工单统计 -->
    <div class="operation-stats">
      <el-button
        type="primary"
        plain
        icon="Plus"
        @click="handleAdd"
        v-hasPermi="['manage:collect:add']"
      >新增</el-button>
      <div class="work-order-stats">
        工单统计列表<span class="sub-title">{{ start }} ~ {{ end }}</span>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="collectList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="50" align="center" />
      <el-table-column label="人员名称" align="center" prop="emp.userName" />
      <el-table-column label="角色" align="center" prop="emp.roleName" />
      <el-table-column label="联系电话" align="center" prop="emp.mobile" />
      <el-table-column label="完成数（本月）" align="center" prop="finishCount" />
      <el-table-column label="进行中（本月）" align="center" prop="progressCount" />
      <el-table-column label="取消数（本月）" align="center" prop="cancelCount" />
      <el-table-column label="操作" align="center" width="120">
        <template #default="scope">
          <el-button link type="primary" @click="handleDetail(scope.row)" 
            v-hasPermi="['manage:collect:query']">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 新增/修改对话框 -->
    <el-dialog :title="title" v-model="open" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="选择人员" prop="userId">
          <div class="emp-info-wrapper">
            <el-button type="primary" @click="showEmpDialog = true">
              <span class="emp-name">{{ form.emp ? form.emp.userName : '选择人员' }}</span>
            </el-button>
            <div v-if="form.emp" class="emp-detail">
              <span class="role-icon">🔖</span>
              <span class="role-name">{{ form.emp.roleName }}</span>
              <span class="divider">|</span>
              <span class="phone-icon">📱</span>
              <span class="phone-number">{{ form.emp.mobile }}</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="完成数" prop="finishCount">
          <el-input-number v-model="form.finishCount" :min="0" controls-position="right" />
        </el-form-item>

        <el-form-item label="进行中" prop="progressCount">
          <el-input-number v-model="form.progressCount" :min="0" controls-position="right" />
        </el-form-item>

        <el-form-item label="取消数" prop="cancelCount">
          <el-input-number v-model="form.cancelCount" :min="0" controls-position="right" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 人员选择对话框 -->
    <el-dialog title="选择人员" v-model="showEmpDialog" width="800px">
      <el-table
        v-loading="empLoading"
        :data="empData"
        @row-click="handleEmpSelect"
        highlight-current-row
      >
        <el-table-column property="userName" label="姓名" width="120" />
        <el-table-column property="roleName" label="角色" width="120" />
        <el-table-column property="mobile" label="电话" width="150" />
        <el-table-column property="regionName" label="区域" />
      </el-table>
      <pagination
        v-show="empTotal > 0"
        :total="empTotal"
        v-model:page="empQuery.pageNum"
        v-model:limit="empQuery.pageSize"
        @pagination="getEmpList"
      />
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog title="工单统计详情" v-model="detailVisible" width="620px">
      <div class="dialog-content">
        <div class="info-section">
          <div class="info-row">
            <span class="label">人员姓名：</span>
            <span class="value highlight">{{ detailData.emp?.userName || '暂无' }}</span>
          </div>
          <div class="info-row">
            <span class="label">所属角色：</span>
            <span class="value">{{ detailData.emp?.roleName || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="label">负责区域：</span>
            <span class="value">{{ detailData.emp?.regionName || '-' }}</span>
          </div>
        </div>

        <el-table :data="processedStats" border size="small" style="margin-top: 18px;">
          <el-table-column prop="period" label="统计周期" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="row.type" effect="plain">{{ row.period }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="总工单数" align="center" width="120">
            <template #default="{ row }">
              <span class="emphasize">{{ row.totalCount }}</span>
            </template>
          </el-table-column>
          <el-table-column label="完成工单" prop="finishCount" align="center" />
          <el-table-column label="进行中工单" prop="progressCount" align="center" />
          <el-table-column label="拒绝工单" prop="cancelCount" align="center" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="Collect">
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { listCollect, addCollect, getCollect } from "@/api/manage/collect"
import { listEmp } from "@/api/manage/emp"
import dayjs from 'dayjs'

// 时间范围
const start = dayjs().startOf('month').format('YYYY.MM.DD')
const end = dayjs().endOf('day').format('YYYY.MM.DD')

const { proxy } = getCurrentInstance()

// 数据状态
const collectList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const open = ref(false)
const title = ref("")
const detailVisible = ref(false)
const showEmpDialog = ref(false)
const formRef = ref(null)
const detailLoading = ref(false)

// 角色选项
const roleOptions = ref([
  { value: '1002', label: '运营人员' },
  { value: '1003', label: '运维人员' }
])

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userId: null,
  roleCode: null
})

// 表单数据
const form = reactive({
  userId: null,
  finishCount: 0,
  progressCount: 0,
  cancelCount: 0,
  emp: null
})

// 验证规则
const rules = reactive({
  userId: [{ required: true, message: '请选择人员', trigger: 'blur' }],
  finishCount: [
    { required: true, message: '请输入完成数', trigger: 'blur' },
    { type: 'number', min: 0, message: '不能小于0', trigger: 'blur' }
  ],
  progressCount: [
    { required: true, message: '请输入进行中数量', trigger: 'blur' },
    { type: 'number', min: 0, message: '不能小于0', trigger: 'blur' }
  ],
  cancelCount: [
    { required: true, message: '请输入取消数', trigger: 'blur' },
    { type: 'number', min: 0, message: '不能小于0', trigger: 'blur' }
  ]
})

// 人员选择相关
const empData = ref([])
const empTotal = ref(0)
const empLoading = ref(false)
const empQuery = reactive({
  pageNum: 1,
  pageSize: 5,
  status: 1 // 只显示启用状态员工
})

// 详情数据结构
const detailData = ref({
  emp: [],
  statistics: []
})

// 监听对话框显示状态
watch(showEmpDialog, (newVal) => {
  if (newVal) {
    getEmpList()
  }
})

onMounted(() => {
  getList()
})

/** 获取统计列表 */
async function getList() {
  loading.value = true;
  try {
    // 1. 获取符合搜索条件的用户信息
    const empRes = await listEmp({
      userName: queryParams.userName,
      roleCode: queryParams.roleCode, // 确保角色筛选生效
      pageSize: 1000
    });
    
    if (empRes.rows.length === 0) {
      collectList.value = [];
      total.value = 0;
      return;
    }

    // 2. 构建用户ID到用户信息的映射表
    const empMap = new Map(empRes.rows.map(e => [e.id, e]));
    const userIds = [...empMap.keys()];

    // 3. 获取这些用户的统计数据
    const collectRes = await listCollect({
      userIds: userIds.join(','),
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize
    });

    // 4. 严格过滤确保只显示符合条件的记录
    console.log('列表接口返回数据:', collectRes.rows)
    collectList.value = collectRes.rows
      .filter(item => empMap.has(item.userId))
      .map(item => ({
        ...item,
        emp: empMap.get(item.userId)
      }));

    total.value = collectRes.total;
  } catch (error) {
    console.error("获取数据失败:", error);
  } finally {
    loading.value = false;
  }
}

/** 获取可选人员列表 */
function getEmpList() {
  empLoading.value = true
  listEmp(empQuery).then(res => {
    empData.value = res.rows
    empTotal.value = res.total
  }).finally(() => {
    empLoading.value = false
  })
}

/** 选择人员 */
function handleEmpSelect(row) {
  if (!row || !row.id) {
    proxy.$modal.msgError('请选择有效人员')
    return
  }

  form.userId = row.id
  form.emp = {
    userName: row.userName || '未知',
    roleName: row.roleName || '未分配',
    mobile: row.mobile || '暂无',
    regionName: row.regionName || '未分配'
  }
  showEmpDialog.value = false
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  queryParams.userName = null
  queryParams.roleCode = null
  handleQuery()
}

/** 新增按钮操作 */
function handleAdd() {
  open.value = true
  title.value = "添加工单统计"
  nextTick(() => {
    reset()
  })
}

/** 查看详情 */
function handleDetail(row) {
  // ID有效性校验
  if (typeof row.id === 'undefined' || row.id === null || isNaN(row.id)) {
    proxy.$modal.msgError('当前记录缺少有效ID，无法查看详情')
    return
  }
  getCollect(row.id).then(res => {
    const data = res.data;
    detailData.value= {
      emp: data.emp || null,
      statistics: [
        {
          period: '当日统计',
          finishCount: data.finishCount,
          progressCount: data.progressCount,
          cancelCount: data.cancelCount
        },
        {
          period: '本月统计',
          finishCount: data.finishCountY,
          progressCount: data.progressCountY,
          cancelCount: data.cancelCountY
        },
        {
          period: '总计统计',
          finishCount: data.finishCountS,
          progressCount: data.progressCountS,
          cancelCount: data.cancelCountS
        }
      ]
    }
    detailVisible.value = true
  }).finally(() => {
    detailLoading.value = false
  })
}

/** 计算属性：处理统计数据 */
const processedStats = computed(() => {
  return (detailData.value.statistics || []).map(item => ({
    ...item,
    totalCount: (item.finishCount || 0) + (item.progressCount || 0) + (item.cancelCount || 0),
    type: getPeriodType(item.period)
  }))
})

/** 获取周期类型 */
function getPeriodType(period) {
  const typeMap = {
    '当日统计': 'success',
    '本月统计': 'warning',
    '总计统计': 'info'
  }
  return typeMap[period] || ''
}

/** 提交表单 */
function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      addCollect({
        userId: form.userId,
        finishCount: form.finishCount,
        progressCount: form.progressCount,
        cancelCount: form.cancelCount,
        collectDate: new Date()
      }).then(() => {
        proxy.$modal.msgSuccess('新增成功')
        open.value = false
        getList()
      })
    }
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.userId = 0
  form.finishCount = 0
  form.progressCount = 0
  form.cancelCount = 0
  form.emp = null
  if (formRef.value) {
    formRef.value.resetFields()
  }
}
</script>
<style scoped>
.operation-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
}

.work-order-stats {
  flex: 1;
  text-align: center;
}

.sub-title {
  font-size: 0.9em;
  color: #666;
  margin-left: 5px;
}

.emp-info-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.emp-name {
  font-weight: 500;
}

.emp-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.role-icon,
.phone-icon {
  display: inline-block;
  width: 16px;
  text-align: center;
}

.role-name {
  color: #666;
  font-size: 13px;
}

.phone-number {
  color: #2d8cf0;
  font-size: 13px;
  font-weight: 400;
}

.divider {
  color: #ddd;
  margin: 0 8px;
}

.emphasize {
  font-weight: 600;
  color: #67C23A;
  font-size: 15px;
}

.el-tag {
  border-radius: 12px;
}

.el-tag--success {
  color: #67C23A;
  background: #f0f9eb;
}

.el-tag--warning {
  color: #E6A23C;
  background: #fdf6ec;
}

.el-tag--info {
  color: #909399;
  background: #f4f4f5;
}

.custom-header th {
  background: #f8f9fa !important;
  font-weight: 600;
}
</style>