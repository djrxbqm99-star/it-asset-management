package com.example.itassetmanagement.security;

import com.example.itassetmanagement.domain.Staff;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class StaffUserDetails implements UserDetails {

    private final Staff staff;

    public StaffUserDetails(Staff staff) {
        this.staff = staff;
    }

    public Staff getStaff() {
        return staff;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // staff.role 값(USER/ADMIN)을 그대로 Spring Security 권한으로 매핑
        // -> role이 "ADMIN"이면 ROLE_ADMIN, 그 외(또는 null)에는 ROLE_USER
        // 관리자 페이지(/admin)는 SecurityConfig에서 ROLE_ADMIN만 접근하도록 제한함
        String role = (staff.getRole() != null && !staff.getRole().isBlank())
                ? staff.getRole()
                : "USER";
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getPassword() {
        return staff.getPassword();
    }

    @Override
    public String getUsername() {
        return staff.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}