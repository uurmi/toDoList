const express = require("express");
const router = express.Router();
const Category = require("../models/category");
const Ticket = require("../models/ticket");

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get category by name
router.get("/:name", async (req, res) => {
  try {
    const category = await Category.findOne({ name: req.params.name });
    res.send(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Post category
router.post("/", async (req, res) => {
  const category = new Category({
    name: req.body.name,
    description: req.body.description,
    color: req.body.color,
  });
  try {
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update category
router.patch("/:id", getCategory, async (req, res) => {
  Object.keys(req.body).forEach((element, index) => {
    if (Object.values(req.body)[index] != null) {
      res.category[element] = Object.values(req.body)[index];
    } else {
      res.category[element] = undefined;
    }
  });

  try {
    const updatedCategory = await res.category.save();
    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete category
router.delete("/:id", getCategory, async (req, res) => {
  try {
    await Ticket.deleteMany({category: res.category.name})
    await res.category.deleteOne();
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getCategory(req, res, next) {
  let category;
  try {
    category = await Category.findById(req.params.id);
    if (category == null) {
      return res.status(404).json({ message: "Cannot find category" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.category = category;
  next();
}

module.exports = router;
