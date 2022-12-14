var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const Sequelize = require("sequelize");
const jwt = require("express-jwt");
const sequelizeInstance = require("./models/index").sequelize;
const forest = require("forest-express-sequelize");
const cors = require("cors");

console.log({ sequelizeInstance });

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

let allowedOrigins = [/\.forestadmin\.com$/, /localhost:\d{4}$/];

const ALLOWED_CORS = "http://localhost:3000,http://app.forestadmin.com";

allowedOrigins = allowedOrigins.concat(ALLOWED_CORS.split(","));

const corsConfig = {
  origin: [/\.forestadmin\.com$/, /localhost:\d{4}$/],
  maxAge: 86400, // NOTICE: 1 day
  credentials: true,
};

// Support for request-private-network as the `cors` package
// doesn't support it by default
// See: https://github.com/expressjs/cors/issues/236
app.use((req, res, next) => {
  if (req.headers["access-control-request-private-network"]) {
    res.setHeader("access-control-allow-private-network", "true");
  }
  next(null);
});

app.use(
  "/forest/authentication",
  cors({
    ...corsConfig,
    // The null origin is sent by browsers for redirected AJAX calls
    // we need to support this in authentication routes because OIDC
    // redirects to the callback route
    origin: corsConfig.origin.concat("null"),
  })
);

app.use(cors(corsConfig));

const FOREST_AUTH_SECRET = "";
const FOREST_ENV_SECRET = "";

app.use(
  jwt({
    secret: FOREST_AUTH_SECRET,
    credentialsRequired: false,
    algorithms: ["HS256"],
  })
);

forest
  .init({
    envSecret: FOREST_ENV_SECRET,
    authSecret: FOREST_AUTH_SECRET,
    objectMapping: Sequelize,
    connections: { default: sequelizeInstance },
  })
  .then((FAMiddleware) => {
    app.use(FAMiddleware);
  });

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
