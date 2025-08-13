import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.static(path.join(__dirname, 'dist')));

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
