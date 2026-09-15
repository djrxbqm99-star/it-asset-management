/* ============================================
   admin.js - 회장님 전용 관리자 페이지 전용 스크립트
   경로: src/main/resources/static/js/admin/admin.js
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initFontSizeToggle();
    initLogoutModal();
    initCharts();
});

/* ---------- 큰 글씨 모드 토글 ---------- */
function initFontSizeToggle() {
    const body = document.getElementById('adminBody');
    const toggleBtn = document.getElementById('fontToggleBtn');
    if (!body || !toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
        const isBig = body.classList.toggle('big-font');
        toggleBtn.classList.toggle('active', isBig);
        toggleBtn.title = isBig ? '기본 글씨 크기로' : '큰 글씨 모드';
    });
}

/* ---------- 로그아웃 확인 모달 ---------- */
function initLogoutModal() {
    const openBtn = document.getElementById('logoutOpenBtn');
    const cancelBtn = document.getElementById('logoutCancelBtn');
    const modal = document.getElementById('logoutModal');
    if (!openBtn || !modal) return;

    openBtn.addEventListener('click', () => modal.classList.add('open'));
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => modal.classList.remove('open'));
    }
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
    });
}

/* ---------- 그래프 (부서별 막대 / 상태별 도넛) ---------- */
function initCharts() {
    if (typeof Chart === 'undefined') return;

    // 부서별 자산 수 - 막대 그래프
    const deptCanvas = document.getElementById('adminDepartmentChart');
    if (deptCanvas && typeof departmentLabels !== 'undefined' && departmentLabels.length > 0) {
        new Chart(deptCanvas, {
            type: 'bar',
            data: {
                labels: departmentLabels,
                datasets: [{
                    label: '자산 건수',
                    data: departmentCounts,
                    backgroundColor: '#8CA985',
                    borderRadius: 8,
                    maxBarThickness: 46
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 } }
                }
            }
        });
    }

    // 상태별 자산 비율 - 도넛 그래프
    const statusCanvas = document.getElementById('adminStatusChart');
    if (statusCanvas && typeof statusLabels !== 'undefined' && statusLabels.length > 0) {
        new Chart(statusCanvas, {
            type: 'doughnut',
            data: {
                labels: statusLabels,
                datasets: [{
                    data: statusCounts,
                    backgroundColor: ['#4C9A6A', '#D19A3D', '#B5615A'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 16, font: { size: 13 } } }
                }
            }
        });
    }
}