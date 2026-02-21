/* ============================================
   Capstone Report Generator – Logic
   Matches reference template alignment & logo
   ============================================ */

// ---------- Step Navigation ----------
let currentStep = 1;

function goToStep(step) {
    if (step > currentStep) {
        if (!validateStep(currentStep)) return;
    }

    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
    document.getElementById(`step-${step}`).classList.add('active');

    document.querySelectorAll('.step-indicator .step').forEach(el => {
        const s = parseInt(el.dataset.step);
        el.classList.remove('active', 'completed');
        if (s === step) el.classList.add('active');
        else if (s < step) el.classList.add('completed');
    });

    currentStep = step;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateStep(step) {
    const stepEl = document.getElementById(`step-${step}`);
    const inputs = stepEl.querySelectorAll('input[required], textarea[required]');
    let valid = true;
    inputs.forEach(inp => {
        if (!inp.value.trim()) {
            inp.style.borderColor = 'var(--danger)';
            inp.style.boxShadow = '0 0 0 3px hsla(0, 75%, 60%, 0.2)';
            valid = false;
            setTimeout(() => {
                inp.style.borderColor = '';
                inp.style.boxShadow = '';
            }, 2000);
        }
    });
    if (!valid) inputs[0]?.focus();
    return valid;
}

// ---------- Student Block Logic ----------
function clearStudent(num) {
    document.getElementById(`student-${num}-name`).value = '';
    document.getElementById(`student-${num}-reg`).value = '';
    updateGrammarBanner();
}

document.querySelectorAll('#student-2-block input, #student-3-block input, #student-4-block input').forEach(inp => {
    inp.addEventListener('input', () => {
        const block = inp.closest('.student-block');
        const hasContent = Array.from(block.querySelectorAll('input')).some(i => i.value.trim());
        block.classList.toggle('has-content', hasContent);
        updateGrammarBanner();
    });
});

function updateGrammarBanner() {
    const s2 = document.getElementById('student-2-name').value.trim();
    const s3 = document.getElementById('student-3-name').value.trim();
    const s4 = document.getElementById('student-4-name').value.trim();
    const banner = document.getElementById('grammar-banner');
    banner.classList.toggle('visible', !s2 && !s3 && !s4);
}

document.addEventListener('DOMContentLoaded', updateGrammarBanner);

// ---------- Helpers ----------
function getStudents() {
    const students = [];
    for (let i = 1; i <= 4; i++) {
        const nameInput = document.getElementById(`student-${i}-name`);
        const regInput = document.getElementById(`student-${i}-reg`);
        if (nameInput && regInput) {
            const name = nameInput.value.trim();
            const reg = regInput.value.trim();
            if (name && reg) students.push({ name, reg });
        }
    }
    return students;
}

function isSingleStudent() {
    return getStudents().length === 1;
}

// ---------- Document Generation ----------
function generateDocument() {
    if (!validateStep(3)) return;

    const projectTitle = document.getElementById('project-title').value.trim().toUpperCase();
    const courseCode = document.getElementById('course-code').value.trim().toUpperCase();
    const courseName = document.getElementById('course-name').value.trim().toUpperCase();
    const branchName = document.getElementById('branch-name').value.trim().toUpperCase();
    const guideName = document.getElementById('guide-name').value.trim();
    const guideDesignation = document.getElementById('guide-designation').value.trim();
    const programDirector = document.getElementById('program-director').value.trim();
    const departmentName = document.getElementById('department-name').value.trim();
    const submissionDate = document.getElementById('submission-date').value.trim();
    const vivaDate = document.getElementById('viva-date').value.trim();

    const students = getStudents();
    const single = isSingleStudent();

    const data = { projectTitle, courseCode, courseName, branchName, guideName, guideDesignation, programDirector, departmentName, submissionDate, vivaDate, students, single };

    buildTitlePage(data);
    buildDeclaration(data);
    buildCertificate(data);
    buildAcknowledgement(data);

    // Grammar notification
    const notifText = document.getElementById('grammar-notification-text');
    if (single) {
        notifText.textContent = 'Single student detected → Grammar auto-adjusted: "We" → "I", "our" → "my", "Students" → "Student"';
    } else {
        notifText.textContent = `${students.length} students detected → Grammar uses plural form: "We", "our", "Students"`;
    }

    document.getElementById('output-section').classList.remove('hidden');
    document.querySelector('.form-section').style.display = 'none';
    document.querySelector('.hero').style.display = 'none';

    setTimeout(() => {
        document.getElementById('output-section').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// =============================================
//  SECTION BUILDERS — matching reference layout
// =============================================

function logoHTML() {
    // Use the base64 logo extracted from the original docx
    if (typeof SIMATS_LOGO_BASE64 !== 'undefined') {
        return `<div class="doc-logo"><img src="${SIMATS_LOGO_BASE64}" alt="SIMATS Engineering Logo"></div>`;
    }
    return '';
}

// ---- Title Page ----
function buildTitlePage(d) {
    const studentLine = d.students.map(s => `<strong>${s.name}</strong> (${s.reg})`).join('&nbsp;&nbsp;&nbsp;&nbsp;');

    const html = `
<div class="doc-page">
    <div class="doc-center doc-title-main"><strong>${d.projectTitle}</strong></div>

    <div class="doc-spacer-lg"></div>

    <div class="doc-center"><strong>A CAPSTONE PROJECT REPORT</strong></div>

    <div class="doc-spacer-sm"></div>

    <div class="doc-center">Submitted in the partial fulfilment for the Course of</div>

    <div class="doc-spacer-sm"></div>

    <div class="doc-center doc-course"><strong>${d.courseCode} – ${d.courseName}</strong></div>

    <div class="doc-spacer-sm"></div>

    <div class="doc-center">to the award of the degree of <strong>BACHELOR OF ENGINEERING</strong> IN</div>

    <div class="doc-center"><strong>${d.branchName}</strong></div>

    <div class="doc-spacer-lg"></div>

    <div class="doc-center"><strong>Submitted by</strong> ${studentLine}</div>

    <div class="doc-spacer-md"></div>

    <div class="doc-center"><strong>Under the Supervision of ${d.guideName}</strong></div>

    <div class="doc-spacer-lg"></div>

    ${logoHTML()}

    <div class="doc-spacer-sm"></div>

    <div class="doc-center"><strong>SIMATS ENGINEERING</strong></div>
    <div class="doc-center"><strong>Saveetha Institute of Medical and Technical Sciences</strong></div>
    <div class="doc-center"><strong>Chennai – 602105</strong></div>

    <div class="doc-spacer-md"></div>

    <div class="doc-center"><strong>${d.submissionDate}</strong></div>
</div>`;
    document.getElementById('title-page-content').innerHTML = html;
}

// ---- Declaration ----
function buildDeclaration(d) {
    const s = d.single;
    const studentNames = d.students.map(st => `<strong>${st.name}</strong>`).join(', ');

    const bodyText = `${s ? 'I' : 'We'}, ${studentNames}, of the <strong>${d.departmentName}</strong>, Saveetha Institute of Medical and Technical Sciences, Saveetha University, Chennai, hereby declare that the Capstone Project Work entitled '<strong>${d.projectTitle}</strong>' is the result of ${s ? 'my' : 'our'} own bonafide efforts. To the best of ${s ? 'my' : 'our'} knowledge, the work presented herein is original, accurate, and has been carried out in accordance with principles of engineering ethics.`;

    let sigLines = '';
    d.students.forEach(st => {
        sigLines += `
        <div class="doc-sig-name">${st.name}</div>
        <div class="doc-sig-reg">(${st.reg})</div>`;
    });

    const html = `
<div class="doc-page">
    ${logoHTML()}

    <div class="doc-heading">DECLARATION</div>

    <div class="doc-body-justified">${bodyText}</div>

    <div class="doc-spacer-md"></div>

    <div class="doc-left-block">
        <div>Place: Chennai</div>
        <div>Date: ${d.submissionDate}</div>
    </div>

    <div class="doc-spacer-lg"></div>

    <div class="doc-right-block">
        <div class="doc-sig-label">Signature of the ${s ? 'Student' : 'Students'}</div>
        ${sigLines}
    </div>
</div>`;
    document.getElementById('declaration-content').innerHTML = html;
}

// ---- Bonafide Certificate ----
function buildCertificate(d) {
    const studentNames = d.students.map(st => `<strong>${st.name} (${st.reg})</strong>`).join(', ');

    const bodyText = `This is to certify that the Capstone Project entitled "<strong>${d.projectTitle}</strong>" has been carried out by ${studentNames} under the supervision of <strong>${d.guideName}</strong> and is submitted in partial fulfilment of the requirements for the current semester of the B.Tech <strong>${d.branchName}</strong> program at Saveetha Institute of Medical and Technical Sciences, Chennai.`;

    const html = `
<div class="doc-page">
    ${logoHTML()}

    <div class="doc-heading">BONAFIDE CERTIFICATE</div>

    <div class="doc-body-justified">${bodyText}</div>

    <div class="doc-spacer-xl"></div>

    <div class="doc-two-col">
        <div class="doc-col">
            <div class="doc-sig-line">SIGNATURE</div>
            <div class="doc-sig-detail"><strong>${d.programDirector}</strong></div>
            <div class="doc-sig-detail"><strong>Program Director</strong></div>
            <div class="doc-sig-detail">${d.departmentName}</div>
            <div class="doc-sig-detail">Saveetha School of Engineering</div>
            <div class="doc-sig-detail">SIMATS</div>
        </div>
        <div class="doc-col">
            <div class="doc-sig-line">SIGNATURE</div>
            <div class="doc-sig-detail"><strong>${d.guideName}</strong></div>
            <div class="doc-sig-detail"><strong>${d.guideDesignation}</strong></div>
            <div class="doc-sig-detail">${d.departmentName}</div>
            <div class="doc-sig-detail">Saveetha School of Engineering</div>
            <div class="doc-sig-detail">SIMATS</div>
        </div>
    </div>

    <div class="doc-spacer-lg"></div>

    <div class="doc-left-block">
        Submitted for the Project work Viva-Voce held on ${d.vivaDate}
    </div>

    <div class="doc-spacer-lg"></div>

    <div class="doc-two-col">
        <div class="doc-col">
            <div class="doc-sig-line">INTERNAL EXAMINER</div>
        </div>
        <div class="doc-col">
            <div class="doc-sig-line">EXTERNAL EXAMINER</div>
        </div>
    </div>
</div>`;
    document.getElementById('certificate-content').innerHTML = html;
}

// ---- Acknowledgement ----
function buildAcknowledgement(d) {
    const s = d.single;

    const para1 = `${s ? 'I' : 'We'} would like to express ${s ? 'my' : 'our'} heartfelt gratitude to all those who supported and guided ${s ? 'me' : 'us'} throughout the successful completion of ${s ? 'my' : 'our'} Capstone Project. ${s ? 'I am' : 'We are'} deeply thankful to ${s ? 'my' : 'our'} respected Founder and Chancellor, Dr. N.M. Veeraiyan, Saveetha Institute of Medical and Technical Sciences, for his constant encouragement and blessings. ${s ? 'I' : 'We'} also express ${s ? 'my' : 'our'} sincere thanks to ${s ? 'my' : 'our'} Pro-Chancellor, Dr. Deepak Nallaswamy Veeraiyan, and ${s ? 'my' : 'our'} Vice-Chancellor, Dr. S. Suresh Kumar, for their visionary leadership and moral support during the course of this project.`;

    const para2 = `${s ? 'I am' : 'We are'} truly grateful to ${s ? 'my' : 'our'} Director, Dr. Ramya Deepak, SIMATS Engineering, for providing ${s ? 'me' : 'us'} with the necessary resources and a motivating academic environment. ${s ? 'My' : 'Our'} special thanks to ${s ? 'my' : 'our'} Principal, Dr. B. Ramesh for granting ${s ? 'me' : 'us'} access to the institute's facilities and encouraging ${s ? 'me' : 'us'} throughout the process. ${s ? 'I' : 'We'} sincerely thank ${s ? 'my' : 'our'} Head of the Department, Program Director <strong>${d.programDirector}</strong> for his continuous support, valuable guidance, and constant motivation.`;

    const para3 = `${s ? 'I am' : 'We are'} especially indebted to ${s ? 'my' : 'our'} guide, <strong>${d.guideName}</strong> for his creative suggestions, consistent feedback, and unwavering support during each stage of the project. ${s ? 'I' : 'We'} also express ${s ? 'my' : 'our'} gratitude to the Project Coordinators, Review Panel Members (Internal and External), and the entire faculty team for their constructive feedback and valuable inputs that helped improve the quality of ${s ? 'my' : 'our'} work. Finally, ${s ? 'I' : 'we'} thank all faculty members, lab technicians, ${s ? 'my' : 'our'} parents, and friends for their continuous encouragement and support.`;

    let sigLines = '';
    d.students.forEach(st => {
        sigLines += `
        <div class="doc-sig-name">${st.name}</div>
        <div class="doc-sig-reg">(${st.reg})</div>`;
    });

    const html = `
<div class="doc-page">
    ${logoHTML()}

    <div class="doc-heading">ACKNOWLEDGEMENT</div>

    <div class="doc-body-justified">${para1}</div>
    <div class="doc-body-justified">${para2}</div>
    <div class="doc-body-justified">${para3}</div>

    <div class="doc-spacer-lg"></div>

    <div class="doc-right-block">
        ${sigLines}
    </div>
</div>`;
    document.getElementById('acknowledgement-content').innerHTML = html;
}

// ---------- Edit / Back ----------
function editForm() {
    document.getElementById('output-section').classList.add('hidden');
    document.querySelector('.form-section').style.display = '';
    document.querySelector('.hero').style.display = '';
    goToStep(1);
}

// ---------- Copy ----------
function copySection(elementId) {
    const el = document.getElementById(elementId);
    navigator.clipboard.writeText(el.innerText).then(() => showToast('Section copied to clipboard!'));
}

function copyAll() {
    const sections = ['title-page-content', 'declaration-content', 'certificate-content', 'acknowledgement-content'];
    const labels = ['═══ TITLE PAGE ═══', '═══ DECLARATION ═══', '═══ BONAFIDE CERTIFICATE ═══', '═══ ACKNOWLEDGEMENT ═══'];
    let fullText = '';
    sections.forEach((id, i) => {
        fullText += labels[i] + '\n\n';
        fullText += document.getElementById(id).innerText + '\n\n\n';
    });
    navigator.clipboard.writeText(fullText).then(() => showToast('All pages copied to clipboard!'));
}

// downloadDocx() is defined in docx_export.js (uses docx.js library for proper Word output)

// ---------- Toast ----------
// ---------- Step Indicator Click ----------
document.querySelectorAll('.step-indicator .step').forEach(stepEl => {
    stepEl.addEventListener('click', () => {
        const targetStep = parseInt(stepEl.dataset.step);
        if (targetStep < currentStep || validateStep(currentStep)) {
            goToStep(targetStep);
        }
    });
});

// Auto-generate helper removed as per user request for strict user-provided description
function showToast(message) {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toast-message');
    msg.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('visible');
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 2500);
}

// Auto-generate when user leaves title field
document.addEventListener('DOMContentLoaded', function () {
    const titleInput = document.getElementById('project-title');
    // Description auto-generation removed as per user request.
});

async function autoGenerateRefSample() {
    const titleInput = document.getElementById('project-title');
    const refInput = document.getElementById('project-references');
    const title = titleInput.value.trim();

    if (!title || title.length < 5 || refInput.value.trim()) return;

    try {
        const prompt = 'Suggest a standard IEEE/APA citation format sample for a B.Tech capstone project report bibliography. Return ONLY JSON: {"sample":"Author (Year). Title. Journal. Volume(Issue), pages."}';
        const parsed = await callAI(prompt);

        if (parsed.sample) {
            refInput.value = parsed.sample;
        }
    } catch (e) {
        console.warn('Auto-generate ref sample failed:', e);
        refInput.value = "Author (Year). Title. Journal/Publisher.";
    }
}

function getProjectTitle() {
    return document.getElementById('project-title').value.trim().toUpperCase();
}
