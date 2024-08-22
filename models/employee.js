const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const employeeSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['admin','employee'],
        default:'employee'
    },
    departmentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Department',
        required:true
    },
    profile:{
        phone:String,
        address:String,
        position:String
    }
}, {timestamps:true });

employeeSchema.pre('save',async function(next){
    const person = this;

    //Hash the password only if it has been modified
    if(!person.isModified('password'))return next();

    try{
        //Hash function generation
        const salt = await bcrypt.genSalt(10);
        
        //Hash password
        const hashedPassword = await bcrypt.hash(person.password,salt);
        person.password = hashedPassword;
        next();

    }catch(err){
        return next(err);
    }
})

employeeSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};



const Employee = mongoose.model('Employee',employeeSchema);

module.exports = Employee;