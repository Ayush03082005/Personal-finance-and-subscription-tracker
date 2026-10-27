const jwt = require("jsonwebtoken");

/**
 * Generates a JWT, stores it as an HttpOnly cookie, and returns the token string.
 * @param {object} res      - Express response object
 * @param {string} userId   - MongoDB _id of the user
 * @returns {string} token
 */
const generateToken = (res, userId) => {
  const secret = process.env.JWT_SECRET || "smart_finance_tracker_jwt_secret_key_2026";
  const token = jwt.sign(
    { id: userId },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  const isProduction = process.env.NODE_ENV === "production";

  if (res && res.cookie) {
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  return token;
};

module.exports = generateToken;
