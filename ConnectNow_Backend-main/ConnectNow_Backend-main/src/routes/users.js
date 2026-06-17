const express = require("express");
const userRouter = express.Router();
const { connectionRequestModel } = require("../model/connectionRequest");
const { userAuth } = require("../middlewares/auth");
const userModel = require("../model/user");

userRouter.get("/user/request/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequest = await connectionRequestModel
      .find({
        toUserId: loggedInUser._id,
        status: "interested",
      })
      .populate("fromUserId", [
        "firstName",
        "lastName",
        "about",
        "photoUrl",
        "age",
      ]);

    res.json({ message: "Data fetched successfully", Data: connectionRequest });
  } catch (err) {
    res.status(400).send("Error:" + err.message);
  }
});

userRouter.get("/user/request/sent", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequest = await connectionRequestModel
      .find({
        fromUserId: loggedInUser._id,
        status: "interested",
      })
      .populate("toUserId", [
        "firstName",
        "lastName",
        "about",
        "photoUrl",
        "age",
      ]);

    res.json({ message: "Data fetched successfully", Data: connectionRequest });
  } catch (err) {
    res.status(400).send("Error:" + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connections = await connectionRequestModel
      .find({
        $or: [
          { fromUserId: loggedInUser._id, status: "accepted" },
          { toUserId: loggedInUser._id, status: "accepted" },
        ],
      })
      .populate("fromUserId", [
        "firstName",
        "lastName",
        "age",
        "photoUrl",
        "about",
      ])
      .populate("toUserId", [
        "firstName",
        "lastName",
        "age",
        "photoUrl",
        "about",
      ]);


    const data = [];
    for (const row of connections) {
      const fromDoc = row?.fromUserId;
      const toDoc = row?.toUserId;
  
      if (!fromDoc || !toDoc || !fromDoc._id || !toDoc._id) continue;

      const isFromMe =
        typeof fromDoc._id.equals === "function"
          ? fromDoc._id.equals(loggedInUser._id)
          : String(fromDoc._id) === String(loggedInUser._id);

      const otherUser = isFromMe ? toDoc : fromDoc;
      if (!otherUser || !otherUser._id) continue;
      data.push(otherUser);
    }

    res.json({ message: "Connections fetched successfully", Data: data });
  } catch (err) {
    res.status(400).send("Error:" + err.message);
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const relatedRequests = await connectionRequestModel
      .find({
        $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
      })
      .select("fromUserId toUserId status createdAt");

    const hideStatuses = new Set(["accepted", "rejected", "ignore"]);
    const hideUserIds = new Set();
    const reqMap = new Map(); 

    for (const r of relatedRequests) {
      const from = r.fromUserId.toString();
      const to = r.toUserId.toString();
      const otherUserId = from === loggedInUser._id.toString() ? to : from;
      if (hideStatuses.has(r.status)) {
        hideUserIds.add(otherUserId);
      } else if (r.status === "interested") {
        reqMap.set(otherUserId, {
          exists: true,
          status: r.status,
          direction:
            from === loggedInUser._id.toString() ? "outgoing" : "incoming",
          requestId: r._id,
        });
      }
    }

    const users = await userModel
      .find({
        _id: { $ne: loggedInUser._id, $nin: Array.from(hideUserIds) },
      })
      .skip(skip)
      .limit(limit);

    const data = users.map((u) => {
      const ui = u.toObject();
      const r = reqMap.get(u._id.toString());
      if (r) ui.requestInfo = r;
      return ui;
    });

    res.json({ message: "Feed fetched successfully", Data: data });
  } catch (err) {
    res.status(400).send("Error:" + err.message);
  }
});

module.exports = userRouter;
