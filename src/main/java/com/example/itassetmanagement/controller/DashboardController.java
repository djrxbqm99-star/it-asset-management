package com.example.itassetmanagement.controller;

import com.example.itassetmanagement.domain.Asset;
import com.example.itassetmanagement.domain.Staff;
import com.example.itassetmanagement.dto.AssetSummaryDto;
import com.example.itassetmanagement.repository.AssetRepository;
import com.example.itassetmanagement.repository.StaffRepository;
import com.example.itassetmanagement.security.StaffUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 대시보드(메인 화면) 컨트롤러
 * - 로그인 성공 시 이동하는 화면
 * - 통계 카드(전체/정상/수리중/폐기 건수)에 필요한 데이터를 AssetRepository에서 집계해서 전달
 * - 2단계: 부서별/상태별 그래프 데이터, 최근 등록된 자산 목록 추가
 * - 3단계: 통계 카드 클릭 시 상태별 자산 목록을 모달로 보여주기 위한 JSON API 추가
 * - 4단계(B안): 자산 상세 모달에서 수정/인수인계/상태변경까지 그대로 처리할 수 있도록
 *   departments/staffList를 모델에 추가 (staffPickerModal 등 자산 목록 화면과 동일한 피커 모달 재사용)
 * - 모델 속성명은 AssetController(자산 목록)와 동일하게 loginDepartment / loginName 사용
 */
@Controller
@RequiredArgsConstructor
public class DashboardController {

    private final AssetRepository assetRepository;
    private final StaffRepository staffRepository;

    // asset 테이블의 status 컬럼에 저장되는 값과 반드시 동일하게 맞춰야 합니다.
    private static final String STATUS_NORMAL = "정상";
    private static final String STATUS_REPAIR = "수리중";
    private static final String STATUS_DISPOSED = "폐기";

    // 통계 카드 클릭 모달 페이지네이션 크기 (자산 목록 화면과 동일하게 5건)
    private static final int STATUS_MODAL_PAGE_SIZE = 5;

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

        // ===== 수정/인수인계 모달의 담당자 선택 피커에 필요한 데이터 (자산 목록 화면과 동일) =====
        model.addAttribute("departments", assetRepository.findDistinctDepartments());
        model.addAttribute("staffList", staffRepository.findAll());

        // 헤더에 표시할 로그인한 직원 정보 (AssetController와 동일한 속성명)
        if (loginUser != null) {
            model.addAttribute("loginDepartment", loginUser.getStaff().getDepartment());
            model.addAttribute("loginName", loginUser.getStaff().getName());
        }

        // 뷰 경로: src/main/resources/templates/dashboard/home.html
        return "dashboard/home";
    }

    /**
     * 통계 카드 클릭 시 뜨는 "상태별 자산 목록" 모달용 JSON API
     * - status가 없거나 "ALL"이면 전체 자산 대상
     * - AssetController의 searchAssets를 그대로 재사용 (department/staffId/assetType/keyword는 사용하지 않음)
     */
    @GetMapping("/dashboard/assets-by-status")
    @ResponseBody
    public Map<String, Object> assetsByStatus(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page) {

        String normalizedStatus = (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status))
                ? status.trim() : null;

        PageRequest pageable = PageRequest.of(page, STATUS_MODAL_PAGE_SIZE);
        Page<Asset> assetPage = assetRepository.searchAssets(null, normalizedStatus, null, null, null, pageable);

        List<AssetSummaryDto> content = assetPage.getContent().stream()
                .map(AssetSummaryDto::from)
                .toList();

        Map<String, Object> result = new HashMap<>();
        result.put("content", content);
        result.put("totalPages", assetPage.getTotalPages());
        result.put("number", assetPage.getNumber());
        result.put("totalElements", assetPage.getTotalElements());
        return result;
    }
}