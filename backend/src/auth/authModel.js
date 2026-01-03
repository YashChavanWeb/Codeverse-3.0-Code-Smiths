import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "vendor"],
      default: "user",
    },
    location: {
      address: {
        type: String,
        required: function () {
          return this.role === "vendor";
        },
        trim: true,
      },
      coordinates: {
        type: String,
        required: function () {
          return this.role === "vendor";
        },
      },
    },
    storeName: {
      type: String,
      required: function () {
        return this.role === "vendor";
      },
      trim: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export { User };
