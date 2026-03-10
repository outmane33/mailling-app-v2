const { default: mongoose } = require("mongoose");
const shema = mongoose.Schema;

const senderBrevoShema = new shema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email must be unique"],
      lowercase: true,
      trim: true,
    },
    app_password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      maxlength: [128, "Password must be less than 128 characters"],
    },
    proxy: {
      type: String,
      required: [true, "Proxy is required"],
      unique: [true, "Proxy must be unique"],
      trim: true,
    },
  },
  { timestamps: true }
);

const SenderBrevo =
  mongoose.models.SenderBrevo ||
  mongoose.model("SenderBrevo", senderBrevoShema);

module.exports = SenderBrevo;
