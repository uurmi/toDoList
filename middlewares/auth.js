const jwt = require("jsonwebtoken");

const SECRET_TOKEN = "thisismysecretkey1998";

module.exports = (req, res, next) => {
  const token = req.header("Authorization");
  try {
    if (!token) return res.status(401).send("Denied");
    const decodedToken = jwt.verify(token, SECRET_TOKEN);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ message: "Auth failed!" });
  }
};
