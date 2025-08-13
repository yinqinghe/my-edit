<template>
    <div>
        <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="customer" label="customer" width="180" />
            <el-table-column prop="onboard" label="onboard" width="180" />
            <el-table-column prop="offboard" label="offboard" />
            <el-table-column prop="MDE" label="MDE" />
            <el-table-column prop="cortex" label="cortex" />
        </el-table>
    </div>

</template>

<script>
import { tableData } from '@/data/CustomersTableData.js'

console.log(tableData) // 直接用
export default {
    data() {
        return {
            tableData // 返回给模板
        }
    }
}
</script>
