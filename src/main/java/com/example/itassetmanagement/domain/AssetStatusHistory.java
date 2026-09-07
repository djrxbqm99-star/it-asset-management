package com.example.itassetmanagement.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "asset_status_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "status_history_id")
    private Long statusHistoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false, foreignKey = @ForeignKey(name = "fk_status_asset"))
    private Asset asset;

    @Column(name = "changed_status", nullable = false, length = 20)
    private String changedStatus;

    @Column(length = 255)
    private String reason;

    // 상태를 변경한 직원 (FK, NULL 가능)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by", foreignKey = @ForeignKey(name = "fk_status_changed_by"))
    private Staff changedBy;

    @Column(name = "changed_at", nullable = false, updatable = false)
    private LocalDateTime changedAt;

    @PrePersist
    protected void onCreate() {
        this.changedAt = LocalDateTime.now();
    }
}