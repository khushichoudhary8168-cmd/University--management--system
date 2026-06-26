package com.university.ums.repository;

import com.university.ums.entity.Mark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarkRepository extends JpaRepository<Mark, Long> {

    List<Mark> findByStudent_Id(Long studentId);

    List<Mark> findByStudent_IdAndCourse_Id(Long studentId, Long courseId);

    List<Mark> findByCourse_Id(Long courseId);

    List<Mark> findByStudent_IdAndSemester(Long studentId, Integer semester);

    List<Mark> findByStudent_IdAndAcademicYear(Long studentId, String academicYear);
}