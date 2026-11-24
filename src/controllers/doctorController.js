const doctorModel = require('../models/doctorModel');

async function listDoctors(req, res) {
  try {
    const doctors = await doctorModel.getAllDoctors();
    res.json(doctors); } 
    catch (error) {
    console.error('Could not load doctors:', error.message);
    res.status(500).json({ error: 'Could not load doctors' }); } } 
    
async function getDoctorById(req, res, next) {
  const doctorId = Number(req.params.id);

  if (!Number.isInteger(doctorId) || doctorId < 1) {
    return res.status(400).json({ error: 'Provide a valid doctor ID' }); }

  try {
    const doctor = await doctorModel.getDoctorById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' }); }
      return res.json(doctor); } 
      catch (error) {
        next(error); } }

async function createDoctor(req, res, next) {
  const { fullName, specialty, consultationFee, room } = req.body;
  const fee = Number(consultationFee);

  if (
    typeof fullName !== 'string' || fullName.trim() === '' ||
    typeof specialty !== 'string' || specialty.trim() === '' ||
    !Number.isFinite(fee) || fee < 0 ||
    typeof room !== 'string' || room.trim() === ''
  ) {
    return res.status(400).json({
      error: 'Provide a name, specialty, non-negative consultation fee, and room'
    });
  }

  try {
    const doctorId = await doctorModel.createDoctor({
      fullName: fullName.trim(),
      specialty: specialty.trim(),
      consultationFee: fee,
      room: room.trim() });
      return res.status(201).json({ message: 'Doctor created', doctorId }); } 
      catch (error) {
        next(error); } }

async function updateDoctor(req, res, next) {
  const doctorId = Number(req.params.id);
  const { fullName, specialty, consultationFee, room } = req.body;
  const fee = Number(consultationFee);

  if (!Number.isInteger(doctorId) || doctorId < 1) {
    return res.status(400).json({ error: 'Provide a valid doctor ID' });
  }

  if (
    typeof fullName !== 'string' || fullName.trim() === '' ||
    typeof specialty !== 'string' || specialty.trim() === '' ||
    !Number.isFinite(fee) || fee < 0 ||
    typeof room !== 'string' || room.trim() === ''
  ) {
    return res.status(400).json({
      error: 'Provide a name, specialty, non-negative consultation fee, and room'
    });
  }

  try {
    const updated = await doctorModel.updateDoctor(doctorId, {
      fullName: fullName.trim(),
      specialty: specialty.trim(),
      consultationFee: fee,
      room: room.trim() });
      
      if (!updated) {
        return res.status(404).json({ error: 'Doctor not found' }); }
        return res.json({ message: 'Doctor updated', doctorId }); } 
        catch (error) {
          next(error); } }

async function deleteDoctor(req, res, next) {
  const doctorId = Number(req.params.id);

  if (!Number.isInteger(doctorId) || doctorId < 1) {
    return res.status(400).json({ error: 'Provide a valid doctor ID' }); }

  try {
    const deleted = await doctorModel.deleteDoctor(doctorId);
    if (!deleted) {
      return res.status(404).json({ error: 'Doctor not found' }); }
      return res.status(204).send(); }
      catch (error) {
        if (
          error.code === 'ER_ROW_IS_REFERENCED_2' ||
          error.code === 'ER_ROW_IS_REFERENCED' ) { 
            return res.status(409).json({
              error: 'Cannot delete a doctor with appointments' }); }
              next(error); } }

async function getDoctorStatistics(req, res, next) {
  const doctorId = Number(req.params.id);

  if (!Number.isInteger(doctorId) || doctorId < 1) {
    return res.status(400).json({ error: 'Provide a valid doctor ID' }); }

  try {
    const statistics = await doctorModel.getDoctorStatistics(doctorId);
    if (!statistics) {
      return res.status(404).json({ error: 'Doctor not found' }); }
      return res.json(statistics); }
      catch (error) {
        next(error); } }

async function getDoctorsReport(req, res, next) {
  try {
    const report = await doctorModel.getDoctorsReport();
    return res.json(report); } 
    catch (error) { 
      next(error); } }

async function getBusyDaysReport(req, res, next) {
  try {
    const report = await doctorModel.getBusyDaysReport();
    return res.json(report); }
    catch (error) {
      next(error); } }

module.exports = { listDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor, getDoctorStatistics, getDoctorsReport, getBusyDaysReport };