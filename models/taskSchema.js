const mongoose = require('mongoose')

const taskSchema = mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    departmentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Department',
        required:true
    },
    assignedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Employee',
        required:true
    },
    status:{
        type:String,
        enum:['pending','in-progress','completed'],
        default:'pending'
    },
    dueDate:{
        type:Date,
        default: Date.now
    }
}, {timestamps:true});

const Task = mongoose.model('Task',taskSchema);
module.exports = Task;