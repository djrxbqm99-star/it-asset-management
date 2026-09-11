package com.example.itassetmanagement.repository;

import com.example.itassetmanagement.domain.Asset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AssetRepository extends JpaRepository<Asset, Long> {

    // 자산관리번호로 단건 조회 (중복 체크 등에 사용)
    Optional<Asset> findByAssetCode(String assetCode);

    boolean existsByAssetCode(String assetCode);

    // 자산 수정 시 중복체크용 - 자기 자신(assetId)은 제외하고 검사
    boolean existsByAssetCodeAndAssetIdNot(String assetCode, Long assetId);

    // 목록 페이지네이션 (5개씩) - 상태별 필터링 (레거시, searchAssets로 대체됨)
    Page<Asset> findByStatus(String status, Pageable pageable);

    // 담당자 기준 aside 필터용 (레거시, searchAssets로 대체됨)
    Page<Asset> findByCurrentStaff_Department(String department, Pageable pageable);

    // 대시보드 통계 카드용 - 상태별 건수 집계 (전체 건수는 상속받은 count() 사용)
    long countByStatus(String status);

    // 자산 목록 aside 부서 필터 목록용 - 현재 담당자가 배정된 자산에 존재하는 부서명 중복 제거
    @Query("SELECT DISTINCT a.currentStaff.department FROM Asset a " +
            "WHERE a.currentStaff.department IS NOT NULL " +
            "ORDER BY a.currentStaff.department")
    List<String> findDistinctDepartments();

    /**
     * 대시보드 부서별 자산 수 그래프용 - 부서별 자산 건수 집계
     * 결과 Object[] : [0]=department(String), [1]=count(Long)
     * 건수 많은 부서 순으로 정렬
     */
    @Query("SELECT a.currentStaff.department, COUNT(a) FROM Asset a " +
            "WHERE a.currentStaff.department IS NOT NULL " +
            "GROUP BY a.currentStaff.department " +
            "ORDER BY COUNT(a) DESC")
    List<Object[]> countAssetsByDepartment();

    /**
     * 대시보드 하단 "최근 등록된 자산" 테이블용 - 등록일(createdAt) 기준 최신 10건
     * 주의: asset 테이블에 updated_at 컬럼이 없어 "변경"이 아닌 "등록" 기준입니다.
     */
    List<Asset> findTop10ByOrderByCreatedAtDesc();

    /**
     * 자산 목록 통합 검색 (부서 / 상태 / 검색어 조합, 페이지네이션 포함)
     * 파라미터가 null이면 해당 조건은 무시됨
     */
    @Query("SELECT a FROM Asset a WHERE " +
            "(:department IS NULL OR a.currentStaff.department = :department) AND " +
            "(:status IS NULL OR a.status = :status) AND " +
            "(:staffId IS NULL OR a.currentStaff.staffId = :staffId) AND " +
            "(:assetType IS NULL OR a.assetType = :assetType) AND " +
            "(:keyword IS NULL OR a.assetName LIKE CONCAT('%', :keyword, '%') OR a.assetCode LIKE CONCAT('%', :keyword, '%')) " +
            "ORDER BY a.assetId DESC")
    Page<Asset> searchAssets(@Param("department") String department,
                             @Param("status") String status,
                             @Param("staffId") Long staffId,
                             @Param("assetType") String assetType,
                             @Param("keyword") String keyword,
                             Pageable pageable);

    /**
     * CSV 내보내기용 - 위와 동일한 조건, 페이지네이션 없이 전체 조회 (최신 등록순)
     */
    @Query("SELECT a FROM Asset a WHERE " +
            "(:department IS NULL OR a.currentStaff.department = :department) AND " +
            "(:status IS NULL OR a.status = :status) AND " +
            "(:staffId IS NULL OR a.currentStaff.staffId = :staffId) AND " +
            "(:assetType IS NULL OR a.assetType = :assetType) AND " +
            "(:keyword IS NULL OR a.assetName LIKE CONCAT('%', :keyword, '%') OR a.assetCode LIKE CONCAT('%', :keyword, '%')) " +
            "ORDER BY a.assetId DESC")
    List<Asset> searchAssetsAll(@Param("department") String department,
                                @Param("status") String status,
                                @Param("staffId") Long staffId,
                                @Param("assetType") String assetType,
                                @Param("keyword") String keyword);
}