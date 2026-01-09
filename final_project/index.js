const express = require('express');
const app = express();
const port = 5000;

// INI YANG BENAR! DUA-DUANYA
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DATA BUKU
const books = [
    {isbn: "1", title: "Things Fall Apart", author: "Chinua Achebe", reviews: {}},
    {isbn: "2", title: "Fairy tales", author: "Hans Christian Andersen", reviews: {}},
    {isbn: "3", title: "The Divine Comedy", author: "Dante Alighieri", reviews: {}},
    {isbn: "6", title: "No Longer at Ease", author: "Chinua Achebe", reviews: {}}
];

let users = {};
let tokens = {};

// TASK 2-6
app.get('/', (req, res) => res.json(books));
app.get('/isbn/:isbn', (req, res) => {
    const book = books.find(b => b.isbn === req.params.isbn);
    res.json(book || {error: "Book not found"});
});
app.get('/author/:author', (req, res) => {
    const author = decodeURIComponent(req.params.author);
    const result = books.filter(b => b.author === author);
    res.json(result);
});
app.get('/title/:title', (req, res) => {
    const title = decodeURIComponent(req.params.title);
    const result = books.filter(b => b.title === title);
    res.json(result);
});
app.get('/review/:isbn', (req, res) => {
    const book = books.find(b => b.isbn === req.params.isbn);
    res.json(book ? book.reviews : {error: "Book not found"});
});

// TASK 7: REGISTER - VERSI FIX 100%
app.post('/customer/register', (req, res) => {
    console.log("=== TASK 7 REGISTER ===");
    console.log("Full request body:", req.body);
    console.log("Body keys:", Object.keys(req.body));
    
    // Ambil data dari body (bisa JSON atau URL-encoded)
    const username = req.body.username || req.body.Username;
    const password = req.body.password || req.body.Password;
    
    console.log("Extracted username:", username);
    console.log("Extracted password:", password);
    
    if (!username || !password) {
        console.log("ERROR: Missing username or password");
        return res.status(400).json({error: "Need username and password"});
    }
    
    if (users[username]) {
        console.log("ERROR: User already exists");
        return res.status(400).json({error: "User exists"});
    }
    
    users[username] = {password};
    console.log("SUCCESS: User registered:", username);
    res.json({message: `User ${username} successfully registered. You can now login.`});
});

// TASK 8: LOGIN
app.post('/customer/login', (req, res) => {
    console.log("=== TASK 8 LOGIN ===");
    
    const username = req.body.username || req.body.Username;
    const password = req.body.password || req.body.Password;
    const user = users[username];
    
    console.log("Login attempt:", username);
    
    if (!user || user.password !== password) {
        console.log("ERROR: Invalid credentials");
        return res.status(401).json({error: "Invalid credentials"});
    }
    
    const token = "test_token_123";
    tokens[token] = username;
    
    console.log("SUCCESS: User logged in, token:", token);
    res.json({
        message: "You are successfully logged in",
        accessToken: token,
        username: username
    });
});

// TASK 9: ADD REVIEW
app.put('/customer/auth/review/:isbn', (req, res) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({error: "Unauthorized"});
    }
    
    const token = auth.replace('Bearer ', '');
    const username = tokens[token];
    
    if (!username) {
        return res.status(401).json({error: "Invalid token"});
    }
    
    const isbn = req.params.isbn;
    const review = req.body.review || req.body.Review;
    const book = books.find(b => b.isbn === isbn);
    
    if (!book) {
        return res.status(404).json({error: "Book not found"});
    }
    
    book.reviews[username] = review;
    res.json({
        message: "Review added/updated successfully",
        reviews: book.reviews
    });
});

// TASK 10: DELETE REVIEW
app.delete('/customer/auth/review/:isbn', (req, res) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({error: "Unauthorized"});
    }
    
    const token = auth.replace('Bearer ', '');
    const username = tokens[token];
    
    if (!username) {
        return res.status(401).json({error: "Invalid token"});
    }
    
    const isbn = req.params.isbn;
    const book = books.find(b => b.isbn === isbn);
    
    if (!book) {
        return res.status(404).json({error: "Book not found"});
    }
    
    delete book.reviews[username];
    res.json({
        message: "Review deleted successfully",
        reviews: book.reviews
    });
});

app.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
    console.log(`📚 Test endpoints:`);
    console.log(`   GET  http://localhost:${port}/`);
    console.log(`   POST http://localhost:${port}/customer/register`);
});