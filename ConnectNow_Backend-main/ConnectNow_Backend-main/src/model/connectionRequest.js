const mongoose = require("mongoose");


const connectionRequestSchema = new mongoose.Schema(
    {
    
        fromUserId:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"user",  
            required:true
        },

        toUserId :{
            type: mongoose.Schema.Types.ObjectId,
            ref:"user",
            required:true
        },

        status :{
            type: String,
            required:true,
            enum:{
                values:["ignore", "interested","accepted","rejected"],
                message:"{value} is not supported"
            },
            
        },
    },
    {
        timestamps:true
    }

);
connectionRequestSchema.index({fromUserId:1, toUserId:1}); 

connectionRequestSchema.pre("save", function(next){

    const connectionRequest = this;
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error("Cannot send connection to your self");
    }
    next();
});

const connectionRequestModel = new mongoose.model("connectionRequest",connectionRequestSchema);

module.exports = {
    connectionRequestModel
};