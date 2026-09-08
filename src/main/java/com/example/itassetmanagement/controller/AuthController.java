package com.example.itassetmanagement.controller;

import com.example.itassetmanagement.dto.auth.SignupRequestDto;
import com.example.itassetmanagement.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Controller
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // 메인(랜딩) 페이지
    @GetMapping({"/", "/home"})
    public String home() {
        return "home"; // templates/home.html
    }

    // 로그인 페이지 (실제 인증 처리는 Spring Security가 담당)
    @GetMapping("/login")
    public String loginPage() {
        return "auth/login"; // templates/auth/login.html
    }

    // 회원가입 화면
    @GetMapping("/signup")
    public String signupPage(Model model) {
        model.addAttribute("signupRequestDto", new SignupRequestDto());
        return "auth/signup"; // templates/auth/signup.html
    }

    // 회원가입 처리
    @PostMapping("/signup")
    public String signup(@Valid @ModelAttribute SignupRequestDto signupRequestDto,
                         BindingResult bindingResult,
                         Model model) {

        if (bindingResult.hasErrors()) {
            return "auth/signup";
        }

        try {
            authService.signup(signupRequestDto);
        } catch (IllegalArgumentException e) {
            model.addAttribute("errorMessage", e.getMessage());
            return "auth/signup";
        }

        return "redirect:/login?signup=success";
    }

    // 아이디 중복 확인 (회원가입 화면 AJAX 호출용)
    // 응답 예: {"available": true}
    @GetMapping("/api/check-username")
    @ResponseBody
    public Map<String, Boolean> checkUsername(@RequestParam String username) {
        boolean available = authService.isUsernameAvailable(username);
        return Map.of("available", available);
    }
}