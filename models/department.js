const mongoose = require('mongoose')

const departmentSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        required:true
    },
    employees:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Employee'
    }]

}, {timestamps:true});

const Department = mongoose.model('Department',departmentSchema);
module.exports = Department;