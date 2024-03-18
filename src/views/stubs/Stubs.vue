<template>
  <div class="stubs-list">
    <div v-if="isEmpty(currentMockUrl)" class="empty-data">
      請先選擇一個項目
    </div>
    <div v-else>
      <!-- <tool-bar></tool-bar> -->
      <!-- 頂部工具欄-->
      <el-row class="top-tools" justify="start">
        <el-form :inline="true" class="form-inline" size="small">
          <el-form-item>
            總數：<span class="total-num">{{ total }}</span>
          </el-form-item>
          <el-form-item>
            <el-select size="small" style="width: 100px" placeholder="每頁條數" v-model="pageSize" @change="refreshListData">
              <el-option label="10" :value="10" key="10"></el-option>
              <el-option label="20" :value="20" key="20"></el-option>
              <el-option label="50" :value="50" key="50"></el-option>
              <el-option label="100" :value="100" key="100"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input class="tools-filter" placeholder="根據ID 查詢" clearable v-model="stubMappingID"
              @clear="refreshListData">
              <template #append>
                <el-button :icon="Search" @click="getStubMappingByID"></el-button>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button :icon="Plus" type="primary" @click="addStubMapping">新增</el-button>
          </el-form-item>
          <el-form-item>
            <el-button :icon="Refresh" type="warning" @click="refreshListData">更新</el-button>
          </el-form-item>
          <!-- <el-form-item>
<el-button :icon="Right" type="danger" @click="dialogRecordFormVisible = true">錄製</el-button>
</el-form-item> -->
          <!-- <el-form-item>
