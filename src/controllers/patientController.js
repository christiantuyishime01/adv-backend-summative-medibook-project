const patientModel = require('../models/patientModel');

async function listPatients(req, res) {
  try {
    const patients = await patientModel.getAllPatients();
    res.json(patients); } 
    catch (error) {
    console.error('Could not load patients:', error.message);
    res.status(500).json({ error: 'Could not load patients' }); } } 
    
async function getPatientById(req, res, next) {
  const patientId = Number(req.params.id);

  if (!Number.isInteger(patientId) || patientId < 1) {
    return res.status(400).json({ error: 'Provide a valid patient ID' }); }

  try {
    const patient = await patientModel.getPatientById(patientId);

  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' }); }
    res.json(patient); }
    catch (error) {
      next(error); } }
    
async function createPatient(req, res, next) {
  const { fullName, email, phone } = req.body;

  if (
    typeof fullName !== 'string' || fullName.trim() === '' ||
    typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof phone !== 'string' || !/^\d{12}$/.test(phone) ) {
    return res.status(400).json({
      error: 'Provide a name, valid email, and 12-digit phone number' }); }

  try {
    const patientId = await patientModel.createPatient({
      fullName: fullName.trim(),
      email: email.trim(),
      phone });  
    return res.status(201).json({ message: 'Patient created', patientId }); }
    catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email is already in use' }); }
    next(error); } }

async function updatePatient(req, res, next) {
  const patientId = Number(req.params.id);
  const { fullName, email, phone } = req.body;

  if (!Number.isInteger(patientId) || patientId < 1) {
    return res.status(400).json({ error: 'Provide a valid patient ID' }); }

  if (
    typeof fullName !== 'string' || fullName.trim() === '' ||
    typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof phone !== 'string' || !/^\d{12}$/.test(phone) ) {
    return res.status(400).json({
      error: 'Provide a name, valid email, and 12-digit phone number' }); }

  try {
    const updated = await patientModel.updatePatient(patientId, {
      fullName: fullName.trim(),
      email: email.trim(),
      phone });
    if (!updated) {
      return res.status(404).json({ error: 'Patient not found' }); }
      return res.json({ message: 'Patient updated', patientId }); } 
      catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email is already in use' }); }
    next(error); } }

async function deletePatient(req, res, next) {
  const patientId = Number(req.params.id);

  if (!Number.isInteger(patientId) || patientId < 1) {
    return res.status(400).json({ error: 'Provide a valid patient ID' }); }

  try {
    const deleted = await patientModel.deletePatient(patientId);
    if (!deleted) {
      return res.status(404).json({ error: 'Patient not found' }); } 
      return res.status(204).send(); } 
      catch (error) {
    if (
      error.code === 'ER_ROW_IS_REFERENCED_2' ||
      error.code === 'ER_ROW_IS_REFERENCED' ) {
      return res.status(409).json({
        error: 'Cannot delete a patient with appointments' }); }
        next(error); } }

module.exports = { listPatients, getPatientById, createPatient, updatePatient, deletePatient };