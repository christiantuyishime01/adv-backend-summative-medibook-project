const pool = require('../config/db');

async function getAllPatients() {
  const [rows] = await pool.query(
    'SELECT patient_id, full_name, email, phone, created_at, updated_at FROM patients' );
    return rows; } 
    
async function getPatientById(patientId) {
  const [rows] = await pool.execute('SELECT patient_id, full_name, email, phone, created_at, updated_at FROM patients WHERE patient_id = ?', [patientId] );
  return rows[0] || null; }

async function createPatient({ fullName, email, phone }) {
  const [result] = await pool.execute(
    'INSERT INTO patients (full_name, email, phone) VALUES (?, ?, ?)',
    [fullName, email, phone] );
  return result.insertId; }

async function updatePatient(patientId, { fullName, email, phone }) {
  const [result] = await pool.execute('UPDATE patients SET full_name = ?, email = ?, phone = ?, updated_at = NOW() WHERE patient_id = ?', [fullName, email, phone, patientId] );
  return result.affectedRows > 0; }

async function deletePatient(patientId) {
  const [result] = await pool.execute('DELETE FROM patients WHERE patient_id = ?', [patientId] );
  return result.affectedRows > 0; }

module.exports = { getAllPatients, getPatientById, createPatient, updatePatient, deletePatient };