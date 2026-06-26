package com.university.ums.repository;

import com.university.ums.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByUser_Id(Long userId);

    Optional<Student> findByEnrollmentNumber(String enrollmentNumber);

    List<Student> findByDepartment_Id(Long departmentId);

    boolean existsByEnrollmentNumber(String enrollmentNumber);
}