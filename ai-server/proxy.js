import express from 'express';
import cors from 'cors';
import axios from 'axios'; // Import axios

const app = express();
const port = 5080;

// Enable CORS for all origins
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Route to forward requests to Ollama API
app.post('/api/generate', async (req, res) => {
    const { prompt } = req.body;
    const modelName = 'event-manager';

    console.log(prompt);

    try {
        // Use axios to forward the request to Ollama API
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: modelName,
            prompt: prompt,
            temperature: 0.7,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Send the successful response back to the client
        res.json(response.data);
    } catch (error) {
        console.error('Error forwarding request to Ollama:', error);
        res.status(500).json({ error: 'Failed to forward request to Ollama' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Proxy server listening at http://localhost:${port}`);
});
