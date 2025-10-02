// Review routes
app.get('/api/pandals/:id/reviews', (req, res) => {
  const pandalReviews = reviews.filter(r => r.pandalId === parseInt(req.params.id));
  res.json(pandalReviews);
});

app.post('/api/pandals/:id/reviews', (req, res) => {
  const { userId, rating, review } = req.body;
  const newReview = {
    id: Date.now().toString(),
    pandalId: parseInt(req.params.id),
    userId,
    rating,
    review,
    date: new Date(),
    helpfulCount: 0
  };
  reviews.push(newReview);
  res.status(201).json(newReview);
});

// Route optimization endpoint
app.post('/api/route-plan', (req, res) => {
  const { pandals, startPoint } = req.body;
  const selectedPandals = pandalsData.filter(p => pandals.includes(p.id));
  
  // Simple route optimization using nearest neighbor algorithm
  const route = [];
  let current = startPoint;
  const unvisited = [...selectedPandals];

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minDistance = Infinity;
    
    unvisited.forEach((pandal, idx) => {
      const distance = calculateDistance(
        current.lat,
        current.lng,
        pandal.coordinates.lat,
        pandal.coordinates.lng
      );
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
    current = nearest.coordinates;
  }

  res.json({
    route,
    totalDistance: route.reduce((sum, r) => sum + r.distance, 0),
    estimatedTime: route.length * 30 // Assuming 30 minutes per pandal
  });
});