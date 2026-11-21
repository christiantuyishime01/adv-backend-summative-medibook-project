CREATE DATABASE IF NOT EXISTS medibook;

USE medibook;

CREATE TABLE patients (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(12) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_patients_email UNIQUE (email),
    CONSTRAINT chk_patients_phone CHECK (phone REGEXP '^[0-9]{12}$')
) ENGINE = InnoDB;

CREATE TABLE doctors (
    doctor_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    consultation_fee DECIMAL(10, 2) NOT NULL,
    room VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_doctors_consultation_fee CHECK (consultation_fee >= 0)
) ENGINE = InnoDB;

CREATE TABLE appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_datetime DATETIME NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    status ENUM('booked', 'cancelled') NOT NULL DEFAULT 'booked',
    refund_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    cancelled_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active_slot_doctor_id INT GENERATED ALWAYS AS (
        CASE
            WHEN status = 'booked' THEN doctor_id
            ELSE NULL
        END
    ) STORED,
    CONSTRAINT fk_appointments_patient FOREIGN KEY (patient_id) REFERENCES patients (patient_id) ON DELETE RESTRICT,
    CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id) REFERENCES doctors (doctor_id) ON DELETE RESTRICT,
    CONSTRAINT uq_appointments_active_slot UNIQUE (
        active_slot_doctor_id,
        appointment_datetime
    ),
    CONSTRAINT chk_appointments_amount_paid CHECK (amount_paid >= 0),
    CONSTRAINT chk_appointments_refund CHECK (
        refund_amount >= 0
        AND refund_amount <= amount_paid
    ),
    CONSTRAINT chk_appointments_slot_time CHECK (
        TIME(appointment_datetime) >= '09:00:00'
        AND TIME(appointment_datetime) <= '16:30:00'
        AND MINUTE(appointment_datetime) IN (0, 30)
        AND SECOND(appointment_datetime) = 0
    )
) ENGINE = InnoDB;