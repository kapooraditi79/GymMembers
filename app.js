const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const authRoutes = require("./routes/auth");
const healthRoutes = require("./routes/health");
const paymentRoutes = require("./routes/payments");
const userRoutes = require("./routes/users");

const app = express();

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "gym_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());

// Routes
app.use("/", authRoutes);
app.use("/health", healthRoutes);
app.use("/payments", paymentRoutes);
app.use("/users", userRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
