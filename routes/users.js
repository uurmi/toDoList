const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_TOKEN = "thisismysecretkey1998";

// SIGNUP ROUTE

router.post("/signup", async (req, res, next) => {
  User.findOne({ email: req.body.email }).then((user1) => {
    if (user1) {
      return res.status(401).json({
        message: "User Already Exist",
      });
    }
  });

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    email: req.body.email,
    password: hashedPassword,
  });

  try {
    user.save().then((result) => {
      if (!result) {
        return res.status(500).json({
          message: "Error Creating User",
        });
      }
      res.status(201).json({
        message: "User created!",
      });
    });
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
});

//  LOGIN ROUTE

router.post("/login", (req, res, next) => {
  let fetchedUser;

  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: "Auth failed no such user",
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then((result) => {
      if (!result) {
        return res.status(401).json({
          message: "Auth failed inccorect password",
        });
      }

      // CREATING THE JSON WEBTOKEN WITH SIGNATURE AND KEY

      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        SECRET_TOKEN
      );
      res
        .header("Authorization", token)
        .send({ token: token, userId: fetchedUser._id });
    })
    .catch((e) => {
      console.log(e);
    });
});

module.exports = router;
