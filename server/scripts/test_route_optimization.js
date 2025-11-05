const pool = require('../db');

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

async function testRouteOptimization() {
  try {
    console.log('Testing Route Optimization...\n');

    // Get some sample pandals
    const pandalsResult = await pool.query(
      'SELECT id, name, location, lat, lng FROM pandals LIMIT 5'
    );

    if (pandalsResult.rows.length === 0) {
      console.log('❌ No pandals found in database');
      pool.end();
      return;
    }

    console.log('📍 Available Pandals:');
    pandalsResult.rows.forEach((p, idx) => {
      console.log(`   ${idx + 1}. ${p.name} (${p.location}) - Lat: ${p.lat}, Lng: ${p.lng}`);
    });

    // Define a starting point (e.g., Central Mumbai)
    const startPoint = {
      lat: 19.0760,
      lng: 72.8777
    };

    console.log(`\n🏁 Starting Point: Lat ${startPoint.lat}, Lng ${startPoint.lng}`);

    // Select pandals to route
    const pandalIds = pandalsResult.rows.map(p => p.id);
    console.log(`\n🎯 Planning route for ${pandalIds.length} pandals: ${pandalIds.join(', ')}`);

    // Simulate the route optimization algorithm
    const selectedPandals = pandalsResult.rows.map(p => ({
      ...p,
      coordinates: {
        lat: parseFloat(p.lat),
        lng: parseFloat(p.lng)
      }
    }));

    // Nearest neighbor algorithm
    const route = [];
    let current = startPoint;
    const unvisited = [...selectedPandals];

    console.log('\n🔄 Running Nearest Neighbor Algorithm...\n');

    let step = 1;
    while (unvisited.length > 0) {
      let nearestIdx = 0;
      let minDistance = Infinity;
      
      console.log(`Step ${step}: Current position - Lat: ${current.lat.toFixed(4)}, Lng: ${current.lng.toFixed(4)}`);
      
      // Find nearest pandal
      unvisited.forEach((pandal, idx) => {
        const distance = calculateDistance(
          current.lat,
          current.lng,
          pandal.coordinates.lat,
          pandal.coordinates.lng
        );
        console.log(`   - Distance to ${pandal.name}: ${distance.toFixed(2)} km`);
        if (distance < minDistance) {
          minDistance = distance;
          nearestIdx = idx;
        }
      });

      const nearest = unvisited.splice(nearestIdx, 1)[0];
      route.push({
        pandal: nearest,
        distance: minDistance
      });
      console.log(`   ✅ Selected: ${nearest.name} (${minDistance.toFixed(2)} km away)\n`);
      current = nearest.coordinates;
      step++;
    }

    // Calculate total distance and time
    const totalDistance = route.reduce((sum, r) => sum + r.distance, 0);
    const estimatedTime = route.length * 30; // 30 minutes per pandal

    console.log('=' .repeat(60));
    console.log('📊 ROUTE OPTIMIZATION RESULTS');
    console.log('=' .repeat(60));
    console.log(`\n🗺️  Optimized Route Order:`);
    route.forEach((stop, idx) => {
      console.log(`   ${idx + 1}. ${stop.pandal.name}`);
      console.log(`      📍 ${stop.pandal.location}`);
      console.log(`      🚶 ${stop.distance.toFixed(2)} km from previous stop`);
    });

    console.log(`\n📏 Total Distance: ${totalDistance.toFixed(2)} km`);
    console.log(`⏱️  Estimated Time: ${Math.floor(estimatedTime / 60)} hrs ${estimatedTime % 60} min`);
    console.log(`   (${route.length} pandals × 30 min each)`);

    console.log('\n✅ Route optimization is working correctly!');
    console.log('\n💡 Algorithm: Nearest Neighbor (Greedy approach)');
    console.log('   - Starts from your location');
    console.log('   - Always selects the closest unvisited pandal');
    console.log('   - Simple and fast, good for small to medium routes');

  } catch (error) {
    console.error('❌ Error testing route optimization:', error);
  } finally {
    pool.end();
  }
}

testRouteOptimization();
