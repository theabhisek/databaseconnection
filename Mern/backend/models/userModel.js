const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
    maxLength: [30, "Name cannot exceed 30 character"],
    minLenght: [4, "Name should have more than 4 character"],
  },
  email: {
    type: String,
    required: [true, "Please Enter your Email"],
    unique: true,
    validate: [validator.isEmail, "Please Enter Your Email"],
  },
  password: {
    type: String,
    required: [true, "Please Enter your Password"],
    minLength: [8, "Password should be greater than 8 characters"]
  },
  avatar: {
    public_id: {
      type: String,
     
    },
    url: {
      type: String,
    },
  },
  role: {
    type: String,
    default:"admin",
  },

  resetPasswordToken:String,
  resetPasswordExpire:Date
});
userSchema.pre("save",async function(next){

    this.password = await bcrypt.hash(this.password,10)
})
//Jwt Token
userSchema.methods.getJwtToken  = function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.Jwt_EXPIRE
    })
}


//Compare Password
userSchema.methods.comparePassword = async function(entertedPasword){
   return await bcrypt.compare(entertedPasword,this.password)
}

// Generating Password Reset Token
userSchema.methods.getResetPasswordToken = async function(){

  //Generating Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  //Hashing and adding  reset password  to userSchema
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest('hex')

  this.resetPasswordExpire  = Date.now()  + 15 * 60 * 1000;

  return resetToken
}

module.exports = mongoose.model("User",userSchema)
