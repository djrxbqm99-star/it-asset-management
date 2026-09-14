/* =========================================================
   dashboard.js
   대시보드 화면 전용 스크립트

   포함 기능:
   1. 로그아웃 확인 모달 열기/닫기
   2. Chart.js 로컬 파일 기반 부서별(막대) / 상태별(도넛) 그래프
      -> departmentLabels, departmentCounts, statusLabels, statusCounts는
         home.html의 th:inline="javascript" 블록에서 전역 변수로 주입됨
   3. 통계 카드 클릭 -> "상태별 자산 목록" 모달 (서버 페이지네이션, 5건씩)
   4. 최근 등록된 자산 목록 -> 클라이언트 사이드 페이지네이션 (5건씩)
   5. 자산 상세 모달 + 수정/인수인계/상태변경 모달
      (자산 목록 화면 assets-home.js와 완전히 동일한 방식으로 동작,
       /assets/{id}/detail, /assets/{id}/edit-data, /assets/{id}/edit,
       /assets/{id}/handover, /assets/{id}/status-change 를 그대로 재사용)
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* ===================== 요소 참조 ===================== */
    const logoutOpenBtn = document.getElementById("logoutOpenBtn");
    const logoutCancelBtn = document.getElementById("logoutCancelBtn");
    const logoutModal = document.getElementById("logoutModal");

    const detailModal = document.getElementById("detailModal");

    const editModal = document.getElementById("editModal");
    const editCloseBtn = document.getElementById("editCloseBtn");
    const editCancelBtn = document.getElementById("editCancelBtn");

    const handoverModal = document.getElementById("handoverModal");
    const handoverCloseBtn = document.getElementById("handoverCloseBtn");
    const handoverCancelBtn = document.getElementById("handoverCancelBtn");

    const statusChangeModal = document.getElementById("statusChangeModal");
    const statusChangeCloseBtn = document.getElementById("statusChangeCloseBtn");
    const statusChangeCancelBtn = document.getElementById("statusChangeCancelBtn");

    /* ===================== 로그아웃 모달 ===================== */
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
            if (e.target === logoutModal) closeLogoutModal();
        });
    }

    /* ===================== 자산 상세 모달 바깥 클릭 닫기 ===================== */
    if (detailModal) {
        detailModal.addEventListener("click", function (e) {
            if (e.target === detailModal) closeDetailModal();
        });
    }

    /* ===================== 자산 수정 모달 ===================== */
    if (editCloseBtn) editCloseBtn.addEventListener("click", closeEditModal);
    if (editCancelBtn) editCancelBtn.addEventListener("click", closeEditModal);
    if (editModal) {
        editModal.addEventListener("click", function (e) {
            if (e.target === editModal) closeEditModal();
        });
    }

    /* ===================== 인수인계 모달 ===================== */
    if (handoverCloseBtn) handoverCloseBtn.addEventListener("click", closeHandoverModal);
    if (handoverCancelBtn) handoverCancelBtn.addEventListener("click", closeHandoverModal);
    if (handoverModal) {
        handoverModal.addEventListener("click", function (e) {
            if (e.target === handoverModal) closeHandoverModal();
        });
    }

    /* ===================== 상태 변경 모달 ===================== */
    if (statusChangeCloseBtn) statusChangeCloseBtn.addEventListener("click", closeStatusChangeModal);
    if (statusChangeCancelBtn) statusChangeCancelBtn.addEventListener("click", closeStatusChangeModal);
    if (statusChangeModal) {
        statusChangeModal.addEventListener("click", function (e) {
            if (e.target === statusChangeModal) closeStatusChangeModal();
        });
    }

    /* ===================== ESC 키로 열려있는 모달 전부 닫기 ===================== */
    document.addEventListener("keydown", function (e) {
        if (e.key !== "Escape") return;
        if (logoutModal && logoutModal.classList.contains("open")) closeLogoutModal();
        if (detailModal && detailModal.classList.contains("open")) closeDetailModal();
        if (editModal && editModal.classList.contains("open")) closeEditModal();
        if (handoverModal && handoverModal.classList.contains("open")) closeHandoverModal();
        if (statusChangeModal && statusChangeModal.classList.contains("open")) closeStatusChangeModal();
        if (statusListModal && statusListModal.classList.contains("open")) closeStatusListModal();
        document.querySelectorAll(".picker-modal-box").forEach(function (box) {
            const overlay = box.closest(".modal-overlay");
            if (overlay && overlay.classList.contains("open")) overlay.classList.remove("open");
        });
    });

    /* ===================== 부서별 자산 수 (막대 그래프) ===================== */
    const departmentCanvas = document.getElementById("departmentChart");
    if (departmentCanvas && typeof Chart !== "undefined" && typeof departmentLabels !== "undefined" && departmentLabels.length > 0) {
        new Chart(departmentCanvas, {
            type: "bar",
            data: {
                labels: departmentLabels,
                datasets: [{
                    label: "자산 수",
                    data: departmentCounts,
                    backgroundColor: "#2f6fed",
                    borderRadius: 8,
                    maxBarThickness: 44
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return context.parsed.y + " 건";
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 },
                        grid: { color: "#eef1f6" }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    } else if (departmentCanvas && typeof Chart === "undefined") {
        console.error("[대시보드] Chart.js가 로드되지 않았습니다. /js/vendor/chart.umd.min.js 파일이 실제로 존재하는지 확인해주세요.");
    }

    /* ===================== 상태별 자산 비율 (도넛 그래프) ===================== */
    const statusCanvas = document.getElementById("statusChart");
    if (statusCanvas && typeof Chart !== "undefined" && typeof statusLabels !== "undefined" && statusLabels.length > 0) {
        new Chart(statusCanvas, {
            type: "doughnut",
            data: {
                labels: statusLabels,
                datasets: [{
                    data: statusCounts,
                    backgroundColor: ["#2e9e5b", "#e08a1e", "#6b7280"],
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "62%",
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: { boxWidth: 12, padding: 16 }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return context.label + ": " + context.parsed + " 건";
                            }
                        }
                    }
                }
            }
        });
    } else if (statusCanvas && typeof Chart === "undefined") {
        console.error("[대시보드] Chart.js가 로드되지 않았습니다. /js/vendor/chart.umd.min.js 파일이 실제로 존재하는지 확인해주세요.");
    }

    /* ===================== 최근 등록된 자산 목록: 클라이언트 페이지네이션 (5건씩) ===================== */
    const recentRows = Array.from(document.querySelectorAll("#recentTable .recent-row"));
    const recentPaginationEl = document.getElementById("recentPagination");
    const RECENT_PAGE_SIZE = 5;

    function renderRecentPage(pageIndex) {
        const totalPages = Math.ceil(recentRows.length / RECENT_PAGE_SIZE);

        recentRows.forEach(function (row, idx) {
            const belongsToPage = Math.floor(idx / RECENT_PAGE_SIZE) === pageIndex;
            row.classList.toggle("recent-row-hidden", !belongsToPage);
        });

        if (!recentPaginationEl) return;
        recentPaginationEl.innerHTML = "";
        if (totalPages <= 1) return;

        for (let i = 0; i < totalPages; i++) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "page-link" + (i === pageIndex ? " page-active" : "");
            btn.textContent = String(i + 1);
            btn.addEventListener("click", function () {
                renderRecentPage(i);
            });
            recentPaginationEl.appendChild(btn);
        }
    }

    if (recentRows.length > 0) {
        renderRecentPage(0);
    }

    /* ===================== 통계 카드 클릭 -> 상태별 자산 목록 모달 ===================== */
    const statusListModal = document.getElementById("statusListModal");
    const statusListCloseBtn = document.getElementById("statusListCloseBtn");
    const statusListIcon = document.getElementById("statusListIcon");
    const statusListTitle = document.getElementById("statusListTitle");
    const statusListSubtitle = document.getElementById("statusListSubtitle");
    const statusListLoading = document.getElementById("statusListLoading");
    const statusListTable = document.getElementById("statusListTable");
    const statusListTbody = document.getElementById("statusListTbody");
    const statusListEmpty = document.getElementById("statusListEmpty");
    const statusListPagination = document.getElementById("statusListPagination");

    function openStatusListModal(status, label, icon) {
        statusListTitle.textContent = label;
        statusListIcon.textContent = icon;
        statusListModal.classList.add("open");
        loadStatusListPage(status, 0);
    }

    function closeStatusListModal() {
        statusListModal.classList.remove("open");
    }

    function loadStatusListPage(status, page) {
        statusListLoading.style.display = "block";
        statusListTable.style.display = "none";
        statusListEmpty.style.display = "none";
        statusListPagination.innerHTML = "";

        const url = "/dashboard/assets-by-status?status=" + encodeURIComponent(status) + "&page=" + page;

        fetch(url)
            .then(function (res) {
                if (!res.ok) throw new Error("목록을 불러오지 못했습니다.");
                return res.json();
            })
            .then(function (data) {
                statusListLoading.style.display = "none";
                statusListSubtitle.textContent = data.totalElements + "건의 자산이 있습니다";

                if (!data.content || data.content.length === 0) {
                    statusListEmpty.style.display = "block";
                    return;
                }

                statusListTable.style.display = "table";
                statusListTbody.innerHTML = "";

                data.content.forEach(function (asset) {
                    const tr = document.createElement("tr");
                    tr.innerHTML =
                        "<td>" + asset.assetCode + "</td>" +
                        "<td>" + asset.assetName + "</td>" +
                        "<td>" + asset.assetType + "</td>" +
                        "<td>" + asset.staffName + "</td>" +
                        "<td>" + asset.department + "</td>";
                    tr.addEventListener("click", function () {
                        closeStatusListModal();
                        openDetailModal(asset.assetId);
                    });
                    statusListTbody.appendChild(tr);
                });

                renderStatusListPagination(status, data.number, data.totalPages);
            })
            .catch(function (err) {
                statusListLoading.style.display = "none";
                statusListEmpty.textContent = err.message || "목록을 불러오지 못했습니다.";
                statusListEmpty.style.display = "block";
            });
    }

    function renderStatusListPagination(status, currentPage, totalPages) {
        statusListPagination.innerHTML = "";
        if (totalPages <= 1) return;

        for (let i = 0; i < totalPages; i++) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "page-link" + (i === currentPage ? " page-active" : "");
            btn.textContent = String(i + 1);
            btn.addEventListener("click", function () {
                loadStatusListPage(status, i);
            });
            statusListPagination.appendChild(btn);
        }
    }

    document.querySelectorAll(".stat-card[data-status]").forEach(function (card) {
        card.addEventListener("click", function () {
            openStatusListModal(card.dataset.status, card.dataset.statusLabel, card.dataset.statusIcon);
        });
    });

    if (statusListCloseBtn) statusListCloseBtn.addEventListener("click", closeStatusListModal);
    if (statusListModal) {
        statusListModal.addEventListener("click", function (e) {
            if (e.target === statusListModal) closeStatusListModal();
        });
    }

    /* =====================================================
       선택 모달 공통 로직 (종류 / 상태 / 담당자)
       - 자산 목록 화면(assets-home.js)과 완전히 동일한 방식
       ===================================================== */
    let currentPickerInputId = null;
    let currentPickerDisplayId = null;

    document.querySelectorAll(".picker-btn:not(.date-picker-btn)").forEach(function (btn) {
        btn.addEventListener("click", function () {
            currentPickerInputId = btn.dataset.targetInput;
            currentPickerDisplayId = btn.dataset.targetDisplay;
            const pickerModal = document.getElementById(btn.dataset.picker);
            if (pickerModal) pickerModal.classList.add("open");
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
            if (overlay) overlay.classList.remove("open");
        });
    });

    document.querySelectorAll(".picker-modal-box").forEach(function (box) {
        const overlay = box.closest(".modal-overlay");
        if (!overlay) return;
        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) overlay.classList.remove("open");
        });
    });

    /* =====================================================
       구매일자 캘린더 (수정 모달용)
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
            if (e.target === datePickerModal) datePickerModal.classList.remove("open");
        });
    }

    /* =====================================================
       담당자 선택 모달 - 이름 검색 + 부서 칩 필터 (인수인계 모달용)
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
       자산관리번호 실시간 중복체크 (수정 모달용)
       ===================================================== */
    (function setupDuplicateCheck() {
        const input = document.getElementById("editAssetCode");
        const hint = document.getElementById("editAssetCodeHint");
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
                const form = document.getElementById("editForm");
                const excludeId = form ? form.dataset.assetId : null;
                let url = "/api/assets/check-code?code=" + encodeURIComponent(code);
                if (excludeId) url += "&excludeId=" + encodeURIComponent(excludeId);

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
    })();

});