<el-button :icon="Search" type="success" @click="getStubMappingsByMetadata()">高級搜尋</el-button>
</el-form-item> -->
        </el-form>
      </el-row>

      <!-- 內容顯示區-->
      <!-- 無內容時顯示-->
      <div class="empty-data" v-if="!tableData.length">暫無數據，請先新增</div>
      <!-- 有內容時顯示-->
      <div v-else>
        <el-row>
          <!-- 左側Stub Mappings 列表-->
          <el-col :span="5" class="left-list">
            <!-- 分頁信息及翻頁功能-->
            <el-row class="list-pagination" align="middle" justify="space-between">
              <div class="filter-options">
                <el-input placeholder="當前數據中檢索" clearable v-model="listFilter" size="small" />
              </div>
              <div class="pagination">
                <div class="pagination-tip">
                  <label>{{ `第${fromNum} - ${toNum} 條` }}</label>
                </div>
                <el-pagination :page-size="pageSize" :total="total" :current-page="pageNum"
                  @update:current-page="onCurrentPageNumChage" :small="true" layout="prev,next"></el-pagination>
              </div>
            </el-row>
            <!-- 列表-->
            <el-scrollbar class="list-content">
              <ul>
                <li v-for="(item, index) in tableData" v-bind:key="item.id" @click="onClickListItem(item, index)">
                  <div :class="selectedIndex === index ? 'content-item select' : 'content-item'" v-if="localSearch(item)">
                    <label class="first-line">
                      <span>{{ item.name }}</span>
                      <div class="status-flag">
                        <span v-if="!item.response.fromConfiguredStub" class="disable-flag">×</span>
                        <span v-if="isUnsave(item)" class="unsave-flag">*</span>
                      </div>
                    </label>
                    <label class="second-line">
                      <el-tag size="small" :type="methodStyle(item.request.method)">{{
                        item.request.method }}</el-tag>
                      <span class="item-url">{{ item.metadata.render.request.url }}</span>
                    </label>
                    <label class="third-line">
                      <status-tag :status="item.response.status" />
                    </label>
                  </div>
                </li>
              </ul>
            </el-scrollbar>
          </el-col>
          <!-- 右側Stub Mapping 詳情-->
          <el-col :span="19" class="right-detail" v-if="selectedItem">
            <!-- 操作欄-->
            <div class="detail-tools">
              <!-- 操作按鈕-->
              <div class="switch-edit-view">
                <span :class="isShowFormEdit ? 'switch-button is-active' : 'switch-button'"
                  @click="isShowFormEdit = true">編輯</span>
                <span :class="!isShowFormEdit ? 'switch-button is-active' : 'switch-button'"
                  @click="isShowFormEdit = false">預覽</span>
              </div>
              <el-form size="small" v-show="isShowFormEdit">
                <el-button :icon="Finished" type="primary" @click="saveStubMapping"
                  v-if="isUnsave(selectedItem)">保存</el-button>
                <template v-if="JSON.stringify(selectedItem) !== JSON.stringify(resetItem)">
                  <el-popconfirm title="確定重置嗎？" @confirm="resetStubMapping" width="150">
                    <template #reference>
                      <el-button :icon="RefreshLeft" type="warning">重置</el-button>
                    </template>
                  </el-popconfirm>
                </template>
                <el-popconfirm title="確定刪除嗎？" @confirm="deleteStubMappingByID" width="150">
                  <template #reference>
                    <el-button :icon="Delete" type="danger">刪除</el-button>
                  </template>
                </el-popconfirm>
                <el-button :icon="CopyDocument" type="success" @click="cloneStubMapping"
                  v-if="!isUnsave(selectedItem)">副本</el-button>
              </el-form>
            </div>
            <!-- Form Edit/JSON View 切換-->
            <el-scrollbar class="detail-tab">
              <!-- Form Edit -->
              <el-form class="detail-info" :model="selectedItem" ref="selectedItemRef" label-width="120px"
                label-position="left" v-show="isShowFormEdit" size="default">
                <el-collapse v-model="activeCollapseNames">
                  <!-- 基本信息：名稱、優先級、場景、啟用禁用、元數據-->
                  <el-collapse-item name="General">
                    <template #title>
                      <b>基本信息</b>
                    </template>
                    <general-info></general-info>
                  </el-collapse-item>
                  <!-- Request -->
                  <el-collapse-item name="Request">
                    <template #title>
                      <b>Request</b>
                    </template>
                    <request></request>
                  </el-collapse-item>
                  <!-- Response -->
                  <el-collapse-item name="Response">
                    <template #title>
                      <b>Response</b>
                    </template>
                    <response></response>
                  </el-collapse-item>
                  <!-- postServeActions -->
                  <el-collapse-item :name="'Webhook' + (index + 1)"
                    v-for="(webhook, index) in selectedItem.postServeActions">
                    <template #title>
                      <b>{{ 'Webhooks(' + (index + 1) + ')' }}</b>
                    </template>
                    <webhook :webhook="webhook" :index="index"></webhook>
                  </el-collapse-item>
                  <webhook-add-button>Add a webhook</webhook-add-button>
                </el-collapse>
              </el-form>
              <!-- JSON View -->
              <div class="detail-preview" v-show="!isShowFormEdit">
                <json-viewer :value="selectedItemView" :copyable="{ copyText: '複製', copiedText: '已複製' }"
                  :expand-depth="10"></json-viewer>
              </div>
            </el-scrollbar>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { toRaw } from 'vue';
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref, reactive, watch, defineAsyncComponent, h } from 'vue';
import { computed } from '@vue/reactivity';
import { Search, Plus, Refresh, RefreshLeft, Right, Finished, Delete, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type Action, type FormRules } from 'element-plus';

import { isEmpty, formatDateTime, cloneJson } from '@/lib/helper'
import { ErrorHandler } from '@/lib/axios'
import { useShareStatesStore } from '@/stores/UseShareStatesStore'
import { type IStubMapping, R_Mappings, R_All_Mappings, R_Mapping, C_Mapping, U_Mapping, D_Mapping } from '@/service/api/StubMappings'
import { methodStyle } from '@/service/render/style'
import { apiDataToRenderData } from '@/service/render/convert/apiDataToRenderData'
import { renderDataToApiData } from '@/service/render/convert/renderDataToApiData'

import StatusTag from '../components/StatusTag.vue'
import GeneralInfo from './GeneralInfo.vue'
import Request from './Request.vue'
import Response from './Response.vue'
const Webhook = defineAsyncComponent(() =>
  import('./Webhook.vue')
)
const WebhookAddButton = defineAsyncComponent(() =>
  import('./WebhookAddButton.vue')
)

