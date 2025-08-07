import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  People,
  School,
  Payment,
  Certificate,
  TrendingUp,
  PersonAdd,
  Add,
  Notifications,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const recentActivities = [
    { text: 'Nouveau étudiant inscrit: Marie Dupont', time: '5 min', type: 'student' },
    { text: 'Paiement reçu: 350€ - Jean Martin', time: '15 min', type: 'payment' },
    { text: 'Certificat émis: IA - Sophie Bernard', time: '1h', type: 'certificate' },
    { text: 'Nouveau cours créé: Analyse de Données', time: '2h', type: 'course' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'student': return <PersonAdd color="primary" />;
      case 'payment': return <Payment color="success" />;
      case 'certificate': return <Certificate color="warning" />;
      case 'course': return <School color="info" />;
      default: return <Notifications />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Administration
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Bienvenue {user?.firstName}, voici un aperçu de votre centre de formation
          </Typography>
        </Box>
        <Box>
          <Button variant="contained" startIcon={<Add />} sx={{ mr: 1 }}>
            Nouveau Cours
          </Button>
          <Button variant="outlined" startIcon={<PersonAdd />}>
            Nouvel Étudiant
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="div" color="primary.main">
                127
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Étudiants actifs
              </Typography>
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                +12 ce mois
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <School sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" component="div" color="info.main">
                15
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Formations actives
              </Typography>
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                +3 ce mois
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <Payment sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" component="div" color="success.main">
                45,230€
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Revenus ce mois
              </Typography>
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                +8.5%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <Certificate sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" component="div" color="warning.main">
                89
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Certificats émis
              </Typography>
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                +15 ce mois
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Actions Rapides
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="outlined" fullWidth startIcon={<PersonAdd />}>
                  Ajouter un Étudiant
                </Button>
                <Button variant="outlined" fullWidth startIcon={<School />}>
                  Créer une Formation
                </Button>
                <Button variant="outlined" fullWidth startIcon={<Payment />}>
                  Enregistrer un Paiement
                </Button>
                <Button variant="outlined" fullWidth startIcon={<Certificate />}>
                  Émettre un Certificat
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Activités Récentes
              </Typography>
              
              <List>
                {recentActivities.map((activity, index) => (
                  <ListItem key={index} divider={index < recentActivities.length - 1}>
                    <ListItemIcon>
                      {getActivityIcon(activity.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.text}
                      secondary={`Il y a ${activity.time}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pending Actions */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Actions en Attente
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center" sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                    <Typography variant="h6" color="warning.dark">5</Typography>
                    <Typography variant="body2" color="warning.dark">
                      Paiements en retard
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center" sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="h6" color="info.dark">3</Typography>
                    <Typography variant="body2" color="info.dark">
                      Inscriptions à valider
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center" sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="h6" color="success.dark">8</Typography>
                    <Typography variant="body2" color="success.dark">
                      Formations terminées
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center" sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                    <Typography variant="h6" color="error.dark">2</Typography>
                    <Typography variant="body2" color="error.dark">
                      Problèmes à résoudre
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;