const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: { 
        type: "String", 
        required: true 
    },
    email: { 
        type: "String", 
        unique: true, 
        required: true 
    },
    password: { 
        type: "String", 
        required: true 
    },
    pic: {
      type: "String",
      required: true,
      default:"./public/images/userDefault.jpg",
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
},{ timestaps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;