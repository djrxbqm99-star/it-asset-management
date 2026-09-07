package com.example.itassetmanagement.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "asset_assignment_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetAssignmentHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assignment_id")
    private Long assignmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false, foreignKey = @ForeignKey(name = "fk_assignment_asset"))
    private Asset asset;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false, foreignKey = @ForeignKey(name = "fk_assignment_staff"))
    private Staff staff;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    // NULL이면 현재 담당중이라는 뜻 (타임라인에서 최상단 + '현재 담당' 뱃지 처리 기준)
    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(length = 255)
    private String reason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Transient
    public boolean isCurrent() {
        return this.endDate == null;
    }
}