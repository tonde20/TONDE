import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const CoursesPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center">
        <Typography variant="h3" component="h1" gutterBottom>
          Nos Formations
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Page en cours de développement...
        </Typography>
      </Box>
    </Container>
  );
};

export default CoursesPage;