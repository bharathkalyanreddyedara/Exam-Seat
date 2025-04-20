/**
 * Exam Seating Arrangement System
 * Main JavaScript file
 */

// Global state object to track application state
const state = {
  user: null,
  exams: [],
  studentSeats: [],
  users: [],
  currentPage: 'home',
  theme: localStorage.getItem('theme') || 'light',
  filterValue: 'all',
};

// DOM elements
const elements = {
  pages: {},
  navLinks: {},
  modal: {},
  auth: {},
  dashboard: {},
  seating: {},
  exams: {},
  notification: {}
};

/**
 * Initialize the application
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme based on local storage or system preference
  initTheme();
  
  // Gather DOM elements references for easy access
  gatherElements();
  
  // Set up event listeners
  initEventListeners();
  
  // Check if user is logged in (from localStorage)
  checkAuth();
  
  // Fetch data if user is authenticated
  if (state.user) {
    fetchData();
  }
});

/**
 * Initialize theme based on local storage or system preference
 */
function initTheme() {
  // Check if theme is saved in localStorage
  if (state.theme === 'dark') {
    document.body.classList.add('dark');
    document.getElementById('theme-switch').checked = true;
  } else {
    document.body.classList.remove('dark');
    document.getElementById('theme-switch').checked = false;
  }
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
  if (state.theme === 'light') {
    state.theme = 'dark';
    document.body.classList.add('dark');
  } else {
    state.theme = 'light';
    document.body.classList.remove('dark');
  }
  
  // Save preference to localStorage
  localStorage.setItem('theme', state.theme);
}

/**
 * Collect important DOM elements for later use
 */
