import commonInput from '@/components/commonInput.vue'
import commonTable from '@/components/commonTable.vue'
import { mapActions, mapGetters } from 'vuex'
import {
    getProductList
}from '@/utils/api'
export default{
    data(){
        return{
            diaTitle:'批量修改',
            dialogTableVisible:false,
            isBatch:true, 
            editData:{
                condition:1,
                costPrice:1,
                productType:'',
                costNum:'',
            },
            conditions:[
                {name:'按条件查询',value:1},
                {name:'按当前页',value:2},
                {name:'按勾选条件',value:3},
            ],
            ruleForm:{
                costNum:[
                    {required: true, message: '请输入修改值', trigger: 'blur'}
                ]
            },

            queryData:{},
            pager:{
                page:1,
                rows:20
            },
            searchFrom:[
                {
                    label:'商品编码:',
                    type:'text',
                    value:'product_code',
                    clear:true,
                    search:'like',
                    placeholder:'请输入商品编码',
                    style:'width:250px'
                },
                {
                    type:'text',
                    value:'product_name',
                    label:'商品名称:',
                    search:'like',
                    clear:true,
                    placeholder:'请输入商品名称',
                    style:'width:250px'
                },

                {
                    type:'select',
                    value:'store_name',
                    label:'所属店铺',
                    search:'eq',
                    placeholder:'请选择',
                    selectFrom:[]
                },
                {
                    type:'select',
                    value:'product_type',
                    label:'商品类型',
                    search:'eq',
                    placeholder:'请选择',
                    selectFrom:[]
                },
                {
                    type:'select',
                    value:'is_sale',
                    label:'是否上架',
                    search:'eq',
                    placeholder:'请选择',
                    selectFrom:[]
                },
                {
                    type:'date',
                    name:'create_time',
                    search:'between',
                    label:'创建时间',
                },
                {
                    type:'btn',
                    btntxt:'搜索',
                    btnType:'primary',
                    value:'search'
                },
                {
                    type:'btn',
                    btntxt:'添加',
                    btnType:'primary',
                    value:'add'
                },
                {
                    type:'btn',
                    btntxt:'重置条件',
                    btnType:'primary',
                    value:'reset'
                },
         
            ],
            
            tableData:[],
            columnData:[
                {
                    prop:'product_code',
                    label:'商品编码',
                },
                {
                    prop:'product_name',
                    label:'商品名称',
                },
                {
                    prop:'product_describe',
                    label:'商品描述',
                },
                {
                    prop:'product_price',
                    label:'商品价格',
                },
                {
                    prop:'product_type',
                    label:'商品类型',
                },
                {
                    prop:'stock',
                    label:'库存',
                },
                {
                    prop:'create_time',
                    label:'创建时间',
                },
                {
                    prop:'store_name',
                    label:'所属店铺',
                },
                {
                    prop:'is_sale',
                    label:'是否上架',
                },
            ],
            count:0,
            options:{
                selection:true,  //是否开启多选
                width:200,    //操作栏长度
                operation:[
                    {type:'primary',name:'编辑',value:'edit'},
                    {type:'danger',name:'删除',value:'del'}
                ]
            },
            isVisible:false,
            //表单选择数据
            selectOption:[],
            //修改条件数据
            changeEditData:[],

        }
    },
    components:{
        commonInput,
        commonTable
    },
    computed: {
        ...mapGetters([
            'getUserInfo',
        ])
      },
    created(){
        this.getData({})
    },
    methods:{
        //搜索
        search(data){
            console.log(data)
            this.queryData= data 
            this.pager.page=1
            this.pager.rows=20
            this.getData(data)
        },
        getData(data){
           getProductList(data).then(res=>{
                this.tableData=res.data.result.productList
                this.count=res.data.result.count
            })
        },
     
        //单个修改
        edit(data){
            this.isBatch=false
            this.dialogTableVisible=true
            this.diaTitle='单个商品修改'
            let arr=[]
            arr.push(data)
            this.changeEditData=arr
        },
        //批量修改
        batchModify(data){
            this.isBatch=true
            this.dialogTableVisible=true
            this.diaTitle='批量修改'
            this.changeCondition(0)
        },
        //切换修改条件
        changeCondition(val){
            let condition=this.editData.condition
            let data=JSON.parse(JSON.stringify(this.queryData)) 
            if(condition===1){
                data.page=1
                data.rows=9999
                this.getProductCost(data)
            }else if(condition===2){
                data.page=this.pager.page
                data.rows=this.pager.rows
                this.getProductCost(data)
            }else{
                if(this.selectOption.length<=0){
                    this.$message.error("请至少选择一个条件")
                    this.editData.condition=1
                    return
                }else{
                    this.changeEditData=this.selectOption
                }
            }
        },
        //获取修改数据
        getProductCost(data){
            http.post('/warn_product/index',data,(res)=>{
                this.changeEditData=res.items              
            })
        },
        //确认修改
        change(formName){
            let changeEditData=this.changeEditData
            let editData=this.editData
            if(!editData.costPrice && !editData.productType){
                this.dialogTableVisible=false
                return
            }
            this.$refs[formName].validate((valid)=>{
                if(valid){
                    let data=[]
                    changeEditData.forEach(item=>{
                        let obj={}
                        let costPrice = 0;
                        let costNum = Number(editData.costNum);
                        switch (editData.costPrice){
                            case 0:
                                costPrice=item.costPrice
                                break;
                            case 1:
                                costPrice=costNum
                                break;
                            case 2:
                                costPrice=Number(item.originalPrice) + costNum
                                break;
                            case 3:
                                costPrice=Number(item.originalPrice) * costNum
                                break;
                            case 4:
                                costPrice=Number(item.costPrice) + costNum
                                break;
                            case 5:
                                costPrice=Number(item.costPrice) * costNum
                                break;
                        }
                        obj.costPrice=costPrice
                        obj.originalPrice=item.originalPrice
                        editData.productType?obj.productType=editData.productType:delete obj.productType
                        obj.warnProductId=item.warnProductId
                        data.push(obj)
                    })
                    const loading = this.$loading({
                        lock: true,
                        text: 'Loading',
                        spinner: 'el-icon-loading',
                        background: 'rgba(0, 0, 0, 0.7)'
                    });
                    http.post("/warn_product/edit",data,(res)=>{
                        loading.close()
                        if(res){
                            this.$message({
                                message:'修改成功',
                                type:'success'
                            })
                            this.dialogTableVisible=false
                            this.getData({})
                        }
                    })
                }else{
                    return false
                }
            })
        },
        closeDia(formName){
            this.dialogTableVisible=false
            this.$refs[formName].resetFields();
        },
        // 跳转变更日志
        redirect(data){
            this.$router.push({
                path:'/ChangeLog',
                query:{
                    productBn:data.productBn
                }
            })
        },
        //选择
        select(data){
            this.selectOption=data
        },
        //删除
        del(data,type){
            //批量删除
            if(type=='all' && this.selectOption.length<=0){
                this.$message.error("请至少选择一个条件")
                return
            }
            this.$confirm('删除后数据无法恢复，请确认是否执行该操作','提示',{
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let ids=[]
                if(type=='all'){
                    this.selectOption.forEach(item=>{
                        ids.push(item.warnProductId)
                    })
                }else{
                    ids[0]=data.warnProductId
                }

                let query={
                    warn_product_id:['in',ids]
                }
                http.post("/warn_product/remove",query,res=>{
                    if(res){
                        this.$message({
                            type: 'success',
                            message: '删除成功!'
                        });
                        this.getData({})
                    }
                })
                
              }).catch(() => {
                this.$message({
                  type: 'info',
                  message: '已取消删除'
                });
            })
        },

        //导出
        exportReport(val){
            this.isVisible=true
        },
        
        //分页页码
        currentChange(val){
            this.pager.page=val
            this.getData(this.queryData)
        },
        //页数
        sizeChange(val){
            this.pager.rows=val
            this.getData(this.queryData)
        }
    }
}