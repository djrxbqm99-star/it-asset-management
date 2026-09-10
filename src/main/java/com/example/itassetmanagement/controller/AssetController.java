package com.example.itassetmanagement.controller;

import com.example.itassetmanagement.domain.Asset;
import com.example.itassetmanagement.domain.AssetAssignmentHistory;
import com.example.itassetmanagement.domain.AssetStatusHistory;
import com.example.itassetmanagement.domain.MaintenanceHistory;
import com.example.itassetmanagement.domain.Staff;
import com.example.itassetmanagement.repository.AssetAssignmentHistoryRepository;
import com.example.itassetmanagement.repository.AssetRepository;
import com.example.itassetmanagement.repository.AssetStatusHistoryRepository;
import com.example.itassetmanagement.repository.MaintenanceHistoryRepository;
import com.example.itassetmanagement.repository.StaffRepository;
import com.example.itassetmanagement.security.StaffUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class AssetController {

    private final AssetRepository assetRepository;
    private final AssetAssignmentHistoryRepository assetAssignmentHistoryRepository;
    private final AssetStatusHistoryRepository assetStatusHistoryRepository;
    private final MaintenanceHistoryRepository maintenanceHistoryRepository;
    private final StaffRepository staffRepository;

    private static final int PAGE_SIZE = 5;

    private String normalize(String value) {
        return (value != null && !value.isBlank()) ? value.trim() : null;
    }

    // "" 또는 null이면 null, 숫자가 아니면 null, 그 외에는 Long으로 변환
    private Long parseStaffId(String staffId) {
        String normalized = normalize(staffId);
        if (normalized == null) return null;
        try {
            return Long.valueOf(normalized);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * 이 자산을 로그인한 사람이 수정할 수 있는지 여부
     * - 지금은 "본인이 등록한 자산"만 허용
     * - 나중에 관리자(회장님) 페이지가 생기면 role == ADMIN 이면 전체 허용하도록 이 메서드만 고치면 됨
     */
    private boolean canEdit(Asset asset, Staff loginStaff) {
        if (loginStaff.isAdmin()) {
            return true;
        }
        return asset.getCreatedBy() != null
                && asset.getCreatedBy().getStaffId().equals(loginStaff.getStaffId());
    }

    /**
     * 자산 목록 화면
     */
    @GetMapping("/assets")
    public String assetList(
            @AuthenticationPrincipal StaffUserDetails userDetails,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String staffId,
            @RequestParam(required = false) String assetType,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            Model model) {

        Staff loginStaff = userDetails.getStaff();
        model.addAttribute("loginName", loginStaff.getName());
        model.addAttribute("loginDepartment", loginStaff.getDepartment());
        model.addAttribute("loginStaffId", loginStaff.getStaffId());
        model.addAttribute("loginIsAdmin", loginStaff.isAdmin());

        String normalizedDepartment = normalize(department);
        String normalizedStatus = normalize(status);
        String normalizedAssetType = normalize(assetType);
        String normalizedKeyword = normalize(keyword);
        Long normalizedStaffId = parseStaffId(staffId);

        PageRequest pageable = PageRequest.of(page, PAGE_SIZE);
        Page<Asset> assetPage = assetRepository.searchAssets(
                normalizedDepartment, normalizedStatus, normalizedStaffId, normalizedAssetType, normalizedKeyword, pageable);

        List<String> departments = assetRepository.findDistinctDepartments();
        List<Staff> staffList = staffRepository.findAll();

        String selectedStaffName = null;
        if (normalizedStaffId != null) {
            selectedStaffName = staffRepository.findById(normalizedStaffId)
                    .map(Staff::getName)
                    .orElse(null);
        }

        model.addAttribute("assetPage", assetPage);
        model.addAttribute("departments", departments);
        model.addAttribute("staffList", staffList);
        model.addAttribute("selectedDepartment", normalizedDepartment);
        model.addAttribute("selectedStatus", normalizedStatus);
        model.addAttribute("selectedStaffId", normalizedStaffId);
        model.addAttribute("selectedStaffName", selectedStaffName);
        model.addAttribute("selectedAssetType", normalizedAssetType);
        model.addAttribute("selectedKeyword", normalizedKeyword);

        return "assets/home";
    }

    /**
     * 자산 상세 모달 내용 (AJAX)
     * - canEdit 플래그를 같이 내려서 화면에서 "수정" 버튼 노출 여부를 결정
     */
    @GetMapping("/assets/{assetId}/detail")
    public String assetDetail(@AuthenticationPrincipal StaffUserDetails userDetails,
                              @PathVariable Long assetId, Model model) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 자산입니다. id=" + assetId));

        List<AssetAssignmentHistory> historyList =
                assetAssignmentHistoryRepository.findByAsset_AssetIdOrderByStartDateDesc(assetId);
        List<AssetStatusHistory> statusHistoryList =
                assetStatusHistoryRepository.findByAsset_AssetIdOrderByChangedAtDesc(assetId);
        List<MaintenanceHistory> maintenanceHistoryList =
                maintenanceHistoryRepository.findByAsset_AssetIdOrderByMaintenanceDateDesc(assetId);

        model.addAttribute("asset", asset);
        model.addAttribute("historyList", historyList);
        model.addAttribute("statusHistoryList", statusHistoryList);
        model.addAttribute("maintenanceHistoryList", maintenanceHistoryList);
        model.addAttribute("canEdit", canEdit(asset, userDetails.getStaff()));

        return "assets/detail-modal :: content";
    }

    /**
     * 자산관리번호 실시간 중복체크 (AJAX)
     * - 등록 화면: excludeId 없이 호출
     * - 수정 화면: 자기 자신은 중복으로 안 치기 위해 excludeId로 현재 assetId를 넘김
     */
    @GetMapping("/api/assets/check-code")
    @ResponseBody
    public Map<String, Boolean> checkAssetCode(
            @RequestParam String code,
            @RequestParam(required = false) Long excludeId) {

        boolean duplicated = (excludeId != null)
                ? assetRepository.existsByAssetCodeAndAssetIdNot(code, excludeId)
                : assetRepository.existsByAssetCode(code);

        Map<String, Boolean> result = new HashMap<>();
        result.put("available", !duplicated);
        return result;
    }

    /**
     * 수정 모달을 채우기 위한 자산 원본 데이터 (AJAX, JSON)
     * - 본인이 등록한 자산이 아니면 403
     */
    @GetMapping("/assets/{assetId}/edit-data")
    @ResponseBody
    public Map<String, Object> getEditData(@AuthenticationPrincipal StaffUserDetails userDetails,
                                           @PathVariable Long assetId) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 자산입니다."));

        if (!canEdit(asset, userDetails.getStaff())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인이 등록한 자산만 수정할 수 있습니다.");
        }

        Map<String, Object> data = new HashMap<>();
        data.put("assetId", asset.getAssetId());
        data.put("assetCode", asset.getAssetCode());
        data.put("assetName", asset.getAssetName());
        data.put("assetType", asset.getAssetType());
        data.put("status", asset.getStatus());
        data.put("staffId", asset.getCurrentStaff() != null ? asset.getCurrentStaff().getStaffId() : null);
        data.put("staffLabel", asset.getCurrentStaff() != null
                ? asset.getCurrentStaff().getName() + " (" + (asset.getCurrentStaff().getDepartment() != null ? asset.getCurrentStaff().getDepartment() : "소속 미지정") + ")"
                : "담당자 없음");
        data.put("purchaseDate", asset.getPurchaseDate() != null ? asset.getPurchaseDate().toString() : null);

        return data;
    }

    /**
     * 신규 자산 등록
     * - 로그인한 사람이 등록자(createdBy)로 자동 기록됨 -> 본인 수정 권한의 기준이 됨
     * - 자산관리번호 중복이면 에러 플래시 메시지와 함께 목록으로 리다이렉트
     * - 담당자를 지정한 경우, 최초 인수인계 이력(asset_assignment_history)도 함께 생성
     */
    @PostMapping("/assets/register")
    public String registerAsset(
            @AuthenticationPrincipal StaffUserDetails userDetails,
            @RequestParam String assetCode,
            @RequestParam String assetName,
            @RequestParam String assetType,
            @RequestParam(defaultValue = "정상") String status,
            @RequestParam(required = false) String staffId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate purchaseDate,
            RedirectAttributes redirectAttributes) {

        if (assetCode == null || assetCode.isBlank() || assetName == null || assetName.isBlank()
                || assetType == null || assetType.isBlank()) {
            redirectAttributes.addFlashAttribute("registerError", "자산관리번호, 자산명, 종류는 필수 입력입니다.");
            return "redirect:/assets";
        }

        if (assetRepository.existsByAssetCode(assetCode)) {
            redirectAttributes.addFlashAttribute("registerError",
                    "이미 존재하는 자산관리번호입니다: " + assetCode);
            return "redirect:/assets";
        }

        Long normalizedStaffId = parseStaffId(staffId);
        Staff staff = null;
        if (normalizedStaffId != null) {
            staff = staffRepository.findById(normalizedStaffId).orElse(null);
        }

        Asset asset = Asset.builder()
                .assetCode(assetCode)
                .assetName(assetName)
                .assetType(assetType)
                .status(status)
                .currentStaff(staff)
                .createdBy(userDetails.getStaff())
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
     * 자산 수정
     * - 본인이 등록한 자산이 아니면 거부
     * - 담당자가 바뀌면 기존 인수인계 이력을 종료(end_date)하고 새 이력을 시작
     */
    @PostMapping("/assets/{assetId}/edit")
    public String editAsset(
            @AuthenticationPrincipal StaffUserDetails userDetails,
            @PathVariable Long assetId,
            @RequestParam String assetCode,
            @RequestParam String assetName,
            @RequestParam String assetType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate purchaseDate,
            RedirectAttributes redirectAttributes) {

        Asset asset = assetRepository.findById(assetId).orElse(null);
        if (asset == null) {
            redirectAttributes.addFlashAttribute("registerError", "존재하지 않는 자산입니다.");
            return "redirect:/assets";
        }

        if (!canEdit(asset, userDetails.getStaff())) {
            redirectAttributes.addFlashAttribute("registerError", "본인이 등록한 자산만 수정할 수 있습니다.");
            return "redirect:/assets";
        }

        if (assetCode == null || assetCode.isBlank() || assetName == null || assetName.isBlank()
                || assetType == null || assetType.isBlank()) {
            redirectAttributes.addFlashAttribute("registerError", "자산관리번호, 자산명, 종류는 필수 입력입니다.");
            return "redirect:/assets";
        }

        if (assetRepository.existsByAssetCodeAndAssetIdNot(assetCode, assetId)) {
            redirectAttributes.addFlashAttribute("registerError",
                    "이미 존재하는 자산관리번호입니다: " + assetCode);
            return "redirect:/assets";
        }

        // 담당자 변경은 "인수인계", 상태 변경은 "상태 변경" 기능에서 각각 이력을 남기며 처리하므로
        // 여기서는 자산의 기본 정보(관리번호/이름/종류/구매일자)만 수정한다.
        asset.setAssetCode(assetCode);
        asset.setAssetName(assetName);
        asset.setAssetType(assetType);
        asset.setPurchaseDate(purchaseDate);
        assetRepository.save(asset);

        redirectAttributes.addFlashAttribute("registerSuccess",
                "'" + assetName + "' 자산 정보가 수정되었습니다.");
        return "redirect:/assets";
    }

    /**
     * 담당자 인수인계 (수정과는 별도의 명확한 액션)
     * - 기존 담당자의 진행중이던 이력을 종료(end_date)하고, 새 담당자로 이력을 새로 시작
     * - 자산의 현재 담당자(current_staff_id)도 함께 갱신
     * - 본인이 등록한 자산이 아니면 거부
     */
    @PostMapping("/assets/{assetId}/handover")
    public String handoverAsset(
            @AuthenticationPrincipal StaffUserDetails userDetails,
            @PathVariable Long assetId,
            @RequestParam String newStaffId,
            @RequestParam(required = false) String reason,
            RedirectAttributes redirectAttributes) {

        Asset asset = assetRepository.findById(assetId).orElse(null);
        if (asset == null) {
            redirectAttributes.addFlashAttribute("registerError", "존재하지 않는 자산입니다.");
            return "redirect:/assets";
        }

        if (!canEdit(asset, userDetails.getStaff())) {
            redirectAttributes.addFlashAttribute("registerError", "본인이 등록한 자산만 인수인계할 수 있습니다.");
            return "redirect:/assets";
        }

        Long normalizedNewStaffId = parseStaffId(newStaffId);
        if (normalizedNewStaffId == null) {
            redirectAttributes.addFlashAttribute("registerError", "인계받을 담당자를 선택해 주세요.");
            return "redirect:/assets";
        }

        Staff newStaff = staffRepository.findById(normalizedNewStaffId).orElse(null);
        if (newStaff == null) {
            redirectAttributes.addFlashAttribute("registerError", "존재하지 않는 담당자입니다.");
            return "redirect:/assets";
        }

        LocalDate today = LocalDate.now();
        String normalizedReason = (reason != null && !reason.isBlank()) ? reason.trim() : "인수인계";

        // 기존 담당자의 진행중이던 이력 종료
        assetAssignmentHistoryRepository.findByAsset_AssetIdAndEndDateIsNull(assetId)
                .ifPresent(h -> {
                    h.setEndDate(today);
                    assetAssignmentHistoryRepository.save(h);
                });

        // 새 담당자 이력 시작
        AssetAssignmentHistory newHistory = AssetAssignmentHistory.builder()
                .asset(asset)
                .staff(newStaff)
                .startDate(today)
                .reason(normalizedReason)
                .build();
        assetAssignmentHistoryRepository.save(newHistory);

        asset.setCurrentStaff(newStaff);
        assetRepository.save(asset);

        redirectAttributes.addFlashAttribute("registerSuccess",
                "'" + asset.getAssetName() + "' 담당자가 " + newStaff.getName() + " 님에게 인수인계되었습니다.");
        return "redirect:/assets";
    }

    /**
     * 자산 상태 변경 (정상 / 수리중 / 폐기)
     * - asset_status_history에 변경 이력 기록
     * - actionContent를 입력한 경우 maintenance_history에도 조치 내역 기록 (예: 수리 완료 처리 시)
     * - 본인이 등록한 자산이 아니면 거부
     */
    @PostMapping("/assets/{assetId}/status-change")
    public String changeStatus(
            @AuthenticationPrincipal StaffUserDetails userDetails,
            @PathVariable Long assetId,
            @RequestParam String newStatus,
            @RequestParam(required = false) String reason,
            @RequestParam(required = false) String actionContent,
            RedirectAttributes redirectAttributes) {

        Asset asset = assetRepository.findById(assetId).orElse(null);
        if (asset == null) {
            redirectAttributes.addFlashAttribute("registerError", "존재하지 않는 자산입니다.");
            return "redirect:/assets";
        }

        if (!canEdit(asset, userDetails.getStaff())) {
            redirectAttributes.addFlashAttribute("registerError", "본인이 등록한 자산만 상태를 변경할 수 있습니다.");
            return "redirect:/assets";
        }

        if (newStatus == null || newStatus.isBlank()) {
            redirectAttributes.addFlashAttribute("registerError", "변경할 상태를 선택해 주세요.");
            return "redirect:/assets";
        }

        Staff loginStaff = userDetails.getStaff();

        asset.setStatus(newStatus);
        assetRepository.save(asset);

        AssetStatusHistory statusHistory = AssetStatusHistory.builder()
                .asset(asset)
                .changedStatus(newStatus)
                .reason((reason != null && !reason.isBlank()) ? reason.trim() : null)
                .changedBy(loginStaff)
                .build();
        assetStatusHistoryRepository.save(statusHistory);

        if (actionContent != null && !actionContent.isBlank()) {
            MaintenanceHistory maintenance = MaintenanceHistory.builder()
                    .asset(asset)
                    .staff(loginStaff)
                    .actionContent(actionContent.trim())
                    .build();
            maintenanceHistoryRepository.save(maintenance);
        }

        redirectAttributes.addFlashAttribute("registerSuccess",
                "'" + asset.getAssetName() + "' 상태가 '" + newStatus + "'(으)로 변경되었습니다.");
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
            @RequestParam(required = false) String staffId,
            @RequestParam(required = false) String assetType,
            @RequestParam(required = false) String keyword) throws IOException {

        String normalizedDepartment = normalize(department);
        String normalizedStatus = normalize(status);
        String normalizedAssetType = normalize(assetType);
        String normalizedKeyword = normalize(keyword);
        Long normalizedStaffId = parseStaffId(staffId);

        List<Asset> assets = assetRepository.searchAssetsAll(
                normalizedDepartment, normalizedStatus, normalizedStaffId, normalizedAssetType, normalizedKeyword);

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