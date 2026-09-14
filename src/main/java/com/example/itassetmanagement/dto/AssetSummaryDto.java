package com.example.itassetmanagement.dto;

import com.example.itassetmanagement.domain.Asset;

import java.time.format.DateTimeFormatter;

/**
 * 대시보드 "통계 카드 클릭 → 자산 목록 모달"에서 사용하는 요약 DTO
 * - Asset 엔티티를 그대로 JSON 직렬화하면 Lazy 연관관계(Staff) 때문에
 *   문제가 생길 수 있어, 필요한 필드만 뽑아서 안전하게 내려줌
 */
public record AssetSummaryDto(
        Long assetId,
        String assetCode,
        String assetName,
        String assetType,
        String status,
        String staffName,
        String department,
        String createdAt
) {
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public static AssetSummaryDto from(Asset asset) {
        boolean hasStaff = asset.getCurrentStaff() != null;
        return new AssetSummaryDto(
                asset.getAssetId(),
                asset.getAssetCode(),
                asset.getAssetName(),
                asset.getAssetType(),
                asset.getStatus(),
                hasStaff ? asset.getCurrentStaff().getName() : "미배정",
                hasStaff ? asset.getCurrentStaff().getDepartment() : "-",
                asset.getCreatedAt() != null ? asset.getCreatedAt().format(DATE_FORMAT) : "-"
        );
    }
}