const { currentMockUrl, selectedItem, selectedIndex, currentStubMappingID, resetItem } = storeToRefs(useShareStatesStore())
const tableData = ref([] as any[])
const pageNum = ref(1)
const pageSize = ref(10)
const fromNum = computed(() => (pageNum.value - 1) * pageSize.value + (total ? 1 : 0))
const toNum = computed(() => (pageNum.value * pageSize.value) > total.value ? total.value : (pageNum.value * pageSize.value))

/**
* 根據offset 和limit 查詢
*/
// const getAllStubMappings = async () => {
//   await R_All_Mappings(currentMockUrl.value).then((res: any) => {
//     return res.mappings
//   }).catch(err => {
//     ErrorHandler.create(err).end()
//   })
// }
const getStubMappings = async (isUserAction: boolean) => {
  await R_Mappings(currentMockUrl.value, { offset: (pageNum.value - 1) * pageSize.value, limit: pageSize.value }).then((res: any) => {
    tableData.value = (res.mappings || []).map((item: any) => {
      return apiDataToRenderData(item);
    });
    total.value = res.meta.total
    selectedItem.value = total.value > 0 ? tableData.value[0] : {}
    selectedIndex.value = 0
    isShowFormEdit.value = true
    resetItem.value = cloneJson(selectedItem.value)
    if (isUserAction) {
      ElMessage({
        type: 'success',
        message: '更新成功',
      })
    }
  }).catch(err => {
    ErrorHandler.create(err).end()
  })
}

// ###### 頁面加載和監聽######

onBeforeMount(() => {
  if (!isEmpty(currentMockUrl.value)) {
    getStubMappings(false)
  }
})

watch(currentMockUrl, (newValue, oldValue) => {
  if (currentMockUrl.value) {
    getStubMappings(false)
  } else {
    tableData.value = []
  }
})

// ###### 1. 頂部工具欄######
const dialogRecordFormVisible = ref(false)
const stubMappingID = ref('')
const total = ref(0)

/**
* 當每頁條數改變或點擊刷新按鈕時重新查詢
*/
const refreshListData = () => {
  pageNum.value = 1
  saveItemBeforeNextAction().then(async (action: Action) => {
    if (action === 'confirm' || action === 'cancel') {
      if (stubMappingID.value) {
        getStubMappingByID()
      } else {
        await getStubMappings(true)
        if (tableData.value.length) switchSelectedItem(0)
      }
    }
  })
}

/**
* 根據StubMapping ID 查詢
*/
const getStubMappingByID = async () => {
  if (isEmpty(stubMappingID.value)) {
    ElMessage({ type: 'warning', message: '請輸入Stub Mapping 的ID' })
    return
  }
  if (!stubMappingID.value.match(/[0-9a-z]{8}(-[0-9a-z]{4}){3}-[0-9a-z]{12}/)) {
    ElMessage({ type: 'warning', message: 'UUID 格式錯誤' })
    return
  }
  await R_Mapping(currentMockUrl.value, stubMappingID.value).then((res: any) => {
    tableData.value = [apiDataToRenderData(res)];
    total.value = 1
    currentStubMappingID.value = stubMappingID.value
    switchSelectedItem(0)
    ElMessage({
      type: 'success',
      message: '刷新成功',
    })
  }).catch((err: any) => {
    ErrorHandler.create(err).handle((err) => {
      if (err.response && err.response.status === 404) {
        ElMessage({ type: 'warning', message: '不存在該UUID ' })
        return true
      }
      return false
    }).end()
  })
}

/**
* 新增一個默認Stub Mapping 到列表（未保存）
*/
const addStubMapping = () => {
  if (tableData.value.length && !tableData.value[0].id) return;
  const item = apiDataToRenderData({
    name: '請輸入Stub Mapping 名稱',
    priority: 5,
    persistent: true,
    request: {
      method: 'GET',
      url: '/example'
    },
    response: {}
  });
  tableData.value.unshift(item);
  switchSelectedItem(0)
}

/**
* 根據Metadata 查詢
*/
const getStubMappingsByMetadata = () => {
  // TODO
  getStubMappings(true)
}

// ###### 2. 左側列表######

/**
* 判斷當前選中項是否有修改未保存
* @param item 當前選中項
*/
const isUnsave = computed(() => (item: IStubMapping) => {
  return !item.id || (selectedItem.value === item && JSON.stringify(selectedItem.value) !== JSON.stringify(resetItem.value))
})

