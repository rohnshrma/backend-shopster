const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
       username: {
        type: String,
        required: true,
        trim : true,
       },
         email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            match: [/\S+@\S+\.\S+/, "is invalid"],
         },
         password:{
            type: String,
            required: true,
            minlength: [6, "password must be at least 6 characters long"]
         }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("user", userSchema);