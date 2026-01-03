import { User } from "./authModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const signup = async (req, res) => {
  const { username, email, password, role, location, storeName } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // If the user is a vendor, check if location and storeName are provided
    if (role === "vendor") {
      if (!location || !storeName) {
        return res.status(400).json({
          message: "Location and store name are required for vendors",
        });
      }
    }

    // Hash password and save new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
      location: role === "vendor" ? location : undefined,
      storeName: role === "vendor" ? storeName : undefined,
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    // Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Respond with token and username
    res.status(200).json({
      message: "Signin successful",
      token,
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    console.error("Error during signin:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /vendors?city=Vasai
const getVendorsByLocation = async (req, res) => {
  const { city } = req.query;

  try {
    if (!city) {
      return res.status(400).json({ message: "City parameter is required" });
    }

    const vendors = await User.find({
      role: "vendor",
      location: new RegExp(city, "i"), // Case-insensitive matching
    }).select("-password"); // Security: Exclude hashed passwords from response

    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors,
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { signup, signin, getVendorsByLocation };
