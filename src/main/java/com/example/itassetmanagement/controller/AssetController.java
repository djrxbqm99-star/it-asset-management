package com.example.itassetmanagement.controller;

import com.example.itassetmanagement.security.StaffUserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AssetController {

    // 로그인 성공 시 이동하는 페이지 (자산 목록은 다음 단계에서 채울 예정)
    @GetMapping("/assets")
    public String assetList(@AuthenticationPrincipal StaffUserDetails userDetails, Model model) {
        model.addAttribute("loginName", userDetails.getStaff().getName());
        model.addAttribute("loginDepartment", userDetails.getStaff().getDepartment());
        return "assets/home"; // templates/assets/home.html
    }
}