// Small things every page needs: the phone menu, and the partnership inquiry form (a demo: nothing is sent).
(function () {
  "use strict";
  const btn = document.querySelector(".menu-btn"), nav = document.getElementById("siteNav");
  if (btn && nav) {
    btn.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
  }
  const form = document.getElementById("inquiryForm");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      form.querySelectorAll(".err").forEach(n => n.remove());
      const need = [["iName", "Enter your name."], ["iOrg", "Enter your institution."]];
      let ok = true;
      need.forEach(([id, msg]) => { const f = document.getElementById(id); if (!f.value.trim()) { f.insertAdjacentHTML("afterend", '<span class="err">' + msg + "</span>"); ok = false; } });
      const email = document.getElementById("iEmail");
      if (!/^\S+@\S+\.\S+$/.test(email.value.trim())) { email.insertAdjacentHTML("afterend", '<span class="err">Enter an email like name@university.edu.</span>'); ok = false; }
      if (!ok) return;
      const safe = s => s.replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
      const c = document.getElementById("iConfirm");
      c.innerHTML = "<b>Call request saved on this page</b><span>We'd email " + safe(document.getElementById("iName").value.trim()) + " at " +
        safe(document.getElementById("iOrg").value.trim()) + " to set up a call about a pilot.</span><span style=\"color:var(--muted)\">This example site doesn't send requests, so nothing was emailed.</span>";
      c.hidden = false;
    });
  }
})();
