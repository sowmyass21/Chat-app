const { default: mongoose } = require("mongoose");


const photoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],
  createdAt: { type: Date, default: Date.now },
}); 

const photoModel = mongoose.model("photo", photoSchema);

module.exports = photoModel;