/**
* 本地搜索，篩選列表中符合查詢條件的列表項。
*
* 如果參數符合查詢條件，則返回true。
*
* @param item 當前列表項數據
*/
const listFilter = ref('')
const localSearch = (item: any) => {
  // TODO 語法搜索，如title:客服介入&& urL:/abc/dwew
  return (!listFilter.value || ((item.request.url || '').indexOf(listFilter.value) !== -1) || (item.name || '').indexOf(listFilter.value) !== -1)
}

/**
* 上一頁、下一頁
*
* 噹噹前頁碼改變時重新查詢
* @param currentPageNum 當前頁碼
*/
const onCurrentPageNumChage = (currentPageNum: number) => {
  pageNum.value = currentPageNum
  getStubMappings(true)
}

/**
* 點擊列表項
* @param item 被選中的列表項
* @param index 被選中的列表項索引
*/
const onClickListItem = (item: IStubMapping, index: number) => {
  // 如果要選中的與已選中的是同一個，則立即返回，不做處理
  if (selectedItem && selectedItem.value === tableData.value[index]) return

  // 如果有未保存的項，則提示是否先保存
  let removeFirst = false
  if (!tableData.value[0].id) removeFirst = true
  saveItemBeforeNextAction().then((action: Action) => {
    if (action === 'confirm' || action === 'cancel') {
      switchSelectedItem(removeFirst && action === 'cancel' ? --index : index)
    }
  })
}

// ###### 3. 右側詳情頁######
const isShowFormEdit = ref(true)

// 3.1 表單編輯
const activeCollapseNames = ref(['General', 'Request', 'Response', 'Webhook1', 'Webhook2', 'Webhook3', 'Webhook4', 'Webhook5'])

/**
* 保存按鈕：創建或更新StubMapping
*/
const saveStubMapping = async () => {

  if (selectedItem.value!.metadata.wmui.createTime) {
    selectedItem.value!.metadata.wmui.updateTime = formatDateTime(new Date().getTime())
  } else {
    selectedItem.value!.metadata.wmui.createTime = formatDateTime(new Date().getTime())
  }

  let t1 = await R_All_Mappings(currentMockUrl.value).then((res: any) => {
    return res.mappings
  }).catch(err => {
    ErrorHandler.create(err).end()
  })

  let selectedItemValue = toRaw(selectedItem.value!)

  const index = t1.findIndex((item: any) => item.id === selectedItem.value!.id)
  if (index != -1) {
    t1[index]['name'] = selectedItemValue.name
  }
  else {
    t1.push(selectedItemValue)
  }

  let user = t1.filter((user: any) => user.name == selectedItemValue.name);

  if (user.length > 1) {

    let stub_name_existed_message = 'stub名稱 「' + user[0].name + '」已存在，請修改stub名稱後再保存！'
    ElMessageBox({
      title: '提示', //MessageBox 標題
      message: stub_name_existed_message, //MessageBox 消息内容
      confirmButtonText: '确定', //確認按鈕的文字内容
      cancelButtonText: '取消', //取消按鈕的文字内容
      showCancelButton: false, //是否顯示取消按鈕
      closeOnClickModal: false, //是否可通过点击遮罩关闭
      type: 'warning', //消息类型，用于显示图标
    }).then(() => {
      ElMessage.success('請修改stub名稱~');
    }).catch(() => {
      ElMessage.success('請修改stub名稱~');
    });


    return

  }
  else {

    // 如果是新增未保存的數據
    if (!selectedItem.value!.id) {
      C_Mapping(currentMockUrl.value, renderDataToApiData(selectedItem.value as IStubMapping)).then((res: any) => {
        // 新增數據後當前頁列表條數加一，需要刷新，重新計算total 和pageNum
        getStubMappings(false)
      }).catch((err) => {
        ErrorHandler.create(err).end()
      })
      return
    }
    // 如果是修改未保存的數據
    if (JSON.stringify(selectedItem.value) !== JSON.stringify(resetItem.value)) {
      U_Mapping(currentMockUrl.value, selectedItem.value!.id as string, renderDataToApiData(selectedItem.value as IStubMapping)).then((res: any) => {
        tableData.value[selectedIndex.value] = apiDataToRenderData(res)
        switchSelectedItem(selectedIndex.value)
      }).catch((err) => {
        ErrorHandler.create(err).end()
      })
      return
    }
  }
}

