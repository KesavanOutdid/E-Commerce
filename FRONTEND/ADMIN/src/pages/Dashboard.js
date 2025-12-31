import { Container, Typography, Paper, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">
            Welcome, {user?.firstName} {user?.lastName}!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Email: {user?.email}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Roles: {user?.roleNames?.join(', ')}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
