const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const { WaveFile } = require('wavefile');

const app = express();
app.use(bodyParser.raw({ type: '*/*', limit: '50mb' }));

function convertToWav(rawData, gain = 20) {
    const wav = new WaveFile();

    // Create WAV from raw PCM data
    wav.fromScratch(1, // Number of channels (mono)
        64000, // Sample rate
        '16', // Bit depth
        rawData); // Raw PCM data

    // // Apply gain
    // const samples = wav.getSamples();
    // for (let i = 0; i < samples.length; i++) {
    //     samples[i] = Math.max(-32768, Math.min(32767, samples[i] * gain));
    // }

    return wav.toBuffer();
}

app.post('/stream', (req, res) => {
    console.log(`Got ${req.body.length} I2S bytes`);

    fs.appendFile('i2s.raw', req.body, (err) => {
        if (err) {
            console.error('Error saving raw file:', err);
            return res.status(500).send('Error saving raw file');
        }
        res.send('OK');
    });
});

app.post('/end_stream', (req, res) => {
    console.log(`End of transmission`);

    fs.readFile('i2s.raw', (err, rawData) => {
        if (err) {
            console.error('Error reading raw file:', err);
            return res.status(500).send('Error reading raw file');
        }

        try {
            const wavBuffer = convertToWav(rawData);
            fs.writeFile('audio.wav', wavBuffer, (wavErr) => {
                if (wavErr) {
                    console.error('Error saving WAV file:', wavErr);
                    return res.status(500).send('Error saving WAV file');
                }

                fs.unlink('i2s.raw', (unlinkErr) => {
                    if (unlinkErr) {
                        console.error('Error deleting raw file:', unlinkErr);
                    }
                    res.send('OK');
                });
            });
        } catch (convErr) {
            console.error('Error converting to WAV:', convErr);
            res.status(500).send('Error converting to WAV');
        }
    });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
