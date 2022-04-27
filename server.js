const express = require('express');
const axios = require('axios');
const cors = require('cors');
const Redis = require("redis");
const client = Redis.createClient();

const DEFAULT_EXPIRATION = 3600;

const app = express()
app.use(express.urlencoded({extended: true}))
app.use(cors())

app.get("/images", async (req, res) => {
    try {
        const albumId = req.query.albumId;
        await client.connect();
        let images = await client.get(`photos?albumId=${albumId}`)
        if (!images) {
            const {data} = await axios.get(
                "http://jsonplaceholder.typicode.com/photos",
                {params: {albumId}}
            )
            await client.setEx(
                `photos?albumId=${albumId}`,
                DEFAULT_EXPIRATION,
                JSON.stringify(data));
                 await client.disconnect();
            return res.status(200).send(data)
        } else
            await client.disconnect();

        return res.status(200).send(images)
    } catch (error) {
        res.status(404).send(`Something wrong ${error}`)
    }
})

app.listen(3000, () => {
    console.log('server is running')
});