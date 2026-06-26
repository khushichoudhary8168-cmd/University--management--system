package com.university.ums.repository;

import com.university.ums.entity.LeaveApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveApplicationRepository extends JpaRepository<LeaveApplication, Long> {

    List<LeaveApplication> findByStudent_Id(Long studentId);

    List<LeaveApplication> findByStatus(LeaveApplication.LeaveStatus status);

    List<LeaveApplication> findByStudent_IdAndStatus(Long studentId, LeaveApplication.LeaveStatus status);
}