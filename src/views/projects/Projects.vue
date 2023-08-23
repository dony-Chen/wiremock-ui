<template>
    <el-drawer id="project-drawer" v-model="isShowProjects" direction="ltr" size="50%" @closed="isShowProjects = false">
        <template #header="{}">
            <div class="title">
                <b>項目信息管理</b>
            </div>
        </template>
        <div class="tools">
            <el-button type="primary" :icon="Plus" size="small" @click="addItem"></el-button>
        </div>
        <el-table :data="projects" :row-key="getRowKey">
            <el-table-column label="項目名稱" width="250">
                <template #default="scope">
                    <EditableCell type="text" v-model="scope.row.name" />
                </template>
            </el-table-column>
            <el-table-column label="項目地址" width="300">
                <template #default="scope">
                    <EditableCell type="text" v-model="scope.row.url" @blur="(newValue: string) => changeUrl(scope.row)" />
                </template>
            </el-table-column>
            <el-table-column label="項目描述">
                <template #default="scope">
                    <EditableCell type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" v-model="scope.row.desc" />
                </template>
            </el-table-column>
            <el-table-column width="60" label="操作">
                <template #default="scope">
                    <el-popconfirm :title="`確定刪除【${scope.row.name}】？`" @confirm="delItem(scope.row.id)" width="200">
                        <template #reference>
                            <el-button :icon="Delete" type="danger" size="small"></el-button>
                        </template>
                    </el-popconfirm>
                </template>
            </el-table-column>
        </el-table>
    </el-drawer>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import {
    Delete,
    Plus
} from '@element-plus/icons-vue'

import { nanoid } from '@/lib/helper'
import { useProjectsStore } from '@/stores/UseProjectsStore';
import { type IProject } from '@/stores/UseProjectsStore';
import { useShareStatesStore } from '@/stores/UseShareStatesStore';
import EditableCell from '@/components/EditableCell.vue';

const projectStore = useProjectsStore();
const { projects } = storeToRefs(projectStore);

const shareStateStore = useShareStatesStore()
const { isShowProjects, currentProjectId, currentMockUrl } = storeToRefs(shareStateStore)

/**
 * 为 el-table 每一行生成唯一 Key，防止就地更新時渲染錯誤
 * @param row 行數據
 */
const getRowKey = (row: IProject) => {
    return row.id
}

/**
 * 監聽 URL 值的變化
 * @param row 行數據
 */
const changeUrl = (row: IProject) => {
    if (row.id === currentProjectId.value && row.url !== currentMockUrl.value) {
        currentMockUrl.value = row.url
    }
}

/**
 * 添加一個項目，項目 ID 根據時間戳生成
 */
const addItem = () => {
    projects.value.push({
        id: nanoid(),
        name: "範例",
        url: "http://localhost:8080",
        desc: "",
    })
}

/**
 * 刪除一個項目
 * @param id 项目 ID
 */
const delItem = (id: string) => {
    let delIndex = projects.value.findIndex((item) => item.id === id)
    projects.value.splice(delIndex, 1)
    if (currentProjectId.value === id) {
        currentProjectId.value = ''
        currentMockUrl.value = ''
    }
}

</script>

<style lang="less" scoped>
.tools {
    text-align: right;
    padding-right: 10px;
}

.title {
    text-align: center;
}
</style>