/**
* 重置當前選中項，數據回滾到編輯前的數據
*/
const resetStubMapping = () => {
  if (JSON.stringify(selectedItem.value) === JSON.stringify(resetItem.value)) {
    ElMessage({ type: 'success', message: '數據未變更，無需重置' })
    return
  }
  tableData.value[selectedIndex.value] = cloneJson(resetItem.value)
  switchSelectedItem(selectedIndex.value)
}

/**
* 刪除當前選中的StubMapping。
*
* 如果是草稿項，直接移除；否則根據ID 刪除。
*/
const deleteStubMappingByID = () => {
  if (!selectedItem.value!.id) {
    tableData.value.shift()
    switchSelectedItem(0)
  } else {
    D_Mapping(currentMockUrl.value, selectedItem.value!.id as string).then(() => {
      ElMessage({
        type: 'success',
        message: '刪除成功',
      })
      // 總數發生改變需要刷新
      getStubMappings(false)
    }).catch((err) => {
      ErrorHandler.create(err).end()
    })
  }
}

/**
* 複製當前選中項目，並新增到列表頂部
*/
const cloneStubMapping = () => {
  const cloneItem = cloneJson(selectedItem.value)
  delete cloneItem.id
  delete cloneItem.uuid
  tableData.value.unshift(cloneItem);
  switchSelectedItem(0)
}

// 3.2 JSON 預覽
const selectedItemView = computed(() => {
  const clonedItem = JSON.parse(JSON.stringify(selectedItem.value))
  return renderDataToApiData(clonedItem)
})

// ###### 輔助方法######

const saveItemBeforeNextAction = async (): Promise<Action> => {
  if (!tableData.value.length || (tableData.value[0].id && JSON.stringify(selectedItem.value) === JSON.stringify(resetItem.value))) {
    return 'confirm' as Action
  }
  let userAction!: Action
  await ElMessageBox.confirm(
    '您有Stub Mapping 未保存，是否先保存？ ',
    '提示',
    {
      confirmButtonText: '保存',
      cancelButtonText: '放棄',
      type: 'warning',
      distinguishCancelAndClose: true
    }
  ).then(async () => { //保存修改


    let t1 = await R_All_Mappings(currentMockUrl.value).then((res: any) => {
      return res.mappings
    }).catch(err => {
      ErrorHandler.create(err).end()
    })
    let selectedItemValue = toRaw(selectedItem.value!)

    const index = t1.findIndex((item: any) => item.id === selectedItem.value!.id)
    if (index != -1) {
      t1[index]['name'] = selectedItemValue.name
    }
    else {
      t1.push(selectedItemValue)
    }

    let user = t1.filter((user: any) => user.name == selectedItemValue.name);


    // 如果是添加未保存的數據
    if (!tableData.value[0].id) {
      if (user.length > 1) {
        let stub_name_existed_message = 'stub名稱 「' + user[0].name + '」已存在，請修改stub名稱後再保存！'
        ElMessageBox({
          title: '提示', //MessageBox 標題
          message: stub_name_existed_message, //MessageBox 消息内容
          confirmButtonText: '确定', //確認按鈕的文字内容
          cancelButtonText: '取消', //取消按鈕的文字内容
          showCancelButton: false, //是否顯示取消按鈕
          closeOnClickModal: false, //是否可通过点击遮罩关闭
          type: 'warning', //消息类型，用于显示图标
        }).then(() => {
          ElMessage.success('請修改stub名稱~');
        }).catch(() => {
          ElMessage.success('請修改stub名稱~');
        });
        userAction = 'close' as Action
      }
      else {
        await C_Mapping(currentMockUrl.value, renderDataToApiData(tableData.value[0])).then((res: any) => {
          tableData.value[0] = apiDataToRenderData(res)
          userAction = 'confirm' as Action
        }).catch((err) => {
          ErrorHandler.create(err).end()
        })
      }

      return
    }
    // 如果是修改未保存的數據
    if (JSON.stringify(selectedItem.value) !== JSON.stringify(resetItem.value)) {

      if (user.length > 1) {
        let stub_name_existed_message = 'stub名稱 「' + user[0].name + '」已存在，請修改stub名稱後再保存！'
        ElMessageBox({
          title: '提示', //MessageBox 標題
          message: stub_name_existed_message, //MessageBox 消息内容
          confirmButtonText: '确定', //確認按鈕的文字内容
          cancelButtonText: '取消', //取消按鈕的文字内容
          showCancelButton: false, //是否顯示取消按鈕
          closeOnClickModal: false, //是否可通过点击遮罩关闭
          type: 'warning', //消息类型，用于显示图标
        }).then(() => {
          ElMessage.success('請修改stub名稱~');
        }).catch(() => {
          ElMessage.success('請修改stub名稱~');
        });
        userAction = 'close' as Action
      }
      else {
        await U_Mapping(currentMockUrl.value, selectedItem.value!.id as string, renderDataToApiData(selectedItem.value as IStubMapping)).then((res: any) => {
          tableData.value[selectedIndex.value] = apiDataToRenderData(res)
          userAction = 'confirm' as Action
        }).catch((err) => {
          ErrorHandler.create(err).end()
        })
      }
      return
    }
  }).catch((action: Action) => { //放棄修改或關閉彈窗
    userAction = action
    if (action === 'cancel') {
      if (!tableData.value[0].id) {
        tableData.value.shift()
      } else {
        tableData.value[selectedIndex.value] = cloneJson(resetItem.value)
      }
    }
  })
  return Promise.resolve(userAction)

}

