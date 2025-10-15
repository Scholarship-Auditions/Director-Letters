-- Create the database
CREATE DATABASE directors_letters_db;

-- Connect to the new database
\c directors_letters_db;

-- Create letter writers table
CREATE TABLE letterwriters (
    writer_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Create letter recipients table
CREATE TABLE letterrecipients (
    recipient_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Create letter categories table
CREATE TABLE lettercategories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Create letters table
CREATE TABLE letters (
    letter_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    writer_id INTEGER REFERENCES letterwriters(writer_id),
    recipient_id INTEGER REFERENCES letterrecipients(recipient_id),
    category_id INTEGER REFERENCES lettercategories(category_id)
);

-- Create users table for authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Insert some sample data (optional)
INSERT INTO letterwriters (name) VALUES ('Band Director'), ('Choir Director'), ('Orchestra Director'), ('Musical Theater Director');
INSERT INTO letterrecipients (name) VALUES ('Student'), ('Parent'), ('Administrator'), ('Colleague');
INSERT INTO lettercategories (name) VALUES ('Recommendation'), ('Congratulations'), ('Discipline'), ('General');