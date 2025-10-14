const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ =require('lodash');
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const path = require('path');
const session = require('express-session');
const passport = require('passport');
passportLocalMongoose = require('passport-local-mongoose')
const methodOverride = require('method-override');
const { stringify } = require("querystring");
const multer = require('multer');
const app = express();
const pool = require('./db');
const fs = require('fs');
const mammoth = require('mammoth');


const upload = multer({ dest: 'uploads/' }).single('file');




app.use(bodyParser.urlencoded({extended: true}));
// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(session({
  secret: "Our little secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))

const userSchema = new mongoose.Schema ({
    email: String,
    password: String,

});

userSchema.plugin(passportLocalMongoose)

const User = new mongoose.model("User", userSchema)

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


const homeStartingContent = "";
const aboutContent = " about zach";
const contactContent = "contact zach";






//ROUTES

//redirect home if not logged in
app.get('/', function (req,res){
  if(req.isAuthenticated()){
    res.redirect('/adminhome')

  }else{

    res.redirect('/home')
  }

})

app.get("/home", function(req,res){   
      res.render('home') 
  });

  app.get("/aboutus", function(req,res){   
    res.render('about')
});

app.get("/contact", function(req,res){
    res.render('contact')
});

app.get('/aboutus', function(req,res){
    res.render('about')
});







//LETTER ROUTES

//LETTERS INCLUDING SEARCH
// Retrieve letters from the database
app.get('/letters', function (req, res) {
  const searchQuery = req.query.search || '';
  const categoryFilter = req.query.category || '';

  // Fetch letter categories from the database
  const categoryQuery = 'SELECT * FROM directors_letters_db.lettercategories';
  pool.query(categoryQuery, (err, categoryResult) => {
    if (err) {
      console.error('Error retrieving letter categories from the database:', err);
      return res.status(500).send('Internal Server Error');
    }

    const lettercategories = categoryResult.rows;

    // Modify the SQL query to include the WHERE clause for filtering based on searchQuery and categoryFilter
    const query = `
      SELECT l.*, w.name AS writer_name, r.name AS recipient_name, c.name AS category_name
      FROM directors_letters_db.letters l
      INNER JOIN directors_letters_db.letterwriters w ON l.writer_id = w.writer_id
      INNER JOIN directors_letters_db.letterrecipients r ON l.recipient_id = r.recipient_id
      INNER JOIN directors_letters_db.lettercategories c ON l.category_id = c.category_id
      WHERE (l.title ILIKE $1 OR l.content::text ILIKE $1)
      ${categoryFilter ? 'AND c.category_id = $2' : ''}
    `;

    const searchParam = `%${searchQuery}%`; // Add wildcard characters to search for partial matches
    const queryParams = [searchParam];

    if (categoryFilter) {
      queryParams.push(categoryFilter);
    }

    pool.query(query, queryParams, (err, result) => {
      if (err) {
        console.error('Error retrieving letters from the database:', err);
        return res.status(500).send('Internal Server Error');
      }

      const letters = result.rows;

      res.render('letters', { letters, searchQuery, categoryFilter, lettercategories });
    });
  });
});

// Upload .docx file
app.post('/letters', upload, function (req, res) {
  const { title, writer, recipient, category } = req.body;
  const file = req.file;

  // Perform database query to insert the new letter
  const query = 'INSERT INTO directors_letters_db.letters (title, content, writer_id, recipient_id, category_id) VALUES ($1, $2, $3, $4, $5)';
  const values = [title, file.buffer, writer, recipient, category];

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting new letter into the database:', err);
      return;
    }
    console.log('New letter inserted into the database');
    res.redirect('/letters'); // Redirect to the letters page after creating the letter
  });
});

