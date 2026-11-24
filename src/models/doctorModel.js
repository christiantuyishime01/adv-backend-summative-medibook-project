const pool = require('../config/db');

async function getAllDoctors() {
  const [rows] = await pool.query( 'SELECT doctor_id, full_name, specialty, consultation_fee, room, created_at, updated_at FROM doctors' ); 
  return rows; } 
  
async function createDoctor({ fullName, specialty, consultationFee, room }) {
  const [result] = await pool.execute(
    'INSERT INTO doctors (full_name, specialty, consultation_fee, room) VALUES (?, ?, ?, ?)',
    [fullName, specialty, consultationFee, room] );
  return result.insertId; }

async function getDoctorById(doctorId) {
  const [rows] = await pool.execute( 'SELECT doctor_id, full_name, specialty, consultation_fee, room, created_at,updated_at FROM doctors WHERE doctor_id = ?', [doctorId] );
  return rows[0] || null; }

async function updateDoctor(doctorId, { fullName, specialty, consultationFee, room }) {
  const [result] = await pool.execute(
    'UPDATE doctors SET full_name = ?, specialty = ?, consultation_fee = ?, room = ?, updated_at = NOW() WHERE doctor_id = ?',
    [fullName, specialty, consultationFee, room, doctorId] );
    return result.affectedRows > 0; }

async function deleteDoctor(doctorId) {
  const [result] = await pool.execute( 'DELETE FROM doctors WHERE doctor_id = ?', [doctorId] );
  return result.affectedRows > 0; }

async function getDoctorStatistics(doctorId) {
  const [summary] = await pool.execute(
    `SELECT
       COALESCE(SUM(a.amount_paid - a.refund_amount), 0) AS revenue_collected,
       COALESCE(SUM(
         CASE WHEN a.status = 'booked'
           AND a.appointment_datetime > NOW() THEN 1 ELSE 0 END
       ), 0) AS upcoming_appointment_count
     FROM doctors AS d
     LEFT JOIN appointments AS a ON a.doctor_id = d.doctor_id
     WHERE d.doctor_id = ?
     GROUP BY d.doctor_id`, [doctorId] );
     
     if (summary.length === 0) return null;
     
     const [dailyAppointments] = await pool.execute(
      `WITH RECURSIVE next_days AS ( SELECT CURDATE() AS appointment_date UNION ALL SELECT DATE_ADD(appointment_date, INTERVAL 1 DAY) FROM next_days WHERE appointment_date < DATE_ADD(CURDATE(), INTERVAL 6 DAY) )
      SELECT nd.appointment_date, COUNT(a.appointment_id) AS appointment_count, ROUND(COUNT(a.appointment_id) / 12 * 100, 2) AS utilization_percent FROM next_days AS nd LEFT JOIN appointments AS a ON DATE(a.appointment_datetime) = nd.appointment_date AND a.doctor_id = ? AND a.status = 'booked' GROUP BY nd.appointment_date ORDER BY nd.appointment_date`, [doctorId] ); 
      
      return { ...summary[0], dailyAppointments }; }


async function getDoctorsReport() {
  const [rows] = await pool.query(`SELECT d.doctor_id, d.full_name, COUNT(a.appointment_id) AS total_appointments, COALESCE(SUM(a.amount_paid - a.refund_amount), 0) AS revenue_collected FROM doctors AS d LEFT JOIN appointments AS a ON a.doctor_id = d.doctor_id GROUP BY d.doctor_id, d.full_name ORDER BY d.doctor_id `);
  return rows; }

async function getBusyDaysReport() {
  const [rows] = await pool.query(`SELECT d.doctor_id, d.full_name, DATE(a.appointment_datetime) AS appointment_date, COUNT(*) AS booked_count, ROUND(COUNT(*) / 12 * 100, 2) AS utilization_percent FROM doctors AS d JOIN appointments AS a ON a.doctor_id = d.doctor_id WHERE a.status = 'booked' GROUP BY d.doctor_id, d.full_name, DATE(a.appointment_datetime) HAVING COUNT(*) > 12 * 0.8 ORDER BY appointment_date, d.doctor_id `);
  return rows; }

module.exports = { getAllDoctors, createDoctor, getDoctorById, updateDoctor, deleteDoctor, getDoctorStatistics, getDoctorsReport, getBusyDaysReport };