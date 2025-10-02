import React from 'react';
import { Container, Card, Button, Form } from 'react-bootstrap';

function UserProfile() {
  const [user, setUser] = React.useState({
    name: 'John Doe',
    email: 'john@example.com',
    favoritePandals: [
      {
        id: 1,
        name: 'Lalbaugcha Raja',
        lastVisited: '2025-09-21'
      },
      {
        id: 2,
        name: 'GSB Seva Mandal',
        lastVisited: '2025-09-22'
      }
    ]
  });

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    // Handle profile update logic here
    console.log('Profile update requested');
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">User Profile</h2>
      
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleUpdateProfile}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                type="text" 
                value={user.name}
                onChange={(e) => setUser({...user, name: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                value={user.email}
                onChange={(e) => setUser({...user, email: e.target.value})}
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              Update Profile
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <h3 className="mb-3">Favorite Pandals</h3>
      {user.favoritePandals.map(pandal => (
        <Card key={pandal.id} className="mb-2">
          <Card.Body>
            <Card.Title>{pandal.name}</Card.Title>
            <Card.Text>Last visited: {pandal.lastVisited}</Card.Text>
            <Button variant="outline-danger" size="sm">
              Remove from Favorites
            </Button>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}

export default UserProfile;