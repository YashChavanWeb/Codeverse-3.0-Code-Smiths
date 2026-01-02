import jwt from "jsonwebtoken";
import { User } from "./authModel.js";

const verifyUser = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Remove "Bearer " from the token if present
    const tokenWithoutBearer = token.startsWith("Bearer ")
      ? token.slice(7)
      : token;

    // Verify and decode the token
    const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);

    // Find the user by the ID stored in the token
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    // Attach the user to the request object for use in other routes
    req.user = user;

    next();
  } catch (error) {
    console.error("Error in verifying user:", error);
    return res.status(400).json({ message: "Invalid token." });
  }
};

export default verifyUser;
