// ============================================
// home.js - 홈(랜딩) 페이지 전용
// 경로: src/main/resources/static/js/home.js
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    var guideModal = document.getElementById('guideModal');
    var openBtn = document.getElementById('guideOpenBtn');
    var closeBtn = document.getElementById('guideCloseBtn');
    var closeCta = document.getElementById('guideCloseCta');

    function openGuide(e) {
        if (e) e.preventDefault();
        guideModal.classList.add('open');
    }

    function closeGuide() {
        guideModal.classList.remove('open');
    }

    openBtn.addEventListener('click', openGuide);
    closeBtn.addEventListener('click', closeGuide);
    closeCta.addEventListener('click', closeGuide);

    // 모달 바깥(오버레이) 클릭 시 닫기
    guideModal.addEventListener('click', function (e) {
        if (e.target === guideModal) {
            closeGuide();
        }
    });

    // ESC 키로 닫기
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && guideModal.classList.contains('open')) {
            closeGuide();
        }
    });
});