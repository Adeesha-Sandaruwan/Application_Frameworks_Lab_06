const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let posts = [];//empty array to store posts in memory
let currentId = 1;

app.get('/api/test', (req, res) => {
    res.status(200).json({ message: "The Express server is successfully running!" });
});

app.post('/api/posts', (req, res) => {
    //grabs the data from the request body
    const newPost = {
        id: currentId++,
        title: req.body.title,
        content: req.body.content,
        author: req.body.author
    };
    posts.push(newPost);//adds the new post to the posts array
    res.status(201).json(newPost);
});

//returns all the posts in the posts array as a JSON response
app.get('/api/posts', (req, res) => {
    res.status(200).json(posts);
});

//returns a single post based on the provided ID in the URL parameter
app.get('/api/posts/:id', (req, res) => {
    const postId = parseInt(req.params.id);
    const post = posts.find(p => p.id === postId);

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
});

app.put('/api/posts/:id', (req, res) => {
    const postId = parseInt(req.params.id);
    const post = posts.find(p => p.id === postId);

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;
    post.author = req.body.author || post.author;

    res.status(200).json(post);
});

app.delete('/api/posts/:id', (req, res) => {
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