/* =========================================================
   전역 함수 (자산 상세 모달에서 호출됨)
   - 자산 목록 화면 assets-home.js와 완전히 동일한 방식
   ========================================================= */

function openDetailModal(assetId) {
    fetch(`/assets/${assetId}/detail`)
        .then(function (res) {
            if (!res.ok) throw new Error("자산 상세 정보를 불러오지 못했습니다.");
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

function closeDetailModal() {
    const detailModal = document.getElementById("detailModal");
    if (detailModal) detailModal.classList.remove("open");
}

/**
 * 자산 수정 모달 열기 (상세 모달의 "수정" 버튼에서 호출)
 */
function openEditModal(assetId) {
    fetch(`/assets/${assetId}/edit-data`)
        .then(function (res) {
            if (res.status === 403) throw new Error("본인이 등록한 자산만 수정할 수 있습니다.");
            if (!res.ok) throw new Error("자산 정보를 불러오지 못했습니다.");
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

function closeEditModal() {
    const editModal = document.getElementById("editModal");
    if (editModal) editModal.classList.remove("open");
}

/**
 * 상태 변경 모달 열기 (상세 모달의 "상태 변경" 버튼에서 호출)
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

function closeStatusChangeModal() {
    const statusChangeModal = document.getElementById("statusChangeModal");
    if (statusChangeModal) statusChangeModal.classList.remove("open");
}

/**
 * 인수인계 모달 열기 (상세 모달의 "인수인계" 버튼에서 호출)
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

function closeHandoverModal() {
    const handoverModal = document.getElementById("handoverModal");
    if (handoverModal) handoverModal.classList.remove("open");
}