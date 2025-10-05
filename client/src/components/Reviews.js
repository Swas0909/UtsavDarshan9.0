import React, { useState, useEffect } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { StarFill, Star } from 'react-bootstrap-icons';

const Reviews = ({ pandalId }) => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    rating: 5,
    review: ''
  });

  const fetchReviews = React.useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/pandals/${pandalId}/reviews`);
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, [pandalId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/pandals/${pandalId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newReview,
          userId: 'temp-user' // Replace with actual user ID when auth is implemented
        })
      });
      if (response.ok) {
        setNewReview({ rating: 5, review: '' });
        fetchReviews();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const StarRating = ({ rating }) => (
    <div className="mb-2">
      {[1, 2, 3, 4, 5].map((star) => (
        star <= rating ? <StarFill key={star} color="#ffc107" /> : <Star key={star} />
      ))}
    </div>
  );

  return (
    <div className="reviews-section mt-4">
      <h3>Reviews</h3>
      
      <Card className="mb-4">
        <Card.Body>
          <h5>Write a Review</h5>
          <Form onSubmit={handleSubmitReview}>
            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <div>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="link"
                    className="p-0 me-2"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                  >
                    {star <= newReview.rating ? (
                      <StarFill color="#ffc107" size={24} />
                    ) : (
                      <Star size={24} />
                    )}
                  </Button>
                ))}
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Your Review</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newReview.review}
                onChange={(e) => setNewReview({ ...newReview, review: e.target.value })}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit Review
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <div className="reviews-list">
        {reviews.map((review) => (
          <Card key={review.id} className="mb-3">
            <Card.Body>
              <StarRating rating={review.rating} />
              <Card.Text>{review.review}</Card.Text>
              <small className="text-muted">
                Posted on {new Date(review.date).toLocaleDateString()}
              </small>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Reviews;