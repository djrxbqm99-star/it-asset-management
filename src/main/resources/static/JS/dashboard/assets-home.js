/* =========================================================
   assets-home.js
   자산 목록 화면 전용 스크립트
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const logoutOpenBtn = document.getElementById("logoutOpenBtn");
    const logoutCancelBtn = document.getElementById("logoutCancelBtn");
    const logoutModal = document.getElementById("logoutModal");
    const detailModal = document.getElementById("detailModal");
    const searchOpenBtn = document.getElementById("searchOpenBtn");
    const searchCloseBtn = document.getElementById("searchCloseBtn");
    const searchModal = document.getElementById("searchModal");
    const statusFilterOpenBtn = document.getElementById("statusFilterOpenBtn");
    const statusFilterModal = document.getElementById("statusFilterModal");
    const registerOpenBtn = document.getElementById("registerOpenBtn");
    const registerCloseBtn = document.getElementById("registerCloseBtn");
    const registerCancelBtn = document.getElementById("registerCancelBtn");
    const registerModal = document.getElementById("registerModal");
    const editModal = document.getElementById("editModal");
    const editCloseBtn = document.getElementById("editCloseBtn");
    const editCancelBtn = document.getElementById("editCancelBtn");
    const statusChangeModal = document.getElementById("statusChangeModal");
    const statusChangeCloseBtn = document.getElementById("statusChangeCloseBtn");
    const statusChangeCancelBtn = document.getElementById("statusChangeCancelBtn");
    const assetsGuideOpenBtn = document.getElementById("assetsGuideOpenBtn");
    const assetsGuideCloseBtn = document.getElementById("assetsGuideCloseBtn");
    const assetsGuideCloseCta = document.getElementById("assetsGuideCloseCta");
    const assetsGuideModal = document.getElementById("assetsGuideModal");
    const handoverModal = document.getElementById("handoverModal");
    const handoverCloseBtn = document.getElementById("handoverCloseBtn");
    const handoverCancelBtn = document.getElementById("handoverCancelBtn");

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

    if (statusFilterOpenBtn) {
        statusFilterOpenBtn.addEventListener("click", function () {
            statusFilterModal.classList.add("open");
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

    if (editCloseBtn) {
        editCloseBtn.addEventListener("click", closeEditModal);
    }

    if (editCancelBtn) {
        editCancelBtn.addEventListener("click", closeEditModal);
    }

    if (editModal) {
        editModal.addEventListener("click", function (e) {
            if (e.target === editModal) {
                closeEditModal();
            }
        });
    }

    if (statusChangeCloseBtn) {
        statusChangeCloseBtn.addEventListener("click", closeStatusChangeModal);
    }

    if (statusChangeCancelBtn) {
        statusChangeCancelBtn.addEventListener("click", closeStatusChangeModal);
    }

    if (statusChangeModal) {
        statusChangeModal.addEventListener("click", function (e) {
            if (e.target === statusChangeModal) {
                closeStatusChangeModal();
            }
        });
    }

    if (assetsGuideOpenBtn) {
        assetsGuideOpenBtn.addEventListener("click", function () {
            assetsGuideModal.classList.add("open");
        });
    }

    if (assetsGuideCloseBtn) {
        assetsGuideCloseBtn.addEventListener("click", function () {
            assetsGuideModal.classList.remove("open");
        });
    }

    if (assetsGuideCloseCta) {
        assetsGuideCloseCta.addEventListener("click", function () {
            assetsGuideModal.classList.remove("open");
        });
    }

    if (assetsGuideModal) {
        assetsGuideModal.addEventListener("click", function (e) {
            if (e.target === assetsGuideModal) {
                assetsGuideModal.classList.remove("open");
            }
        });
    }

    if (handoverCloseBtn) {
        handoverCloseBtn.addEventListener("click", closeHandoverModal);
    }

    if (handoverCancelBtn) {
        handoverCancelBtn.addEventListener("click", closeHandoverModal);
    }

    if (handoverModal) {
        handoverModal.addEventListener("click", function (e) {
            if (e.target === handoverModal) {
                closeHandoverModal();
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
        if (editModal && editModal.classList.contains("open")) {
            closeEditModal();
        }
        if (statusChangeModal && statusChangeModal.classList.contains("open")) {
            closeStatusChangeModal();
        }
        if (assetsGuideModal && assetsGuideModal.classList.contains("open")) {
            assetsGuideModal.classList.remove("open");
        }
        if (handoverModal && handoverModal.classList.contains("open")) {
            closeHandoverModal();
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
       ===================================================== */
    let currentPickerInputId = null;
    let currentPickerDisplayId = null;

    document.querySelectorAll(".picker-btn:not(.date-picker-btn)").forEach(function (btn) {
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
            const li = e.target.closest("li[data-value]");
            if (!li) return;

            if (currentPickerInputId) {
                const input = document.getElementById(currentPickerInputId);
                if (input) input.value = li.dataset.value;
            }
            if (currentPickerDisplayId) {
                const display = document.getElementById(currentPickerDisplayId);
                if (display) display.textContent = li.textContent;
            }

            const overlay = list.closest(".modal-overlay");
            if (overlay) {
                overlay.classList.remove("open");
            }
        });
    });

    document.querySelectorAll(".picker-modal-box").forEach(function (box) {
        const overlay = box.closest(".modal-overlay");
        if (!overlay) return;
        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) {
                overlay.classList.remove("open");
            }
        });
    });

    /* =====================================================
       구매일자 캘린더 (등록/수정 모달 공용, 여러 버튼 지원)
       ===================================================== */
    const datePickerModal = document.getElementById("datePickerModal");
    if (datePickerModal) {
        const calendarDays = document.getElementById("calendarDays");
        const calMonthLabel = document.getElementById("calMonthLabel");
        const calPrevBtn = document.getElementById("calPrevBtn");
        const calNextBtn = document.getElementById("calNextBtn");

        let viewYear, viewMonth;
        let currentDateInputId = null;
        let currentDateDisplayId = null;
        let selectedDate = null;

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
                    if (currentDateInputId) {
                        document.getElementById(currentDateInputId).value =
                            viewYear + "-" + pad(viewMonth + 1) + "-" + pad(d);
                    }
                    if (currentDateDisplayId) {
                        document.getElementById(currentDateDisplayId).textContent =
                            viewYear + "년 " + (viewMonth + 1) + "월 " + d + "일";
                    }
                    datePickerModal.classList.remove("open");
                });

                calendarDays.appendChild(dayEl);
            }
        }

        document.querySelectorAll(".date-picker-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
                currentDateInputId = btn.dataset.targetInput;
                currentDateDisplayId = btn.dataset.targetDisplay;
                selectedDate = null;
                const now = new Date();
                viewYear = now.getFullYear();
                viewMonth = now.getMonth();
                renderCalendar();
                datePickerModal.classList.add("open");
            });
        });

        if (calPrevBtn) {
            calPrevBtn.addEventListener("click", function () {
                viewMonth--;
                if (viewMonth < 0) { viewMonth = 11; viewYear--; }
                renderCalendar();
            });
        }

        if (calNextBtn) {
            calNextBtn.addEventListener("click", function () {
                viewMonth++;
                if (viewMonth > 11) { viewMonth = 0; viewYear++; }
                renderCalendar();
            });
        }

        datePickerModal.addEventListener("click", function (e) {
            if (e.target === datePickerModal) {
                datePickerModal.classList.remove("open");
            }
        });
    }

    /* =====================================================
       담당자 선택 모달 - 이름 검색 + 부서 칩 필터
       (검색/등록/수정 모달 모두에서 재사용되므로 querySelectorAll로 전부 처리)
       ===================================================== */
    const staffSearchInput = document.getElementById("staffPickerSearch");
    const staffDeptChips = document.getElementById("staffPickerDeptChips");
    const staffListEl = document.getElementById("staffPickerList");

    if (staffSearchInput && staffListEl) {
        let activeDept = "";

        function filterStaffList() {
            const keyword = staffSearchInput.value.trim().toLowerCase();
            let visibleCount = 0;

            staffListEl.querySelectorAll("li[data-value]").forEach(function (li) {
                if (li.dataset.value === "") {
                    const show = keyword === "" && activeDept === "";
                    li.style.display = show ? "" : "none";
                    if (show) visibleCount++;
                    return;
                }

                const name = (li.dataset.name || "").toLowerCase();
                const dept = li.dataset.department || "";
                const matchesKeyword = keyword === "" || name.includes(keyword);
                const matchesDept = activeDept === "" || dept === activeDept;
                const show = matchesKeyword && matchesDept;
                li.style.display = show ? "" : "none";
                if (show) visibleCount++;
            });

            let emptyMsg = staffListEl.querySelector(".picker-empty-msg");
            if (visibleCount === 0) {
                if (!emptyMsg) {
                    emptyMsg = document.createElement("li");
                    emptyMsg.className = "picker-empty-msg";
                    emptyMsg.textContent = "검색 결과가 없습니다.";
                    staffListEl.appendChild(emptyMsg);
                }
            } else if (emptyMsg) {
                emptyMsg.remove();
            }
        }

        staffSearchInput.addEventListener("input", filterStaffList);

        if (staffDeptChips) {
            staffDeptChips.querySelectorAll(".picker-dept-chip").forEach(function (chip) {
                chip.addEventListener("click", function () {
                    staffDeptChips.querySelectorAll(".picker-dept-chip").forEach(function (c) {
                        c.classList.remove("active");
                    });
                    chip.classList.add("active");
                    activeDept = chip.dataset.dept || "";
                    filterStaffList();
                });
            });
        }

        // 담당자 선택 버튼이 검색/등록/수정 모달 3곳에 있으므로 전부 리스너 연결
        document.querySelectorAll('.picker-btn[data-picker="staffPickerModal"]').forEach(function (btn) {
            btn.addEventListener("click", function () {
                staffSearchInput.value = "";
                activeDept = "";
                if (staffDeptChips) {
                    staffDeptChips.querySelectorAll(".picker-dept-chip").forEach(function (c) {
                        c.classList.remove("active");
                    });
                    const allChip = staffDeptChips.querySelector('.picker-dept-chip[data-dept=""]');
                    if (allChip) allChip.classList.add("active");
                }
                filterStaffList();
                setTimeout(function () {
                    staffSearchInput.focus();
                }, 50);
            });
        });
    }

    /* =====================================================
       자산관리번호 실시간 중복체크 (등록 / 수정 공용)
       ===================================================== */
    setupDuplicateCheck("assetCode", "assetCodeHint", null);
    setupDuplicateCheck("editAssetCode", "editAssetCodeHint", "editForm");

    function setupDuplicateCheck(inputId, hintId, formIdForExcludeId) {
        const input = document.getElementById(inputId);
        const hint = document.getElementById(hintId);
        if (!input || !hint) return;

        let debounceTimer = null;

        input.addEventListener("input", function () {
            clearTimeout(debounceTimer);
            const code = input.value.trim();

            if (code === "") {
                hint.textContent = "";
                hint.className = "field-hint";
                return;
            }

            debounceTimer = setTimeout(function () {
                let url = "/api/assets/check-code?code=" + encodeURIComponent(code);

                if (formIdForExcludeId) {
                    const form = document.getElementById(formIdForExcludeId);
                    const excludeId = form ? form.dataset.assetId : null;
                    if (excludeId) {
                        url += "&excludeId=" + encodeURIComponent(excludeId);
                    }
                }

                fetch(url)
                    .then(function (res) { return res.json(); })
                    .then(function (data) {
                        if (data.available) {
                            hint.textContent = "✅ 사용 가능한 관리번호입니다.";
                            hint.className = "field-hint field-hint-ok";
                        } else {
                            hint.textContent = "❌ 이미 사용중인 관리번호입니다.";
                            hint.className = "field-hint field-hint-error";
                        }
                    })
                    .catch(function () {
                        hint.textContent = "";
                    });
            }, 350);
        });
    }

});

