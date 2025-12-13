const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const methodOverride = require("method-override");
const { stringify } = require("querystring");
const multer = require("multer");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
require("dotenv").config();

const app = express();
const pool = require("./db");
const fs = require("fs");
const mammoth = require("mammoth");
const s3Client = require("./s3Client");

const upload = multer({ dest: "uploads/" }).single("file");
const letterBucket =
  process.env.LETTER_BUCKET_NAME || process.env.STORAGE_LETTERS_BUCKETNAME;

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? 'http://directors-letters-frontend.s3-website.us-east-2.amazonaws.com'
    : 'http://localhost:5173', // Vite dev server port
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      // look in urlencoded POST bodies and delete it
      var method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

const homeStartingContent = "";
const aboutContent = " about zach";
const contactContent = "contact zach";

// New API routes for authentication
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
      [username, hashedPassword]
    );

    const user = newUser.rows[0];
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'your_default_secret', { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Error registering new user." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'your_default_secret', { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});



function authenticateToken(req, res, next) {
  if (process.env.REQUIRE_AUTH !== "true") {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'your_default_secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// API-based letter routes
app.get("/api/letters", async (req, res) => {
  try {
    const searchQuery = req.query.search || "";
    const categoryFilter = req.query.category || "";

    const query = `
      SELECT l.*, w.name AS writer_name, r.name AS recipient_name, c.name AS category_name
      FROM letters l
      INNER JOIN letterwriters w ON l.writer_id = w.writer_id
      INNER JOIN letterrecipients r ON l.recipient_id = r.recipient_id
      INNER JOIN lettercategories c ON l.category_id = c.category_id
      WHERE (l.title ILIKE $1 OR l.content::text ILIKE $1)
      ${categoryFilter ? "AND c.category_id = $2" : ""}
    `;

    const searchParam = `%${searchQuery}%`;
    const queryParams = [searchParam];

    if (categoryFilter) {
      queryParams.push(categoryFilter);
    }

    const { rows } = await pool.query(query, queryParams);
    const rowsWithUrls = await Promise.all(
      rows.map(async (row) => ({
        ...row,
        s3_url: await buildSignedUrl(row.s3_key),
      }))
    );
    res.json(rowsWithUrls);
  } catch (error) {
    console.error("Error fetching letters:", error);
    res.status(500).json({ message: "Error fetching letters." });
  }
});

app.get("/api/letters/director/:directorName", async (req, res) => {
  try {
    const { directorName } = req.params;
    const searchQuery = req.query.search || "";
    const categoryFilter = req.query.category || "";

    const query = `
      SELECT l.*, w.name AS writer_name, r.name AS recipient_name, c.name AS category_name
      FROM letters l
      INNER JOIN letterwriters w ON l.writer_id = w.writer_id
      INNER JOIN letterrecipients r ON l.recipient_id = r.recipient_id
      INNER JOIN lettercategories c ON l.category_id = c.category_id
      WHERE w.name = $1
      AND (l.title ILIKE $2 OR l.content::text ILIKE $2)
      ${categoryFilter ? "AND c.category_id = $3" : ""}
    `;

    const searchParam = `%${searchQuery}%`;
    const queryParams = [directorName, searchParam];

    if (categoryFilter) {
      queryParams.push(categoryFilter);
    }

    const { rows } = await pool.query(query, queryParams);
    const rowsWithUrls = await Promise.all(
      rows.map(async (row) => ({
        ...row,
        s3_url: await buildSignedUrl(row.s3_key),
      }))
    );
    res.json(rowsWithUrls);
  } catch (error) {
    console.error("Error fetching director letters:", error);
    res.status(500).json({ message: "Error fetching director letters." });
  }
});

app.get("/api/letters/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM letters WHERE letter_id = $1", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Letter not found." });
    }
    const signedUrl = await buildSignedUrl(rows[0].s3_key);
    res.json({ ...rows[0], s3_url: signedUrl });
  } catch (error) {
    console.error("Error fetching letter:", error);
    res.status(500).json({ message: "Error fetching letter." });
  }
});

app.post("/api/letters", authenticateToken, upload, async (req, res) => {
    const { title, writer, recipient, category } = req.body;
    const file = req.file;

    try {
        const filePath = path.join(__dirname, "uploads", file.filename);
        const fileBuffer = fs.readFileSync(filePath);
        const result = await mammoth.convertToHtml({ buffer: fileBuffer });
        const htmlContent = result.value;

        const timestamp = Date.now();
        const sanitizedTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const s3Key = `letters/${sanitizedTitle || "letter"}-${timestamp}.html`;

        await uploadHtmlToS3(s3Key, htmlContent);

        const query = "INSERT INTO letters (title, content, writer_id, recipient_id, category_id, s3_key, s3_bucket) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *";
        const values = [title, htmlContent, writer, recipient, category, s3Key, letterBucket];

        const { rows } = await pool.query(query, values);
        const signedUrl = await buildSignedUrl(s3Key);
        res.status(201).json({ ...rows[0], s3_url: signedUrl });
    } catch (error) {
        console.error("Error creating letter:", error);
        res.status(500).json({ message: "Error creating letter." });
    }
});

app.put("/api/letters/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, writer, recipient, category } = req.body;

        const query = "UPDATE letters SET title = $1, content = $2, writer_id = $3, recipient_id = $4, category_id = $5 WHERE letter_id = $6 RETURNING *";
        const values = [title, content, writer, recipient, category, id];

        const { rows } = await pool.query(query, values);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Letter not found." });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error("Error updating letter:", error);
        res.status(500).json({ message: "Error updating letter." });
    }
});

