package com.university.ums.service;

import com.university.ums.dto.CourseDto;
import com.university.ums.entity.Course;
import com.university.ums.entity.Department;
import com.university.ums.entity.Faculty;
import com.university.ums.exception.BadRequestException;
import com.university.ums.exception.ResourceNotFoundException;
import com.university.ums.repository.CourseRepository;
import com.university.ums.repository.DepartmentRepository;
import com.university.ums.repository.FacultyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    public List<CourseDto> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CourseDto getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + id));
        return toDto(course);
    }

    public List<CourseDto> getCoursesByDepartment(Long departmentId) {
        return courseRepository.findByDepartment_Id(departmentId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<CourseDto> getCoursesByFaculty(Long facultyId) {
        return courseRepository.findByAssignedFaculty_Id(facultyId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CourseDto createCourse(CourseDto dto) {
        if (courseRepository.existsByCode(dto.getCode())) {
            throw new BadRequestException("Course code already exists: " + dto.getCode());
        }

        Department department = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + dto.getDepartmentId()));

        Course course = new Course();
        course.setName(dto.getName());
        course.setCode(dto.getCode());
        course.setDescription(dto.getDescription());
        course.setCredits(dto.getCredits());
        course.setSemester(dto.getSemester());
        course.setDepartment(department);

        if (dto.getFacultyId() != null) {
            Faculty faculty = facultyRepository.findById(dto.getFacultyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Faculty not found: " + dto.getFacultyId()));
            course.setAssignedFaculty(faculty);
        }

        return toDto(courseRepository.save(course));
    }

    @Transactional
    public CourseDto updateCourse(Long id, CourseDto dto) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + id));

        course.setName(dto.getName());
        course.setDescription(dto.getDescription());
        course.setCredits(dto.getCredits());
        course.setSemester(dto.getSemester());

        if (dto.getFacultyId() != null) {
            Faculty faculty = facultyRepository.findById(dto.getFacultyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Faculty not found: " + dto.getFacultyId()));
            course.setAssignedFaculty(faculty);
        }

        return toDto(courseRepository.save(course));
    }

    @Transactional
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + id));
        courseRepository.delete(course);
    }

    // Assign faculty to a course
    @Transactional
    public CourseDto assignFacultyToCourse(Long courseId, Long facultyId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found: " + facultyId));

        course.setAssignedFaculty(faculty);
        return toDto(courseRepository.save(course));
    }

    // Map Course entity to DTO
    private CourseDto toDto(Course course) {
        CourseDto dto = new CourseDto();
        dto.setId(course.getId());
        dto.setName(course.getName());
        dto.setCode(course.getCode());
        dto.setDescription(course.getDescription());
        dto.setCredits(course.getCredits());
        dto.setSemester(course.getSemester());

        if (course.getDepartment() != null) {
            dto.setDepartmentId(course.getDepartment().getId());
            dto.setDepartmentName(course.getDepartment().getName());
        }
        if (course.getAssignedFaculty() != null) {
            dto.setFacultyId(course.getAssignedFaculty().getId());
            dto.setFacultyName(course.getAssignedFaculty().getUser().getFullName());
        }
        return dto;
    }
}