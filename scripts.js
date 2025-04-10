// Simulated Async Storage
// This is a wrapper around localStorage that simulates asynchronous behavior
// by using Promises. In a real application, this might be replaced with
// actual async storage like IndexedDB or a backend API.
const AsyncStorage = {
    async getItem(key) {
        return new Promise((resolve) => {
            const value = localStorage.getItem(key);
            resolve(value ? JSON.parse(value) : null);
        });
    },
    // Method to save data with async/Promise pattern
    async setItem(key, value) {
        return new Promise((resolve) => {
            localStorage.setItem(key, JSON.stringify(value));
            resolve();
        });
    },
    // Method to remove data with async/Promise pattern
    async removeItem(key) {
        return new Promise((resolve) => {
            localStorage.removeItem(key);
            resolve();
        });
    }
};

// Student Classes
// BASE CLASS: Demonstrates ENCAPSULATION (data and methods in one unit)
// and establishes the foundation for INHERITANCE
class Student {
    constructor(name) {
        // Properties demonstrate ENCAPSULATION - bundling data with methods
        this.name = name;
        this.courses = [];
        // Generating a unique ID for each student instance
        this.id = Date.now().toString(36) + Math.random().toString(36).substring(2); // Unique ID
    }

    // Method demonstrates ENCAPSULATION - operations that work on the object's data
    enroll(course) {
        // Check if already enrolled
        if (!this.courses.some(c => c.id === course.id)) {
            this.courses.push(course);
            return true;
        }
        return false;
    }

    // This method will be used for POLYMORPHISM when overridden by child classes
    getDetails() {
        return `${this.name} (${this.constructor.name})`;
    }
}

// INHERITANCE: DomesticStudent inherits from Student
// This is a CHILD CLASS that extends the base Student class
class DomesticStudent extends Student {
    constructor(name) {
        // Calls the parent constructor - demonstrates INHERITANCE
        super(name);
        // Additional properties specific to this child class
        this.type = 'Domestic';
        this.tuitionRate = 1000;
    }
    // Inherits all methods from parent Student class
    // The getDetails method from parent class exhibits POLYMORPHISM
    // as it will include the specific class name "DomesticStudent"
}

// INHERITANCE: Another child class extending Student
class InternationalStudent extends Student {
    constructor(name) {
        // Calls the parent constructor - demonstrates INHERITANCE
        super(name);
        // Additional properties specific to this child class
        this.type = 'International';
        this.tuitionRate = 1500;
    }
    // Inherits all methods from parent Student class
    // The getDetails method from parent class exhibits POLYMORPHISM
    // as it will include the specific class name "InternationalStudent"
}

// Course Class
class Course {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

// Enrollment System
class EnrollmentSystem {
    constructor() {
        this.courses = [];
        this.students = [];
        this.enrollments = [];
    }

    async loadData() {
        try {
            this.students = (await AsyncStorage.getItem('students')) || [];
            this.courses = (await AsyncStorage.getItem('courses')) || [
                new Course(1, 'Mathematics'),
                new Course(2, 'Computer Science'),
                new Course(3, 'Physics')
            ];
            this.enrollments = (await AsyncStorage.getItem('enrollments')) || [];
            
            // Properly reconstruct student objects
            this.students = this.students.map(s => {
                const student = s.type === 'Domestic' ? new DomesticStudent(s.name) : new InternationalStudent(s.name);
                student.id = s.id || Date.now().toString(36) + Math.random().toString(36).substring(2);
                student.courses = Array.isArray(s.courses) ? s.courses.map(c => new Course(c.id, c.name)) : [];
                return student;
            });

            // Save initial data if it's the first load
            if (!await AsyncStorage.getItem('courses')) {
                await AsyncStorage.setItem('courses', this.courses);
            }
            
            // Ensure enrollment IDs and references are set
            this.enrollments = this.enrollments.map(enrollment => {
                if (!enrollment.id) {
                    enrollment.id = Date.now().toString(36) + Math.random().toString(36).substring(2);
                }
                
                // Find the referenced student and course
                const student = this.students.find(s => s.getDetails() === enrollment.student);
                const course = this.courses.find(c => c.name === enrollment.course);
                
                if (student && course) {
                    enrollment.studentId = student.id;
                    enrollment.courseId = course.id;
                }
                
                return enrollment;
            });
        } catch (error) {
            console.error("Error loading data:", error);
            // Reset to default values
            this.courses = [
                new Course(1, 'Mathematics'),
                new Course(2, 'Computer Science'),
                new Course(3, 'Physics')
            ];
            this.students = [];
            this.enrollments = [];
        }
    }

