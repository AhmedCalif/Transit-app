import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/', async (req, res) => {
  const { location } = req.body;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=1500&type=bus_station&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const busStations = response.data.results;

    const busTimesPromises = busStations.map(station => {
      const stationUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${location.lat},${location.lng}&destination=${station.geometry.location.lat},${station.geometry.location.lng}&mode=transit&key=${apiKey}`;
      return axios.get(stationUrl);
    });

    const busTimesResponses = await Promise.all(busTimesPromises);
    const busTimes = busTimesResponses.map(response => response.data);

    res.json(busTimes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', (req, res) => {
  res.render('home/busTimes', { apiKey: process.env.GOOGLE_MAPS_API_KEY });
});

export default router;