/**
 * 자산 상세 모달 열기
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
 */
function closeDetailModal() {
    const detailModal = document.getElementById("detailModal");
    if (detailModal) {
        detailModal.classList.remove("open");
    }
}

/**
 * 자산 수정 모달 열기
 * - 상세 모달의 "수정" 버튼에서 호출 (전역 함수)
 * - /assets/{id}/edit-data 로 원본 데이터를 받아 폼에 채워넣음
 * - 본인이 등록한 자산이 아니면 서버가 403을 주고, 여기서는 안내 후 중단
 */
function openEditModal(assetId) {
    fetch(`/assets/${assetId}/edit-data`)
        .then(function (res) {
            if (res.status === 403) {
                throw new Error("본인이 등록한 자산만 수정할 수 있습니다.");
            }
            if (!res.ok) {
                throw new Error("자산 정보를 불러오지 못했습니다.");
            }
            return res.json();
        })
        .then(function (data) {
            closeDetailModal();

            const form = document.getElementById("editForm");
            form.action = `/assets/${assetId}/edit`;
            form.dataset.assetId = assetId;

            document.getElementById("editAssetCode").value = data.assetCode || "";
            document.getElementById("editAssetName").value = data.assetName || "";
            document.getElementById("editAssetTypeValue").value = data.assetType || "";
            document.getElementById("editAssetTypeDisplay").textContent = data.assetType || "종류를 선택하세요";
            document.getElementById("editPurchaseDateValue").value = data.purchaseDate || "";
            document.getElementById("editPurchaseDateDisplay").textContent =
                data.purchaseDate ? data.purchaseDate : "날짜를 선택하세요";

            const hint = document.getElementById("editAssetCodeHint");
            if (hint) {
                hint.textContent = "";
                hint.className = "field-hint";
            }

            document.getElementById("editModal").classList.add("open");
        })
        .catch(function (err) {
            alert(err.message);
        });
}

