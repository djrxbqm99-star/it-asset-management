package com.example.itassetmanagement.controller;

import com.example.itassetmanagement.domain.Asset;
import com.example.itassetmanagement.repository.AssetRepository;
import com.example.itassetmanagement.security.StaffUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.ArrayList;
import java.util.List;

/**
 * 대시보드(메인 화면) 컨트롤러
 * - 로그인 성공 시 이동하는 화면
 * - 통계 카드(전체/정상/수리중/폐기 건수)에 필요한 데이터를 AssetRepository에서 집계해서 전달
 * - 2단계: 부서별/상태별 그래프 데이터, 최근 등록된 자산 목록 추가
 * - 모델 속성명은 AssetController(자산 목록)와 동일하게 loginDepartment / loginName 사용
 */
@Controller
@RequiredArgsConstructor
public class DashboardController {

    private final AssetRepository assetRepository;

    // asset 테이블의 status 컬럼에 저장되는 값과 반드시 동일하게 맞춰야 합니다.
    private static final String STATUS_NORMAL = "정상";
    private static final String STATUS_REPAIR = "수리중";
    private static final String STATUS_DISPOSED = "폐기";

    @GetMapping("/dashboard")
    public String dashboard(@AuthenticationPrincipal StaffUserDetails loginUser, Model model) {

        // ===== 통계 카드 =====
        long totalCount = assetRepository.count();
        long normalCount = assetRepository.countByStatus(STATUS_NORMAL);
        long repairCount = assetRepository.countByStatus(STATUS_REPAIR);
        long disposedCount = assetRepository.countByStatus(STATUS_DISPOSED);

        model.addAttribute("totalCount", totalCount);
        model.addAttribute("normalCount", normalCount);
        model.addAttribute("repairCount", repairCount);
        model.addAttribute("disposedCount", disposedCount);

        // ===== 부서별 자산 수 그래프 (막대) =====
        // countAssetsByDepartment() 결과: Object[0]=부서명(String), Object[1]=건수(Long)
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
        // 통계 카드에서 이미 집계한 normal/repair/disposed 값을 그대로 재사용
        model.addAttribute("statusLabels", List.of(STATUS_NORMAL, STATUS_REPAIR, STATUS_DISPOSED));
        model.addAttribute("statusCounts", List.of(normalCount, repairCount, disposedCount));

        // ===== 최근 등록된 자산 목록 (하단 테이블, 최신 10건) =====
        List<Asset> recentAssets = assetRepository.findTop10ByOrderByCreatedAtDesc();
        model.addAttribute("recentAssets", recentAssets);

        // 헤더에 표시할 로그인한 직원 정보 (AssetController와 동일한 속성명)
        if (loginUser != null) {
            model.addAttribute("loginDepartment", loginUser.getStaff().getDepartment());
            model.addAttribute("loginName", loginUser.getStaff().getName());
        }

        // 뷰 경로: src/main/resources/templates/dashboard/home.html
        return "dashboard/home";
    }
}