// ============================================
// signup.js - 회원가입 페이지 전용
// 경로: src/main/resources/static/js/signup.js
// ============================================

document.addEventListener('DOMContentLoaded', function () {

    /* ---------- 1. 부서 선택 모달 ---------- */
    var departmentModal = document.getElementById('departmentModal');
    var departmentSelectBtn = document.getElementById('departmentSelectBtn');
    var departmentCloseBtn = document.getElementById('departmentCloseBtn');
    var departmentDisplay = document.getElementById('departmentDisplay');
    var departmentInput = document.getElementById('department');
    var departmentItems = document.querySelectorAll('.department-list li');

    departmentSelectBtn.addEventListener('click', function () {
        departmentModal.classList.add('open');
    });

    departmentCloseBtn.addEventListener('click', function () {
        departmentModal.classList.remove('open');
    });

    departmentModal.addEventListener('click', function (e) {
        if (e.target === departmentModal) {
            departmentModal.classList.remove('open');
        }
    });

    departmentItems.forEach(function (item) {
        item.addEventListener('click', function () {
            var value = item.getAttribute('data-value');

            departmentItems.forEach(function (i) { i.classList.remove('active'); });
            item.classList.add('active');

            departmentInput.value = value;
            departmentDisplay.textContent = value;
            departmentSelectBtn.classList.add('selected');

            departmentModal.classList.remove('open');
        });
    });

    /* ---------- 2. 아이디 중복 확인 (실시간, 디바운스) ---------- */
    var usernameInput = document.getElementById('username');
    var usernameCheckStatus = document.getElementById('usernameCheckStatus');
    var usernameHint = document.getElementById('usernameHint');
    var usernameAvailable = false;
    var debounceTimer = null;

    usernameInput.addEventListener('input', function () {
        var value = usernameInput.value.trim();
        usernameAvailable = false;
        usernameCheckStatus.textContent = '';
        usernameCheckStatus.className = 'check-status';
        usernameHint.textContent = '';
        usernameHint.className = 'field-hint';

        if (debounceTimer) clearTimeout(debounceTimer);

        if (value.length < 4) {
            if (value.length > 0) {
                usernameHint.textContent = '아이디는 4자 이상 입력해 주세요.';
                usernameHint.classList.add('taken');
            }
            return;
        }

        usernameCheckStatus.textContent = '확인 중...';
        usernameCheckStatus.classList.add('checking');

        debounceTimer = setTimeout(function () {
            fetch('/api/check-username?username=' + encodeURIComponent(value))
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    if (data.available) {
                        usernameAvailable = true;
                        usernameCheckStatus.textContent = '✔ 사용 가능';
                        usernameCheckStatus.className = 'check-status available';
                        usernameHint.textContent = '사용할 수 있는 아이디입니다.';
                        usernameHint.className = 'field-hint available';
                    } else {
                        usernameAvailable = false;
                        usernameCheckStatus.textContent = '✕ 중복';
                        usernameCheckStatus.className = 'check-status taken';
                        usernameHint.textContent = '이미 사용 중인 아이디입니다.';
                        usernameHint.className = 'field-hint taken';
                    }
                })
                .catch(function () {
                    usernameCheckStatus.textContent = '';
                });
        }, 400);
    });

    /* ---------- 3. 비밀번호 확인 일치 여부 ---------- */
    var passwordInput = document.getElementById('password');
    var passwordConfirmInput = document.getElementById('passwordConfirm');
    var passwordConfirmHint = document.getElementById('passwordConfirmHint');

    function checkPasswordMatch() {
        if (passwordConfirmInput.value.length === 0) {
            passwordConfirmHint.textContent = '';
            passwordConfirmHint.className = 'field-hint';
            return;
        }
        if (passwordInput.value === passwordConfirmInput.value) {
            passwordConfirmHint.textContent = '비밀번호가 일치합니다.';
            passwordConfirmHint.className = 'field-hint available';
        } else {
            passwordConfirmHint.textContent = '비밀번호가 일치하지 않습니다.';
            passwordConfirmHint.className = 'field-hint taken';
        }
    }

    passwordInput.addEventListener('input', checkPasswordMatch);
    passwordConfirmInput.addEventListener('input', checkPasswordMatch);

    /* ---------- 4. 제출 전 최종 검증 ---------- */
    var form = document.getElementById('signupForm');

    form.addEventListener('submit', function (e) {
        var problems = [];

        if (usernameInput.value.trim().length < 4) {
            problems.push('아이디를 4자 이상 입력해 주세요.');
        } else if (!usernameAvailable) {
            problems.push('아이디 중복 확인을 완료해 주세요.');
        }

        if (passwordInput.value.length < 4) {
            problems.push('비밀번호를 4자 이상 입력해 주세요.');
        }

        if (passwordInput.value !== passwordConfirmInput.value) {
            problems.push('비밀번호 확인이 일치하지 않습니다.');
        }

        if (document.getElementById('name').value.trim().length === 0) {
            problems.push('이름을 입력해 주세요.');
        }

        if (problems.length > 0) {
            e.preventDefault();
            alert(problems.join('\n'));
        }
    });
});