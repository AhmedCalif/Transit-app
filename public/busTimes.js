document.getElementById('busTimesForm').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const locationInput = document.getElementById('location').value;
  
    if (!locationInput) {
      alert('Please enter a location');
      return;
    }
  
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: locationInput }, async (results, status) => {
      if (status === 'OK') {
        const location = results[0].geometry.location;
        const latLng = {
          lat: location.lat(),
          lng: location.lng()
        };
  
        try {
          const response = await fetch('/bus-times', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ location: latLng })
          });
  
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          const busTimes = await response.json();
          console.log('Fetched bus times:', busTimes);
          displayBusTimes(busTimes);
        } catch (error) {
          console.error('Error fetching bus times:', error);
        }
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  });
  
  function displayBusTimes(busTimes) {
    const busTimesResults = document.getElementById('busTimesResults');
    busTimesResults.innerHTML = ''; // Clear previous results
  
    if (!busTimes.length) {
      busTimesResults.innerHTML = '<p>No bus routes found for the given location.</p>';
      return;
    }
  
    busTimes.forEach(route => {
      if (route && route.legs && route.legs.length > 0) {
        route.legs.forEach(leg => {
          leg.steps.forEach(step => {
            if (step.travel_mode === 'TRANSIT') {
              const transitDetails = step.transit_details;
  
              const busTimeInfo = document.createElement('div');
              busTimeInfo.className = 'mb-4 p-4 border rounded shadow';
  
              const busRoute = document.createElement('h3');
              busRoute.className = 'text-lg font-bold';
              busRoute.textContent = `Bus Route: ${transitDetails.line.short_name || transitDetails.line.name || 'N/A'}`;
              busTimeInfo.appendChild(busRoute);
  
              const departure = document.createElement('p');
              departure.innerHTML = `<strong>Departure:</strong> ${transitDetails.departure_stop.name} at ${transitDetails.departure_time.text}`;
              busTimeInfo.appendChild(departure);
  
              const arrival = document.createElement('p');
              arrival.innerHTML = `<strong>Arrival:</strong> ${transitDetails.arrival_stop.name} at ${transitDetails.arrival_time.text}`;
              busTimeInfo.appendChild(arrival);
  
              const headsign = document.createElement('p');
              headsign.innerHTML = `<strong>Headsign:</strong> ${transitDetails.headsign}`;
              busTimeInfo.appendChild(headsign);
  
              const numStops = document.createElement('p');
              numStops.innerHTML = `<strong>Num Stops:</strong> ${transitDetails.num_stops}`;
              busTimeInfo.appendChild(numStops);
  
              busTimesResults.appendChild(busTimeInfo);
            }
          });
        });
      } else {
        console.error('No valid legs or steps in the route:', route);
      }
    });
  }
  