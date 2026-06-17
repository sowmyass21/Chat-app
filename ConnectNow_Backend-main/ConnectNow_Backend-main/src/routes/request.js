const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { connectionRequestModel } = require("../model/connectionRequest");
const userModel = require("../model/user");

requestRouter.post(
  "/request/send/:status/:touserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.touserId;
      const status = req.params.status;

      const allowedStatus = ["ignore", "interested"];
      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid connection status: " + status });
      }

      const touser = await userModel.findById(toUserId);
      if (!touser) {
        return res.status(400).send("User not found");
      }

      const existingConnectionRequest = await connectionRequestModel.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingConnectionRequest) {
        return res.status(400).json({
          message: "Connection request already exists. Please check once.",
        });
      }

      const connectionRequest = new connectionRequestModel({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();
      res.json({
        message:
          req.user.firstName + " is " + status + " in " + touser.firstName,
      });
    } catch (err) {
      res.status(500).send("Error: " + err.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user._id;
      const requestId = req.params.requestId;
      const status = req.params.status;

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid connection status: " + status });
      }

      const connectionRequest = await connectionRequestModel.findOne({
        _id: requestId,
        toUserId: loggedInUser,
        status: "interested",
      });
      if (!connectionRequest) {
        return res
          .status(400)
          .json({ message: "Connection request not found" });
      }

      connectionRequest.status = status;
      await connectionRequest.save();
      res.json({ message: "Connection request status updated to " + status });
    } catch (err) {
      res.status(500).send("Error: " + err.message);
    }
  }
);

requestRouter.delete(
  "/request/withdraw/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const existing = await connectionRequestModel.findOne({
        fromUserId,
        toUserId,
        status: "interested",
      });
      if (!existing) {
        return res
          .status(404)
          .json({ message: "No pending request to withdraw" });
      }
      await connectionRequestModel.deleteOne({ _id: existing._id });
      return res.json({ message: "Connection request withdrawn" });
    } catch (err) {
      return res.status(500).json({ message: "Error: " + err.message });
    }
  }
);

module.exports = requestRouter;
