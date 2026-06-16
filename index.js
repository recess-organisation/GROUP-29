const express = require('express');
const app = express();
const port = 3000;

// Base route (Home)
app.get('/', (req, res) => {
    res.send('Hello, Express!');
});

// Lab extension: About route
app.get('/about', (req, res) => {
    res.send('This is the About Page.');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});