// 切換選中項
const switchSelectedItem = (nextIndex: number) => {
  selectedItem.value = tableData.value[nextIndex]
  selectedIndex.value = nextIndex
  resetItem.value = cloneJson(selectedItem.value);
  // activeCollapseNames.value = ['General', 'Request', 'Response']
  // isShowFormEdit.value = true
}

// const rules = reactive<FormRules>({
// name: [
// { required: true, message: '請輸入名稱', trigger: 'blur' }
// ],
// matchType: [
// { required: true, message: '請選擇URL匹配類型', trigger: 'change' }
// ],
// priority: [
// { required: true, message: '請選擇匹配優先級', trigger: 'change' }
// ],
// url: [
// { required: true, message: '請輸入請求URL路徑', trigger: 'blur' }
// ],
// request: {
// method: [
// { required: true, message: '請選擇請求方式', trigger: 'change' }
// ],
// },
// response: {
// status: [
// { required: true, message: '請輸入響應狀態碼', trigger: 'blur' }
// ],
// proxyBaseUrl: [
// { required: true, message: '請輸入proxyBaseUrl', trigger: 'blur' }
// ],
// },
// fixedDelayMilliseconds: [
// { required: true, message: '請輸入Delay（ms）', trigger: 'change' }
// ],
// delayDistribution: {
// lower: [
// { required: true, message: '請輸入Lower bound（ms）', trigger: 'change' }
// ],
// upper: [
// { required: true, message: '請輸入Upper bound（ms）', trigger: 'change' }
// ],
// median: [
// { required: true, message: '請輸入Median delay（ms）', trigger: 'change' }
// ],
// sigma: [
// { required: true, message: '請輸入Standard deviation', trigger: 'change' }
// ],
// },
// hooks: {
// url: [
// { required: true, message: '請輸入url', trigger: 'blur' }
// ],
// headers: [
// { required: true, message: '請輸入headers', trigger: 'blur' },
// {
// required: true, trigger: ['change', 'blur'], validator: (rule, value, callback) => {

// try {
// if (value && !Object.keys(JSON.parse(value)).length) {
// callback(new Error('headers格式有誤'));
// } else {
// this.errorTip = '';
// callback()
// }
// } catch (e) {
// callback(new Error('headers格式有誤'))
// }

// }
// },
// ],
// method: [
// { required: true, message: '請選擇method', trigger: 'change' }
// ],
// jsonBody: [
// {
// required: false, trigger: ['change', 'blur'], validator: (rule, value, callback) => {

// try {
// if (value && !Object.keys(JSON.parse(value)).length) {
// callback(new Error('jsonBody 格式有誤'));
// } else {
// this.errorTip = '';
// callback()
// }
// } catch (e) {
// callback(new Error('jsonBody 格式有誤'))
// }

