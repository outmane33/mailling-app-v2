const { default: mongoose } = require("mongoose");
const shema = mongoose.Schema;

const senderOutlookShema = new shema(
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
    recovery_email: {
      type: String,
      required: [true, "Recovery email is required"],
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const SenderOutlook =
  mongoose.models.SenderOutlook ||
  mongoose.model("SenderOutlook", senderOutlookShema);

module.exports = SenderOutlook;
