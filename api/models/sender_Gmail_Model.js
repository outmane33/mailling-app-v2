const { default: mongoose } = require("mongoose");
const shema = mongoose.Schema;

const senderGmailShema = new shema(
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
  },
  { timestamps: true }
);

const SenderGmail =
  mongoose.models.SenderGmail ||
  mongoose.model("SenderGmail", senderGmailShema);

module.exports = SenderGmail;