    async addStudent(student) {
        // Add validation
        if (!student.name || student.name.trim() === '') {
            throw new Error('Student name is required');
        }
        this.students.push(student);
        await this.saveData('students');
        return student;
    }

    async editStudent(index, name, type) {
        // Validation
        if (!name || name.trim() === '') {
            throw new Error('Student name is required');
        }
        if (index < 0 || index >= this.students.length) {
            throw new Error('Invalid student index');
        }

        const oldStudent = this.students[index];
        const student = type === 'domestic' ? new DomesticStudent(name) : new InternationalStudent(name);
        student.id = oldStudent.id; // Preserve ID
        student.courses = oldStudent.courses; // Preserve courses

        this.students[index] = student;
        
        // Update enrollments to reflect the name change
        this.enrollments = this.enrollments.map(e => {
            if (e.studentId === student.id) {
                return {
                    ...e,
                    student: student.getDetails()
                };
            }
            return e;
        });

        await this.saveAllData();
        return student;
    }

    async deleteStudent(index) {
        if (index < 0 || index >= this.students.length) {
            throw new Error('Invalid student index');
        }
        
        const student = this.students[index];
        
        // Remove student
        this.students.splice(index, 1);
        
        // Remove associated enrollments
        this.enrollments = this.enrollments.filter(e => e.studentId !== student.id);
        
        await this.saveAllData();
        return true;
    }

    async addCourse(name) {
        // Validation
        if (!name || name.trim() === '') {
            throw new Error('Course name is required');
        }
        
        const id = this.courses.length ? Math.max(...this.courses.map(c => c.id)) + 1 : 1;
        const course = new Course(id, name);
        this.courses.push(course);
        await this.saveData('courses');
        return course;
    }

    async deleteCourse(id) {
        // Validate ID is a number
        id = parseInt(id, 10);
        if (isNaN(id)) {
            throw new Error('Invalid course ID');
        }

        const courseIndex = this.courses.findIndex(c => c.id === id);
        if (courseIndex === -1) {
            throw new Error('Course not found');
        }
        
        const courseToRemove = this.courses[courseIndex];
        
        // Remove course
        this.courses.splice(courseIndex, 1);
        
        // Remove course from students
        this.students.forEach(student => {
            student.courses = student.courses.filter(c => c.id !== id);
        });
        
        // Remove associated enrollments
        this.enrollments = this.enrollments.filter(e => e.courseId !== id);
        
        await this.saveAllData();
        return true;
    }

    async enrollStudent(studentIndex, courseId) {
        // Validate inputs
        if (studentIndex < 0 || studentIndex >= this.students.length) {
            throw new Error('Invalid student selected');
        }
        
        courseId = parseInt(courseId, 10);
        if (isNaN(courseId)) {
            throw new Error('Invalid course ID');
        }
        
        const student = this.students[studentIndex];
        const course = this.courses.find(c => c.id === courseId);
        
        if (!course) {
            throw new Error('Course not found');
        }
        
        // Check if already enrolled
        if (student.courses.some(c => c.id === courseId)) {
            throw new Error('Student is already enrolled in this course');
        }
        
        // Add course to student
        const enrolled = student.enroll(course);
        
        if (enrolled) {
            // Add enrollment record with IDs
            const enrollmentRecord = { 
                id: Date.now().toString(36) + Math.random().toString(36).substring(2),
                studentId: student.id,
                courseId: course.id,
                student: student.getDetails(), 
                course: course.name,
                date: new Date().toISOString()
            };
            
            this.enrollments.push(enrollmentRecord);
            await this.saveAllData();
            return enrollmentRecord; // Return the enrollment record
        }
        
        return false;
    }
    