function gatherElements() {
  // Pages
  document.querySelectorAll('.page').forEach(page => {
    elements.pages[page.id] = page;
  });
  
  // Navigation links
  document.querySelectorAll('.nav-link').forEach(link => {
    elements.navLinks[link.dataset.page] = link;
  });
  
  // Auth elements
  elements.auth = {
    loginBtn: document.getElementById('login-btn'),
    registerBtn: document.getElementById('register-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    userMenu: document.querySelector('.user-menu'),
    usernameDisplay: document.getElementById('username-display'),
    authActions: document.querySelector('.auth-actions'),
    authModal: document.getElementById('auth-modal'),
    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),
    loginTab: document.getElementById('login-tab'),
    registerTab: document.getElementById('register-tab'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    closeModal: document.querySelectorAll('.close-modal')
  };
  
  // Dashboard elements
  elements.dashboard = {
    studentName: document.getElementById('student-name'),
    upcomingExamsCount: document.getElementById('upcoming-exams-count'),
    seatsAssignedCount: document.getElementById('seats-assigned-count'),
    nextExamDate: document.getElementById('next-exam-date'),
    examsList: document.getElementById('exams-list'),
    examFilter: document.getElementById('exam-filter'),
    resetFilter: document.getElementById('reset-filter')
  };
  
  // Seating elements
  elements.seating = {
    examSelect: document.getElementById('exam-select'),
    venueName: document.getElementById('venue-name'),
    examDate: document.getElementById('exam-date'),
    seatingGrid: document.getElementById('seating-grid'),
    seatNumber: document.getElementById('seat-number'),
    printSeating: document.getElementById('print-seating')
  };
  
  // Exam details elements
  elements.exams = {
    calendar: document.getElementById('exam-calendar'),
    timeline: document.querySelector('.exam-timeline'),
    prevMonth: document.getElementById('prev-month'),
    nextMonth: document.getElementById('next-month'),
    currentMonth: document.getElementById('current-month')
  };
  
  // Modal elements
  elements.modal = {
    examDetailsModal: document.getElementById('exam-details-modal'),
    examTitle: document.getElementById('exam-title'),
    examType: document.getElementById('exam-type'),
    examDetailDate: document.getElementById('exam-detail-date'),
    examTime: document.getElementById('exam-time'),
    examVenue: document.getElementById('exam-venue'),
    examSeat: document.getElementById('exam-seat'),
    viewSeatingBtn: document.getElementById('view-seating-btn'),
    printDetailsBtn: document.getElementById('print-details-btn')
  };
  
  // Notification element
  elements.notification = {
    container: document.getElementById('notification'),
    message: document.getElementById('notification-message'),
    icon: document.getElementById('notification-icon')
  };
}

/**
 * Set up event listeners for interactive elements
 */
function initEventListeners() {
  // Theme toggle
  document.getElementById('theme-switch').addEventListener('change', toggleTheme);
  
  // Navigation
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = link.dataset.page;
      showPage(pageId);
    });
  });
  
  // Mobile menu toggle
  document.querySelector('.mobile-menu-btn').addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('active');
    document.querySelector('.auth-actions').classList.toggle('active');
    document.querySelector('.theme-toggle').classList.toggle('active');
  });
  
  // Auth modal
  elements.auth.loginBtn.addEventListener('click', () => {
    elements.auth.authModal.classList.add('active');
    changeAuthTab('login');
  });
  
  elements.auth.registerBtn.addEventListener('click', () => {
    elements.auth.authModal.classList.add('active');
    changeAuthTab('register');
  });
  
  elements.auth.closeModal.forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
      });
    });
  });
  
  // Auth tabs
  elements.auth.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      changeAuthTab(btn.dataset.tab);
    });
  });
  
  // Auth forms
  elements.auth.loginForm.addEventListener('submit', handleLogin);
  elements.auth.registerForm.addEventListener('submit', handleRegister);
  elements.auth.logoutBtn.addEventListener('click', logout);
  
  // Dashboard filters
  if (elements.dashboard.examFilter) {
    elements.dashboard.examFilter.addEventListener('change', filterExams);
  }
  
  if (elements.dashboard.resetFilter) {
    elements.dashboard.resetFilter.addEventListener('click', resetFilters);
  }
  
  // Modal close when clicking outside
  window.addEventListener('click', (e) => {
    document.querySelectorAll('.modal').forEach(modal => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
  
  // Get Started button
  document.querySelector('.cta-buttons .btn-primary').addEventListener('click', () => {
    if (state.user) {
      showPage('dashboard');
    } else {
      elements.auth.authModal.classList.add('active');
      changeAuthTab('login');
    }
  });
  
  // Exam detail buttons
  if (elements.modal.viewSeatingBtn) {
    elements.modal.viewSeatingBtn.addEventListener('click', () => {
      const examId = elements.modal.viewSeatingBtn.dataset.examId;
      elements.modal.examDetailsModal.classList.remove('active');
      showPage('seating');
      
      // Set the selected exam in the dropdown
      if (elements.seating.examSelect) {
        elements.seating.examSelect.value = examId;
        // Trigger change event to load seating plan
        const event = new Event('change');
        elements.seating.examSelect.dispatchEvent(event);
      }
    });
  }
  
  if (elements.modal.printDetailsBtn) {
    elements.modal.printDetailsBtn.addEventListener('click', () => {
      const examId = elements.modal.printDetailsBtn.dataset.examId;
      printExamDetails(examId);
    });
  }
  
  // Seating Plan print button
  if (elements.seating.printSeating) {
    elements.seating.printSeating.addEventListener('click', () => {
      const examId = elements.seating.examSelect.value;
      printExamDetails(examId);
    });
  }
  
  // Exam select dropdown
  if (elements.seating.examSelect) {
    elements.seating.examSelect.addEventListener('change', () => {
      const examId = elements.seating.examSelect.value;
      const exam = state.exams.find(e => e.id === examId);
      
      if (exam) {
        // Update venue and date info
        elements.seating.venueName.textContent = exam.venue;
        elements.seating.examDate.textContent = `${exam.date} | ${exam.time}`;
        
        // Find seat assignment if exists
        const seatAssignment = state.studentSeats.find(
          seat => seat.exam_id === examId && seat.student_id === state.user.id
        );
        
        if (seatAssignment) {
          elements.seating.seatNumber.textContent = seatAssignment.seat_number;
        } else {
          elements.seating.seatNumber.textContent = 'Not Assigned';
        }
        
        // Generate seating grid
        generateSeatingGrid(examId);
      }
    });
  }
  
  // Calendar navigation
  if (elements.exams.prevMonth) {
    elements.exams.prevMonth.addEventListener('click', () => {
      // Logic for showing previous month
      generateCalendar(-1);
    });
  }
  
  if (elements.exams.nextMonth) {
    elements.exams.nextMonth.addEventListener('click', () => {
      // Logic for showing next month
      generateCalendar(1);
    });
  }
}

/**
 * Change auth modal tabs between login and register
 */
function changeAuthTab(tabId) {
  elements.auth.tabBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  
  elements.auth.loginTab.classList.toggle('active', tabId === 'login');
  elements.auth.registerTab.classList.toggle('active', tabId === 'register');
}

/**
 * Show specified page and update navigation
 */
function showPage(pageId, tabId = null) {
  // Hide all pages
  Object.values(elements.pages).forEach(page => {
    page.classList.remove('active');
  });
  
  // Show selected page
  if (elements.pages[pageId + '-page']) {
    elements.pages[pageId + '-page'].classList.add('active');
    state.currentPage = pageId;
    
    // Update navigation
    Object.keys(elements.navLinks).forEach(key => {
      elements.navLinks[key].classList.toggle('active', key === pageId);
    });
    
    // Load page-specific content
    if (pageId === 'dashboard' && state.user) {
      updateDashboard();
    } else if (pageId === 'exams' && state.user) {
      generateCalendar();
      generateTimeline();
    } else if (pageId === 'seating' && state.user) {
      populateExamSelect();
    }
  } else {
    // Show 404
    elements.pages['not-found-page'].classList.add('active');
  }
}

/**
 * Check if user is authenticated from localStorage
 */
function checkAuth() {
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      state.user = JSON.parse(userData);
      updateAuthUI(true);
    } catch (e) {
      // Invalid user data
      localStorage.removeItem('user');
      updateAuthUI(false);
    }
  } else {
    updateAuthUI(false);
  }
}

