package com.example.itassetmanagement.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "asset")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "asset_id")
    private Long assetId;

    @Column(name = "asset_code", nullable = false, unique = true, length = 30)
    private String assetCode;

    @Column(name = "asset_name", nullable = false, length = 100)
    private String assetName;

    @Column(name = "asset_type", nullable = false, length = 30)
    private String assetType;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "정상";

    // 현재 담당 직원 (FK, NULL 가능)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_staff_id", foreignKey = @ForeignKey(name = "fk_asset_current_staff"))
    private Staff currentStaff;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "정상";
        }
    }
}