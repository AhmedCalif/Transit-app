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
  
          const busTimes = await response.json();
          console.log('Bus times response:', busTimes);  // Log the response to inspect its structure
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
    busTimesResults.innerHTML = '';  // Clear previous results
  
    busTimes.forEach(times => {
      times.routes.forEach(route => {
        route.legs[0].steps.forEach(step => {
          if (step.travel_mode === 'TRANSIT') {
            const transitDetails = step.transit_details;
            
            const busTimeDiv = document.createElement('div');
            busTimeDiv.className = 'mb-4 p-4 border rounded shadow';
  
            const busRoute = document.createElement('h3');
            busRoute.className = 'text-lg font-bold';
            busRoute.textContent = `Bus Route: ${transitDetails.line.short_name}`;
            busTimeDiv.appendChild(busRoute);
  
            const departure = document.createElement('p');
            const departureStrong = document.createElement('strong');
            departureStrong.textContent = 'Departure: ';
            departure.appendChild(departureStrong);
            departure.appendChild(document.createTextNode(`${transitDetails.departure_stop.name} at ${transitDetails.departure_time.text}`));
            busTimeDiv.appendChild(departure);
  
            const arrival = document.createElement('p');
            const arrivalStrong = document.createElement('strong');
            arrivalStrong.textContent = 'Arrival: ';
            arrival.appendChild(arrivalStrong);
            arrival.appendChild(document.createTextNode(`${transitDetails.arrival_stop.name} at ${transitDetails.arrival_time.text}`));
            busTimeDiv.appendChild(arrival);
  
            const headsign = document.createElement('p');
            const headsignStrong = document.createElement('strong');
            headsignStrong.textContent = 'Headsign: ';
            headsign.appendChild(headsignStrong);
            headsign.appendChild(document.createTextNode(transitDetails.headsign));
            busTimeDiv.appendChild(headsign);
  
            const numStops = document.createElement('p');
            const numStopsStrong = document.createElement('strong');
            numStopsStrong.textContent = 'Num Stops: ';
            numStops.appendChild(numStopsStrong);
            numStops.appendChild(document.createTextNode(transitDetails.num_stops));
            busTimeDiv.appendChild(numStops);
  
            busTimesResults.appendChild(busTimeDiv);
          }
        });
      });
    });
  }
  