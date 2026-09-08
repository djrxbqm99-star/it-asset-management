/* =========================================================
   dashboard.js
   대시보드 화면 전용 스크립트
   - 로그아웃 확인 모달 열기/닫기 제어
   - assets-home.js와 동일한 id 규칙(logoutOpenBtn / logoutModal / logoutCancelBtn) 사용
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

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

});