// Download .docx file
app.get('/letters/:id/download', function (req, res) {
  const letterId = req.params.id;
  const query = 'SELECT * FROM directors_letters_db.letters WHERE letter_id = $1';

  pool.query(query, [letterId], (err, result) => {
    if (err) {
      console.error('Error retrieving letter from the database:', err);
      return res.status(500).send('Internal Server Error');
    }

    if (result.rows.length === 0) {
      return res.status(404).send('Letter not found');
    }

    const letter = result.rows[0];

    // Generate the file name for download
    const fileName = `${letter.title}.docx`;
    const filePath = path.join(__dirname, 'uploads', fileName);

    // Set the appropriate headers for the file download
    res.setHeader('Content-disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    // Stream the file to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  });
});


// Render the form for adding a new letter
app.get('/add-letter', function (req, res) {
  // Fetch the writer, recipient, and category data from the database
  const writerQuery = 'SELECT * FROM directors_letters_db.letterwriters';
  const recipientQuery = 'SELECT * FROM directors_letters_db.letterrecipients';
  const categoryQuery = 'SELECT * FROM directors_letters_db.lettercategories';

  // Use Promise.all to execute all queries simultaneously
  Promise.all([
    pool.query(writerQuery),
    pool.query(recipientQuery),
    pool.query(categoryQuery)
  ])
    .then(([writerResult, recipientResult, categoryResult]) => {
      const letterwriters = writerResult.rows;
      const letterrecipients = recipientResult.rows;
      const lettercategories = categoryResult.rows;

      res.render('add-letter', {
        letterwriters,
        letterrecipients,
        lettercategories
      });
    })
    .catch((err) => {
      console.error('Error retrieving data from the database:', err);
      res.status(500).send('Internal Server Error');
    });
});

// Handle the submission of the new letter form
app.post('/add-letter', function (req, res) {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Error uploading file:', err);
      return res.status(500).send('Error uploading file. Please try again.');
    } else if (err) {
      console.error('Error uploading file:', err);
      return res.status(500).send('Error uploading file. Please try again.');
    }

    // Extract form data
    const { title, writer, recipient, category } = req.body;
    const file = req.file;

    // Read the uploaded .docx file and convert it to HTML
    const filePath = path.join(__dirname, 'uploads', file.filename);
    const fileBuffer = fs.readFileSync(filePath);

    mammoth.convertToHtml({ buffer: fileBuffer })
      .then((result) => {
        // Extract the HTML content from the result
        const htmlContent = result.value;

        // Store the letter data in the database
        const query = 'INSERT INTO directors_letters_db.letters (title, content, writer_id, recipient_id, category_id) VALUES ($1, $2, $3, $4, $5)';
        const values = [title, htmlContent, writer, recipient, category];

        pool.query(query, values, (dbErr) => {
          if (dbErr) {
            console.error('Error inserting new letter into the database:', dbErr);
            return res.status(500).send('Error inserting new letter. Please try again.');
          }

          console.log('New letter inserted into the database');
          res.redirect('/letters'); // Redirect to the letters page after creating the letter
        });
      })
      .catch((conversionErr) => {
        console.error('Error converting .docx to HTML:', conversionErr);
        return res.status(500).send('Error converting .docx to HTML. Please try again.');
      });
  });
});

// ...

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));// Render the form for adding a new letter
app.get('/add-letter', function (req, res) {
  // Fetch the writer, recipient, and category data from the database
  const writerQuery = 'SELECT * FROM directors_letters_db.letterwriters';
  const recipientQuery = 'SELECT * FROM directors_letters_db.letterrecipients';
  const categoryQuery = 'SELECT * FROM directors_letters_db.lettercategories';

  // Use Promise.all to execute all queries simultaneously
  Promise.all([
    pool.query(writerQuery),
    pool.query(recipientQuery),
    pool.query(categoryQuery)
  ])
    .then(([writerResult, recipientResult, categoryResult]) => {
      const letterwriters = writerResult.rows;
      const letterrecipients = recipientResult.rows;
      const lettercategories = categoryResult.rows;

      res.render('add-letter', {
        letterwriters,
        letterrecipients,
        lettercategories
      });
    })
    .catch((err) => {
      console.error('Error retrieving data from the database:', err);
      res.status(500).send('Internal Server Error');
    });
});

