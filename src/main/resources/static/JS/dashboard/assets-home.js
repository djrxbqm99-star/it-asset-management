// ============================================
// assets-home.js - 로그인 후 착지 페이지(임시) 전용
// 경로: src/main/resources/static/js/dashboard/assets-home.js
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    var logoutModal = document.getElementById('logoutModal');
    var openBtn = document.getElementById('logoutOpenBtn');
    var cancelBtn = document.getElementById('logoutCancelBtn');

    function openLogoutModal() {
        logoutModal.classList.add('open');
    }

    function closeLogoutModal() {
        logoutModal.classList.remove('open');
    }

    openBtn.addEventListener('click', openLogoutModal);
    cancelBtn.addEventListener('click', closeLogoutModal);

    logoutModal.addEventListener('click', function (e) {
        if (e.target === logoutModal) {
            closeLogoutModal();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && logoutModal.classList.contains('open')) {
            closeLogoutModal();
        }
    });
});