package com.example.itassetmanagement; // 본인 패키지명에 맞게

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/")
    public String hello() {
        return "Hello, IT 자산관리 시스템!";
    }
}