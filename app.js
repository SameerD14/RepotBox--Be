require("dotenv").config({ quiet: true });
var cookieParser = require("cookie-parser");
var createError = require("http-errors");
var express = require("express");
var logger = require("morgan");
const cors = require("cors");
var path = require("path");

//import routes
const connectDB = require("./config/db"); //DB Config
const groupRoutes = require("./routes/groupRoutes");
const rightRoutes = require("./routes/rightRoutes");
const userRoutes = require("./routes/userRoutes");
const groupRightRoutes = require("./routes/groupRightRoutes");
const groupUserRoutes = require("./routes/groupUserRoutes");
const complaintsRoutes = require("./routes/complaintRoutes");
const commentRoutes = require("./routes/commentRoutes");
const likeRoutes = require("./routes/likeRoutes");
const authRoutes = require("./routes/authRoutes");
const uploadImage = require("./routes/imageRoutes");
const pushTokenRoutes = require("./routes/pushTokenRoutes");
/* -------------------------------------------------------------------------- */
var app = express();
const PORT = process.env.PORT || 8080;

/* ------------------------------ db connection ----------------------------- */

connectDB();

/* ------------------------------- Middleware ------------------------------- */
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ------------------------------- Router Path ------------------------------ */

app.get("/", (req, res) => {
	res.send("Hurry its Working");
});
app.use("/api/groups", groupRoutes);
app.use("/api/rights", rightRoutes);
app.use("/api/group-rights", groupRightRoutes);
app.use("/api/users", userRoutes);
app.use("/api/group-users", groupUserRoutes);
app.use("/api/complaints", complaintsRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/like", likeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadImage);
app.use("/api/token", pushTokenRoutes);
/* --------------------------------- Listener --------------------------------- */
app.listen(PORT, () => {
	console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

/* ----------------  catch 404 and forward to error handler --------------- */
app.use(function (req, res, next) {
	next(createError(404));
});

/* ----------------------------  error handler ---------------------------- */
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
