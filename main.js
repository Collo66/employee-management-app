// ==================== Global Variables ====================
let employees = JSON.parse(localStorage.getItem('employees')) || [];
let currentEditingId = null;

// ==================== Initialize on Page Load ====================
document.addEventListener('DOMContentLoaded', function() {
    // Load employees data
    loadEmployeesData();

    // Form submission
    const employeeForm = document.getElementById('employeeForm');
    if (employeeForm) {
        employeeForm.addEventListener('submit', handleFormSubmit);
    }

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', handleSearch);
        displayEmployees();
    }

    // Set active nav link
    setActiveNavLink();
});

// ==================== Form Handling ====================
function handleFormSubmit(e) {
    e.preventDefault();

    // Get form values
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const department = document.getElementById('department').value;
    const position = document.getElementById('position').value.trim();

    // Validate inputs
    if (!validateForm(fullName, email, phone, department, position)) {
        return;
    }

    // Check if email already exists
    if (employees.some(emp => emp.email === email)) {
        showErrorMessage('emailError', 'This email already exists!');
        return;
    }

    // Create employee object
    const newEmployee = {
        id: Date.now(),
        fullName: fullName,
        email: email,
        phone: phone,
        department: department,
        position: position
    };

    // Add to employees array
    employees.push(newEmployee);

    // Save to localStorage
    saveEmployeesData();

    // Show success message
    showSuccessMessage();

    // Reset form
    document.getElementById('employeeForm').reset();

    // Clear errors
    clearFormErrors();

    // Redirect to view contacts after 2 seconds
    setTimeout(() => {
        window.location.href = 'view-contacts.html';
    }, 2000);
}

// ==================== Form Validation ====================
function validateForm(fullName, email, phone, department, position) {
    let isValid = true;

    // Clear all errors first
    clearFormErrors();

    // Validate Full Name
    if (fullName === '') {
        showErrorMessage('fullNameError', 'Full name is required');
        isValid = false;
    } else if (fullName.length < 3) {
        showErrorMessage('fullNameError', 'Full name must be at least 3 characters');
        isValid = false;
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === '') {
        showErrorMessage('emailError', 'Email is required');
        isValid = false;
    } else if (!emailRegex.test(email)) {
        showErrorMessage('emailError', 'Please enter a valid email address');
        isValid = false;
    }

    // Validate Phone
    const phoneRegex = /^[\d\s\-\(\)]+$/;
    if (phone === '') {
        showErrorMessage('phoneError', 'Phone number is required');
        isValid = false;
    } else if (!phoneRegex.test(phone)) {
        showErrorMessage('phoneError', 'Please enter a valid phone number');
        isValid = false;
    }

    // Validate Department
    if (department === '') {
        showErrorMessage('departmentError', 'Please select a department');
        isValid = false;
    }

    // Validate Position
    if (position === '') {
        showErrorMessage('positionError', 'Position is required');
        isValid = false;
    } else if (position.length < 2) {
        showErrorMessage('positionError', 'Position must be at least 2 characters');
        isValid = false;
    }

    return isValid;
}

function showErrorMessage(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function clearFormErrors() {
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(error => {
        error.textContent = '';
        error.classList.remove('show');
    });
}

function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        successMessage.style.display = 'block';
    }
}

// ==================== Employees Display ====================
function displayEmployees() {
    const tableBody = document.getElementById('tableBody');
    const emptyRow = document.getElementById('emptyRow');

    if (!tableBody) return;

    // Clear existing rows
    tableBody.innerHTML = '';

    // Check if there are employees
    if (employees.length === 0) {
        emptyRow.style.display = 'table-row';
        tableBody.appendChild(emptyRow);
        return;
    }

    // Hide empty row
    emptyRow.style.display = 'none';

    // Add employee rows
    employees.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(employee.fullName)}</td>
            <td>${escapeHtml(employee.email)}</td>
            <td>${escapeHtml(employee.phone)}</td>
            <td>${escapeHtml(employee.department)}</td>
            <td>${escapeHtml(employee.position)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-small" onclick="viewEmployeeDetails(${employee.id})">Details</button>
                    <button class="btn btn-secondary btn-small" onclick="showEditAlertForEmployee(${employee.id})">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="showDeleteConfirmation(${employee.id})">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// ==================== Search Functionality ====================
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();

    if (searchTerm === '') {
        displayEmployees();
        return;
    }

    const filteredEmployees = employees.filter(emp => 
        emp.fullName.toLowerCase().includes(searchTerm) ||
        emp.email.toLowerCase().includes(searchTerm) ||
        emp.department.toLowerCase().includes(searchTerm) ||
        emp.phone.includes(searchTerm)
    );

    displayFilteredEmployees(filteredEmployees);
}