/**
 * 자산 수정 모달 닫기
 */
function closeEditModal() {
    const editModal = document.getElementById("editModal");
    if (editModal) {
        editModal.classList.remove("open");
    }
}

/**
 * 상태 변경 모달 열기
 * - 상세 모달의 "상태 변경" 버튼에서 호출 (전역 함수)
 */
function openStatusChangeModal(assetId, currentStatus) {
    closeDetailModal();

    const form = document.getElementById("statusChangeForm");
    form.action = `/assets/${assetId}/status-change`;

    document.getElementById("statusChangeValue").value = currentStatus || "정상";
    document.getElementById("statusChangeDisplay").textContent = currentStatus || "정상";
    document.getElementById("statusChangeReason").value = "";
    document.getElementById("statusChangeAction").value = "";

    document.getElementById("statusChangeModal").classList.add("open");
}

/**
 * 상태 변경 모달 닫기
 */
function closeStatusChangeModal() {
    const statusChangeModal = document.getElementById("statusChangeModal");
    if (statusChangeModal) {
        statusChangeModal.classList.remove("open");
    }
}

/**
 * 인수인계 모달 열기
 * - 상세 모달의 "인수인계" 버튼에서 호출 (전역 함수)
 */
function openHandoverModal(assetId, currentStaffId, currentStaffLabel) {
    closeDetailModal();

    const form = document.getElementById("handoverForm");
    form.action = `/assets/${assetId}/handover`;

    document.getElementById("handoverCurrentStaff").textContent = currentStaffLabel || "담당자 없음";
    document.getElementById("handoverStaffIdValue").value = "";
    document.getElementById("handoverStaffDisplay").textContent = "담당자를 선택하세요";
    document.getElementById("handoverReason").value = "";

    document.getElementById("handoverModal").classList.add("open");
}

/**
 * 인수인계 모달 닫기
 */
function closeHandoverModal() {
    const handoverModal = document.getElementById("handoverModal");
    if (handoverModal) {
        handoverModal.classList.remove("open");
    }
}