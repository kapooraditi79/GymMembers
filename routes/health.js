const express = require("express");
const router = express.Router();
const db = require("../db");

// GET: Render add health status form
router.get("/new", async (req, res) => {
  if (!req.session.logged) {
    return res.redirect("/login");
  }
  try {
    const [members] = await db.query(
      "SELECT membership_id, name, dob, gender, joining_date FROM members"
    );
    res.render("add_health", {
      full_name: req.session.full_name,
      members: members,
      messages: req.flash(),
    });
  } catch (err) {
    console.error("Error loading members for health form:", err);
    req.flash("error", "Error loading members");
    res.redirect("/dashboard/admin");
  }
});

// POST: Add new health status
router.post("/new", async (req, res) => {
  if (!req.session.logged) {
    return res.redirect("/login");
  }
  const { membership_id, calorie, height, weight, fat, remarks } = req.body;

  // Server-side validation
  if (!membership_id || !calorie || !height || !weight || !fat || !remarks) {
    req.flash("error", "All fields are required");
    return res.redirect("/health/new");
  }
  if (isNaN(calorie) || calorie <= 0) {
    req.flash("error", "Calorie must be a positive number");
    return res.redirect("/health/new");
  }
  if (isNaN(height) || height <= 0) {
    req.flash("error", "Height must be a positive number");
    return res.redirect("/health/new");
  }
  if (isNaN(weight) || weight <= 0) {
    req.flash("error", "Weight must be a positive number");
    return res.redirect("/health/new");
  }
  if (isNaN(fat) || fat < 0) {
    req.flash("error", "Fat must be a non-negative number");
    return res.redirect("/health/new");
  }

  try {
    // Verify membership_id exists
    const [member] = await db.query(
      "SELECT membership_id FROM members WHERE membership_id = ?",
      [membership_id]
    );
    if (member.length === 0) {
      req.flash("error", "Invalid Membership ID");
      return res.redirect("/health/new");
    }

    // Insert health status
    await db.query(
      "INSERT INTO health_status (membership_id, calorie, height, weight, fat, remarks, record_date) VALUES (?, ?, ?, ?, ?, ?, CURDATE())",
      [membership_id, calorie, height, weight, fat, remarks]
    );
    req.flash("success", "Health status added successfully");
    res.redirect("/health/new");
  } catch (err) {
    console.error("Error adding health status:", err);
    req.flash("error", "Error adding health status");
    res.redirect("/health/new");
  }
});

// GET: Render health status table
router.get("/", async (req, res) => {
  if (!req.session.logged) {
    return res.redirect("/login");
  }
  try {
    const [healthRecords] = await db.query(`
      SELECT h.health_id, h.membership_id, m.name AS user_name, m.dob, m.gender, m.joining_date, 
             h.calorie, h.height, h.weight, h.fat, h.remarks, h.record_date
      FROM health_status h
      JOIN members m ON h.membership_id = m.membership_id
    `);
    if (!healthRecords.length) {
      console.log("No health records found");
    }
    res.render("health", {
      full_name: req.session.full_name,
      healthRecords: healthRecords,
      messages: req.flash(),
    });
  } catch (err) {
    console.error("Error fetching health status:", err);
    req.flash("error", "Error fetching health status");
    res.redirect("/dashboard/admin");
  }
});

// GET: Fetch member details for AJAX
router.get("/member/:membership_id", async (req, res) => {
  try {
    const [member] = await db.query(
      "SELECT name, dob, gender, joining_date FROM members WHERE membership_id = ?",
      [req.params.membership_id]
    );
    if (member.length === 0) {
      return res.status(404).json({ error: "Member not found" });
    }
    res.json(member[0]);
  } catch (err) {
    console.error("Error fetching member details:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
