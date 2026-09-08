package com.example.itassetmanagement.service;

import com.example.itassetmanagement.domain.Staff;
import com.example.itassetmanagement.dto.auth.SignupRequestDto;
import com.example.itassetmanagement.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void signup(SignupRequestDto dto) {
        if (staffRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        Staff staff = Staff.builder()
                .username(dto.getUsername())
                .password(passwordEncoder.encode(dto.getPassword())) // 반드시 암호화하여 저장
                .name(dto.getName())
                .department(dto.getDepartment())
                .build();

        staffRepository.save(staff);
    }

    // 회원가입 화면에서 아이디 중복 확인(AJAX)에 사용
    public boolean isUsernameAvailable(String username) {
        if (username == null || username.isBlank()) {
            return false;
        }
        return !staffRepository.existsByUsername(username);
    }
}