function displayFilteredEmployees(filteredEmployees) {
    const tableBody = document.getElementById('tableBody');
    const emptyRow = document.getElementById('emptyRow');

    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (filteredEmployees.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="6" class="empty-message">No employees found matching your search.</td>`;
        tableBody.appendChild(row);
        return;
    }

    filteredEmployees.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(employee.fullName)}</td>
            <td>${escapeHtml(employee.email)}</td>
            <td>${escapeHtml(employee.phone)}</td>
            <td>${escapeHtml(employee.department)}</td>
            <td>${escapeHtml(employee.position)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-small" onclick="viewEmployeeDetails(${employee.id})">Details</button>
                    <button class="btn btn-secondary btn-small" onclick="showEditAlertForEmployee(${employee.id})">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="showDeleteConfirmation(${employee.id})">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// ==================== View Employee Details ====================
function viewEmployeeDetails(id) {
    const employee = employees.find(emp => emp.id === id);

    if (!employee) return;

    const modalBody = document.getElementById('modalBodyDetails');
    modalBody.innerHTML = `
        <div class="modal-body">
            <div class="detail-item">
                <strong>Full Name:</strong>
                <p>${escapeHtml(employee.fullName)}</p>
            </div>
            <div class="detail-item">
                <strong>Email Address:</strong>
                <p><a href="mailto:${escapeHtml(employee.email)}">${escapeHtml(employee.email)}</a></p>
            </div>
            <div class="detail-item">
                <strong>Phone Number:</strong>
                <p><a href="tel:${escapeHtml(employee.phone)}">${escapeHtml(employee.phone)}</a></p>
            </div>
            <div class="detail-item">
                <strong>Department:</strong>
                <p>${escapeHtml(employee.department)}</p>
            </div>
            <div class="detail-item">
                <strong>Position:</strong>
                <p>${escapeHtml(employee.position)}</p>
            </div>
        </div>
    `;

    const modal = document.getElementById('detailsModal');
    modal.classList.add('show');
}

function closeDetailsModal() {
    const modal = document.getElementById('detailsModal');
    modal.classList.remove('show');
}

// ==================== Edit Employee ====================
function showEditAlertForEmployee(id) {
    const employee = employees.find(emp => emp.id === id);

    if (!employee) return;

    // Show an alert-style popup
    const editMessage = `
Edit Employee: ${employee.fullName}

Current Details:
- Email: ${employee.email}
- Phone: ${employee.phone}
- Department: ${employee.department}
- Position: ${employee.position}

Click OK to proceed with editing (Feature would redirect to edit form)
    `;

    if (confirm(editMessage)) {
        // Store the ID and redirect to edit page (if it existed)
        currentEditingId = id;
        alert('Edit feature would open here. For now, you can view the complete details above.');
    }
}

// ==================== Delete Employee ====================
function showDeleteConfirmation(id) {
    const employee = employees.find(emp => emp.id === id);

    if (!employee) return;

    const confirmDelete = confirm(
        `Are you sure you want to delete ${employee.fullName}?\n\nThis action cannot be undone.`
    );

    if (confirmDelete) {
        deleteEmployee(id);
    }
}

function deleteEmployee(id) {
    // Find and remove employee
    employees = employees.filter(emp => emp.id !== id);

    // Save to localStorage
    saveEmployeesData();

    // Show confirmation
    alert('Employee deleted successfully!');

    // Refresh the table
    displayEmployees();
}

// ==================== Data Management ====================
function saveEmployeesData() {
    localStorage.setItem('employees', JSON.stringify(employees));
}

function loadEmployeesData() {
    employees = JSON.parse(localStorage.getItem('employees')) || [];
}

// ==================== Utility Functions ====================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
}

// ==================== Sample Data (for testing) ====================
// Uncomment the line below to populate sample data on first load
// function addSampleData() {
//     if (employees.length === 0) {
//         employees = [
//             {
//                 id: 1,
//                 fullName: 'John Smith',
//                 email: 'john.smith@company.com',
//                 phone: '(555) 123-4567',
//                 department: 'IT',
//                 position: 'Senior Developer'
//             },
//             {
//                 id: 2,
//                 fullName: 'Sarah Johnson',
//                 email: 'sarah.johnson@company.com',
//                 phone: '(555) 234-5678',
//                 department: 'HR',
//                 position: 'HR Manager'
//             },
//             {
//                 id: 3,
//                 fullName: 'Michael Brown',
//                 email: 'michael.brown@company.com',
//                 phone: '(555) 345-6789',
//                 department: 'Finance',
//                 position: 'Finance Manager'
//             },
//             {
//                 id: 4,
//                 fullName: 'Emily Davis',
//                 email: 'emily.davis@company.com',
//                 phone: '(555) 456-7890',
//                 department: 'Marketing',
//                 position: 'Marketing Specialist'
//             }
//         ];
//         saveEmployeesData();
//     }
// }
// addSampleData();