/**
 * Update UI based on authentication state
 */
function updateAuthUI(isLoggedIn) {
  if (isLoggedIn && state.user) {
    elements.auth.loginBtn.classList.add('hidden');
    elements.auth.registerBtn.classList.add('hidden');
    elements.auth.userMenu.classList.remove('hidden');
    elements.auth.usernameDisplay.textContent = state.user.username;
    
    // Update student name in dashboard
    if (elements.dashboard.studentName) {
      elements.dashboard.studentName.textContent = state.user.username;
    }
  } else {
    elements.auth.loginBtn.classList.remove('hidden');
    elements.auth.registerBtn.classList.remove('hidden');
    elements.auth.userMenu.classList.add('hidden');
  }
}

/**
 * Handle login form submission
 */
function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  
  if (!username || !password) {
    showNotification('Please fill in all fields', 'error');
    return;
  }
  
  // For static demo, authentication is simulated
  const users = [
    { id: "1", username: "admin", password: "admin123", role: "admin", email: "admin@example.com" },
    { id: "2", username: "student1", password: "student123", role: "student", email: "student1@example.com" },
    { id: "3", username: "student2", password: "student123", role: "student", email: "student2@example.com" }
  ];
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    // Remove password before storing user data
    const { password, ...safeUser } = user;
    state.user = safeUser;
    localStorage.setItem('user', JSON.stringify(safeUser));
    
    // Update UI
    updateAuthUI(true);
    elements.auth.authModal.classList.remove('active');
    showNotification('Login successful!', 'success');
    
    // Fetch data and show dashboard
    fetchData();
    showPage('dashboard');
  } else {
    showNotification('Invalid username or password', 'error');
  }
}

/**
 * Handle registration form submission
 */
