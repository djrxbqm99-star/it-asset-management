package com.example.itassetmanagement.repository;

import com.example.itassetmanagement.domain.MaintenanceHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaintenanceHistoryRepository extends JpaRepository<MaintenanceHistory, Long> {

    // 특정 자산의 유지보수 이력을 최신순으로 조회
    List<MaintenanceHistory> findByAsset_AssetIdOrderByMaintenanceDateDesc(Long assetId);
}