USE medibook;

INSERT INTO patients (patient_id, full_name, email, phone) 
VALUES
(1, 'Joshua Smith', 'josh.smith@gmail.com', '233244111222'),
(2, 'Collins Johnson', 'coll.johnson@gmail.com', '233555333444'),
(3, 'Esther Asante', 'essy.asante@gmail.com', '233501234567'),
(4, 'Michael Black', 'mich.black@gmail.com', '233201000004'),
(5, 'Sarah Williams', 'sarah.willy@gmail.com', '233202000005'),
(6, 'Cedrick Iradukunda', 'ced.iradukunda@gmail.com', '233203080006'),
(7, 'Alice Uwase', 'ally.uwase@gmail.com', '233204000007'),
(8, 'Samuel Niyonsaba', 'sam.niyonsaba@gmail.com', '233205000008'),
(9, 'Grace Mukamana', 'grace.mukamana@gmail.com', '233206000009'),
(10, 'David Habimana', 'david.habimana@gmail.com', '233207000010'),
(11, 'Linda Uwimana', 'linda.uwimana@gmail.com', '233208000011');

INSERT INTO doctors (doctor_id, full_name, specialty, consultation_fee, room)
VALUES
(1, 'Dr. Ivan', 'Dermatology', 150.00,'R-12'),
(2, 'Dr. Kevine', 'Paediatrics', 100.00, 'R-03'),
(3, 'Dr. Maza', 'Cardiology', 175.00, 'R-09');

INSERT INTO appointments (patient_id, doctor_id, appointment_datetime, amount_paid)
VALUES
(1, 1, '2026-12-01 09:00:00', 150.00),
(2, 1, '2026-12-01 09:30:00', 150.00),
(3, 1, '2026-12-01 10:00:00', 150.00),
(4, 1, '2026-12-01 10:30:00', 150.00),
(5, 1, '2026-12-01 11:00:00', 150.00),
(6, 1, '2026-12-01 11:30:00', 150.00),
(7, 1, '2026-12-01 12:00:00', 150.00),
(8, 1, '2026-12-01 12:30:00', 150.00),
(9, 1, '2026-12-01 13:00:00', 150.00),
(10, 1, '2026-12-01 13:30:00', 150.00),
(11, 1, '2026-12-01 14:00:00', 150.00),
(1, 2, '2026-12-02 09:00:00', 100.00);