/* =========================================================
   assets-home.js
   자산 목록 화면 전용 스크립트
   - 로그아웃 확인 모달 (common.css 기준 'open' 클래스로 토글)
   - 자산 상세 모달: 행 클릭 시 /assets/{id}/detail 을 AJAX로 불러와 삽입
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const logoutOpenBtn = document.getElementById("logoutOpenBtn");
    const logoutCancelBtn = document.getElementById("logoutCancelBtn");
    const logoutModal = document.getElementById("logoutModal");
    const detailModal = document.getElementById("detailModal");
    const searchOpenBtn = document.getElementById("searchOpenBtn");
    const searchCloseBtn = document.getElementById("searchCloseBtn");
    const searchModal = document.getElementById("searchModal");
    const registerOpenBtn = document.getElementById("registerOpenBtn");
    const registerCloseBtn = document.getElementById("registerCloseBtn");
    const registerCancelBtn = document.getElementById("registerCancelBtn");
    const registerModal = document.getElementById("registerModal");

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

    if (logoutModal) {
        logoutModal.addEventListener("click", function (e) {
            if (e.target === logoutModal) {
                closeLogoutModal();
            }
        });
    }

    if (detailModal) {
        detailModal.addEventListener("click", function (e) {
            if (e.target === detailModal) {
                closeDetailModal();
            }
        });
    }

    if (searchOpenBtn) {
        searchOpenBtn.addEventListener("click", function () {
            searchModal.classList.add("open");
        });
    }

    if (searchCloseBtn) {
        searchCloseBtn.addEventListener("click", function () {
            searchModal.classList.remove("open");
        });
    }

    if (searchModal) {
        searchModal.addEventListener("click", function (e) {
            if (e.target === searchModal) {
                searchModal.classList.remove("open");
            }
        });
    }

    if (registerOpenBtn) {
        registerOpenBtn.addEventListener("click", function () {
            registerModal.classList.add("open");
        });
    }

    if (registerCloseBtn) {
        registerCloseBtn.addEventListener("click", function () {
            registerModal.classList.remove("open");
        });
    }

    if (registerCancelBtn) {
        registerCancelBtn.addEventListener("click", function () {
            registerModal.classList.remove("open");
        });
    }

    if (registerModal) {
        registerModal.addEventListener("click", function (e) {
            if (e.target === registerModal) {
                registerModal.classList.remove("open");
            }
        });
    }

    // ESC 키로 열려있는 모달 닫기
    document.addEventListener("keydown", function (e) {
        if (e.key !== "Escape") return;
        if (logoutModal && logoutModal.classList.contains("open")) {
            closeLogoutModal();
        }
        if (detailModal && detailModal.classList.contains("open")) {
            closeDetailModal();
        }
        if (searchModal && searchModal.classList.contains("open")) {
            searchModal.classList.remove("open");
        }
        if (registerModal && registerModal.classList.contains("open")) {
            registerModal.classList.remove("open");
        }
        document.querySelectorAll(".picker-modal-box").forEach(function (box) {
            const overlay = box.closest(".modal-overlay");
            if (overlay && overlay.classList.contains("open")) {
                overlay.classList.remove("open");
            }
        });
    });

    /* =====================================================
       선택 모달 공통 로직 (부서 / 상태 / 종류 / 담당자)
       - .picker-btn 클릭 → data-picker로 지정된 모달 열기
       - .picker-list 안의 li 클릭 → 연결된 hidden input/표시 텍스트 갱신 후 모달 닫기
       ===================================================== */
    let currentPickerInputId = null;
    let currentPickerDisplayId = null;

    document.querySelectorAll(".picker-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            currentPickerInputId = btn.dataset.targetInput;
            currentPickerDisplayId = btn.dataset.targetDisplay;
            const pickerModal = document.getElementById(btn.dataset.picker);
            if (pickerModal) {
                pickerModal.classList.add("open");
            }
        });
    });

    document.querySelectorAll(".picker-list").forEach(function (list) {
        list.addEventListener("click", function (e) {
            const li = e.target.closest("li");
            if (!li) return;

            if (currentPickerInputId) {
                document.getElementById(currentPickerInputId).value = li.dataset.value;
            }
            if (currentPickerDisplayId) {
                document.getElementById(currentPickerDisplayId).textContent = li.textContent;
            }

            const overlay = list.closest(".modal-overlay");
            if (overlay) {
                overlay.classList.remove("open");
            }
        });
    });

    // 선택 모달 바깥 클릭 시 닫기 (부서/상태/종류/담당자 공통)
    document.querySelectorAll(".picker-modal-box").forEach(function (box) {
        const overlay = box.closest(".modal-overlay");
        if (!overlay) return;
        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) {
                overlay.classList.remove("open");
            }
        });
    });

});

