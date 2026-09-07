package com.example.itassetmanagement.repository;

import com.example.itassetmanagement.domain.AssetStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssetStatusHistoryRepository extends JpaRepository<AssetStatusHistory, Long> {

    // 특정 자산의 상태 변경 이력을 최신순으로 조회
    List<AssetStatusHistory> findByAsset_AssetIdOrderByChangedAtDesc(Long assetId);
}