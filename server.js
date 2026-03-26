const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/api/test', (req, res) => {
    res.status(200).json({ message: "The Express server is successfully running!" });
});

app.listen(PORT, () => {
    console.log(`Server is running and listening on port ${PORT}`);
});