// Handle the submission of the new letter form
app.post('/add-letter', function (req, res) {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Error uploading file:', err);
      return res.status(500).send('Error uploading file. Please try again.');
    } else if (err) {
      console.error('Error uploading file:', err);
      return res.status(500).send('Error uploading file. Please try again.');
    }

    // Extract form data
    const { title, writer, recipient, category } = req.body;
    const file = req.file;

    // Read the uploaded .docx file and convert it to HTML
    const filePath = path.join(__dirname, 'uploads', file.filename);
    const fileBuffer = fs.readFileSync(filePath);

    mammoth.convertToHtml({ buffer: fileBuffer })
      .then((result) => {
        // Extract the HTML content from the result
        const htmlContent = result.value;

        // Store the letter data in the database
        const query = 'INSERT INTO directors_letters_db.letters (title, content, writer_id, recipient_id, category_id) VALUES ($1, $2, $3, $4, $5)';
        const values = [title, htmlContent, writer, recipient, category];

        pool.query(query, values, (dbErr) => {
          if (dbErr) {
            console.error('Error inserting new letter into the database:', dbErr);
            return res.status(500).send('Error inserting new letter. Please try again.');
          }

          console.log('New letter inserted into the database');
          res.redirect('/letters'); // Redirect to the letters page after creating the letter
        });
      })
      .catch((conversionErr) => {
        console.error('Error converting .docx to HTML:', conversionErr);
        return res.status(500).send('Error converting .docx to HTML. Please try again.');
      });
  });
});

// ...

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/letters/:id', function(req, res) {
  const letterId = req.params.id;
  const query = 'SELECT * FROM directors_letters_db.letters WHERE letter_id = $1';
  pool.query(query, [letterId], (err, result) => {
    if (err) {
      console.error('Error retrieving letter from the database:', err);
      return res.status(500).send('Internal Server Error');
    }

    if (result.rows.length === 0) {
      return res.status(404).send('Letter not found');
    }

    const letter = result.rows[0];
    res.render('letter-index', { letter });
  });
});

app.get('/view-docx/:id', function(req, res) {
  const letterId = req.params.id;
  const query = 'SELECT * FROM directors_letters_db.letters WHERE letter_id = $1';
  pool.query(query, [letterId], (err, result) => {
    if (err) {
      console.error('Error retrieving letter from the database:', err);
      return res.status(500).send('Internal Server Error');
    }

    if (result.rows.length === 0) {
      return res.status(404).send('Letter not found');
    }

    const letter = result.rows[0];
    const fileData = letter.content;
    const filePath = `uploads/${letter.title}.docx`;

    // Save the binary data to a file
    fs.writeFile(filePath, fileData, (writeErr) => {
      if (writeErr) {
        console.error('Error saving file:', writeErr);
        return res.status(500).send('Internal Server Error');
      }

      // Set the content-disposition header to force download the file
      res.setHeader('Content-Disposition', 'attachment; filename=' + path.basename(filePath));
      res.sendFile(path.resolve(filePath), (sendErr) => { // Use path.resolve() to get the absolute path
        if (sendErr) {
          console.error('Error sending file:', sendErr);
          return res.status(500).send('Internal Server Error');
        }

        // Delete the file after it is sent
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Error deleting file:', unlinkErr);
          }
        });
      });
    });
  });
});


// Edit letter page
app.get('/letters/:id/edit', function(req, res) {
  const letterId = req.params.id;
  const queryLetter = 'SELECT * FROM directors_letters_db.letters WHERE letter_id = $1';
  const queryWriters = 'SELECT * FROM directors_letters_db.letterwriters';
  const queryRecipients = 'SELECT * FROM directors_letters_db.letterrecipients';
  const queryCategories = 'SELECT * FROM directors_letters_db.lettercategories';

  pool.query(queryLetter, [letterId], (err, resultLetter) => {
    if (err) {
      console.error('Error retrieving letter from the database:', err);
      return res.status(500).send('Internal Server Error');
    }

    if (resultLetter.rows.length === 0) {
      return res.status(404).send('Letter not found');
    }

    const letter = resultLetter.rows[0];

    // Fetch letterwriters data from the database
    pool.query(queryWriters, (err, resultWriters) => {
      if (err) {
        console.error('Error retrieving letterwriters from the database:', err);
        return res.status(500).send('Internal Server Error');
      }

      const letterwriters = resultWriters.rows;

      // Fetch letterrecipients data from the database
      pool.query(queryRecipients, (err, resultRecipients) => {
        if (err) {
          console.error('Error retrieving letterrecipients from the database:', err);
          return res.status(500).send('Internal Server Error');
        }

        const letterrecipients = resultRecipients.rows;

        // Fetch lettercategories data from the database
        pool.query(queryCategories, (err, resultCategories) => {
          if (err) {
            console.error('Error retrieving lettercategories from the database:', err);
            return res.status(500).send('Internal Server Error');
          }

          const lettercategories = resultCategories.rows;

          res.render('edit-letter', {
            letter,
            letterwriters,
            letterrecipients,
            lettercategories
          });
        });
      });
    });
  });
});