function handleRegister(e) {
  e.preventDefault();
  
  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password').value;
  
  if (!username || !email || !password || !confirmPassword) {
    showNotification('Please fill in all fields', 'error');
    return;
  }
  
  if (password !== confirmPassword) {
    showNotification('Passwords do not match', 'error');
    return;
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showNotification('Please enter a valid email address', 'error');
    return;
  }
  
  // For static demo, simulate registration success
  const newUserId = Math.floor(Math.random() * 10000) + 10; // Random ID starting from 10
  const newUser = {
    id: newUserId.toString(),
    username: username,
    role: 'student',
    email: email
  };
  
  // Store user data 
  state.user = newUser;
  localStorage.setItem('user', JSON.stringify(newUser));
  
  // Update UI
  updateAuthUI(true);
  elements.auth.authModal.classList.remove('active');
  showNotification('Registration successful!', 'success');
  
  // Fetch data and show dashboard
  fetchData();
  showPage('dashboard');
}

/**
 * Handle logout
 */
function logout() {
  // Clear user data
  state.user = null;
  localStorage.removeItem('user');
  
  // Update UI
  updateAuthUI(false);
  showNotification('Logged out successfully', 'success');
  
  // Go to home page
  showPage('home');
}

/**
 * Fetch application data 
 * For static demo, this loads mock data
 */
function fetchData() {
  // Mock exam data
  const exams = [
    {
      id: "e1",
      title: "Mathematics 101",
      type: "Final Exam",
      date: "May 15 2023",
      time: "09:00 - 11:00 AM",
      venue: "Main Hall",
      status: "assigned",
      color: "primary"
    },
    {
      id: "e2",
      title: "Computer Science 202",
      type: "Midterm Exam",
      date: "May 17 2023",
      time: "01:00 - 03:00 PM",
      venue: "Science Block A",
      status: "assigned",
      color: "secondary"
    },
    {
      id: "e3",
      title: "History 105",
      type: "Final Exam",
      date: "May 20 2023",
      time: "10:00 AM - 12:00 PM",
      venue: "Arts Center",
      status: "pending",
      color: "accent"
    },
    {
      id: "e4",
      title: "Physics 103",
      type: "Practical Exam",
      date: "May 22 2023",
      time: "02:00 - 04:00 PM",
      venue: "Science Lab B",
      status: "pending",
      color: "primary"
    },
    {
      id: "e5",
      title: "English Literature",
      type: "Final Exam",
      date: "May 25 2023",
      time: "09:00 - 11:00 AM",
      venue: "Humanities Hall",
      status: "assigned",
      color: "secondary"
    }
  ];
  
  // Mock student seat assignments
  const studentSeats = [
    { exam_id: "e1", student_id: "2", seat_number: "A1" },
    { exam_id: "e2", student_id: "2", seat_number: "B3" },
    { exam_id: "e5", student_id: "2", seat_number: "C4" },
    { exam_id: "e1", student_id: "3", seat_number: "A2" },
    { exam_id: "e2", student_id: "3", seat_number: "B5" }
  ];
  
  state.exams = exams;
  state.studentSeats = studentSeats;
  
  updateDashboard();
}

/**
 * Update dashboard content
 */
function updateDashboard() {
  if (!state.user || !elements.dashboard.examsList) return;
  
  // Filter exams for the current student
  const studentSeats = state.studentSeats.filter(
    seat => seat.student_id === state.user.id
  );
  
  const assignedExamIds = studentSeats.map(seat => seat.exam_id);
  
  // Mark exams with assigned seats
  const studentExams = state.exams.map(exam => {
    // Determine if seat is assigned
    const isAssigned = assignedExamIds.includes(exam.id);
    const seatNumber = isAssigned 
      ? studentSeats.find(seat => seat.exam_id === exam.id).seat_number 
      : null;
    
    // Determine exam status
    let status;
    if (exam.status === 'assigned' || isAssigned) {
      status = 'assigned';
    } else {
      status = 'pending';
    }
    
    return { ...exam, status, seatNumber };
  });
  
  // Update stats
  const upcomingExams = studentExams.length;
  const seatsAssigned = studentSeats.length;
  
  elements.dashboard.upcomingExamsCount.textContent = upcomingExams;
  elements.dashboard.seatsAssignedCount.textContent = seatsAssigned;
  
  // Find next exam date
  if (upcomingExams > 0) {
    // Sort exams by date
    const sortedExams = [...studentExams].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });
    
    elements.dashboard.nextExamDate.textContent = sortedExams[0].date;
  } else {
    elements.dashboard.nextExamDate.textContent = "None";
  }
  
  // Render exam cards
  renderExams(studentExams);
}

