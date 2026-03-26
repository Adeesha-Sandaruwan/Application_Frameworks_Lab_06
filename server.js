const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const authenticateToken = require('./auth/authMiddleware');

const app = express();
const PORT = 3000;
const SECRET_KEY = "my_super_secret_key";

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

let posts = [];
let currentId = 1;

app.post('/api/login', (req, res) => {
    const username = req.body.username;
    
    if (!username) {
        return res.status(400).json({ message: "Username is required to login" });
    }

    const user = { name: username };
    const accessToken = jwt.sign(user, SECRET_KEY);
    
    res.json({ accessToken: accessToken });
});

app.get('/home', (req, res) => {
    res.render('home', { posts: posts });
});

app.post('/api/posts', authenticateToken, upload.single('image'), (req, res) => {
    const newPost = {
        id: currentId++,
        title: req.body.title,
        content: req.body.content,
        author: req.user.name,
        imageUrl: req.file ? req.file.path : null
    };
    posts.push(newPost);
    res.status(201).json(newPost);
});

app.get('/api/posts', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedPosts = posts.slice(startIndex, endIndex);

    res.status(200).json({
        currentPage: page,
        totalPages: Math.ceil(posts.length / limit),
        totalPosts: posts.length,
        data: paginatedPosts
    });
});

app.get('/api/posts/:id', (req, res) => {
    const postId = parseInt(req.params.id);
    const post = posts.find(p => p.id === postId);

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
});

app.put('/api/posts/:id', authenticateToken, upload.single('image'), (req, res) => {
    const postId = parseInt(req.params.id);
    const post = posts.find(p => p.id === postId);

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;
    
    if (req.file) {
        post.imageUrl = req.file.path;
    }

    res.status(200).json(post);
});

app.delete('/api/posts/:id', authenticateToken, (req, res) => {
    const postId = parseInt(req.params.id);
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex === -1) {
        return res.status(404).json({ message: "Post not found" });
    }

    posts.splice(postIndex, 1);
    res.status(200).json({ message: "Post deleted successfully" });
});

app.listen(PORT, () => {
    console.log(`Server is running and listening on port ${PORT}`);
});