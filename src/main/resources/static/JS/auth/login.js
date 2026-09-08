// ============================================
// login.js - 로그인 페이지 전용
// 경로: src/main/resources/static/js/login.js
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('loginForm');
    var submitBtn = form.querySelector('.auth-submit');

    form.addEventListener('submit', function () {
        // 중복 클릭 방지 (제출 후 버튼 비활성화)
        submitBtn.disabled = true;
        submitBtn.textContent = '로그인 중...';
    });
});