/**
 * Render exam cards in the dashboard
 */
function renderExams(examsToRender) {
  if (!elements.dashboard.examsList) return;
  
  // Clear existing cards
  elements.dashboard.examsList.innerHTML = '';
  
  if (examsToRender.length === 0) {
    elements.dashboard.examsList.innerHTML = '<p class="no-exams">No exams found.</p>';
    return;
  }
  
  // Filter exams based on selected value
  const filterValue = elements.dashboard.examFilter.value;
  let filteredExams = examsToRender;
  
  if (filterValue !== 'all') {
    filteredExams = examsToRender.filter(exam => exam.status === filterValue);
  }
  
  // Create and append exam cards
  filteredExams.forEach(exam => {
    const examCard = createExamCard(exam);
    elements.dashboard.examsList.appendChild(examCard);
  });
}

/**
 * Create an exam card element
 */
function createExamCard(exam) {
  const card = document.createElement('div');
  card.className = 'exam-card';
  
  const header = document.createElement('div');
  header.className = `exam-card-header ${exam.color}`;
  
  const content = document.createElement('div');
  content.className = 'exam-card-content';
  
  header.innerHTML = `
    <div class="exam-type">${exam.type}</div>
    <h3 class="exam-title">${exam.title}</h3>
    <div class="exam-date">
      <i class="fas fa-calendar"></i>
      <span>${exam.date}</span>
    </div>
  `;
  
  content.innerHTML = `
    <div class="exam-details">
      <div class="exam-detail">
        <i class="fas fa-clock"></i>
        <span>${exam.time}</span>
      </div>
      <div class="exam-detail">
        <i class="fas fa-map-marker-alt"></i>
        <span>${exam.venue}</span>
      </div>
      ${exam.seatNumber ? `
        <div class="exam-detail">
          <i class="fas fa-chair"></i>
          <span>Seat: ${exam.seatNumber}</span>
        </div>
      ` : ''}
    </div>
    
    <div class="exam-status">
      ${getStatusBadge(exam.status, exam.seatNumber)}
      <button class="btn btn-small btn-outline view-details" data-exam-id="${exam.id}">
        View Details
      </button>
    </div>
  `;
  
  card.appendChild(header);
  card.appendChild(content);
  
  // Add event listener for view details button
  setTimeout(() => {
    const viewDetailsBtn = card.querySelector('.view-details');
    if (viewDetailsBtn) {
      viewDetailsBtn.addEventListener('click', () => {
        viewExamDetails(exam.id);
      });
    }
  }, 0);
  
  return card;
}

/**
 * Generate status badge HTML for exam cards
 */
function getStatusBadge(status, seatNumber) {
  let badgeText, badgeClass;
  
  if (status === 'assigned' && seatNumber) {
    badgeText = 'Seat Assigned';
    badgeClass = 'assigned';
  } else if (status === 'pending') {
    badgeText = 'Pending';
    badgeClass = 'pending';
  } else if (status === 'completed') {
    badgeText = 'Completed';
    badgeClass = 'completed';
  } else {
    badgeText = 'Pending Assignment';
    badgeClass = 'pending';
  }
  
  return `<div class="status-badge ${badgeClass}">${badgeText}</div>`;
}

/**
 * Filter exams based on selected status
 */
function filterExams() {
  if (!elements.dashboard.examFilter) return;
  
  state.filterValue = elements.dashboard.examFilter.value;
  updateDashboard();
}

/**
 * Reset exam filters
 */
function resetFilters() {
  if (!elements.dashboard.examFilter) return;
  
  elements.dashboard.examFilter.value = 'all';
  state.filterValue = 'all';
  updateDashboard();
}

/**
 * View exam details in modal
 */
