const { connectRedis } = require('../config/redis');

const JOBS_KEY = 'medibook:jobs';

function getWaitlistKey(doctorId, appointmentDate) {
  return `medibook:waitlist:${doctorId}:${appointmentDate}`; }

async function addToWaitlist({ patientId, doctorId, appointmentDatetime }) {
  const redis = await connectRedis();
  const appointmentDate = appointmentDatetime.slice(0, 10);
  const entry = { patientId, doctorId, appointmentDatetime, appointmentDate };

  await redis.rPush(
    getWaitlistKey(doctorId, appointmentDate),
    JSON.stringify(entry) );

  return entry; }

async function enqueueJob(job) {
  const redis = await connectRedis();
  await redis.rPush(JOBS_KEY, JSON.stringify(job)); }

async function enqueuePromotion(doctorId, appointmentDate) {
  return enqueueJob({ type: 'promote_waitlist', doctorId, appointmentDate }); }

async function enqueueConfirmation(appointmentId, patientId, doctorId) {
  return enqueueJob({ type: 'appointment_confirmation', appointmentId, patientId, doctorId }); }

module.exports = { JOBS_KEY, getWaitlistKey, addToWaitlist, enqueuePromotion, enqueueConfirmation };