// Update letter
app.post('/letters/:id/edit', function(req, res) {
  const letterId = req.params.id;
  const { title, content, writer, recipient, category } = req.body;

  const updateQuery = 'UPDATE directors_letters_db.letters SET title = $1, content = $2, writer_id = $3, recipient_id = $4, category_id = $5 WHERE letter_id = $6';
  const updateValues = [title, content, writer, recipient, category, letterId];

  pool.query(updateQuery, updateValues, (err, result) => {
    if (err) {
      console.error('Error updating letter:', err);
      return res.status(500).send('Internal Server Error');
    }

    console.log('Letter updated successfully');
    res.redirect('/letters/' + letterId); // Redirect to the letter's index view or any other desired page
  });
});


// Delete letter
app.delete('/letters/:id', function(req, res) {
  const letterId = req.params.id;
  const query = 'DELETE FROM directors_letters_db.letters WHERE letter_id = $1';
  pool.query(query, [letterId], (err) => {
    if (err) {
      console.error('Error deleting letter:', err);
      return res.status(500).send('Internal Server Error');
    }

    res.redirect('/letters');
  });
});

app.post('/letters/:id/delete', function(req, res) {
  const letterId = req.params.id;
  const query = 'DELETE FROM directors_letters_db.letters WHERE letter_id = $1';

  pool.query(query, [letterId], (err, result) => {
    if (err) {
      console.error('Error deleting letter:', err);
      return res.status(500).send('Internal Server Error');
    }

    res.redirect('/letters');
  });
});












app.get('/band-director-letters', function(req, res) {
  const searchQuery = req.query.search || '';
  const categoryFilter = req.query.category || '';

  const query = `
    SELECT 
        l.letter_id,
        l.title,
        l.content,
        lw.name AS writer_name,
        lr.name AS recipient_name,
        lc.name AS category_name
    FROM
        directors_letters_db.letters l
        JOIN directors_letters_db.letterwriters lw ON l.writer_id = lw.writer_id
        JOIN directors_letters_db.letterrecipients lr ON l.recipient_id = lr.recipient_id
        JOIN directors_letters_db.lettercategories lc ON l.category_id = lc.category_id
    WHERE
        lw.name = 'Band Director'
        ${categoryFilter ? `AND lc.category_id = ${categoryFilter}` : ''}
        ${searchQuery ? `AND (l.title ILIKE '%${searchQuery}%' OR l.content ILIKE '%${searchQuery}%')` : ''}
  `;

  pool.query(query, (err, result) => {
    if (err) {
      console.error('Error retrieving letters from the database:', err);
      return res.status(500).send('Internal Server Error');
    }

    const letters = result.rows;

    // Get all letter categories for the filter dropdown
    const categoryQuery = 'SELECT * FROM directors_letters_db.lettercategories';
    pool.query(categoryQuery, (categoryErr, categoryResult) => {
      if (categoryErr) {
        console.error('Error retrieving letter categories from the database:', categoryErr);
        return res.status(500).send('Internal Server Error');
      }

      const lettercategories = categoryResult.rows;

      res.render('banddirectorletters', {
        letters,
        searchQuery,
        categoryFilter,
        lettercategories
      });
    });
  });
});


app.get('/choir-director-letters', function(req, res) {
  const searchQuery = req.query.search || '';
  const categoryFilter = req.query.category || '';

  const query = `
    SELECT 
        l.letter_id,
        l.title,
        l.content,
        lw.name AS writer_name,
        lr.name AS recipient_name,
        lc.name AS category_name
    FROM
        directors_letters_db.letters l
        JOIN directors_letters_db.letterwriters lw ON l.writer_id = lw.writer_id
        JOIN directors_letters_db.letterrecipients lr ON l.recipient_id = lr.recipient_id
        JOIN directors_letters_db.lettercategories lc ON l.category_id = lc.category_id
    WHERE
        lw.name = 'Choir Director'
        ${categoryFilter ? `AND lc.category_id = ${categoryFilter}` : ''}
        ${searchQuery ? `AND (l.title ILIKE '%${searchQuery}%' OR l.content ILIKE '%${searchQuery}%')` : ''}
  `;

  pool.query(query, (err, result) => {
    if (err) {
      console.error('Error retrieving letters from the database:', err);
      return res.status(500).send('Internal Server Error');
    }

    const letters = result.rows;

    // Get all letter categories for the filter dropdown
    const categoryQuery = 'SELECT * FROM directors_letters_db.lettercategories';
    pool.query(categoryQuery, (categoryErr, categoryResult) => {
      if (categoryErr) {
        console.error('Error retrieving letter categories from the database:', categoryErr);
        return res.status(500).send('Internal Server Error');
      }

      const lettercategories = categoryResult.rows;

      res.render('choirdirectorletters', {
        letters,
        searchQuery,
        categoryFilter,
        lettercategories
      });
    });
  });
});