app.delete("/api/letters/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query("DELETE FROM letters WHERE letter_id = $1 RETURNING *", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Letter not found." });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting letter:", error);
        res.status(500).json({ message: "Error deleting letter." });
    }
});

const fetchDropdownOptions = async () => {
  const writerQuery = "SELECT * FROM letterwriters ORDER BY name";
  const recipientQuery = "SELECT * FROM letterrecipients ORDER BY name";
  const categoryQuery = "SELECT * FROM lettercategories ORDER BY name";

  const [writerResult, recipientResult, categoryResult] = await Promise.all([
    pool.query(writerQuery),
    pool.query(recipientQuery),
    pool.query(categoryQuery),
  ]);

  return {
    letterwriters: writerResult.rows,
    letterrecipients: recipientResult.rows,
    lettercategories: categoryResult.rows,
  };
};

const uploadHtmlToS3 = async (key, htmlContent) => {
  if (!letterBucket) {
    throw new Error("LETTER_BUCKET_NAME/STORAGE_LETTERS_BUCKETNAME is not set");
  }

  const putCommand = new PutObjectCommand({
    Bucket: letterBucket,
    Key: key,
    Body: htmlContent,
    ContentType: "text/html",
  });

  await s3Client.send(putCommand);
  return key;
};

const buildSignedUrl = async (key) => {
  if (!key || !letterBucket) return null;

  const getCommand = new GetObjectCommand({ Bucket: letterBucket, Key: key });
  return getSignedUrl(s3Client, getCommand, { expiresIn: 60 * 60 });
};

app.get("/api/form-data/add-letter", async (req, res) => {
  try {
    const options = await fetchDropdownOptions();
    res.json(options);
  } catch (error) {
    console.error("Error fetching form data:", error);
    res.status(500).json({ message: "Error fetching form data." });
  }
});

app.get("/api/options", async (req, res) => {
  try {
    const options = await fetchDropdownOptions();
    res.json(options);
  } catch (error) {
    console.error("Error fetching options:", error);
    res.status(500).json({ message: "Error fetching options." });
  }
});

app.get("/api/options/writers", async (req, res) => {
  try {
    const options = await fetchDropdownOptions();
    res.json(options.letterwriters);
  } catch (error) {
    console.error("Error fetching writers:", error);
    res.status(500).json({ message: "Error fetching writers." });
  }
});

app.get("/api/options/recipients", async (req, res) => {
  try {
    const options = await fetchDropdownOptions();
    res.json(options.letterrecipients);
  } catch (error) {
    console.error("Error fetching recipients:", error);
    res.status(500).json({ message: "Error fetching recipients." });
  }
});

app.get("/api/options/categories", async (req, res) => {
  try {
    const options = await fetchDropdownOptions();
    res.json(options.lettercategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Error fetching categories." });
  }
});

app.post("/api/options/writers", authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Writer name is required." });
    }

    const insertQuery =
      "INSERT INTO letterwriters (name) VALUES ($1) RETURNING writer_id, name";
    const { rows } = await pool.query(insertQuery, [name]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error creating writer:", error);
    res.status(500).json({ message: "Error creating writer." });
  }
});

app.put("/api/options/writers/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Writer name is required." });
    }

    const updateQuery =
      "UPDATE letterwriters SET name = $1 WHERE writer_id = $2 RETURNING writer_id, name";
    const { rows } = await pool.query(updateQuery, [name, id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Writer not found." });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error updating writer:", error);
    res.status(500).json({ message: "Error updating writer." });
  }
});

app.post("/api/options/recipients", authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Recipient name is required." });
    }

    const insertQuery =
      "INSERT INTO letterrecipients (name) VALUES ($1) RETURNING recipient_id, name";
    const { rows } = await pool.query(insertQuery, [name]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error creating recipient:", error);
    res.status(500).json({ message: "Error creating recipient." });
  }
});

app.put(
  "/api/options/recipients/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Recipient name is required." });
      }

      const updateQuery =
        "UPDATE letterrecipients SET name = $1 WHERE recipient_id = $2 RETURNING recipient_id, name";
      const { rows } = await pool.query(updateQuery, [name, id]);

      if (rows.length === 0) {
        return res.status(404).json({ message: "Recipient not found." });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error("Error updating recipient:", error);
      res.status(500).json({ message: "Error updating recipient." });
    }
  }
);

app.post("/api/options/categories", authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Category name is required." });
    }

    const insertQuery =
      "INSERT INTO lettercategories (name) VALUES ($1) RETURNING category_id, name";
    const { rows } = await pool.query(insertQuery, [name]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Error creating category." });
  }
});

app.put(
  "/api/options/categories/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Category name is required." });
      }

      const updateQuery =
        "UPDATE lettercategories SET name = $1 WHERE category_id = $2 RETURNING category_id, name";
      const { rows } = await pool.query(updateQuery, [name, id]);

      if (rows.length === 0) {
        return res.status(404).json({ message: "Category not found." });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Error updating category." });
    }
  }
);


///sql connection
const db = require("./db");

db.query("SELECT * FROM lettercategories", (err, results) => {
  if (err) {
    console.error("Error executing query:", err);
    return;
  }
  console.log("Query results:", results.rows);
});

const PORT = process.env.PORT || 3100;

app.listen(PORT, function () {
  console.log(`Server started on port ${PORT}`);
});
