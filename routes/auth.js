const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  if (req.session.logged) {
    return res.redirect("/dashboard/admin");
  }
  res.render("index", { messages: req.flash() });
});

router.get("/login", (req, res) => {
  if (req.session.logged) {
    return res.redirect("/dashboard/admin");
  }
  res.render("login", { messages: req.flash() });
});

router.post("/login", async (req, res) => {
  let { user_id_auth, pass_key } = req.body;
  user_id_auth = user_id_auth.trim();
  pass_key = pass_key.trim();

  if (!user_id_auth || !pass_key) {
    req.flash("error", "Username and Password cannot be empty");
    return res.redirect("/login");
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM admin WHERE username = ? AND pass_key = ?",
      [user_id_auth, pass_key]
    );
    if (rows.length === 1) {
      req.session.user_data = user_id_auth;
      req.session.logged = "start";
      req.session.full_name = user_id_auth;
      req.session.username = rows[0].Full_name;
      res.redirect("/dashboard/admin");
    } else {
      req.flash("error", "Username OR Password is Invalid");
      res.redirect("/login");
    }
  } catch (err) {
    console.error(err);
    req.flash("error", "Server error");
    res.redirect("/login");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

router.get("/forgot-password", (req, res) => {
  res.render("forgot_password", { messages: req.flash() });
});

router.post("/forgot-password", async (req, res) => {
  const { login_id } = req.body;
  if (!login_id) {
    req.flash("error", "Login ID is required");
    return res.redirect("/forgot-password");
  }
  try {
    const [rows] = await db.query("SELECT * FROM admin WHERE username = ?", [
      login_id,
    ]);
    if (rows.length === 0) {
      req.flash("error", "User not found");
      return res.redirect("/forgot-password");
    }
    req.flash("success", "Password reset instructions sent (not implemented)");
    res.redirect("/forgot-password");
  } catch (err) {
    console.error(err);
    req.flash("error", "Server error");
    res.redirect("/forgot-password");
  }
});

router.post("/change-password", async (req, res) => {
  const { login_id, login_key, pwfield, confirmfield } = req.body;
  if (!login_id || !login_key || !pwfield || !confirmfield) {
    req.flash("error", "All fields are required");
    return res.redirect("/forgot-password");
  }
  if (pwfield !== confirmfield) {
    req.flash("error", "Passwords do not match");
    return res.redirect("/forgot-password");
  }
  try {
    const [rows] = await db.query(
      "SELECT * FROM admin WHERE username = ? AND secret_key = ?",
      [login_id, login_key]
    );
    if (rows.length === 0) {
      req.flash("error", "Invalid login ID or secret key");
      return res.redirect("/forgot-password");
    }
    await db.query("UPDATE admin SET pass_key = ? WHERE username = ?", [
      pwfield,
      login_id,
    ]);
    req.flash("success", "Password updated successfully");
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    req.flash("error", "Server error");
    res.redirect("/forgot-password");
  }
});

router.get("/dashboard/admin", (req, res) => {
  if (!req.session.logged) {
    return res.redirect("/login");
  }
  res.render("dashboard", { full_name: req.session.full_name });
});

module.exports = router;
