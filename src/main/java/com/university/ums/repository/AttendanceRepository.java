package com.university.ums.repository;

import com.university.ums.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByStudent_Id(Long studentId);

    List<Attendance> findByStudent_IdAndCourse_Id(Long studentId, Long courseId);

    List<Attendance> findByCourse_IdAndAttendanceDate(Long courseId, LocalDate date);

    List<Attendance> findByStudent_IdAndCourse_IdAndAttendanceDateBetween(
            Long studentId, Long courseId, LocalDate from, LocalDate to);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.course.id = :courseId AND a.status = 'PRESENT'")
    Long countPresentByStudentAndCourse(@Param("studentId") Long studentId, @Param("courseId") Long courseId);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.course.id = :courseId")
    Long countTotalByStudentAndCourse(@Param("studentId") Long studentId, @Param("courseId") Long courseId);

    boolean existsByStudent_IdAndCourse_IdAndAttendanceDate(Long studentId, Long courseId, LocalDate date);
}