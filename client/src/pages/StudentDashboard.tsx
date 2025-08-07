import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  School,
  Payment,
  Certificate,
  Timeline,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Bonjour {user?.firstName} !
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Bienvenue sur votre espace étudiant
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <School sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="div" color="primary.main">
                2
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Formations en cours
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <Certificate sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" component="div" color="success.main">
                1
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Certificats obtenus
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <Payment sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" component="div" color="warning.main">
                850€
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Montant payé
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <Timeline sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" component="div" color="info.main">
                85%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Progression moyenne
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Current Courses */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Mes Formations en Cours
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">Microsoft Office Avancé</Typography>
                  <Chip label="En cours" color="primary" size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Formateur: Marie Dubois • Début: 15 Jan 2024
                </Typography>
                <LinearProgress variant="determinate" value={75} sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Progression: 75% • Prochaine session: Mercredi 14h00
                </Typography>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">Intelligence Artificielle</Typography>
                  <Chip label="En cours" color="primary" size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Formateur: Pierre Martin • Début: 20 Jan 2024
                </Typography>
                <LinearProgress variant="determinate" value={45} sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Progression: 45% • Prochaine session: Vendredi 10h00
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Status */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                État des Paiements
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Microsoft Office Avancé
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  500€ / 500€
                </Typography>
                <Chip label="Payé" color="success" size="small" sx={{ mt: 0.5 }} />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Intelligence Artificielle
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  350€ / 600€
                </Typography>
                <Chip label="Partiel" color="warning" size="small" sx={{ mt: 0.5 }} />
              </Box>

              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Total payé:</strong> 850€<br />
                  <strong>Solde restant:</strong> 250€
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudentDashboard;