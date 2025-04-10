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

## Project Architecture & Workflow

### System Overview

The Course Enrollment System is built using a modular architecture with the following key components:

1. **Class Hierarchy**: A hierarchical structure of classes representing system entities
2. **Storage Layer**: Persistence mechanisms using browser local storage
3. **UI Components**: Interactive interface elements for user interaction
4. **Event Handlers**: Logic to process user actions and system events

### Workflow

The application follows this core workflow:

1. **Initialization**:
   - System loads data from local storage
   - Class instances are reconstructed from stored data
   - UI elements are rendered with the current state

2. **User Operations**:
   - Create new students (domestic or international)
   - Add and manage courses
   - Enroll students in courses
   - View, edit, or delete records through the dashboard

3. **Data Management**:
   - All operations trigger state changes in the system
   - Modified data is persisted to local storage
   - UI components re-render to reflect current state

4. **Cross-cutting Concerns**:
   - Theme management (light/dark mode)
   - Responsive layout adjustments
   - Form validation
   - Asynchronous operations handling

### File Structure

| File | Description |
|------|-------------|
| **index.html** | Landing page and entry point for the application |
| **register.html** | Interface for registering new students |
| **courses.html** | Course management interface |
| **enrollment.html** | Student enrollment interface |
| **dashboard.html** | Administrative dashboard for data management |
| **scripts.js** | Core JavaScript with classes and business logic |
| **styles.css** | Custom CSS styles and animations |

## Object-Oriented Programming Implementation

The system is built on strong OOP principles, demonstrating the four fundamental concepts:

### 1. Encapsulation

**Implementation:**
- Classes bundle related data and functionality into cohesive units
- Private state is maintained within class instances
- Public methods provide controlled access to object functionality

**Example:**
```javascript
class Student {
    constructor(name) {
        this.name = name;
        this.courses = [];
        this.id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    enroll(course) {
        if (!this.courses.some(c => c.id === course.id)) {
            this.courses.push(course);
            return true;
        }
        return false;
    }
}
```

This Student class encapsulates:
- Student properties (name, courses, id)
- Behavior (enrollment logic)
- Data validation (preventing duplicate enrollments)

### 2. Inheritance

**Implementation:**
- Base class (Student) defines common attributes and behaviors
- Specialized classes extend the base class functionality
- Common code is reused through the inheritance chain

**Example:**
```javascript
class Student {
    // Base class implementation
    constructor(name) {
        this.name = name;
        this.courses = [];
        this.id = /* unique ID generation */;
    }
    
    // Common methods
    enroll(course) { /* enrollment logic */ }
    getDetails() { /* returns student details */ }
}

class DomesticStudent extends Student {
    constructor(name) {
        super(name);
        this.type = 'Domestic';
        this.tuitionRate = 1000;
    }
    // Inherits all methods from Student
}

class InternationalStudent extends Student {
    constructor(name) {
        super(name);
        this.type = 'International';
        this.tuitionRate = 1500;
    }
    // Inherits all methods from Student
}
```

This hierarchy allows:
- Code reuse (enrollment logic is shared)
- Type specialization (student-specific attributes)
- Maintenance efficiency (changes to base behavior automatically apply to derived classes)

### 3. Polymorphism

**Implementation:**
- Child classes can override parent class methods
- Objects of different classes can be treated through a common interface
- Method behavior adapts based on the actual object type

**Example:**
```javascript
// Base class method
class Student {
    // ...existing code...
    
    getDetails() {
        return `${this.name} (${this.constructor.name})`;
    }
}

// When called on different objects:
domesticStudent.getDetails();  // "John Doe (DomesticStudent)"
internationalStudent.getDetails();  // "Jane Smith (InternationalStudent)"
```

Polymorphism enables:
- Dynamic method dispatch (the correct implementation runs based on the object's type)
- Uniform treatment of different object types (both domestic and international students can be enrolled using the same method call)
- Extensibility (new student types can be added without changing existing code)

### 4. Abstraction

**Implementation:**
- Complex operations are simplified through well-defined interfaces
- Implementation details are hidden from external code
- Users of the classes interact with simplified abstractions

**Example:**
```javascript
// EnrollmentSystem provides a high-level abstraction
class EnrollmentSystem {
    // ...existing code...
    
    async enrollStudent(studentIndex, courseId) {
        // Complex logic hidden behind a simple interface
        const student = this.students[studentIndex];
        const course = this.courses.find(c => c.id === courseId);
        
        const enrolled = student.enroll(course);
        
        if (enrolled) {
            // Create enrollment record
            this.enrollments.push({
                id: /* generate ID */,
                studentId: student.id,
                courseId: course.id,
                // ...other properties
            });
            
            await this.saveAllData();
            return /* enrollment record */;
        }
        
        return false;
    }
}
```

This abstraction layer:
- Hides the complexity of enrollment (data updates, persistence, etc.)
- Provides a simple interface to clients (just call `enrollStudent` with two parameters)
- Separates concerns (UI code doesn't need to know about storage details)

### 5. Additional OOP Concepts Applied

#### 5.1 Class Composition
The system uses composition to build complex relationships:
- Students have courses (composition)
- EnrollmentSystem composes Students and Courses

#### 5.2 Method Overriding
Child classes override parent methods to provide specialized behavior.

#### 5.3 Interface Implementation
Classes follow implicit interfaces to ensure consistent behavior.

## Data Flow & State Management

### 1. Data Creation
- New entities (students, courses) are created as class instances
- Instances are stored in the EnrollmentSystem collections
- Data is persisted to local storage

### 2. Data Retrieval
- On application load, data is retrieved from local storage
- Plain objects are reconstructed into class instances
- Data is rendered to the appropriate UI elements

### 3. Data Modification
- Class methods modify object state
- Changes trigger UI updates via rendering functions
- Modified data is persisted to maintain consistency

### 4. Data Deletion
- Deletion operations cascade to related entities
- For example, deleting a course removes it from all enrolled students
- The system maintains referential integrity

## Asynchronous Operations

The system uses modern JavaScript Promise-based asynchronous patterns:

1. **AsyncStorage Wrapper**:
   - Simulates asynchronous storage operations
   - Provides consistent Promise-based interface
   - Enables use of async/await syntax

2. **Async Methods**:
   - Core system operations are asynchronous
   - Methods return Promises that resolve when operations complete
   - Error handling with try/catch blocks

3. **UI Updates**:
   - Asynchronous operations trigger UI updates when complete
   - Loading states handle pending operations
   - Error handling provides user feedback

## Technical Implementation Details

### 1. Class Construction and Reconstruction
- Classes are defined with proper inheritance chains
- Data loaded from storage is reconstructed into proper class instances
- Method behavior is preserved after reconstruction

### 2. Event-Driven Architecture
- User interactions trigger event handlers
- Events flow through the system via method calls
- UI updates in response to state changes

### 3. Responsive Design Strategy
- Mobile-first approach with breakpoints
- Sidebar collapses on small screens
- Tables adapt to different screen sizes
- Touch-friendly UI elements

### 4. Theme Management
- Theme toggle using class-based approach
- CSS variables for consistent theming
- Smooth transitions between themes

## SOLID Principles Application

1. **Single Responsibility Principle**: Each class has one primary responsibility (Student manages student data, Course manages course data)

2. **Open/Closed Principle**: System is open for extension (new student types) but closed for modification

3. **Liskov Substitution Principle**: Child classes can substitute parent classes without affecting behavior

4. **Interface Segregation**: Classes expose only necessary methods to clients

5. **Dependency Inversion**: High-level modules depend on abstractions, not concrete implementations

## Conclusion

The Course Enrollment System demonstrates a comprehensive application of object-oriented programming principles to create a maintainable, extensible web application. The clear separation of concerns, proper inheritance hierarchy, and effective use of polymorphism allow the system to handle complex data relationships while maintaining a clean, intuitive user interface.

Through encapsulation, the system protects data integrity, while inheritance and polymorphism enable code reuse and specialized behavior. The abstraction layer simplifies complex operations into straightforward interfaces, making the code both easier to use and easier to maintain.
