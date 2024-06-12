const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/' });

app.post('/upload-photo', upload.single('photo'), async (req, res) => {
    const photoPath = path.join(__dirname, req.file.path);

    try {
        await sendPhotoToTelegram(photoPath);
        res.json({ success: true });
    } catch (error) {
        console.error('Error sending photo to Telegram:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        fs.unlinkSync(photoPath); // Удаляем файл после отправки
    }
});

async function sendPhotoToTelegram(photoPath) {
    const botToken = '6926211862:AAHBpxpTxSA3UsvmmuQ73XeoEuhECc9Lx64';
    const chatId = '5762026796';
    const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;

    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('photo', fs.createReadStream(photoPath));

    const response = await fetch(url, {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    if (!data.ok) {
        throw new Error(data.description);
    }
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
