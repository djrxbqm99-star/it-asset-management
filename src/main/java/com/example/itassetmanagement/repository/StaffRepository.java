package com.example.itassetmanagement.repository;

import com.example.itassetmanagement.domain.Staff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StaffRepository extends JpaRepository<Staff, Long> {

    // 로그인 시 아이디로 조회
    Optional<Staff> findByUsername(String username);

    // 회원가입 시 아이디 중복 체크
    boolean existsByUsername(String username);
}