app.get('/orchestra-director-letters', function(req, res) {
  const searchQuery = req.query.search || '';
  const categoryFilter = req.query.category || '';

  const query = `
    SELECT 
        l.letter_id,
        l.title,
        l.content,
        lw.name AS writer_name,
        lr.name AS recipient_name,
        lc.name AS category_name
    FROM
        directors_letters_db.letters l
        JOIN directors_letters_db.letterwriters lw ON l.writer_id = lw.writer_id
        JOIN directors_letters_db.letterrecipients lr ON l.recipient_id = lr.recipient_id
        JOIN directors_letters_db.lettercategories lc ON l.category_id = lc.category_id
    WHERE
        lw.name = 'Orchestra Director'
        ${categoryFilter ? `AND lc.category_id = ${categoryFilter}` : ''}
        ${searchQuery ? `AND (l.title ILIKE '%${searchQuery}%' OR l.content ILIKE '%${searchQuery}%')` : ''}
  `;

  pool.query(query, (err, result) => {
    if (err) {
      console.error('Error retrieving letters from the database:', err);
      return res.status(500).send('Internal Server Error');
    }

    const letters = result.rows;

    // Get all letter categories for the filter dropdown
    const categoryQuery = 'SELECT * FROM directors_letters_db.lettercategories';
    pool.query(categoryQuery, (categoryErr, categoryResult) => {
      if (categoryErr) {
        console.error('Error retrieving letter categories from the database:', categoryErr);
        return res.status(500).send('Internal Server Error');
      }

      const lettercategories = categoryResult.rows;

      res.render('orchestradirectorletters', {
        letters,
        searchQuery,
        categoryFilter,
        lettercategories
      });
    });
  });
});


app.get('/musical-theater-director-letters', function(req, res) {
  const searchQuery = req.query.search || '';
  const categoryFilter = req.query.category || '';

  const query = `
    SELECT 
        l.letter_id,
        l.title,
        l.content,
        lw.name AS writer_name,
        lr.name AS recipient_name,
        lc.name AS category_name
    FROM
        directors_letters_db.letters l
        JOIN directors_letters_db.letterwriters lw ON l.writer_id = lw.writer_id
        JOIN directors_letters_db.letterrecipients lr ON l.recipient_id = lr.recipient_id
        JOIN directors_letters_db.lettercategories lc ON l.category_id = lc.category_id
    WHERE
        lw.name = 'Musical Theater Director'
        ${categoryFilter ? `AND lc.category_id = ${categoryFilter}` : ''}
        ${searchQuery ? `AND (l.title ILIKE '%${searchQuery}%' OR l.content ILIKE '%${searchQuery}%')` : ''}
  `;

  pool.query(query, (err, result) => {
    if (err) {
      console.error('Error retrieving letters from the database:', err);
      return res.status(500).send('Internal Server Error');
    }

    const letters = result.rows;

    // Get all letter categories for the filter dropdown
    const categoryQuery = 'SELECT * FROM directors_letters_db.lettercategories';
    pool.query(categoryQuery, (categoryErr, categoryResult) => {
      if (categoryErr) {
        console.error('Error retrieving letter categories from the database:', categoryErr);
        return res.status(500).send('Internal Server Error');
      }

      const lettercategories = categoryResult.rows;

      res.render('musicaltheaterdirectorletters', {
        letters,
        searchQuery,
        categoryFilter,
        lettercategories
      });
    });
  });
});





///sql connection
const db = require('./db');

db.query('SELECT * FROM directors_letters_db.lettercategories', (err, results) => {
  if (err) {
    console.error('Error executing query:', err);
    return;
  }
  console.log('Query results:', results.rows);
});





const PORT = process.env.PORT || 3100





app.listen(PORT, function() {
  console.log(`Server started on port ${PORT}`);
});