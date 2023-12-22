const mongoose = require("mongoose");
const { Schema } = mongoose;

const PowerBiDataSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const PowerBiData = mongoose.model("PowerBiData", PowerBiDataSchema);

module.exports = PowerBiData;
