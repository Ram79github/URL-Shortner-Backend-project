import mongoose from "mongoose";

<<<<<<< HEAD
const userSchema =new mongoose.Schema({
    fullname:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true
    },
    profileImg:{
        type:String,
    }
},{timestamps:true})

const User = mongoose.model("user", userSchema);
export default User;
=======
const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      required: true,
      default: "NORMAL",
    },
    password: {
      type: String,
      required: true,
    },
    profileImg: {
      type: String,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("user", userSchema);
export default User;
>>>>>>> Feature
