import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  password: { type: String, required: true, trim: true },
  tc: { type: Boolean, required: true },
  age: {
    type: String,
    required: true,
    trim: true,
    match: [/^[1-9]?\d$/, "Enter Valid Age"],
  },
  gender: { type: String, required: true, trim: true, match: [] },
  address: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
});

const UserModel = mongoose.model("user", userSchema);

export default UserModel;
