
<template>
    <div>
      <h4><b>算力网络表</b></h4>
      <table table-layout="fixed">
        <thead>
        <tr>
          <th v-for="(_, colIndex) in numRows" :key="colIndex">{{colIndex===0?"起始&终止节点":layers[colIndex-1]}}</th>
        </tr>
        </thead>
        <tbody >
        <tr v-for="(rowData, rowIndex) in generateTableData(numRows)" :key="rowIndex" :style="{ '--wid': wid}">
          <td
            v-for="(cell, colIndex) in rowData"
            :key="colIndex"
            :class="{ nonEditable: isNonEditable(rowIndex, colIndex) }"
          >
            {{rowData[colIndex]}}
            <input
              v-if="colIndex!==0&&!isNonEditable(rowIndex, colIndex)"
              type="text"
              v-model="rowData.values[colIndex]"
              style="width: 100%;border: none;text-align: center"
            />
            <span v-else>{{ value }}</span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </template>

  <script>
import colors from '../assets/color.module.scss'
import store from '../store/store'
 export default {
  name: 'Cncchart',
  props:{
    layers:{
      type:Array,
      required: true,
      default: (()=>{
        return JSON.parse(JSON.stringify(store.state.CNCNodes))
      })
    },
  },
  data() {
    return {
      numRows:null ,
      wid:null,
      data:{
        serviceinfo:{
                    Name:[],
                    Nodes:[],
                    Networks:[],
                    Decisions:[],
                },
      },
      svcinfo:[]
    };
  },
 
  created() {
    this.numRows = this.layers.length+1;
    this.wid = 100/(this.numRows+1) + '%';
  },
  methods: {
    isNonEditable(rowIndex, colIndex) {
      // 假设我们想让第二列的第二个单元格（索引为1, 1）为灰色且不可编辑
      // 你可以根据实际需求调整这个逻辑
      return colIndex!==0&rowIndex+1>=colIndex||colIndex===this.numRows;
    },
    generateTableData(numRows) {
      const tableData = [];
      this.svcinfo = JSON.parse(JSON.stringify(store.state.CNCSvcinfo))
      console.log("thisaaaaaa",numRows)
      for (let i = 0; i < numRows-1; i++) {
        var arr =[];
        arr[0]=this.layers[i]
        for (let j=0;j < numRows-1; j++){
            if(i == j){
                arr.push("infinity");
                continue;
            }  
            arr.push(this.svcinfo[0].Networks[i*numRows-i+j].bandwidth);  
        }
        tableData.push(arr); // 填充空字符串或你需要的默认值
      }
      return tableData;
    }
  },
  mounted(){
    
  }

};

  </script>
   
  <style scoped>
  /* 样式可以根据需要添加 */
  table {
    width: 100%;
  }
  th, td {
    border: 1px solid black;
    padding: 8px;
    text-align: center;
    width: var(--wid);
  }
  </style>