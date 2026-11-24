function calculateRefund(amountPaid, appointmentDatetime, now = new Date()) {
  const appointmentTime = new Date(appointmentDatetime).getTime();
  const currentTime = new Date(now).getTime();
  
  if (
    !Number.isFinite(amountPaid) ||
    amountPaid < 0 ||
    !Number.isFinite(appointmentTime) ||
    !Number.isFinite(currentTime) ) {
        throw new Error('Invalid refund calculation input'); }
        
        const hoursNotice = (appointmentTime - currentTime) / (1000 * 60 * 60);
        let refundRate = 0;
        if (hoursNotice > 48) {
            refundRate = 1; } 
            else if (hoursNotice >= 24) {
                refundRate = 0.5; }
                
                return Number((amountPaid * refundRate).toFixed(2)); }
                
                module.exports = { calculateRefund };