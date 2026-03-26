const express = require('express');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./auth/authMiddleware');

const app = express();
const PORT = 3000;
const SECRET_KEY = "my_super_secret_key";

app.use(express.json());

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

app.get('/api/test', (req, res) => {
    res.status(200).json({ message: "The Express server is successfully running!" });
});

app.post('/api/posts', authenticateToken, (req, res) => {
    const newPost = {
        id: currentId++,
        title: req.body.title,
        content: req.body.content,
        author: req.user.name
    };
    posts.push(newPost);
    res.status(201).json(newPost);
});

app.get('/api/posts', (req, res) => {
    res.status(200).json(posts);
});

app.get('/api/posts/:id', (req, res) => {
    const postId = parseInt(req.params.id);
    const post = posts.find(p => p.id === postId);

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
});

app.put('/api/posts/:id', authenticateToken, (req, res) => {
    const postId = parseInt(req.params.id);
    const post = posts.find(p => p.id === postId);

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;

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