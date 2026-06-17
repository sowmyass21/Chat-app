const { default: mongoose } = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  photo:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"photo",
    required:true
  },
  text:{
    type:String,
    required:true
  },
  
  createdAt: { type: Date, default: Date.now },
});

const commentModel = mongoose.model("comment", commentSchema);

module.exports = commentModel;