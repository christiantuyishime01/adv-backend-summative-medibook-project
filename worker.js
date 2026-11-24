require('dotenv').config();

const { connectRedis, redisClient } = require('./src/config/redis');
const appointmentModel = require('./src/models/appointmentModel');
const { JOBS_KEY, getWaitlistKey, enqueueConfirmation } = require('./src/utils/jobQueue');
const { writeAuditLog } = require('./src/utils/auditLogger');

async function processJob(job) {
  if (job.type === 'promote_waitlist') {
    const key = getWaitlistKey(job.doctorId, job.appointmentDate);
    const queuedEntry = await redisClient.lPop(key);

    if (!queuedEntry) return;

    const entry = JSON.parse(queuedEntry);

    try {
      const appointmentId = await appointmentModel.createAppointment({
        patientId: Number(entry.patientId),
        doctorId: Number(entry.doctorId),
        appointmentDatetime: entry.appointmentDatetime });

      await writeAuditLog({
        action: 'waitlist_promoted',
        appointmentId,
        patientId: entry.patientId,
        doctorId: entry.doctorId });

      await enqueueConfirmation(
        appointmentId,
        Number(entry.patientId),
        Number(entry.doctorId) ); }
        catch (error) { 
            await redisClient.lPush(key, queuedEntry);
            throw error; }
            
            return; }

  if (job.type === 'appointment_confirmation') {
    await writeAuditLog({
      action: 'appointment_confirmation_sent',
      appointmentId: job.appointmentId,
      patientId: job.patientId,
      doctorId: job.doctorId });
      
      console.log(`Confirmation recorded for appointment ${job.appointmentId}`); } }

async function runWorker() {
  await connectRedis();
  console.log('Worker is listening for jobs...');

  while (true) {
    const result = await redisClient.blPop(JOBS_KEY, 0);
    if (!result) continue;

    try {
      const job = JSON.parse(result.element);
      console.log('Received job:', job);
      await processJob(job); }
      catch (error) {
        console.error('Could not process job:', error.message); } } }

runWorker().catch((error) => {
    console.error('Worker stopped:', error.message);
    process.exitCode = 1; });