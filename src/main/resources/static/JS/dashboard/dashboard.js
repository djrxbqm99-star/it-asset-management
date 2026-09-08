/* =========================================================
   dashboard.js
   대시보드 화면 전용 스크립트
   - 로그아웃 확인 모달 열기/닫기 제어
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const btnLogout = document.getElementById("btnLogout");
    const btnLogoutCancel = document.getElementById("btnLogoutCancel");
    const logoutModalOverlay = document.getElementById("logoutModalOverlay");

    function openLogoutModal() {
        logoutModalOverlay.classList.add("active");
    }

    function closeLogoutModal() {
        logoutModalOverlay.classList.remove("active");
    }

    if (btnLogout) {
        btnLogout.addEventListener("click", openLogoutModal);
    }

    if (btnLogoutCancel) {
        btnLogoutCancel.addEventListener("click", closeLogoutModal);
    }

    // 모달 바깥 영역 클릭 시 닫기
    if (logoutModalOverlay) {
        logoutModalOverlay.addEventListener("click", function (e) {
            if (e.target === logoutModalOverlay) {
                closeLogoutModal();
            }
        });
    }

    // ESC 키로 모달 닫기
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && logoutModalOverlay.classList.contains("active")) {
            closeLogoutModal();
        }
    });

});