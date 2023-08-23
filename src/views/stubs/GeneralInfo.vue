<template>
    <el-form-item label="啟用" prop="fromConfiguredStub">
        <el-switch v-model="selectedItem!.response.fromConfiguredStub"></el-switch>
    </el-form-item>
    <el-form-item label="名稱" prop="name">
        <el-input v-model="selectedItem!.name"></el-input>
    </el-form-item>
    <el-form-item label="優先級" prop="priority">
        <el-select v-model="selectedItem!.priority">
            <el-option v-for="item in $enum.PRIORITY" :value="item" :key="item"></el-option>
        </el-select>
    </el-form-item>
    <el-form-item label="場景">
        <el-input v-model="selectedItem!.scenarioName" class="input-3">
            <template #prefix>
                <span>場景名稱</span>
            </template>
        </el-input>
        <el-input v-model="selectedItem!.requiredScenarioState" class="input-3">
            <template #prefix>
                <span>上一狀態</span>
            </template>
        </el-input>
        <el-input v-model="selectedItem!.newScenarioState" class="input-3 last-input">
            <template #prefix>
                <span>下一狀態</span>
            </template>
        </el-input>
    </el-form-item>
    <el-form-item label="備註">
        <el-input v-model="selectedItem!.metadata.wmui.description" type="textarea"></el-input>
    </el-form-item>
    <el-form-item label="創建時間" v-if="selectedItem!.metadata.wmui.createTime">
        <span>{{ selectedItem!.metadata.wmui.createTime }}</span>
    </el-form-item>
    <el-form-item label="更新時間" v-if="selectedItem!.metadata.wmui.updateTime">
        <span>{{ selectedItem!.metadata.wmui.updateTime }}</span>
    </el-form-item>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';

import { useShareStatesStore } from '@/stores/UseShareStatesStore'
import $enum from '@/service/const/stubEnum'

const { selectedItem } = storeToRefs(useShareStatesStore())
</script>

<style lang="less" scoped>
.input-3 {
    width: calc(100%/3);
    padding-right: 10px;

}
.last-input {
    padding-right: 0px;
}

</style>