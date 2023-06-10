const express = require("express");
const router = express.Router();
const Ticket = require("../models/ticket");
const Category = require("../models/category");
const ticket = require("../models/ticket");

// Get all tickets
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    let tickets = [];
    for (var i = 0; i < categories.length; i++) {
      let ticketsByCategory = await Ticket.find({
        category: categories[i].name,
        done: false,
      });
      tickets.push({
        category: categories[i],
        tickets: ticketsByCategory,
      });
    }
    let doneTickets = await Ticket.find({ done: true });
    tickets.push({
      category: { name: "Done" },
      tickets: doneTickets,
    });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all tickets from one category
router.get("/byCategory/:category", async (req, res) => {
  let query;
  if (req.params.category == "Done") {
    query = {
      done: true,
    };
  } else {
    query = {
      category: req.params.category,
      done: false,
    };
  }
  try {
    const tickets = await Ticket.find(query).sort({ position: "asc" });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one ticket
router.get("/:id", getTicket, async (req, res) => {
  res.send(res.ticket);
});

// Post ticket
router.post("/", async (req, res) => {
  const count = await Ticket.find({
    category: req.body.category,
    done: false,
  }).count();
  const ticket = new Ticket({
    name: req.body.name,
    description: req.body.description,
    deadline: req.body.deadline,
    category: req.body.category,
    steps: req.body.steps,
    stepsChecked: req.body.stepsChecked,
    position: count,
  });
  try {
    const newTicket = await ticket.save();
    res.status(201).json(newTicket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update ticket position
router.patch("/updatePosition/:id", getTicket, async (req, res) => {
  if (req.body.previousContainer == req.body.currentContainer) {
    sortWithinContainer(req, res);
  } else {
    sortOutsideContainer(req, res);
  }
});

async function sortWithinContainer(req, res) {
  let startPosition, endPosition, shift;
  if (req.body.currentPosition > req.body.previousPosition) {
    endPosition = req.body.currentPosition;
    startPosition = req.body.previousPosition + 1;
    shift = -1;
  } else {
    startPosition = req.body.currentPosition;
    endPosition = req.body.previousPosition - 1;
    shift = 1;
  }
  let query;
  if (req.body.currentContainer == "Done") {
    query = {
      done: true,
    };
  } else {
    query = {
      done: false,
      category: req.body.currentContainer,
    };
  }

  try {
    const ticketsToUpdate = await Ticket.find(query)
      .where("position")
      .gte(startPosition)
      .lte(endPosition);

    ticketsToUpdate.forEach(async (item) => {
      item.position += shift;
      await item.save();
    });
    res.ticket.position = req.body.currentPosition;
    const updatedTicket = await res.ticket.save();
    res.json(ticketsToUpdate);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function sortOutsideContainer(req, res) {
  try {
    let upshiftQuery, downshiftQuery;
    if (req.body.currentContainer == "Done") {
      res.ticket.done = true;
      res.ticket.doneDate = req.body.doneDate;
      upshiftQuery = {
        done: true,
      };
    } else {
      res.ticket.category = req.body.currentContainer;
      upshiftQuery = {
        category: req.body.currentContainer,
        done: false,
      };
    }
    if (req.body.previousContainer == "Done") {
      res.ticket.done = false;
      res.ticket.doneDate = undefined;
      downshiftQuery = {
        done: true,
      };
    } else {
      downshiftQuery = {
        category: req.body.previousContainer,
        done: false,
      };
    }

    const ticketsToShiftUp = await Ticket.find(upshiftQuery)
      .where("position")
      .gte(req.body.currentPosition);

    const ticketsToShiftDown = await Ticket.find(downshiftQuery)
      .where("position")
      .gt(req.body.previousPosition);

    ticketsToShiftUp.forEach(async (item) => {
      item.position += 1;
      await item.save();
    });

    ticketsToShiftDown.forEach(async (item) => {
      item.position = item.position - 1;
      await item.save();
    });

    res.ticket.position = req.body.currentPosition;
    const updatedTicket = await res.ticket.save();
    res.json(updatedTicket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// Update ticket
router.patch("/:id", getTicket, async (req, res) => {
  Object.keys(req.body).forEach((element, index) => {
    if (Object.values(req.body)[index] != null) {
      res.ticket[element] = Object.values(req.body)[index];
    } else {
      res.ticket[element] = undefined;
    }
  });

  try {
    const updatedTicket = await res.ticket.save();
    res.json(updatedTicket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete ticket
router.delete("/:id", getTicket, async (req, res) => {
  try {
    let query;
    if (res.ticket.done == true) {
      query = { done: true };
    } else {
      query = { done: false, category: res.ticket.category };
    }
    const ticketsToShiftDown = await Ticket.find(query)
      .where("position")
      .gt(res.ticket.position);
    ticketsToShiftDown.forEach((item) => {
      item.position = item.position - 1;
      item.save();
    });
    await res.ticket.deleteOne();
    res.json({ message: "Ticket deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getTicket(req, res, next) {
  let ticket;
  try {
    ticket = await Ticket.findById(req.params.id);
    if (ticket == null) {
      return res.status(404).json({ message: "Cannot find ticket" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.ticket = ticket;
  next();
}

module.exports = router;
