const { calculateRefund } = require('../utils/refundCalculator');

const pool = require('../config/db');

async function getAllAppointments() {
  const [rows] = await pool.query(`
    SELECT
      a.appointment_id,
      a.appointment_datetime,
      a.status,
      a.amount_paid,
      a.refund_amount,
      p.patient_id,
      p.full_name AS patient_name,
      d.doctor_id,
      d.full_name AS doctor_name,
      d.specialty
    FROM appointments AS a
    JOIN patients AS p ON a.patient_id = p.patient_id
    JOIN doctors AS d ON a.doctor_id = d.doctor_id
    ORDER BY a.appointment_datetime `);

  return rows; } 

  async function createAppointment({ patientId, doctorId, appointmentDatetime }) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [doctors] = await connection.execute('SELECT consultation_fee FROM doctors WHERE doctor_id = ? FOR UPDATE',[doctorId] );
    if (doctors.length === 0) { 
        const error = new Error('Doctor not found');
        error.status = 404;
        throw error; }
        
        const [futureCheck] = await connection.execute( 'SELECT TIMESTAMP(?) > NOW() AS is_future',[appointmentDatetime] ); 
        
        if (!futureCheck[0].is_future) { 
            const error = new Error('Appointment must be in the future'); 
            error.status = 400; 
            throw error; } 
            
            const [countRows] = await connection.execute( `SELECT COUNT(*) AS booking_count FROM appointments WHERE doctor_id = ? AND status = 'booked' AND DATE(appointment_datetime) = DATE(?)`, [doctorId,appointmentDatetime] );
            
            if (countRows[0].booking_count >= 12) {
                const error = new Error('Doctor has reached the daily booking limit'); 
                error.status = 409; 
                throw error; }
                
                const [result] = await connection.execute( `INSERT INTO appointments (patient_id, doctor_id,appointment_datetime, amount_paid) VALUES (?, ?, ?, ?)`, [ patientId, doctorId, appointmentDatetime,doctors[0].consultation_fee, ] );
                
                await connection.commit();
                return result.insertId; } 
                catch (error) { 
                    await connection.rollback();
                    throw error; } 
                    finally {
                        connection.release(); } }

async function cancelAppointment(appointmentId) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const [appointments] = await connection.execute( `SELECT appointment_id, doctor_id, DATE_FORMAT(appointment_datetime, '%Y-%m-%d') AS appointment_date, appointment_datetime, amount_paid, status FROM appointments WHERE appointment_id = ? FOR UPDATE`, [appointmentId] );
    
    if (appointments.length === 0) {
      const error = new Error('Appointment not found');
      error.status = 404;
      throw error; }
                                
      const appointment = appointments[0];
                                
    if (appointment.status !== 'booked') {
      const error = new Error('Appointment is already cancelled');
      error.status = 409;
      throw error; }
                                  
      const refundAmount = calculateRefund(
      Number(appointment.amount_paid),
      appointment.appointment_datetime );
      
      await connection.execute(`UPDATE appointments SET status = 'cancelled',refund_amount = ?, cancelled_at = NOW() WHERE appointment_id = ?`, [refundAmount, appointmentId] );
      
      await connection.commit();
      return { appointmentId, refundAmount, doctorId: appointment.doctor_id, appointmentDate: appointment.appointment_date }; } 
      catch (error) {
        await connection.rollback();
        throw error; }
        finally {
          connection.release(); } }
                                                                        

module.exports = { getAllAppointments, createAppointment, cancelAppointment };