/**
 * 자산 상세 모달 열기
 * - 테이블 행의 onclick에서 호출 (전역 함수여야 함)
 */
function openDetailModal(assetId) {
    fetch(`/assets/${assetId}/detail`)
        .then(function (res) {
            if (!res.ok) {
                throw new Error("자산 상세 정보를 불러오지 못했습니다.");
            }
            return res.text();
        })
        .then(function (html) {
            const content = document.getElementById("detailModalContent");
            content.innerHTML = html;
            document.getElementById("detailModal").classList.add("open");
        })
        .catch(function (err) {
            alert(err.message);
        });
}

/**
 * 자산 상세 모달 닫기
 * - 모달 내부 "닫기" 버튼, 인쇄 버튼 옆 닫기 버튼의 onclick에서 호출 (전역 함수여야 함)
 */
function closeDetailModal() {
    const detailModal = document.getElementById("detailModal");
    if (detailModal) {
        detailModal.classList.remove("open");
    }
}

/* =========================================================
   구매일자 캘린더 선택 모달
   - 등록 모달이 없는 화면(dashboard 등)에서는 요소가 없으므로 자동으로 무시됨
   ========================================================= */
(function () {
    const datePickerBtn = document.getElementById("datePickerBtn");
    const datePickerModal = document.getElementById("datePickerModal");

    if (!datePickerBtn || !datePickerModal) {
        return;
    }

    const calendarDays = document.getElementById("calendarDays");
    const calMonthLabel = document.getElementById("calMonthLabel");
    const calPrevBtn = document.getElementById("calPrevBtn");
    const calNextBtn = document.getElementById("calNextBtn");
    const purchaseDateValue = document.getElementById("purchaseDateValue");
    const purchaseDateDisplay = document.getElementById("purchaseDateDisplay");

    let viewYear;
    let viewMonth; // 0-indexed
    let selectedDate = null; // { year, month, day }

    function pad(n) {
        return n < 10 ? "0" + n : "" + n;
    }

    function renderCalendar() {
        calMonthLabel.textContent = viewYear + "년 " + (viewMonth + 1) + "월";
        calendarDays.innerHTML = "";

        const firstDay = new Date(viewYear, viewMonth, 1).getDay();
        const lastDate = new Date(viewYear, viewMonth + 1, 0).getDate();
        const today = new Date();

        for (let i = 0; i < firstDay; i++) {
            const blank = document.createElement("span");
            blank.className = "calendar-day calendar-day-empty";
            calendarDays.appendChild(blank);
        }

        for (let d = 1; d <= lastDate; d++) {
            const dayEl = document.createElement("span");
            dayEl.className = "calendar-day";
            dayEl.textContent = d;

            if (selectedDate && selectedDate.year === viewYear &&
                selectedDate.month === viewMonth && selectedDate.day === d) {
                dayEl.classList.add("calendar-day-selected");
            }
            if (today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === d) {
                dayEl.classList.add("calendar-day-today");
            }

            dayEl.addEventListener("click", function () {
                selectedDate = { year: viewYear, month: viewMonth, day: d };
                purchaseDateValue.value = viewYear + "-" + pad(viewMonth + 1) + "-" + pad(d);
                purchaseDateDisplay.textContent = viewYear + "년 " + (viewMonth + 1) + "월 " + d + "일";
                datePickerModal.classList.remove("open");
            });

            calendarDays.appendChild(dayEl);
        }
    }

    datePickerBtn.addEventListener("click", function () {
        const base = selectedDate ? new Date(selectedDate.year, selectedDate.month, 1) : new Date();
        viewYear = base.getFullYear();
        viewMonth = base.getMonth();
        renderCalendar();
        datePickerModal.classList.add("open");
    });

    calPrevBtn.addEventListener("click", function () {
        viewMonth--;
        if (viewMonth < 0) {
            viewMonth = 11;
            viewYear--;
        }
        renderCalendar();
    });

    calNextBtn.addEventListener("click", function () {
        viewMonth++;
        if (viewMonth > 11) {
            viewMonth = 0;
            viewYear++;
        }
        renderCalendar();
    });

    datePickerModal.addEventListener("click", function (e) {
        if (e.target === datePickerModal) {
            datePickerModal.classList.remove("open");
        }
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && datePickerModal.classList.contains("open")) {
            datePickerModal.classList.remove("open");
        }
    });
})();