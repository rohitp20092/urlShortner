import express from 'express';
import { shortenUrl, getOriginalUrl } from './controller/urlShortener';
import { setupWebSocket } from './services/websocket';

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.use(express.json());

app.post('/url', async (req, res) => {
    try {
        const { url } = req.body;
        const clientId = req.headers['x-client-id'] as string;

        if (!clientId) {
            return res.status(400).json({ error: 'Client ID is required' });
        }

        await shortenUrl(url, clientId, BASE_URL);
        res.status(202).json({ message: 'URL shortening in progress' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/:shortCode', async (req, res) => {
    try {
        const originalUrl = await getOriginalUrl(req.params.shortCode);
        if (originalUrl) {
            res.json({ url: originalUrl });
        } else {
            res.status(404).json({ error: 'URL not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

setupWebSocket();
app.listen(PORT, () => {
    console.log(`Server running at ${BASE_URL}`);
});