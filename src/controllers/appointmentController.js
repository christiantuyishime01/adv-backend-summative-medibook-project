const appointmentModel = require('../models/appointmentModel');
const { writeAuditLog } = require('../utils/auditLogger');
const { addToWaitlist, enqueueConfirmation, enqueuePromotion } = require('../utils/jobQueue');

async function listAppointments(req, res) {
  try {
    const appointments = await appointmentModel.getAllAppointments();
    res.json(appointments); }
    catch (error) {
    console.error('Could not load appointments:', error.message);
    res.status(500).json({ error: 'Could not load appointments' }); } }
    
async function bookAppointment(req, res, next) {
    const { patientId, doctorId, appointmentDatetime } = req.body;
    if (
        !Number.isInteger(Number(patientId)) || 
        Number(patientId) < 1 ||
        !Number.isInteger(Number(doctorId)) ||
        Number(doctorId) < 1 ||
        typeof appointmentDatetime !== 'string' ||
        appointmentDatetime.trim() === '' ) {
            return res.status(400).json({
                error: 'Provide valid patientId, doctorId, and appointmentDatetime', }); }
                
                try {
                    const appointmentId = await appointmentModel.createAppointment({
                        patientId: Number(patientId),
                        doctorId: Number(doctorId),
                        appointmentDatetime, });
                        writeAuditLog({ action: 'appointment_booked', appointmentId, patientId, doctorId, appointmentDatetime });
                        await enqueueConfirmation(appointmentId, Number(patientId), Number(doctorId));
                        res.status(201).json({ message: 'Appointment booked', appointmentId }); }
                        catch (error) {
                            console.error('Could not book appointment:', error.message);
                            
                            if (error.code === 'ER_DUP_ENTRY' || error.status === 409) { 
                                try { 
                                    await addToWaitlist({
                                    patientId: Number(patientId),
                                    doctorId: Number(doctorId),
                                    appointmentDatetime });
                                    return res.status(202).json({
                                        message: 'Slot or day is full; patient added to the waitlist' }); }
                                        catch (queueError) { 
                                            return next(queueError); } }
                                
                                if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                                    return res.status(400).json({ error: 'Patient was not found' }); }
                                    res.status(error.status || 500).json({
                                    error: error.status ? error.message : 'Could not book appointment', }); } }

async function cancelAppointment(req, res) {
    const appointmentId = Number(req.params.id);
    
    if (!Number.isInteger(appointmentId) || appointmentId < 1) {
        return res.status(400).json({ error: 'Provide a valid appointment ID' }); }
        
        try {
            const result = await appointmentModel.cancelAppointment(appointmentId);
            writeAuditLog({
                action: 'appointment_cancelled',
                appointmentId: result.appointmentId,
                refundAmount: result.refundAmount, });
                await enqueuePromotion(result.doctorId, result.appointmentDate);

            res.json({
                message: 'Appointment cancelled',
                appointmentId: result.appointmentId,
                refundAmount: result.refundAmount, }); }
                catch (error) {
                    console.error('Could not cancel appointment:', error.message);
                    res.status(error.status || 500).json({
                        error: error.status ? error.message : 'Could not cancel appointment', }); } }
                        
                        
module.exports = { listAppointments, bookAppointment, cancelAppointment };