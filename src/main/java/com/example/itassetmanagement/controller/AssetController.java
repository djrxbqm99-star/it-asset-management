package com.example.itassetmanagement.controller;

import com.example.itassetmanagement.domain.Asset;
import com.example.itassetmanagement.domain.AssetAssignmentHistory;
import com.example.itassetmanagement.domain.Staff;
import com.example.itassetmanagement.repository.AssetAssignmentHistoryRepository;
import com.example.itassetmanagement.repository.AssetRepository;
import com.example.itassetmanagement.repository.StaffRepository;
import com.example.itassetmanagement.security.StaffUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class AssetController {

    private final AssetRepository assetRepository;
    private final AssetAssignmentHistoryRepository assetAssignmentHistoryRepository;
    private final StaffRepository staffRepository;

    private static final int PAGE_SIZE = 5;

    private String normalize(String value) {
        return (value != null && !value.isBlank()) ? value.trim() : null;
    }

    /**
     * 자산 목록 화면
     */
    @GetMapping("/assets")
    public String assetList(
            @AuthenticationPrincipal StaffUserDetails userDetails,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            Model model) {

        model.addAttribute("loginName", userDetails.getStaff().getName());
        model.addAttribute("loginDepartment", userDetails.getStaff().getDepartment());

        String normalizedDepartment = normalize(department);
        String normalizedStatus = normalize(status);
        String normalizedKeyword = normalize(keyword);

        PageRequest pageable = PageRequest.of(page, PAGE_SIZE);
        Page<Asset> assetPage = assetRepository.searchAssets(
                normalizedDepartment, normalizedStatus, normalizedKeyword, pageable);

        List<String> departments = assetRepository.findDistinctDepartments();
        List<Staff> staffList = staffRepository.findAll();

        model.addAttribute("assetPage", assetPage);
        model.addAttribute("departments", departments);
        model.addAttribute("staffList", staffList);
        model.addAttribute("selectedDepartment", normalizedDepartment);
        model.addAttribute("selectedStatus", normalizedStatus);
        model.addAttribute("selectedKeyword", normalizedKeyword);

        return "assets/home";
    }

    /**
     * 자산 상세 모달 내용 (AJAX)
     */
    @GetMapping("/assets/{assetId}/detail")
    public String assetDetail(@PathVariable Long assetId, Model model) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 자산입니다. id=" + assetId));

        List<AssetAssignmentHistory> historyList =
                assetAssignmentHistoryRepository.findByAsset_AssetIdOrderByStartDateDesc(assetId);

        model.addAttribute("asset", asset);
        model.addAttribute("historyList", historyList);

        return "assets/detail-modal :: content";
    }

    /**
     * 신규 자산 등록
     * - 자산관리번호 중복이면 에러 플래시 메시지와 함께 목록으로 리다이렉트
     * - 담당자를 지정한 경우, 최초 인수인계 이력(asset_assignment_history)도 함께 생성
     */
    @PostMapping("/assets/register")
    public String registerAsset(
            @RequestParam String assetCode,
            @RequestParam String assetName,
            @RequestParam String assetType,
            @RequestParam(defaultValue = "정상") String status,
            @RequestParam(required = false) Long staffId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate purchaseDate,
            RedirectAttributes redirectAttributes) {

        if (assetRepository.existsByAssetCode(assetCode)) {
            redirectAttributes.addFlashAttribute("registerError",
                    "이미 존재하는 자산관리번호입니다: " + assetCode);
            return "redirect:/assets";
        }

        Staff staff = null;
        if (staffId != null) {
            staff = staffRepository.findById(staffId).orElse(null);
        }

        Asset asset = Asset.builder()
                .assetCode(assetCode)
                .assetName(assetName)
                .assetType(assetType)
                .status(status)
                .currentStaff(staff)
                .purchaseDate(purchaseDate)
                .build();

        Asset saved = assetRepository.save(asset);

        if (staff != null) {
            AssetAssignmentHistory history = AssetAssignmentHistory.builder()
                    .asset(saved)
                    .staff(staff)
                    .startDate(purchaseDate != null ? purchaseDate : LocalDate.now())
                    .reason("최초 등록")
                    .build();
            assetAssignmentHistoryRepository.save(history);
        }

        redirectAttributes.addFlashAttribute("registerSuccess",
                "'" + assetName + "' 자산이 등록되었습니다.");
        return "redirect:/assets";
    }

    /**
     * 현재 필터 조건 그대로 CSV 내보내기 (UTF-8 BOM 처리로 엑셀 한글 깨짐 방지)
     */
    @GetMapping("/assets/export")
    @ResponseBody
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) throws IOException {

        String normalizedDepartment = normalize(department);
        String normalizedStatus = normalize(status);
        String normalizedKeyword = normalize(keyword);

        List<Asset> assets = assetRepository.searchAssetsAll(
                normalizedDepartment, normalizedStatus, normalizedKeyword);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        baos.write(0xEF);
        baos.write(0xBB);
        baos.write(0xBF);

        try (Writer writer = new OutputStreamWriter(baos, StandardCharsets.UTF_8)) {
            writer.write("자산관리번호,자산명,종류,상태,담당자,부서,구매일자\n");
            for (Asset asset : assets) {
                String staffName = asset.getCurrentStaff() != null ? asset.getCurrentStaff().getName() : "";
                String staffDept = asset.getCurrentStaff() != null ? asset.getCurrentStaff().getDepartment() : "";
                String purchaseDate = asset.getPurchaseDate() != null ? asset.getPurchaseDate().toString() : "";

                writer.write(csvEscape(asset.getAssetCode()) + ",");
                writer.write(csvEscape(asset.getAssetName()) + ",");
                writer.write(csvEscape(asset.getAssetType()) + ",");
                writer.write(csvEscape(asset.getStatus()) + ",");
                writer.write(csvEscape(staffName) + ",");
                writer.write(csvEscape(staffDept) + ",");
                writer.write(csvEscape(purchaseDate) + "\n");
            }
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.setContentDispositionFormData("attachment", "asset_list.csv");

        return ResponseEntity.ok().headers(headers).body(baos.toByteArray());
    }

    private String csvEscape(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}