# Course Enrollment System

A responsive web application for managing student registrations, courses, and enrollments with an intuitive user interface.

## Features

- **Student Management**: Register and manage domestic and international students
- **Course Management**: Create and organize course offerings
- **Enrollment System**: Seamlessly enroll students in available courses
- **Dashboard**: Administrative interface with detailed statistics and data management
- **Responsive Design**: Optimized for desktop and mobile devices
- **Local Storage**: Persistent data storage using the browser's local storage API
- **Dynamic Theme**: Toggle between light and dark modes

## Pages

1. **Home**: Landing page with system overview and navigation
2. **Register**: Add new domestic or international students to the system
3. **Courses**: Create and manage available courses
4. **Enrollment**: Enroll students in courses and view enrollment history
5. **Dashboard**: Administrative view with comprehensive data management capabilities

## Technical Implementation

### Object-Oriented Programming Concepts

The system demonstrates key OOP principles:

- **Encapsulation**: Classes bundle data with methods that operate on that data
- **Inheritance**: Specialized student types (DomesticStudent, InternationalStudent) inherit from the base Student class
- **Polymorphism**: Student types implement their own versions of common methods
- **Abstraction**: Complex operations are simplified through well-defined interfaces

### Technologies Used

- **HTML5**: Page structure and semantic elements
- **CSS3/Tailwind CSS**: Styling and responsive design
- **JavaScript**: Core application logic and DOM manipulation
- **Local Storage API**: Data persistence between sessions
- **Promise-based API**: Asynchronous operations with simulated backend

### Data Architecture

- **Student Class**: Base class with student information and enrollment methods
  - **DomesticStudent**: Extends Student with domestic-specific attributes
  - **InternationalStudent**: Extends Student with international-specific attributes
- **Course Class**: Defines course properties and relationships
- **EnrollmentSystem**: Core management class handling operations between students and courses

## Getting Started

1. Clone or download the repository
2. Open `index.html` in a modern web browser
3. Navigate through the system using the sidebar menu
4. Add students, create courses, and manage enrollments

## Usage Guide

### Adding Students
1. Navigate to the "Register" page
2. Fill in the student's name
3. Select student type (Domestic/International)
4. Submit the form

### Creating Courses
1. Navigate to the "Courses" page
2. Click "Add New Course"
3. Enter course name
4. Submit the form

### Enrolling Students
1. Navigate to the "Enroll" page
2. Select a student from the dropdown
3. Select an available course
4. Click "Enroll Now"

### Managing Data
1. Navigate to the "Dashboard" page
2. View comprehensive statistics
3. Use search filters to find specific records
4. Edit or delete records as needed

## Mobile Responsiveness

The application is fully responsive with:
- Collapsible sidebar navigation for mobile devices
- Touch-friendly buttons and form elements
- Adaptive tables that reformat for small screens
- Fluid layouts that adjust to different screen sizes

## Browser Compatibility

Tested and compatible with:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- User authentication and role-based access
- Advanced filtering and sorting options
- Data export/import functionality
- Course scheduling and calendar integration
- Student performance tracking