    async unenrollStudent(enrollmentId) {
        const enrollmentIndex = this.enrollments.findIndex(e => e.id === enrollmentId);
        
        if (enrollmentIndex === -1) {
            throw new Error('Enrollment not found');
        }
        
        const enrollment = this.enrollments[enrollmentIndex];
        
        // Remove the enrollment
        this.enrollments.splice(enrollmentIndex, 1);
        
        // Find the student and remove the course
        const student = this.students.find(s => s.id === enrollment.studentId);
        
        if (student) {
            const courseId = parseInt(enrollment.courseId, 10);
            student.courses = student.courses.filter(c => c.id !== courseId);
        }
        
        await this.saveAllData();
        return true;
    }

    async saveData(key) {
        try {
            await AsyncStorage.setItem(key, this[key]);
            return true;
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            return false;
        }
    }
    
    async saveAllData() {
        try {
            await AsyncStorage.setItem('students', this.students);
            await AsyncStorage.setItem('courses', this.courses);
            await AsyncStorage.setItem('enrollments', this.enrollments);
            return true;
        } catch (error) {
            console.error('Error saving all data:', error);
            return false;
        }
    }
    
    async resetData() {
        try {
            await AsyncStorage.removeItem('students');
            await AsyncStorage.removeItem('courses');
            await AsyncStorage.removeItem('enrollments');
            
            // Reset to default state
            this.students = [];
            this.courses = [
                new Course(1, 'Mathematics'),
                new Course(2, 'Computer Science'),
                new Course(3, 'Physics')
            ];
            this.enrollments = [];
            
            await AsyncStorage.setItem('courses', this.courses);
            return true;
        } catch (error) {
            console.error('Error resetting data:', error);
            return false;
        }
    }
}

const system = new EnrollmentSystem();

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await system.loadData();
        console.log('Data loaded successfully');
        
        window.renderStudents = function(students) {
            const studentTableBody = document.getElementById('studentTableBody');
            if (studentTableBody) {
                studentTableBody.innerHTML = '';
                
                if (students.length === 0) {
                    const row = document.createElement('tr');
                    row.innerHTML = `<td colspan="5" class="p-3 text-center text-gray-400">No students registered yet</td>`;
                    studentTableBody.appendChild(row);
                    return;
                }
                
                students.forEach((student, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="p-3">${student.name}</td>
                        <td class="p-3">${student.type}</td>
                        <td class="p-3">$${student.tuitionRate}</td>
                        <td class="p-3">${student.courses.map(c => c.name).join(', ') || 'None'}</td>
                        <td class="p-3">
                            <button class="action-btn bg-yellow-600 hover:bg-yellow-700 edit-student" data-index="${index}">Edit</button>
                            <button class="action-btn bg-red-600 hover:bg-red-700 delete-student" data-index="${index}">Delete</button>
                        </td>
                    `;
                    studentTableBody.appendChild(row);
                });
                
                attachStudentActionListeners();
            }
        };
        
        window.renderCourses = function(courses) {
            const courseTableBody = document.getElementById('courseTableBody');
            if (courseTableBody) {
                courseTableBody.innerHTML = '';
                
                if (courses.length === 0) {
                    const row = document.createElement('tr');
                    row.innerHTML = `<td colspan="4" class="p-3 text-center text-gray-400">No courses available</td>`;
                    courseTableBody.appendChild(row);
                    return;
                }
                
                courses.forEach(course => {
                    const enrollmentCount = system.enrollments.filter(e => e.courseId === course.id).length;
                    
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="p-3">${course.id}</td>
                        <td class="p-3">${course.name}</td>
                        <td class="p-3">${enrollmentCount}</td>
                        <td class="p-3">
                            <button class="action-btn bg-red-600 hover:bg-red-700 delete-course" data-id="${course.id}">Delete</button>
                        </td>
                    `;
                    courseTableBody.appendChild(row);
                });
                
                attachCourseActionListeners();
            }
        };
        
