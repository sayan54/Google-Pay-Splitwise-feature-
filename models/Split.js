const mongoose = require("mongoose");

const splitSchema = new mongoose.Schema(
  {
    splitResult: {
      type: Array,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Split", splitSchema);
