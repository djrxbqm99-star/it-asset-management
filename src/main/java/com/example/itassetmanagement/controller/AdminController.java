package com.example.itassetmanagement.controller;

import com.example.itassetmanagement.domain.Asset;
import com.example.itassetmanagement.domain.Staff;
import com.example.itassetmanagement.repository.AssetRepository;
import com.example.itassetmanagement.repository.StaffRepository;
import com.example.itassetmanagement.security.StaffUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.ArrayList;
import java.util.List;

/**
 * 회장님 전용 관리자 페이지 컨트롤러
 * - SecurityConfig에서 "/admin/**" 경로를 ROLE_ADMIN만 접근 가능하도록 제한함 (staff.role = "ADMIN")
 * - 전부 "조회" 전용 화면이며, 수정/삭제 기능은 제공하지 않음
 * - 통계 카드/그래프 집계 로직은 DashboardController와 동일한 방식을 재사용
 */
@Controller
@RequiredArgsConstructor
public class AdminController {

    private final AssetRepository assetRepository;
    private final StaffRepository staffRepository;

    // asset 테이블의 status 컬럼 값과 반드시 동일하게 맞춰야 합니다.
    private static final String STATUS_NORMAL = "정상";
    private static final String STATUS_REPAIR = "수리중";
    private static final String STATUS_DISPOSED = "폐기";

    // 관리자 페이지 목록 테이블 페이지네이션 크기
    private static final int PAGE_SIZE = 10;

    @GetMapping("/admin")
    public String admin(@AuthenticationPrincipal StaffUserDetails loginUser,
                        @RequestParam(defaultValue = "0") int staffPage,
                        @RequestParam(defaultValue = "0") int assetPage,
                        Model model) {

        // ===== 상단 통계 카드 =====
        long totalCount = assetRepository.count();
        long normalCount = assetRepository.countByStatus(STATUS_NORMAL);
        long repairCount = assetRepository.countByStatus(STATUS_REPAIR);
        long disposedCount = assetRepository.countByStatus(STATUS_DISPOSED);
        long totalStaffCount = staffRepository.count();

        model.addAttribute("totalCount", totalCount);
        model.addAttribute("normalCount", normalCount);
        model.addAttribute("repairCount", repairCount);
        model.addAttribute("disposedCount", disposedCount);
        model.addAttribute("totalStaffCount", totalStaffCount);

        // ===== 부서별 자산 수 그래프 (막대) - 대시보드와 동일 로직 =====
        List<Object[]> departmentRows = assetRepository.countAssetsByDepartment();
        List<String> departmentLabels = new ArrayList<>();
        List<Long> departmentCounts = new ArrayList<>();
        for (Object[] row : departmentRows) {
            departmentLabels.add((String) row[0]);
            departmentCounts.add((Long) row[1]);
        }
        model.addAttribute("departmentLabels", departmentLabels);
        model.addAttribute("departmentCounts", departmentCounts);

        // ===== 상태별 자산 수 그래프 (도넛) =====
        model.addAttribute("statusLabels", List.of(STATUS_NORMAL, STATUS_REPAIR, STATUS_DISPOSED));
        model.addAttribute("statusCounts", List.of(normalCount, repairCount, disposedCount));

        // ===== 전체 직원 목록 (조회 전용, 페이지네이션) =====
        Page<Staff> staffPageResult = staffRepository.findAll(
                PageRequest.of(staffPage, PAGE_SIZE, Sort.by("staffId").descending()));
        model.addAttribute("staffPageResult", staffPageResult);

        // ===== 전체 자산 목록 (조회 전용, 페이지네이션 - 검색조건 없이 전체 대상) =====
        Page<Asset> assetPageResult = assetRepository.searchAssets(
                null, null, null, null, null,
                PageRequest.of(assetPage, PAGE_SIZE));
        model.addAttribute("assetPageResult", assetPageResult);

        // 헤더에 표시할 로그인한 관리자 이름
        if (loginUser != null) {
            model.addAttribute("loginName", loginUser.getStaff().getName());
        }

        // 뷰 경로: src/main/resources/templates/admin/admin.html
        return "admin/admin";
    }
}