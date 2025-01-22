// imageModel.js
const { default: mongoose } = require("mongoose");
const path = require("path");

const imageSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

const setImageUrl = (doc) => {
  if (doc.fileName) {
    // Use path.join to create proper file path
    const imageUrl = `${process.env.BACKEND_URL}/${doc.fileName}`;
    doc.fileName = imageUrl; // Store the full URL in a separate field
  }
};

imageSchema.post("init", function (doc) {
  setImageUrl(doc);
});

imageSchema.post("save", function (doc) {
  setImageUrl(doc);
});

const Image = mongoose.model("Image", imageSchema);
module.exports = Image;
