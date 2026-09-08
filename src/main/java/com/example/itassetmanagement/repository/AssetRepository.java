package com.example.itassetmanagement.repository;

import com.example.itassetmanagement.domain.Asset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AssetRepository extends JpaRepository<Asset, Long> {

    // 자산관리번호로 단건 조회 (중복 체크 등에 사용)
    Optional<Asset> findByAssetCode(String assetCode);

    boolean existsByAssetCode(String assetCode);

    // 목록 페이지네이션 (5개씩) - 상태별 필터링
    Page<Asset> findByStatus(String status, Pageable pageable);

    // 목록 페이지네이션 (5개씩) - 전체
    Page<Asset> findAll(Pageable pageable);

    // 담당자 기준 aside 필터용 (부서별)
    Page<Asset> findByCurrentStaff_Department(String department, Pageable pageable);

    // 대시보드 통계 카드용 - 상태별 건수 집계 (전체 건수는 상속받은 count() 사용)
    long countByStatus(String status);
}