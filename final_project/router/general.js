const express = require('express');
const axios = require('axios'); // Import axios
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Fungsi helper untuk simulasi async dengan promise
const asyncGetBooks = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(books);
        }, 1000);
    });
};

const asyncGetBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject(new Error("Book not found"));
            }
        }, 1000);
    });
};

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }

    if (isValid(username)) {
        return res.status(400).json({ message: "User already exists" });
    }

    users.push({ username: username, password: password });
    return res.status(200).json({ message: "User registered successfully" });
});

// TASK 10: Get all books using async callback with Axios
public_users.get('/', function (req, res) {
    // Using promise callbacks
    asyncGetBooks()
        .then((booksData) => {
            return res.status(200).json(booksData);
        })
        .catch((error) => {
            return res.status(500).json({ message: "Error fetching books" });
        });
});

// TASK 11: Get book details based on ISBN using promise callbacks
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    
    // Using promise callbacks
    asyncGetBookByISBN(isbn)
        .then((book) => {
            return res.status(200).json(book);
        })
        .catch((error) => {
            return res.status(404).json({ message: "Book not found" });
        });
});

// TASK 12: Get book details based on author using async/await with Axios
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    
    try {
        // Simulate async operation with Axios
        const response = await axios.get('http://localhost:5000/', { timeout: 5000 });
        const allBooks = response.data;
        
        const booksByAuthor = {};
        for (const [isbn, book] of Object.entries(allBooks)) {
            if (book.author && book.author.toLowerCase().includes(author.toLowerCase())) {
                booksByAuthor[isbn] = book;
            }
        }
        
        if (Object.keys(booksByAuthor).length > 0) {
            return res.status(200).json(booksByAuthor);
        } else {
            return res.status(404).json({ message: "No books found by this author" });
        }
    } catch (error) {
        // Fallback to local books data if API call fails
        const booksByAuthor = {};
        for (const [isbn, book] of Object.entries(books)) {
            if (book.author && book.author.toLowerCase().includes(author.toLowerCase())) {
                booksByAuthor[isbn] = book;
            }
        }
        
        if (Object.keys(booksByAuthor).length > 0) {
            return res.status(200).json(booksByAuthor);
        } else {
            return res.status(404).json({ message: "No books found by this author" });
        }
    }
});

// TASK 13: Get all books based on title using async/await with Axios
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    
    try {
        // Using async/await with Axios
        const response = await axios.get('http://localhost:5000/', { timeout: 5000 });
        const allBooks = response.data;
        
        const booksByTitle = {};
        for (const [isbn, book] of Object.entries(allBooks)) {
            if (book.title && book.title.toLowerCase().includes(title.toLowerCase())) {
                booksByTitle[isbn] = book;
            }
        }
        
        if (Object.keys(booksByTitle).length > 0) {
            return res.status(200).json(booksByTitle);
        } else {
            return res.status(404).json({ message: "No books found with this title" });
        }
    } catch (error) {
        // Fallback to local books data
        const booksByTitle = {};
        for (const [isbn, book] of Object.entries(books)) {
            if (book.title && book.title.toLowerCase().includes(title.toLowerCase())) {
                booksByTitle[isbn] = book;
            }
        }
        
        if (Object.keys(booksByTitle).length > 0) {
            return res.status(200).json(booksByTitle);
        } else {
            return res.status(404).json({ message: "No books found with this title" });
        }
    }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    
    if (book && book.reviews) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "Book or reviews not found" });
    }
});

module.exports.general = public_users;