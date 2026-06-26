package com.university.ums.service;

import com.university.ums.dto.AttendanceDto;
import com.university.ums.dto.MarkDto;
import com.university.ums.entity.*;
import com.university.ums.exception.BadRequestException;
import com.university.ums.exception.ResourceNotFoundException;
import com.university.ums.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FacultyService {

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private MarkRepository markRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private LeaveApplicationRepository leaveApplicationRepository;

    // Get faculty profile by username
    public Faculty getFacultyProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return facultyRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found"));
    }

    // Get courses assigned to this faculty
    public List<Course> getMyCourses(String username) {
        Faculty faculty = getFacultyProfile(username);
        return courseRepository.findByAssignedFaculty_Id(faculty.getId());
    }

    // Get students enrolled in a specific course
    public List<Student> getStudentsInCourse(Long courseId) {
        List<Enrollment> enrollments = enrollmentRepository.findByCourse_Id(courseId);
        return enrollments.stream()
                .filter(e -> e.getStatus() == Enrollment.EnrollmentStatus.ACTIVE)
                .map(Enrollment::getStudent)
                .collect(Collectors.toList());
    }

    // Mark attendance for students in a course
    @Transactional
    public String markAttendance(String username, List<AttendanceDto> attendanceDtos) {
        Faculty faculty = getFacultyProfile(username);
        int count = 0;

        for (AttendanceDto dto : attendanceDtos) {
            // Avoid duplicate attendance for same student/course/date
            if (attendanceRepository.existsByStudent_IdAndCourse_IdAndAttendanceDate(
                    dto.getStudentId(), dto.getCourseId(), dto.getAttendanceDate())) {
                continue; // skip already marked
            }

            Student student = studentRepository.findById(dto.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + dto.getStudentId()));
            Course course = courseRepository.findById(dto.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + dto.getCourseId()));

            Attendance attendance = new Attendance();
            attendance.setStudent(student);
            attendance.setCourse(course);
            attendance.setAttendanceDate(dto.getAttendanceDate());
            attendance.setStatus(dto.getStatus());
            attendance.setMarkedBy(faculty);
            attendance.setMarkedAt(LocalDateTime.now());

            attendanceRepository.save(attendance);
            count++;
        }

        return "Attendance marked for " + count + " student(s).";
    }

    // Upload marks for a student
    @Transactional
    public Mark uploadMark(String username, MarkDto dto) {
        Faculty faculty = getFacultyProfile(username);

        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + dto.getStudentId()));
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + dto.getCourseId()));

        // Compute grade automatically
        String grade = computeGrade(dto.getMarksObtained(), dto.getTotalMarks());

        Mark mark = new Mark();
        mark.setStudent(student);
        mark.setCourse(course);
        mark.setExamType(dto.getExamType());
        mark.setMarksObtained(dto.getMarksObtained());
        mark.setTotalMarks(dto.getTotalMarks());
        mark.setGrade(grade);
        mark.setUploadedBy(faculty);
        mark.setUploadedAt(LocalDateTime.now());
        mark.setAcademicYear(dto.getAcademicYear());
        mark.setSemester(dto.getSemester());

        return markRepository.save(mark);
    }

    // Get full student report for a course
    public Map<String, Object> getStudentReport(Long studentId, Long courseId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));

        List<Mark> marks = markRepository.findByStudent_IdAndCourse_Id(studentId, courseId);
        List<Attendance> attendance = attendanceRepository.findByStudent_IdAndCourse_Id(studentId, courseId);

        long totalClasses = attendanceRepository.countTotalByStudentAndCourse(studentId, courseId);
        long present = attendanceRepository.countPresentByStudentAndCourse(studentId, courseId);
        double attendancePercent = totalClasses > 0
                ? Math.round((present * 100.0 / totalClasses) * 10.0) / 10.0
                : 0.0;

        Map<String, Object> report = new HashMap<>();
        report.put("studentName", student.getUser().getFullName());
        report.put("enrollmentNumber", student.getEnrollmentNumber());
        report.put("marks", marks);
        report.put("attendanceRecords", attendance);
        report.put("totalClasses", totalClasses);
        report.put("classesPresent", present);
        report.put("attendancePercentage", attendancePercent);
        return report;
    }

    // Get count of students across all faculty courses
    public Map<String, Object> getFacultyDashboard(String username) {
        Faculty faculty = getFacultyProfile(username);
        List<Course> courses = courseRepository.findByAssignedFaculty_Id(faculty.getId());

        int totalStudents = 0;
        for (Course course : courses) {
            totalStudents += enrollmentRepository.findByCourse_Id(course.getId()).size();
        }

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalCourses", courses.size());
        dashboard.put("totalStudents", totalStudents);
        dashboard.put("courses", courses);
        return dashboard;
    }

    // Review a leave application
    @Transactional
    public String reviewLeave(Long leaveId, String decision, String remarks) {
        LeaveApplication leave = leaveApplicationRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave application not found: " + leaveId));

        if ("APPROVED".equalsIgnoreCase(decision)) {
            leave.setStatus(LeaveApplication.LeaveStatus.APPROVED);
        } else if ("REJECTED".equalsIgnoreCase(decision)) {
            leave.setStatus(LeaveApplication.LeaveStatus.REJECTED);
        } else {
            throw new BadRequestException("Decision must be APPROVED or REJECTED");
        }

        leave.setRemarks(remarks);
        leave.setReviewedAt(LocalDateTime.now());
        leaveApplicationRepository.save(leave);
        return "Leave application " + decision.toLowerCase() + " successfully.";
    }

    // All pending leaves for faculty to review
    public List<LeaveApplication> getPendingLeaves() {
        return leaveApplicationRepository.findByStatus(LeaveApplication.LeaveStatus.PENDING);
    }

    // Calculate grade from percentage
    private String computeGrade(double obtained, double total) {
        double pct = (obtained / total) * 100;
        if (pct >= 90)
            return "O";
        if (pct >= 80)
            return "A+";
        if (pct >= 70)
            return "A";
        if (pct >= 60)
            return "B+";
        if (pct >= 50)
            return "B";
        if (pct >= 40)
            return "C";
        return "F";
    }
}