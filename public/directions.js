let map, directionsRenderer;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 49.2519, lng: -123.0036 }, // BCIT Vancouver
    zoom: 14
  });

  directionsRenderer = new google.maps.DirectionsRenderer({
    map: map
  });
}

document.getElementById('directionsForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const start = document.getElementById('start').value;
  const end = document.getElementById('end').value;

  if (!start || !end) {
    alert('Please enter both start and end locations');
    return;
  }

  try {
    const response = await fetch('/directions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ start, end })
    });

    const result = await response.json();
    if (result.status === 'OK') {
      displayDirections(result.routes[0]);
    } else {
      console.error('Directions request failed due to ' + result.status);
    }
  } catch (error) {
    console.error('Error fetching directions:', error);
  }
});

document.getElementById('searchForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const search = document.getElementById('search').value;

  if (!search) {
    alert('Please enter a location to search for');
    return;
  }

  try {
    const response = await fetch('/directions/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ search })
    });

    const result = await response.json();
    displaySearchResults(result.results);
  } catch (error) {
    console.error('Error fetching search results:', error);
  }
});

function displayDirections(route) {
  const directionsResults = document.getElementById('directionsResults');
  directionsResults.innerHTML = ''; // Clear previous results

  route.legs.forEach(leg => {
    leg.steps.forEach(step => {
      const stepDiv = document.createElement('div');
      stepDiv.className = 'mb-4 p-4 border rounded shadow';

      if (step.travel_mode === 'TRANSIT') {
        const transitDetails = step.transit_details;

        const busRoute = document.createElement('h3');
        busRoute.className = 'text-lg font-bold';
        busRoute.textContent = `Bus Route: ${transitDetails.line.short_name || transitDetails.line.name || 'N/A'}`;
        stepDiv.appendChild(busRoute);

        const departure = document.createElement('p');
        const departureStrong = document.createElement('strong');
        departureStrong.textContent = 'Departure: ';
        departure.appendChild(departureStrong);
        departure.appendChild(document.createTextNode(`${transitDetails.departure_stop.name} at ${transitDetails.departure_time.text}`));
        stepDiv.appendChild(departure);

        const arrival = document.createElement('p');
        const arrivalStrong = document.createElement('strong');
        arrivalStrong.textContent = 'Arrival: ';
        arrival.appendChild(arrivalStrong);
        arrival.appendChild(document.createTextNode(`${transitDetails.arrival_stop.name} at ${transitDetails.arrival_time.text}`));
        stepDiv.appendChild(arrival);

        const headsign = document.createElement('p');
        const headsignStrong = document.createElement('strong');
        headsignStrong.textContent = 'Headsign: ';
        headsign.appendChild(headsignStrong);
        headsign.appendChild(document.createTextNode(transitDetails.headsign));
        stepDiv.appendChild(headsign);

        const numStops = document.createElement('p');
        const numStopsStrong = document.createElement('strong');
        numStopsStrong.textContent = 'Num Stops: ';
        numStops.appendChild(numStopsStrong);
        numStops.appendChild(document.createTextNode(transitDetails.num_stops));
        stepDiv.appendChild(numStops);

        if (transitDetails.intermediate_stops && transitDetails.intermediate_stops.length > 0) {
          const intermediateStops = document.createElement('div');
          intermediateStops.className = 'mt-4';

          const stopsTitle = document.createElement('h4');
          stopsTitle.className = 'text-md font-bold';
          stopsTitle.textContent = 'Intermediate Stops:';
          intermediateStops.appendChild(stopsTitle);

          transitDetails.intermediate_stops.forEach(stop => {
            const stopDiv = document.createElement('p');
            stopDiv.textContent = stop.name;
            intermediateStops.appendChild(stopDiv);
          });

          stepDiv.appendChild(intermediateStops);
        }
      } else if (step.travel_mode === 'WALKING') {
        const walkingInstructions = document.createElement('p');
        const walkingStrong = document.createElement('strong');
        walkingStrong.textContent = 'Walk: ';
        walkingInstructions.appendChild(walkingStrong);
        walkingInstructions.innerHTML += step.html_instructions || 'No specific walking instructions provided.';
        stepDiv.appendChild(walkingInstructions);

        const walkingTime = document.createElement('p');
        const walkingTimeStrong = document.createElement('strong');
        walkingTimeStrong.textContent = 'Estimated walking time: ';
        walkingTime.appendChild(walkingTimeStrong);
        walkingTime.appendChild(document.createTextNode(step.duration.text));
        stepDiv.appendChild(walkingTime);
      } else {
        const instructions = document.createElement('p'); 
        const instructionsStrong = document.createElement('strong');
        instructionsStrong.textContent = 'Instructions: ';
        instructions.appendChild(instructionsStrong);
        instructions.innerHTML += step.html_instructions || 'No specific instructions provided.';
        stepDiv.appendChild(instructions);
      }

      directionsResults.appendChild(stepDiv);
      console.log(step);
    });
  });
}

function displaySearchResults(results) {
  const searchResults = document.getElementById('searchResults');
  searchResults.innerHTML = ''; // Clear previous results

  results.forEach(result => {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'mb-4 p-4 border rounded shadow';

    const name = document.createElement('h3');
    name.className = 'text-lg font-bold';
    name.textContent = result.name;
    resultDiv.appendChild(name);

    const address = document.createElement('p');
    address.textContent = result.formatted_address;
    resultDiv.appendChild(address);

    const directionsButton = document.createElement('button');
    directionsButton.className = 'mt-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700';
    directionsButton.textContent = 'Get Directions';
    directionsButton.addEventListener('click', () => {
      document.getElementById('end').value = result.formatted_address;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    resultDiv.appendChild(directionsButton);

    searchResults.appendChild(resultDiv);
  });
}

window.onload = initMap;
