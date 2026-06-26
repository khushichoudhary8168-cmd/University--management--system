package com.university.ums.repository;

import com.university.ums.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long> {

    Optional<Faculty> findByUser_Id(Long userId);

    Optional<Faculty> findByEmployeeId(String employeeId);

    List<Faculty> findByDepartment_Id(Long departmentId);

    boolean existsByEmployeeId(String employeeId);
}