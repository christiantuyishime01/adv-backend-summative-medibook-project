const express = require('express');
const doctorController = require('../controllers/doctorController');

const router = express.Router();

router.get('/', doctorController.listDoctors);

router.get('/:id', doctorController.getDoctorById);

router.post('/', doctorController.createDoctor);

router.put('/:id', doctorController.updateDoctor);

router.delete('/:id', doctorController.deleteDoctor);

router.get('/:id/statistics', doctorController.getDoctorStatistics);

router.get('/reports/doctors', doctorController.getDoctorsReport);

router.get('/reports/busy-days', doctorController.getBusyDaysReport);

module.exports = router;