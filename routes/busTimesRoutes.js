import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/', async (req, res) => {
  const { location } = req.body;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  // Fetch nearby bus stations
  const stationsUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=1500&type=bus_station&key=${apiKey}`;

  try {
    const stationsResponse = await axios.get(stationsUrl);
    const busStations = stationsResponse.data.results;

    if (!busStations.length) {
      return res.json([]);
    }

    // Fetch bus times for each bus station
    const busTimesPromises = busStations.map(station => {
      const stationLocation = `${station.geometry.location.lat},${station.geometry.location.lng}`;
      const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${location.lat},${location.lng}&destination=${stationLocation}&mode=transit&key=${apiKey}`;
      return axios.get(directionsUrl);
    });

    const busTimesResponses = await Promise.all(busTimesPromises);
    const busTimes = busTimesResponses.map(response => response.data);

    // Filter out the routes without transit details
    const validBusTimes = busTimes
      .flatMap(busTime => busTime.routes)
      .filter(route => route.legs.some(leg => leg.steps.some(step => step.travel_mode === 'TRANSIT')));

    // Ensure uniqueness and limit to two results per bus route
    const uniqueBusTimes = {};
    validBusTimes.forEach(route => {
      route.legs.forEach(leg => {
        leg.steps.forEach(step => {
          if (step.travel_mode === 'TRANSIT') {
            const busRoute = step.transit_details.line.short_name || step.transit_details.line.name;
            if (!uniqueBusTimes[busRoute]) {
              uniqueBusTimes[busRoute] = [];
            }
            if (uniqueBusTimes[busRoute].length < 2) {
              uniqueBusTimes[busRoute].push(route);
            }
          }
        });
      });
    });

    // Flatten the unique bus times and limit to two results per bus
    const finalBusTimes = Object.values(uniqueBusTimes).flatMap(routes => routes.slice(0, 2));

    res.json(finalBusTimes);
  } catch (error) {
    console.error('Error fetching bus times:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', (req, res) => {
  res.render('home/busTimes', { apiKey: process.env.GOOGLE_MAPS_API_KEY });
});

export default router;
