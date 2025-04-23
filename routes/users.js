const express = require("express");
const router = express.Router();
const db = require("../db");

// GET: Render members list
router.get("/members", async (req, res) => {
  if (!req.session.logged) {
    return res.redirect("/login");
  }
  try {
    const [members] = await db.query("SELECT * FROM members");
    res.render("members", {
      full_name: req.session.full_name,
      members: members,
      messages: req.flash(),
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Error fetching members");
    res.redirect("/dashboard/admin");
  }
});

// GET: Render add member form
router.get("/add", (req, res) => {
  if (!req.session.logged) {
    return res.redirect("/login");
  }
  res.render("add_user", {
    full_name: req.session.full_name,
    messages: req.flash(),
  });
});

// POST: Add new member
router.post("/add", async (req, res) => {
  if (!req.session.logged) {
    return res.redirect("/login");
  }
  const {
    membership_id,
    name,
    street_name,
    city,
    zipcode,
    state,
    gender,
    dob,
    phone_no,
    email_id,
    joining_date,
    plan,
    amount,
    validity,
  } = req.body;

  // Server-side validation
  if (
    !membership_id ||
    !name ||
    !street_name ||
    !city ||
    !zipcode ||
    !state ||
    !gender ||
    !dob ||
    !phone_no ||
    !email_id ||
    !joining_date ||
    !plan ||
    !amount ||
    !validity
  ) {
    req.flash("error", "All fields are required");
    return res.redirect("/users/add");
  }
  if (!/^[0-9]{10}$/.test(phone_no)) {
    req.flash("error", "Phone number must be 10 digits");
    return res.redirect("/users/add");
  }
  if (!/^[0-9]{5,10}$/.test(zipcode)) {
    req.flash("error", "Zipcode must be 5-10 digits");
    return res.redirect("/users/add");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_id)) {
    req.flash("error", "Invalid email format");
    return res.redirect("/users/add");
  }
  if (isNaN(amount) || amount <= 0) {
    req.flash("error", "Amount must be a positive number");
    return res.redirect("/users/add");
  }

  try {
    // Check for duplicate membership_id
    const [existing] = await db.query(
      "SELECT membership_id FROM members WHERE membership_id = ?",
      [membership_id]
    );
    if (existing.length > 0) {
      req.flash("error", "Membership ID already exists");
      return res.redirect("/users/add");
    }

    // Insert new member
    await db.query(
      "INSERT INTO members (membership_id, name, street_name, city, zipcode, state, gender, dob, phone_no, email_id, joining_date, plan, amount, validity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        membership_id,
        name,
        street_name,
        city,
        zipcode,
        state,
        gender,
        dob,
        phone_no,
        email_id,
        joining_date,
        plan,
        amount,
        validity,
      ]
    );
    req.flash("success", "Member added successfully");
    res.redirect("/users/add");
  } catch (err) {
    console.error(err);
    req.flash("error", "Error adding member");
    res.redirect("/users/add");
  }
});

module.exports = router;
