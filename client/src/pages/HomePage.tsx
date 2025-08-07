import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  useTheme,
} from '@mui/material';
import {
  School,
  Computer,
  Psychology,
  CloudUpload,
  Analytics,
  Microsoft,
  StarBorder,
  PersonAdd,
  Login,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const theme = useTheme();

  const courses = [
    {
      title: 'Initiation Informatique',
      description: 'Découvrez les bases de l\'informatique et apprenez à utiliser un ordinateur.',
      icon: <Computer />,
      color: '#3498db',
      level: 'Débutant',
    },
    {
      title: 'Microsoft Office',
      description: 'Maîtrisez Word, Excel, PowerPoint du niveau débutant à avancé.',
      icon: <Microsoft />,
      color: '#e74c3c',
      level: 'Tous niveaux',
    },
    {
      title: 'Intelligence Artificielle',
      description: 'Explorez le monde de l\'IA et ses applications pratiques.',
      icon: <Psychology />,
      color: '#9b59b6',
      level: 'Avancé',
    },
    {
      title: 'Stockage en Ligne',
      description: 'Apprenez à utiliser et gérer les solutions de stockage cloud.',
      icon: <CloudUpload />,
      color: '#1abc9c',
      level: 'Intermédiaire',
    },
    {
      title: 'Analyse de Données',
      description: 'Collectez, analysez et visualisez vos données efficacement.',
      icon: <Analytics />,
      color: '#f39c12',
      level: 'Avancé',
    },
  ];

  const features = [
    {
      title: 'Formations Certifiantes',
      description: 'Obtenez des attestations reconnues pour valoriser vos compétences.',
      icon: <StarBorder />,
    },
    {
      title: 'Suivi Personnalisé',
      description: 'Bénéficiez d\'un accompagnement adapté à votre rythme d\'apprentissage.',
      icon: <School />,
    },
    {
      title: 'Paiement Flexible',
      description: 'Plusieurs options de paiement pour s\'adapter à votre budget.',
      icon: <Analytics />,
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Développez vos Compétences Numériques
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Formations professionnelles en informatique, bureautique et nouvelles technologies
          </Typography>
          
          {!isAuthenticated ? (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<PersonAdd />}
                onClick={() => navigate('/register')}
                sx={{
                  bgcolor: 'secondary.main',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: 'secondary.dark',
                  },
                }}
              >
                S'inscrire Maintenant
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<Login />}
                onClick={() => navigate('/login')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Se Connecter
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              size="large"
              startIcon={<School />}
              onClick={() => navigate('/courses')}
              sx={{
                bgcolor: 'secondary.main',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: 'secondary.dark',
                },
              }}
            >
              Découvrir nos Formations
            </Button>
          )}
        </Container>
      </Box>

      {/* Courses Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 6 }}>
          Nos Formations
        </Typography>
        
        <Grid container spacing={4}>
          {courses.map((course, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                      color: course.color,
                    }}
                  >
                    {course.icon}
                    <Typography variant="h6" component="h3" sx={{ ml: 1, fontWeight: 600 }}>
                      {course.title}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {course.description}
                  </Typography>
                  
                  <Chip
                    label={course.level}
                    size="small"
                    sx={{
                      bgcolor: `${course.color}20`,
                      color: course.color,
                    }}
                  />
                </CardContent>
                
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => navigate('/courses')}
                    sx={{ color: course.color }}
                  >
                    En savoir plus
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 6 }}>
            Pourquoi Nous Choisir ?
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box textAlign="center">
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 2,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'white',
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 6,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom>
            Prêt à Commencer Votre Formation ?
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
            Rejoignez des centaines d'étudiants qui ont déjà développé leurs compétences avec nous.
          </Typography>
          
          {!isAuthenticated && (
            <Button
              variant="contained"
              size="large"
              startIcon={<PersonAdd />}
              onClick={() => navigate('/register')}
              sx={{
                bgcolor: 'secondary.main',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: 'secondary.dark',
                },
              }}
            >
              Commencer Maintenant
            </Button>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;