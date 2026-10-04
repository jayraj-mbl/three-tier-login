CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_code VARCHAR(20) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  department VARCHAR(80) NOT NULL,
  job_title VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO employees (employee_code, full_name, email, department, job_title) VALUES
('EMP001', 'Aarav Sharma', 'aarav@example.com', 'Engineering', 'Software Engineer'),
('EMP002', 'Meera Patel', 'meera@example.com', 'Operations', 'Application Support Engineer'),
('EMP003', 'Rohan Kumar', 'rohan@example.com', 'Finance', 'Financial Analyst'),
('EMP004', 'Ananya Rao', 'ananya@example.com', 'Human Resources', 'HR Specialist'),
('EMP005', 'Vikram Singh', 'vikram@example.com', 'Engineering', 'DevOps Engineer');
