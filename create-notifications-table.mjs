import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  database: 'chemistry_lab_cms',
});

const sql = `
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  type ENUM('loan_pending', 'loan_approved', 'loan_rejected', 'loan_returned', 'book_loan_pending', 'book_loan_approved', 'book_loan_rejected', 'book_loan_returned') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  loanId INT,
  bookLoanId INT,
  isRead INT DEFAULT 0 NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);
`;

try {
  await connection.execute(sql);
  console.log('✓ Notifications table created successfully');
} catch (err) {
  console.error('✗ Error creating notifications table:', err.message);
}

await connection.end();
