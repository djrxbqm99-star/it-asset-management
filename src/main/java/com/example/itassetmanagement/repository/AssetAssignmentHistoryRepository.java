package com.example.itassetmanagement.repository;

import com.example.itassetmanagement.domain.AssetAssignmentHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssetAssignmentHistoryRepository extends JpaRepository<AssetAssignmentHistory, Long> {

    // 특정 자산의 인수인계 이력 전체를 최신순으로 조회 (타임라인 UI용)
    // start_date 기준 내림차순 정렬 → 최근 담당자가 위로 오게 됨
    List<AssetAssignmentHistory> findByAsset_AssetIdOrderByStartDateDesc(Long assetId);

    // 특정 자산의 "현재 담당" 이력 1건 조회 (end_date가 NULL인 것)
    Optional<AssetAssignmentHistory> findByAsset_AssetIdAndEndDateIsNull(Long assetId);

    // 특정 직원이 현재 담당중인 자산 이력 목록
    List<AssetAssignmentHistory> findByStaff_StaffIdAndEndDateIsNull(Long staffId);
}