        window.renderEnrollments = function(enrollments = system.enrollments) {
            const enrollmentTableBody = document.getElementById('enrollmentTableBody');
            if (enrollmentTableBody) {
                enrollmentTableBody.innerHTML = '';
                
                if (enrollments.length === 0) {
                    const row = document.createElement('tr');
                    row.innerHTML = `<td colspan="3" class="p-3 text-center text-gray-400">No enrollments yet</td>`;
                    enrollmentTableBody.appendChild(row);
                    return;
                }
                
                enrollments.forEach(enrollment => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="p-3">${enrollment.student}</td>
                        <td class="p-3">${enrollment.course}</td>
                        <td class="p-3">
                            <button class="action-btn bg-red-600 hover:bg-red-700 unenroll-btn" data-id="${enrollment.id}">Unenroll</button>
                        </td>
                    `;
                    enrollmentTableBody.appendChild(row);
                });
                
                enrollmentTableBody.querySelectorAll('.unenroll-btn').forEach(btn => {
                    btn.addEventListener('click', async function() {
                        const id = this.dataset.id;
                        
                        if (window.showConfirmation) {
                            window.showConfirmation(
                                "Confirm Unenrollment",
                                "Are you sure you want to unenroll this student from the course?",
                                async () => {
                                    try {
                                        await system.unenrollStudent(id);
                                        window.renderStudents(system.students);
                                        window.renderEnrollments();
                                    } catch (error) {
                                        alert(`Failed to unenroll: ${error.message}`);
                                    }
                                }
                            );
                        } else {
                            if (confirm("Are you sure you want to unenroll this student from the course?")) {
                                try {
                                    await system.unenrollStudent(id);
                                    window.renderStudents(system.students);
                                    window.renderEnrollments();
                                } catch (error) {
                                    alert(`Failed to unenroll: ${error.message}`);
                                }
                            }
                        }
                    });
                });
            }
            
            const recentEnrollments = document.getElementById('recentEnrollments');
            if (recentEnrollments) {
                recentEnrollments.innerHTML = '';
                
                if (enrollments.length === 0) {
                    recentEnrollments.innerHTML = `
                        <div class="text-center text-gray-400 py-4">
                            <p>No enrollments yet</p>
                        </div>
                    `;
                    return;
                }
                
                const sortedEnrollments = [...enrollments].sort((a, b) => {
                    if (a.date && b.date) {
                        return new Date(b.date) - new Date(a.date);
                    }
                    return 0;
                });
                
                sortedEnrollments.forEach(enrollment => {
                    const item = document.createElement('div');
                    item.className = 'border-b border-gray-700 py-2 last:border-0';
                    item.innerHTML = `
                        <div class="flex justify-between items-center">
                            <div>
                                <div class="font-semibold">${enrollment.student}</div>
                                <div class="text-sm text-gray-400">${enrollment.course}</div>
                            </div>
                            <button class="action-btn bg-red-600 hover:bg-red-700 unenroll-btn-recent" data-id="${enrollment.id}">Unenroll</button>
                        </div>
                    `;
                    recentEnrollments.appendChild(item);
                });
                
                recentEnrollments.querySelectorAll('.unenroll-btn-recent').forEach(btn => {
                    btn.addEventListener('click', async function() {
                        const id = this.dataset.id;
                        if (confirm("Are you sure you want to unenroll this student from the course?")) {
                            try {
                                await system.unenrollStudent(id);
                                const enrollStats = document.getElementById('currentEnrollmentCount');
                                if (enrollStats) {
                                    enrollStats.textContent = system.enrollments.length;
                                }
                                if (typeof updateDropdowns === 'function') {
                                    updateDropdowns();
                                }
                                window.renderEnrollments();
                            } catch (error) {
                                alert(`Failed to unenroll: ${error.message}`);
                            }
                        }
                    });
                });
            }
            
            updateEnrollmentPageStats();
        };
        
        function updateEnrollmentPageStats() {
            const enrollStudentCount = document.getElementById('enrollStudentCount');
            const enrollCourseCount = document.getElementById('enrollCourseCount');
            const currentEnrollmentCount = document.getElementById('currentEnrollmentCount');
            const noDataMessage = document.getElementById('noDataMessage');
            
            if (enrollStudentCount) {
                enrollStudentCount.textContent = system.students.length;
            }
            
            if (enrollCourseCount) {
                enrollCourseCount.textContent = system.courses.length;
            }
            
            if (currentEnrollmentCount) {
                currentEnrollmentCount.textContent = system.enrollments.length;
            }
            
            if (noDataMessage) {
                if (system.students.length === 0 || system.courses.length === 0) {
                    noDataMessage.classList.remove('hidden');
                    document.getElementById('enrollForm')?.classList.add('hidden');
                } else {
                    noDataMessage.classList.add('hidden');
                    document.getElementById('enrollForm')?.classList.remove('hidden');
                }
            }
        }
    } catch (error) {
        console.error('Failed to load data:', error);
    }

    const menuToggle = document.getElementById('menuToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-open');
        });
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            document.body.classList.remove('sidebar-open');
        });
    }
    
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 768) {
                document.body.classList.remove('sidebar-open');
            }
        });
    });

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => document.body.classList.toggle('light'));
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const name = document.getElementById('name').value.trim();
                if (!name) {
                    throw new Error('Please enter a name');
                }
                
                const type = document.getElementById('studentType').value;
                const student = type === 'domestic' ? new DomesticStudent(name) : new InternationalStudent(name);
                await system.addStudent(student);
                
                const modal = document.getElementById('registerModal');
                document.getElementById('registerMessage').textContent = `Registered: ${student.getDetails()}`;
                modal.classList.remove('hidden');
                
                registerForm.reset();
            } catch (error) {
                alert(`Registration failed: ${error.message}`);
            }
        });
        
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                document.getElementById('registerModal').classList.add('hidden');
            });
        }
    }

    const courseList = document.getElementById('courseList');
    if (courseList) {
        const renderCoursesList = () => {
            courseList.innerHTML = '';
            if (system.courses.length === 0) {
                document.getElementById('noCourseMessage')?.classList.remove('hidden');
                return;
            } else {
                document.getElementById('noCourseMessage')?.classList.add('hidden');
            }
            
            system.courses.forEach(course => {
                const div = document.createElement('div');
                div.className = 'card bg-gray-800 p-4 rounded-lg shadow-lg';
                
                const enrollmentCount = system.enrollments.filter(e => e.courseId === course.id).length;
                
                div.innerHTML = `
                    <h3 class="font-semibold text-lg">Course ID: ${course.id}</h3>
                    <p class="mb-1">${course.name}</p>
                    <p class="text-sm text-blue-400 mb-3">Enrollments: ${enrollmentCount}</p>
                    <div class="flex justify-end">
                        <button class="action-btn bg-red-600 hover:bg-red-700 delete-course-btn" data-id="${course.id}">Delete</button>
                    </div>
                `;
                courseList.appendChild(div);
                
                div.querySelector('.delete-course-btn').addEventListener('click', async (e) => {
                    e.preventDefault();
                    if (window.showConfirmation) {
                        window.showConfirmation(
                            "Delete Course",
                            `Are you sure you want to delete "${course.name}"? This will remove all enrollments for this course.`,
                            async () => {
                                try {
                                    await system.deleteCourse(course.id);
                                    renderCoursesList();
                                    const updateStats = document.getElementById('courseSearch');
                                    if (updateStats) {
                                        updateStats.dispatchEvent(new Event('input'));
                                    }
                                } catch (error) {
                                    alert(`Failed to delete course: ${error.message}`);
                                }
                            }
                        );
                    } else if (confirm(`Are you sure you want to delete "${course.name}"?`)) {
                        try {
                            await system.deleteCourse(course.id);
                            renderCoursesList();
                        } catch (error) {
                            alert(`Failed to delete course: ${error.message}`);
                        }
                    }
                });
            });
            
            const totalCourses = document.getElementById('totalCourses');
            const totalEnrollments = document.getElementById('totalEnrollments');
            
            if (totalCourses) {
                totalCourses.textContent = system.courses.length;
            }
            
            if (totalEnrollments) {
                totalEnrollments.textContent = system.enrollments.length;
            }
        };
        
        renderCoursesList();
        
        const addCourseBtn = document.getElementById('addCourseBtn');
        const addCourseModal = document.getElementById('addCourseModal');
        const addCourseForm = document.getElementById('addCourseForm');
        const closeAddCourseModal = document.getElementById('closeAddCourseModal');

        if (addCourseBtn && addCourseModal && addCourseForm && closeAddCourseModal) {
            addCourseBtn.addEventListener('click', () => {
                addCourseModal.classList.remove('hidden');
                document.getElementById('courseName').focus();
            });
            
            closeAddCourseModal.addEventListener('click', () => {
                addCourseModal.classList.add('hidden');
            });
            
            addCourseForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    const nameInput = document.getElementById('courseName');
                    const name = nameInput.value.trim();
                    
                    if (!name) {
                        throw new Error('Course name is required');
                    }
                    
                    await system.addCourse(name);
                    renderCoursesList();
                    addCourseModal.classList.add('hidden');
                    addCourseForm.reset();
                    
                    const courseSearch = document.getElementById('courseSearch');
                    if (courseSearch) {
                        courseSearch.dispatchEvent(new Event('input'));
                    }
                } catch (error) {
                    alert(`Failed to add course: ${error.message}`);
                }
            });
            
            const courseSearch = document.getElementById('courseSearch');
            if (courseSearch) {
                courseSearch.addEventListener('input', function() {
                    const searchTerm = this.value.toLowerCase().trim();
                    
                    if (searchTerm === '') {
                        renderCoursesList();
                        return;
                    }
                    
                    const filteredCourses = system.courses.filter(c => 
                        c.name.toLowerCase().includes(searchTerm)
                    );
                    
                    courseList.innerHTML = '';
                    
                    if (filteredCourses.length === 0) {
                        document.getElementById('noCourseMessage')?.classList.remove('hidden');
                        return;
                    } else {
                        document.getElementById('noCourseMessage')?.classList.add('hidden');
                    }
                    
                    filteredCourses.forEach(course => {
                        const div = document.createElement('div');
                        div.className = 'card bg-gray-800 p-4 rounded-lg shadow-lg';
                        
                        const enrollmentCount = system.enrollments.filter(e => e.courseId === course.id).length;
                        
                        div.innerHTML = `
                            <h3 class="font-semibold text-lg">Course ID: ${course.id}</h3>
                            <p class="mb-1">${course.name}</p>
                            <p class="text-sm text-blue-400 mb-3">Enrollments: ${enrollmentCount}</p>
                            <div class="flex justify-end">
                                <button class="action-btn bg-red-600 hover:bg-red-700 delete-course-btn" data-id="${course.id}">Delete</button>
                            </div>
                        `;
                        courseList.appendChild(div);
                        
                        div.querySelector('.delete-course-btn').addEventListener('click', async (e) => {
                            e.preventDefault();
                            if (confirm(`Are you sure you want to delete "${course.name}"?`)) {
                                try {
                                    await system.deleteCourse(course.id);
                                    courseSearch.dispatchEvent(new Event('input'));
                                } catch (error) {
                                    alert(`Failed to delete course: ${error.message}`);
                                }
                            }
                        });
                    });
                });
            }
        }
    }

    const enrollForm = document.getElementById('enrollForm');
    if (enrollForm) {
        const studentSelect = document.getElementById('studentSelect');
        const courseSelect = document.getElementById('courseSelect');

        const updateDropdowns = () => {
            if (!studentSelect || !courseSelect) return;
            
            studentSelect.innerHTML = '';
            courseSelect.innerHTML = '';
            
            if (system.students.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No students available';
                option.disabled = true;
                option.selected = true;
                studentSelect.appendChild(option);
                
                enrollForm.querySelector('button[type="submit"]').disabled = true;
            } else {
                system.students.forEach((student, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.textContent = student.getDetails();
                    studentSelect.appendChild(option);
                });
                
                if (system.students.length > 0) {
                    updateAvailableCourses(0);
                }
            }
            
            updateEnrollmentPageStats();
        };
        
        const updateAvailableCourses = (studentIndex) => {
            if (!courseSelect) return;
            
            courseSelect.innerHTML = '';
            
            if (studentIndex === null || studentIndex === undefined || isNaN(studentIndex)) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'Select a student first';
                option.disabled = true;
                option.selected = true;
                courseSelect.appendChild(option);
                return;
            }
            
            const student = system.students[studentIndex];
            if (!student) return;
            
            const enrolledCourseIds = student.courses.map(c => c.id);
            const availableCourses = system.courses.filter(c => !enrolledCourseIds.includes(c.id));
            
            if (availableCourses.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'Student is enrolled in all available courses';
                option.disabled = true;
                option.selected = true;
                courseSelect.appendChild(option);
                
                enrollForm.querySelector('button[type="submit"]').disabled = true;
            } else {
                availableCourses.forEach(course => {
                    const option = document.createElement('option');
                    option.value = course.id;
                    option.textContent = course.name;
                    courseSelect.appendChild(option);
                });
                
                enrollForm.querySelector('button[type="submit"]').disabled = false;
            }
        };
        
        window.updateDropdowns = updateDropdowns;
        
        updateDropdowns();

        studentSelect.addEventListener('change', function() {
            const studentIndex = parseInt(this.value, 10);
            updateAvailableCourses(studentIndex);
        });

        enrollForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const enrollMessage = document.getElementById('enrollMessage');
            
            try {
                const studentIndex = parseInt(studentSelect.value, 10);
                const courseId = parseInt(courseSelect.value, 10);
                
                if (isNaN(studentIndex) || isNaN(courseId)) {
                    throw new Error('Please select both a student and a course');
                }
                
                const student = system.students[studentIndex];
                if (student.courses.some(c => c.id === courseId)) {
                    throw new Error(`${student.name} is already enrolled in this course`);
                }
                
                const enrollmentRecord = await system.enrollStudent(studentIndex, courseId);
                
                if (enrollmentRecord) {
                    enrollMessage.textContent = `Successfully enrolled ${student.name} in ${system.courses.find(c => c.id === courseId).name}!`;
                    enrollMessage.className = 'mt-4 text-green-400 text-center md:text-left';
                    
                    enrollForm.reset();
                    updateDropdowns();
                    updateAvailableCourses(0);
                    
                    const enrollCount = document.getElementById('currentEnrollmentCount');
                    if (enrollCount) {
                        enrollCount.textContent = system.enrollments.length;
                    }
                    
                    window.renderEnrollments();
                } else {
                    throw new Error('Enrollment failed. Please try again.');
                }
            } catch (error) {
                enrollMessage.textContent = error.message;
                enrollMessage.className = 'mt-4 text-red-400 text-center md:text-left';
            }
        });
    }

    const studentTableBody = document.getElementById('studentTableBody');
    const courseTableBody = document.getElementById('courseTableBody');
    const enrollmentTableBody = document.getElementById('enrollmentTableBody');
    
    if (studentTableBody && courseTableBody && enrollmentTableBody) {
        function attachStudentActionListeners() {
            studentTableBody.querySelectorAll('.edit-student').forEach(btn => {
                btn.addEventListener('click', function() {
                    const index = parseInt(this.dataset.index, 10);
                    const student = system.students[index];
                    document.getElementById('editStudentIndex').value = index;
                    document.getElementById('editStudentName').value = student.name;
                    document.getElementById('editStudentType').value = student.type.toLowerCase();
                    document.getElementById('editStudentModal').classList.remove('hidden');
                });
            });
            
            studentTableBody.querySelectorAll('.delete-student').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const index = parseInt(this.dataset.index, 10);
                    const student = system.students[index];
                    
                    if (window.showConfirmation) {
                        window.showConfirmation(
                            "Delete Student",
                            `Are you sure you want to delete ${student.name}? This will also remove all enrollments for this student.`,
                            async () => {
                                try {
                                    await system.deleteStudent(index);
                                    window.renderStudents(system.students);
                                    window.renderEnrollments();
                                } catch (error) {
                                    alert(`Failed to delete student: ${error.message}`);
                                }
                            }
                        );
                    } else if (confirm(`Are you sure you want to delete ${student.name}?`)) {
                        try {
                            await system.deleteStudent(index);
                            window.renderStudents(system.students);
                            window.renderEnrollments();
                        } catch (error) {
                            alert(`Failed to delete student: ${error.message}`);
                        }
                    }
                });
            });
        }
        
        function attachCourseActionListeners() {
            courseTableBody.querySelectorAll('.delete-course').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const id = parseInt(this.dataset.id, 10);
                    const course = system.courses.find(c => c.id === id);
                    
                    if (window.showConfirmation) {
                        window.showConfirmation(
                            "Delete Course",
                            `Are you sure you want to delete "${course.name}"? This will remove it from all enrolled students.`,
                            async () => {
                                try {
                                    await system.deleteCourse(id);
                                    window.renderCourses(system.courses);
                                    window.renderStudents(system.students);
                                    window.renderEnrollments();
                                } catch (error) {
                                    alert(`Failed to delete course: ${error.message}`);
                                }
                            }
                        );
                    } else if (course && confirm(`Are you sure you want to delete "${course.name}"? This will remove it from all enrolled students.`)) {
                        try {
                            await system.deleteCourse(id);
                            window.renderCourses(system.courses);
                            window.renderStudents(system.students);
                            window.renderEnrollments();
                        } catch (error) {
                            alert(`Failed to delete course: ${error.message}`);
                        }
                    }
                });
            });
        }

        window.renderStudents(system.students);
        window.renderCourses(system.courses);
        window.renderEnrollments();
        
        const editStudentModal = document.getElementById('editStudentModal');
        const editStudentForm = document.getElementById('editStudentForm');
        const closeEditStudentModal = document.getElementById('closeEditStudentModal');

        if (editStudentForm && closeEditStudentModal) {
            editStudentForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    const index = parseInt(document.getElementById('editStudentIndex').value, 10);
                    const name = document.getElementById('editStudentName').value.trim();
                    const type = document.getElementById('editStudentType').value;
                    
                    if (!name) {
                        throw new Error('Student name is required');
                    }
                    
                    await system.editStudent(index, name, type);
                    window.renderStudents(system.students);
                    window.renderEnrollments();
                    editStudentModal.classList.add('hidden');
                } catch (error) {
                    alert(`Failed to update student: ${error.message}`);
                }
            });

            closeEditStudentModal.addEventListener('click', () => editStudentModal.classList.add('hidden'));
        }
    }
});