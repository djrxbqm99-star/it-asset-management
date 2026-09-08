// ============================================
// auth.js - 로그인 / 회원가입 공통 (비밀번호 보이기 토글)
// 경로: src/main/resources/static/js/auth.js
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    var toggles = document.querySelectorAll('.password-toggle');

    toggles.forEach(function (btn) {
        btn.addEventListener('click', function () {
            // 버튼 바로 앞의 password input을 찾음
            var wrap = btn.closest('.password-wrap');
            var input = wrap.querySelector('input');

            if (input.type === 'password') {
                input.type = 'text';
                btn.textContent = '🙈';
            } else {
                input.type = 'password';
                btn.textContent = '👁️';
            }
        });
    });
});