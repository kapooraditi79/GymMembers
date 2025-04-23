const express = require("express");
const router = express.Router();
const db = require("../db");

// GET: Render payments page
router.get("/", async (req, res) => {
  if (!req.session.logged) {
    return res.redirect("/login");
  }
  try {
    const [payments] = await db.query(`
      SELECT p.payment_id, p.membership_id, m.name, p.new_plan, p.amount, p.validity, p.payment_date
      FROM payments p
      JOIN members m ON p.membership_id = m.membership_id
    `);
    res.render("payments", {
      full_name: req.session.full_name,
      payments: payments,
      messages: req.flash(),
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Error fetching payments");
    res.redirect("/dashboard/admin");
  }
});

// GET: Render add payment form
router.get("/add", async (req, res) => {
  if (!req.session.logged) {
    return res.redirect("/login");
  }
  try {
    const [members] = await db.query(
      "SELECT membership_id, name, plan FROM members"
    );
    res.render("add_payment", {
      full_name: req.session.full_name,
      members: members,
      messages: req.flash(),
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Error loading members");
    res.redirect("/dashboard/admin");
  }
});

// POST: Add new payment
router.post("/add", async (req, res) => {
  if (!req.session.logged) {
    return res.redirect("/login");
  }
  const { membership_id, new_plan, amount, validity } = req.body;

  // Server-side validation
  if (!membership_id || !new_plan || !amount || !validity) {
    req.flash("error", "All fields are required");
    return res.redirect("/payments/add");
  }
  if (isNaN(amount) || amount <= 0) {
    req.flash("error", "Amount must be a positive number");
    return res.redirect("/payments/add");
  }

  try {
    // Verify membership_id exists
    const [member] = await db.query(
      "SELECT membership_id FROM members WHERE membership_id = ?",
      [membership_id]
    );
    if (member.length === 0) {
      req.flash("error", "Invalid Membership ID");
      return res.redirect("/payments/add");
    }

    // Insert payment
    await db.query(
      "INSERT INTO payments (membership_id, new_plan, amount, validity, payment_date) VALUES (?, ?, ?, ?, CURDATE())",
      [membership_id, new_plan, amount, validity]
    );
    req.flash("success", "Payment added successfully");
    res.redirect("/payments/add");
  } catch (err) {
    console.error(err);
    req.flash("error", "Error adding payment");
    res.redirect("/payments/add");
  }
});

// GET: Fetch member details for AJAX
router.get("/member/:membership_id", async (req, res) => {
  try {
    const [member] = await db.query(
      "SELECT name, plan FROM members WHERE membership_id = ?",
      [req.params.membership_id]
    );
    if (member.length === 0) {
      return res.status(404).json({ error: "Member not found" });
    }
    res.json(member[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