// }
// },
// ]
// }
// })
</script>

<style lang="less" scoped>
:deep(.el-scrollbar__bar) {
  height: 0 !important;
  width: 0 !important;
}

//改變默認輸入框樣式
.filter-options {
  :deep(:focus-visible) {
    outline: -webkit-focus-ring-color auto 0px;
  }

  :deep(.el-input__wrapper) {
    // background-color: #2c3e50;
    box-shadow: none;
  }

  :deep(.el-select:hover:not(.el-select--disabled) .el-input__wrapper) {
    box-shadow: none;
  }

  :deep(.el-input__inner) {
    color: black;
  }
}

// 頂部工具欄
.top-tools {
  padding: 8px 20px;
  text-align: left;

  .total-num {
    color: #0fb2ef;
    font-weight: bold;
  }

  .tools-filter {
    width: 300px;
    margin-right: 8px;
  }

  .form-inline {
    .el-form-item {
      margin-bottom: 0;
      margin-right: 15px;
    }
  }
}

// 左側列表
.left-list {
  text-align: left;
  margin: 0px;
  padding: 0px;
  padding-left: 10px;

  // 分頁
  .list-pagination {
    display: flex;
    // margin-bottom: 8px;
    // height: 20px;

    .pagination {
      display: flex;
      justify-content: end;
    }

    .pagination-tip {
      // float: left;
      font-size: 12px;
      line-height: 24px;
      color: gray;
      padding-left: 2px;
    }
  }

  // 列表內容
  .list-content {
    height: calc(100vh - 110px);
    width: 100%;
    padding: 0;
    margin: 0;
    border: 1px solid #dfdfdf;
    font-size: 0;
    float: left;

    ul {
      padding-left: 0px;
    }

    .status-flag {
      padding-left: 10px;
      text-align: center;

      .disable-flag {
        color: gray;
        padding-left: 3px;
      }

      .unsave-flag {
        padding-left: 3px;
        color: rgb(235, 101, 101);
        height: 20px;
        display: inline-block;
        vertical-align: middle;
        text-align: center;
        line-height: 26px;
        font-size: 20px;
      }
    }

    .content-item {
      list-style-type: none;
      padding: 0 20px;
      border-bottom: 1px solid #dfdfdf;

      cursor: pointer;

      label {
        display: block;
        font-size: 14px;
        word-break: break-all;
        word-wrap: break-word;
        cursor: pointer;
      }

      .first-line {
        font-weight: bold;
        color: #2c3e50d9;
        padding-top: 8px;
        display: flex;
        justify-content: space-between;
      }

      .second-line {
        padding: 10px 0;

        .item-url {
          padding: 0 10px;
          color: #2c3e50d9;
        }
      }

      .third-line {
        padding-bottom: 8px;
      }
    }

    .content-item:hover {
      background: #d0d0d040;
    }
  }

  .select {
    border-left: 2px solid #0fb2ef;
    // margin-left: 1px;
  }
}

// 右側選中item詳細信息
.right-detail {
  padding: 0 20px;

  // 功能欄
  .detail-tools {
    display: flex;
    justify-content: space-between;
    height: 30px;

    .switch-edit-view {
      margin-left: 20px;
      display: flex;
      align-items: flex-end;

      .switch-button {
        cursor: pointer;
        display: inline;
        vertical-align: bottom;
        margin-right: 5px;
        height: 24px;
        color: #0fb2ef;
        font-size: 14px;
      }

      .switch-button.is-active {
        height: 22px;
        color: #f59121;
        border-bottom: 2px solid #f59121;
      }
    }
  }

  .el-scrollbar {
    height: calc(100vh - 117px);
    width: 100%;
  }

  // 切換tab
  .detail-tab {
    .detail-info {
      padding-left: 20px;
    }
  }

  .jv-code {
    max-height: none !important;
  }

  .json-detail {
    overflow: scroll;
    height: 72vh;
    padding: 15px;
    margin: 0;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    border: 1px solid #dcdfe6;
    -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
      0 0 6px 0 rgba(0, 0, 0, 0.04);
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);

    .jv-more {
      display: none;
    }
  }
}

.empty-data {
  color: grey;
  display: flex;
  justify-content: center;
  margin-top: 40px;
  height: 89vh;
}
</style>
