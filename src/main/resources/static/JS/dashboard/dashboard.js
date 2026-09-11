/* =========================================================
   dashboard.js
   대시보드 화면 전용 스크립트
   - 로그아웃 확인 모달 열기/닫기 제어
   - assets-home.js와 동일한 id 규칙(logoutOpenBtn / logoutModal / logoutCancelBtn) 사용
   - Chart.js를 이용한 부서별(막대) / 상태별(도넛) 그래프 렌더링
     -> departmentLabels, departmentCounts, statusLabels, statusCounts는
        home.html의 th:inline="javascript" 블록에서 전역 변수로 주입됨
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* ===================== 로그아웃 모달 ===================== */
    const logoutOpenBtn = document.getElementById("logoutOpenBtn");
    const logoutCancelBtn = document.getElementById("logoutCancelBtn");
    const logoutModal = document.getElementById("logoutModal");

    function openLogoutModal() {
        logoutModal.classList.add("open");
    }

    function closeLogoutModal() {
        logoutModal.classList.remove("open");
    }

    if (logoutOpenBtn) {
        logoutOpenBtn.addEventListener("click", function (e) {
            e.preventDefault();
            openLogoutModal();
        });
    }

    if (logoutCancelBtn) {
        logoutCancelBtn.addEventListener("click", closeLogoutModal);
    }

    // 모달 바깥 영역 클릭 시 닫기
    if (logoutModal) {
        logoutModal.addEventListener("click", function (e) {
            if (e.target === logoutModal) {
                closeLogoutModal();
            }
        });
    }

    // ESC 키로 모달 닫기
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && logoutModal && logoutModal.classList.contains("open")) {
            closeLogoutModal();
        }
    });

    /* ===================== 부서별 자산 수 (막대 그래프) ===================== */
    const departmentCanvas = document.getElementById("departmentChart");
    if (departmentCanvas && typeof departmentLabels !== "undefined" && departmentLabels.length > 0) {
        new Chart(departmentCanvas, {
            type: "bar",
            data: {
                labels: departmentLabels,
                datasets: [{
                    label: "자산 수",
                    data: departmentCounts,
                    backgroundColor: "#2f6fed",
                    borderRadius: 8,
                    maxBarThickness: 44
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return context.parsed.y + " 건";
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 },
                        grid: { color: "#eef1f6" }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }

    /* ===================== 상태별 자산 비율 (도넛 그래프) ===================== */
    const statusCanvas = document.getElementById("statusChart");
    if (statusCanvas && typeof statusLabels !== "undefined" && statusLabels.length > 0) {
        new Chart(statusCanvas, {
            type: "doughnut",
            data: {
                labels: statusLabels,
                datasets: [{
                    data: statusCounts,
                    backgroundColor: ["#2e9e5b", "#e08a1e", "#6b7280"],
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "62%",
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: { boxWidth: 12, padding: 16 }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return context.label + ": " + context.parsed + " 건";
                            }
                        }
                    }
                }
            }
        });
    }

});