function viewExamDetails(examId) {
  const exam = state.exams.find(e => e.id === examId);
  if (!exam) return;
  
  // Find seat assignment if exists
  const seatAssignment = state.studentSeats.find(
    seat => seat.exam_id === examId && seat.student_id === state.user.id
  );
  
  // Update modal content
  elements.modal.examTitle.textContent = exam.title;
  elements.modal.examType.textContent = exam.type;
  elements.modal.examDetailDate.textContent = exam.date;
  elements.modal.examTime.textContent = exam.time;
  elements.modal.examVenue.textContent = exam.venue;
  elements.modal.examSeat.textContent = seatAssignment ? seatAssignment.seat_number : 'Not Assigned';
  
  // Set exam ID for buttons
  elements.modal.viewSeatingBtn.dataset.examId = examId;
  elements.modal.printDetailsBtn.dataset.examId = examId;
  
  // Show modal
  elements.modal.examDetailsModal.classList.add('active');
}

/**
 * Print exam details
 */
function printExamDetails(examId) {
  const exam = state.exams.find(e => e.id === examId);
  if (!exam) return;
  
  // Find seat assignment if exists
  const seatAssignment = state.studentSeats.find(
    seat => seat.exam_id === examId && seat.student_id === state.user.id
  );
  
  // Create print window
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Exam Details - ${exam.title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
        }
        .print-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #4a6baf;
          margin-bottom: 10px;
        }
        .title {
          font-size: 20px;
          margin-bottom: 5px;
        }
        .subtitle {
          font-size: 16px;
          color: #666;
          margin-bottom: 20px;
        }
        .student-info {
          margin-bottom: 30px;
          padding: 15px;
          border: 1px solid #ccc;
          border-radius: 5px;
        }
        .exam-details {
          margin-bottom: 30px;
        }
        .detail-row {
          display: flex;
          margin-bottom: 10px;
        }
        .detail-label {
          width: 150px;
          font-weight: bold;
        }
        .detail-value {
          flex: 1;
        }
        .seat-info {
          text-align: center;
          margin-top: 30px;
          padding: 15px;
          border: 2px dashed #4a6baf;
          border-radius: 5px;
        }
        .seat-label {
          font-size: 18px;
          margin-bottom: 10px;
        }
        .seat-number {
          font-size: 28px;
          font-weight: bold;
          color: #4a6baf;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }
        .qr-placeholder {
          width: 100px;
          height: 100px;
          border: 1px solid #ccc;
          margin: 20px auto;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="print-header">
        <div class="logo">ExamSeat</div>
        <h1 class="title">Exam Admission Ticket</h1>
        <p class="subtitle">Please bring this ticket with you to the exam</p>
      </div>
      
      <div class="student-info">
        <div class="detail-row">
          <div class="detail-label">Student Name:</div>
          <div class="detail-value">${state.user.username}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Student ID:</div>
          <div class="detail-value">${state.user.id}</div>
        </div>
      </div>
      
      <div class="exam-details">
        <div class="detail-row">
          <div class="detail-label">Exam:</div>
          <div class="detail-value">${exam.title}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Type:</div>
          <div class="detail-value">${exam.type}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Date:</div>
          <div class="detail-value">${exam.date}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Time:</div>
          <div class="detail-value">${exam.time}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Venue:</div>
          <div class="detail-value">${exam.venue}</div>
        </div>
      </div>
      
      <div class="seat-info">
        <div class="seat-label">Your Seat Number</div>
        <div class="seat-number">${seatAssignment ? seatAssignment.seat_number : 'Not Assigned'}</div>
      </div>
      
      <div class="qr-placeholder">QR Code Placeholder</div>
      
      <div class="footer">
        <p>Please arrive at least 15 minutes before the exam starts.</p>
        <p>Bring your student ID card and necessary stationery.</p>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `);
  
  printWindow.document.close();
}

/**
 * Populate exam select dropdown
 */
function populateExamSelect() {
  if (!elements.seating.examSelect) return;
  
  // Clear existing options
  elements.seating.examSelect.innerHTML = '';
  
  // Add default option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select an exam...';
  elements.seating.examSelect.appendChild(defaultOption);
  
  // Add options for each exam
  state.exams.forEach(exam => {
    const option = document.createElement('option');
    option.value = exam.id;
    option.textContent = `${exam.title} (${exam.date})`;
    elements.seating.examSelect.appendChild(option);
  });
  
  // If there are exams, select the first one by default
  if (state.exams.length > 0) {
    elements.seating.examSelect.value = state.exams[0].id;
    
    // Trigger the change event
    const event = new Event('change');
    elements.seating.examSelect.dispatchEvent(event);
  }
}

/**
 * Generate seating grid for selected exam
 */
function generateSeatingGrid(examId) {
  if (!elements.seating.seatingGrid) return;
  
  // Clear existing seats
  elements.seating.seatingGrid.innerHTML = '';
  
  // Get exam details
  const exam = state.exams.find(e => e.id === examId);
  if (!exam) return;
  
  // Find current user's seat if assigned
  const userSeat = state.studentSeats.find(
    seat => seat.exam_id === examId && seat.student_id === state.user.id
  );
  
  // Find all seats for this exam
  const examSeats = state.studentSeats.filter(seat => seat.exam_id === examId);
  
  // Generate a grid of seats
  const rows = 5;
  const cols = 8;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const rowLetter = String.fromCharCode(65 + row); // A, B, C, D, E
      const colNumber = col + 1; // 1, 2, 3, ..., 8
      const seatNumber = `${rowLetter}${colNumber}`;
      
      // Create seat element
      const seat = document.createElement('div');
      seat.className = 'seat';
      seat.textContent = seatNumber;
      
      // Determine seat status
      const isTaken = examSeats.some(seat => seat.seat_number === seatNumber);
      const isUserSeat = userSeat && userSeat.seat_number === seatNumber;
      
      if (isUserSeat) {
        seat.classList.add('your-seat');
      } else if (isTaken) {
        seat.classList.add('occupied');
      } else if ((row + col) % 5 === 0) { // Randomly mark some seats as reserved
        seat.classList.add('reserved');
      } else {
        seat.classList.add('available');
      }
      
      elements.seating.seatingGrid.appendChild(seat);
    }
  }
}

/**
 * Generate calendar for exam schedule
 */
function generateCalendar(monthOffset = 0) {
  if (!elements.exams.calendar) return;
  
  // Clear existing calendar
  elements.exams.calendar.innerHTML = '';
  
  // Get current date
  const today = new Date();
  
  // Adjust month if offset is provided
  if (state.currentMonth === undefined) {
    state.currentMonth = today.getMonth();
    state.currentYear = today.getFullYear();
  }
  
  if (monthOffset) {
    state.currentMonth += monthOffset;
    if (state.currentMonth > 11) {
      state.currentMonth = 0;
      state.currentYear++;
    } else if (state.currentMonth < 0) {
      state.currentMonth = 11;
      state.currentYear--;
    }
  }
  
  const month = state.currentMonth;
  const year = state.currentYear;
  
  // Update month display
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
  elements.exams.currentMonth.textContent = `${monthNames[month]} ${year}`;
  
  // Create calendar header (day names)
  const calendarHeader = document.createElement('div');
  calendarHeader.className = 'calendar-row';
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayNames.forEach(day => {
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-header-cell';
    dayCell.textContent = day;
    calendarHeader.appendChild(dayCell);
  });
  
  elements.exams.calendar.appendChild(calendarHeader);
  
  // Get first day of month
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDay = firstDayOfMonth.getDay(); // 0 (Sunday) to 6 (Saturday)
  
  // Get number of days in month
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const numberOfDays = lastDayOfMonth.getDate();
  
  // Create calendar grid
  let dayCounter = 1;
  
  // Prepare exam dates for quick lookups
  const examDates = {};
  state.exams.forEach(exam => {
    const examDate = new Date(exam.date);
    if (examDate.getMonth() === month && examDate.getFullYear() === year) {
      const day = examDate.getDate();
      if (!examDates[day]) examDates[day] = [];
      examDates[day].push(exam);
    }
  });
  
  // Create weeks (rows)
  for (let i = 0; i < 6; i++) { // Max 6 weeks per month
    const weekRow = document.createElement('div');
    weekRow.className = 'calendar-row';
    
    // Create days (cells)
    for (let j = 0; j < 7; j++) {
      const dayCell = document.createElement('div');
      dayCell.className = 'calendar-day';
      
      if (i === 0 && j < startingDay) {
        // Empty cells before the first day of the month
        weekRow.appendChild(dayCell);
      } else if (dayCounter <= numberOfDays) {
        // Add day number
        const dayNumber = document.createElement('span');
        dayNumber.className = 'day-number';
        dayNumber.textContent = dayCounter;
        dayCell.appendChild(dayNumber);
        
        // Check if today
        const isToday = dayCounter === today.getDate() && 
                        month === today.getMonth() && 
                        year === today.getFullYear();
        if (isToday) {
          dayCell.classList.add('today');
        }
        
        // Check if has exams
        if (examDates[dayCounter]) {
          dayCell.classList.add('has-exam');
          
          // Add exam indicators
          examDates[dayCounter].forEach(exam => {
            const indicator = document.createElement('span');
            indicator.className = 'exam-indicator';
            indicator.textContent = exam.title;
            indicator.title = `${exam.title} - ${exam.time}`;
            dayCell.appendChild(indicator);
            
            // Add click event to show exam details
            dayCell.addEventListener('click', () => {
              viewExamDetails(exam.id);
            });
          });
        }
        
        weekRow.appendChild(dayCell);
        dayCounter++;
      } else {
        // Days after the end of the month
        weekRow.appendChild(dayCell);
      }
    }
    
    elements.exams.calendar.appendChild(weekRow);
    
    // Stop if we've displayed all days
    if (dayCounter > numberOfDays) break;
  }
}

/**
 * Generate timeline for upcoming exams
 */
function generateTimeline() {
  if (!elements.exams.timeline) return;
  
  // Clear existing timeline
  elements.exams.timeline.innerHTML = '';
  
  // Sort exams by date
  const sortedExams = [...state.exams].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });
  
  if (sortedExams.length === 0) {
    elements.exams.timeline.innerHTML = '<p class="no-exams">No upcoming exams.</p>';
    return;
  }
  
  // Create timeline items
  sortedExams.forEach((exam, index) => {
    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item';
    
    const marker = document.createElement('div');
    marker.className = 'timeline-marker';
    marker.innerHTML = '<i class="fas fa-calendar-day"></i>';
    
    const content = document.createElement('div');
    content.className = 'timeline-content';
    
    // Find seat assignment if exists
    const seatAssignment = state.studentSeats.find(
      seat => seat.exam_id === exam.id && seat.student_id === state.user.id
    );
    
    content.innerHTML = `
      <div class="timeline-date">${exam.date}</div>
      <h3 class="timeline-title">${exam.title}</h3>
      <div class="timeline-details">
        <p>Time: ${exam.time}</p>
        <p>Venue: ${exam.venue}</p>
        <p>Seat: ${seatAssignment ? seatAssignment.seat_number : 'Not Assigned'}</p>
      </div>
    `;
    
    timelineItem.appendChild(marker);
    timelineItem.appendChild(content);
    
    // Add click event to show exam details
    timelineItem.addEventListener('click', () => {
      viewExamDetails(exam.id);
    });
    
    elements.exams.timeline.appendChild(timelineItem);
  });
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
  if (!elements.notification.container) return;
  
  // Set notification content
  elements.notification.message.textContent = message;
  
  // Set icon based on type
  let iconClass = 'fa-info-circle';
  if (type === 'success') iconClass = 'fa-check-circle';
  if (type === 'warning') iconClass = 'fa-exclamation-triangle';
  if (type === 'error') iconClass = 'fa-times-circle';
  
  elements.notification.icon.className = `fas ${iconClass} ${type}`;
  
  // Show notification
  elements.notification.container.classList.add('show');
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    elements.notification.container.classList.remove('show');
  }, 5000);
}