package com.example.itassetmanagement.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maintenance_id")
    private Long maintenanceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false, foreignKey = @ForeignKey(name = "fk_maintenance_asset"))
    private Asset asset;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false, foreignKey = @ForeignKey(name = "fk_maintenance_staff"))
    private Staff staff;

    @Column(name = "action_content", nullable = false, length = 500)
    private String actionContent;

    @Column(name = "maintenance_date", nullable = false, updatable = false)
    private LocalDateTime maintenanceDate;

    @PrePersist
    protected void onCreate() {
        this.maintenanceDate = LocalDateTime.now();
    }
}