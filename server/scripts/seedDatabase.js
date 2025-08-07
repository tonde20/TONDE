const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const Certificate = require('../models/Certificate');

// Configuration de la base de données
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_management';

const seedDatabase = async () => {
  try {
    // Connexion à la base de données
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connecté à MongoDB');

    // Nettoyer la base de données
    await User.deleteMany({});
    await Course.deleteMany({});
    await Enrollment.deleteMany({});
    await Payment.deleteMany({});
    await Certificate.deleteMany({});
    console.log('Base de données nettoyée');

    // Créer un administrateur
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      email: 'admin@edumanager.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'EduManager',
      role: 'admin',
      phone: '0123456789',
      address: '123 Rue de l\'Administration, 75001 Paris',
      isActive: true
    });
    await admin.save();
    console.log('Administrateur créé');

    // Créer des étudiants de test
    const studentPassword = await bcrypt.hash('etudiant123', 10);
    const students = [
      {
        email: 'etudiant@edumanager.com',
        password: studentPassword,
        firstName: 'Jean',
        lastName: 'Dupont',
        role: 'student',
        phone: '0123456780',
        address: '45 Rue des Étudiants, 75002 Paris',
        dateOfBirth: new Date('1990-05-15'),
        isActive: true
      },
      {
        email: 'marie.martin@email.com',
        password: studentPassword,
        firstName: 'Marie',
        lastName: 'Martin',
        role: 'student',
        phone: '0123456781',
        address: '67 Avenue de la Formation, 75003 Paris',
        dateOfBirth: new Date('1985-08-22'),
        isActive: true
      },
      {
        email: 'pierre.bernard@email.com',
        password: studentPassword,
        firstName: 'Pierre',
        lastName: 'Bernard',
        role: 'student',
        phone: '0123456782',
        address: '89 Boulevard du Savoir, 75004 Paris',
        dateOfBirth: new Date('1992-12-03'),
        isActive: true
      },
      {
        email: 'sophie.dubois@email.com',
        password: studentPassword,
        firstName: 'Sophie',
        lastName: 'Dubois',
        role: 'student',
        phone: '0123456783',
        address: '12 Place de l\'Apprentissage, 75005 Paris',
        dateOfBirth: new Date('1988-03-17'),
        isActive: true
      }
    ];

    const createdStudents = await User.insertMany(students);
    console.log(`${createdStudents.length} étudiants créés`);

    // Créer des cours
    const courses = [
      {
        name: 'Initiation à l\'Informatique',
        description: 'Apprenez les bases de l\'informatique : utilisation d\'un ordinateur, navigation internet, gestion des fichiers.',
        category: 'Initiation Informatique',
        duration: 20,
        price: 300,
        maxStudents: 15,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-29'),
        schedule: {
          days: ['Lundi', 'Mercredi'],
          time: { start: '09:00', end: '11:00' }
        },
        instructor: 'Marie Dubois',
        prerequisites: [],
        objectives: [
          'Maîtriser les bases de l\'ordinateur',
          'Naviguer sur internet en sécurité',
          'Gérer ses fichiers et dossiers'
        ],
        isActive: true
      },
      {
        name: 'Microsoft Office Débutant',
        description: 'Découvrez Word, Excel et PowerPoint niveau débutant pour vos besoins personnels et professionnels.',
        category: 'Microsoft Office Débutant',
        duration: 30,
        price: 450,
        maxStudents: 12,
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-03-15'),
        schedule: {
          days: ['Mardi', 'Jeudi'],
          time: { start: '14:00', end: '16:00' }
        },
        instructor: 'Pierre Martin',
        prerequisites: ['Connaissances de base en informatique'],
        objectives: [
          'Créer des documents Word professionnels',
          'Réaliser des calculs simples sur Excel',
          'Créer des présentations PowerPoint'
        ],
        isActive: true
      },
      {
        name: 'Microsoft Office Avancé',
        description: 'Perfectionnez-vous dans Word, Excel et PowerPoint avec des fonctionnalités avancées.',
        category: 'Microsoft Office Avancé',
        duration: 40,
        price: 600,
        maxStudents: 10,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-15'),
        schedule: {
          days: ['Mercredi', 'Vendredi'],
          time: { start: '10:00', end: '12:00' }
        },
        instructor: 'Marie Dubois',
        prerequisites: ['Niveau intermédiaire en Office'],
        objectives: [
          'Maîtriser les fonctions avancées d\'Excel',
          'Automatiser des tâches avec les macros',
          'Créer des présentations interactives'
        ],
        isActive: true
      },
      {
        name: 'Introduction à l\'Intelligence Artificielle',
        description: 'Découvrez les concepts fondamentaux de l\'IA et ses applications pratiques.',
        category: 'Intelligence Artificielle',
        duration: 35,
        price: 550,
        maxStudents: 8,
        startDate: new Date('2024-01-20'),
        endDate: new Date('2024-02-20'),
        schedule: {
          days: ['Vendredi'],
          time: { start: '09:00', end: '12:00' }
        },
        instructor: 'Dr. Sophie Laurent',
        prerequisites: ['Connaissances de base en informatique'],
        objectives: [
          'Comprendre les concepts de base de l\'IA',
          'Utiliser des outils d\'IA pratiques',
          'Identifier les opportunités d\'application'
        ],
        isActive: true
      },
      {
        name: 'Stockage et Sauvegarde en Ligne',
        description: 'Apprenez à utiliser les services de stockage cloud pour sécuriser vos données.',
        category: 'Stockage en Ligne',
        duration: 15,
        price: 250,
        maxStudents: 20,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-15'),
        schedule: {
          days: ['Samedi'],
          time: { start: '09:00', end: '12:00' }
        },
        instructor: 'Thomas Leroy',
        prerequisites: [],
        objectives: [
          'Configurer des services de stockage cloud',
          'Synchroniser ses données',
          'Assurer la sécurité de ses fichiers'
        ],
        isActive: true
      }
    ];

    const createdCourses = await Course.insertMany(courses);
    console.log(`${createdCourses.length} cours créés`);

    // Créer des inscriptions
    const enrollments = [
      {
        student: createdStudents[0]._id,
        course: createdCourses[2]._id, // Office Avancé
        enrollmentDate: new Date('2024-01-10'),
        status: 'active',
        paymentStatus: 'paid',
        totalAmount: 600,
        amountPaid: 600,
        progress: 75
      },
      {
        student: createdStudents[0]._id,
        course: createdCourses[3]._id, // IA
        enrollmentDate: new Date('2024-01-15'),
        status: 'active',
        paymentStatus: 'partial',
        totalAmount: 550,
        amountPaid: 350,
        progress: 45
      },
      {
        student: createdStudents[1]._id,
        course: createdCourses[1]._id, // Office Débutant
        enrollmentDate: new Date('2024-02-10'),
        status: 'active',
        paymentStatus: 'paid',
        totalAmount: 450,
        amountPaid: 450,
        progress: 20
      },
      {
        student: createdStudents[2]._id,
        course: createdCourses[0]._id, // Initiation
        enrollmentDate: new Date('2024-01-25'),
        status: 'completed',
        paymentStatus: 'paid',
        totalAmount: 300,
        amountPaid: 300,
        progress: 100
      }
    ];

    const createdEnrollments = await Enrollment.insertMany(enrollments);
    console.log(`${createdEnrollments.length} inscriptions créées`);

    // Créer des paiements
    const payments = [
      {
        enrollment: createdEnrollments[0]._id,
        student: createdStudents[0]._id,
        course: createdCourses[2]._id,
        amount: 600,
        paymentMethod: 'card',
        paymentDate: new Date('2024-01-10'),
        status: 'completed',
        receiptNumber: 'REC-20240110-0001',
        processedBy: admin._id
      },
      {
        enrollment: createdEnrollments[1]._id,
        student: createdStudents[0]._id,
        course: createdCourses[3]._id,
        amount: 350,
        paymentMethod: 'cash',
        paymentDate: new Date('2024-01-15'),
        status: 'completed',
        receiptNumber: 'REC-20240115-0001',
        processedBy: admin._id
      },
      {
        enrollment: createdEnrollments[2]._id,
        student: createdStudents[1]._id,
        course: createdCourses[1]._id,
        amount: 450,
        paymentMethod: 'transfer',
        paymentDate: new Date('2024-02-10'),
        status: 'completed',
        receiptNumber: 'REC-20240210-0001',
        processedBy: admin._id
      },
      {
        enrollment: createdEnrollments[3]._id,
        student: createdStudents[2]._id,
        course: createdCourses[0]._id,
        amount: 300,
        paymentMethod: 'cheque',
        paymentDate: new Date('2024-01-25'),
        status: 'completed',
        receiptNumber: 'REC-20240125-0001',
        processedBy: admin._id
      }
    ];

    await Payment.insertMany(payments);
    console.log(`${payments.length} paiements créés`);

    // Créer un certificat
    const certificate = new Certificate({
      student: createdStudents[2]._id,
      course: createdCourses[0]._id,
      enrollment: createdEnrollments[3]._id,
      certificateNumber: 'CERT-2024-000001',
      issueDate: new Date('2024-02-01'),
      completionDate: new Date('2024-01-30'),
      grade: 'A',
      finalScore: 85,
      attendanceRate: 95,
      issuedBy: admin._id,
      status: 'valid'
    });

    await certificate.save();
    console.log('Certificat créé');

    console.log('\n=== DONNÉES DE TEST CRÉÉES ===');
    console.log('Administrateur:');
    console.log('  Email: admin@edumanager.com');
    console.log('  Mot de passe: admin123');
    console.log('\nÉtudiants:');
    console.log('  Email: etudiant@edumanager.com');
    console.log('  Mot de passe: etudiant123');
    console.log('\nAutres étudiants:');
    console.log('  marie.martin@email.com');
    console.log('  pierre.bernard@email.com');
    console.log('  sophie.dubois@email.com');
    console.log('  Mot de passe: etudiant123');
    console.log('\nBase de données initialisée avec succès !');

  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Connexion fermée');
  }
};

// Exécuter le script
seedDatabase();