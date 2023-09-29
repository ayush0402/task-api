// Import required modules and configure environment variables
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
require("dotenv").config();

// Create an express application
const app = express();

// Configure the application port
const port = process.env.PORT || 3000;

// Middleware: Configure morgan and body-parser
app.use(morgan("dev"));
app.use(bodyParser.json());

// Middleware to check if a query parameter is numeric
function checkNumericQueryParam(req, res, next) {
  const numericParams = ["jobValue", "jobId"];

  for (const param of numericParams) {
    if (req.query[param] !== undefined && isNaN(req.query[param])) {
      return res
        .status(400)
        .json({ error: `${param} must be a numeric value` });
    }
  }

  next(); // Continue to the next middleware or route handler
}

// Middleware: Check if the query parameters are numeric
app.use(checkNumericQueryParam);

// A Map to store the jobs
const jobMap = new Map();

app.get("/all", (req, res) => {
  try {
    // Retrieve the jobValue query parameter with a default value of 0
    const { jobValue = 0 } = req.query;

    // Convert jobValue to a number to ensure it's treated as a numeric comparison
    const numericJobValue = parseFloat(jobValue);

    // Return all the jobs with IDs greater than or equal to numericJobValue, sorted by jobValue
    const jobs = Array.from(jobMap.entries())
      .filter(([jobId, value]) => value >= numericJobValue)
      .sort((a, b) => a[1] - b[1]);

    res.json({ jobs });
  } catch (error) {
    console.error("Error while processing the /all route:", error);
    res.status(500).json({ e: "Internal Server Error" + error });
  }
});

app.post("/add", (req, res) => {
  try {
    const { jobId, jobValue } = req.query;

    // Check if jobId or jobValue is missing
    if (!jobId || !jobValue) {
      throw new Error("jobId and jobValue must be provided");
    }

    jobMap.set(jobId, jobValue);
    res.json({ stat: "ok" });
  } catch (error) {
    console.error("Error while processing the /add route:", error);
    res.status(500).json({ e: "Internal Server Error" + error });
  }
});

app.delete("/remove", (req, res) => {
  try {
    const { jobId } = req.query;

    // Check if jobId is missing
    if (!jobId) {
      throw new Error("jobId must be provided");
    }

    // Check if jobId exists in the jobMap
    if (!jobMap.has(jobId)) {
      res.status(404).json({ error: "Job ID not found" });
      return;
    }

    jobMap.delete(jobId);
    res.json({ stat: "ok" });
  } catch (error) {
    console.error("Error while processing the /remove route:", error);
    res.status(500).json({ e: "Internal Server Error" + error });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
