/* ============================================
   Full .docx Report Export
   Formatting from reference template documents.
   Content is AI-generated via Gemini API based
   on the user's specific project topic.
   ============================================ */

function base64ToUint8Array(b64) {
    var raw = b64.replace(/^data:image\/\w+;base64,/, '');
    var bin = atob(raw);
    var arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
}

async function downloadDocx() {
    try {
        if (typeof docx === 'undefined') {
            showToast('Error: Document library not loaded. Refresh the page.');
            return;
        }

        var D = docx;
        var Document = D.Document, Packer = D.Packer, Paragraph = D.Paragraph, TextRun = D.TextRun,
            ImageRun = D.ImageRun, AlignmentType = D.AlignmentType,
            Table = D.Table, TableRow = D.TableRow, TableCell = D.TableCell, WidthType = D.WidthType,
            BorderStyle = D.BorderStyle, Header = D.Header, Footer = D.Footer,
            TabStopType = D.TabStopType, convertInchesToTwip = D.convertInchesToTwip,
            LineRuleType = D.LineRuleType, PageNumber = D.PageNumber, NumberFormat = D.NumberFormat;

        // ---- Form data ----
        var projectTitle = document.getElementById('project-title').value.trim().toUpperCase();
        var courseCode = document.getElementById('course-code').value.trim().toUpperCase();
        var courseName = document.getElementById('course-name').value.trim().toUpperCase();
        var branchName = document.getElementById('branch-name').value.trim().toUpperCase();
        var guideName = document.getElementById('guide-name').value.trim();
        var guideDesignation = document.getElementById('guide-designation').value.trim();
        var programDirector = document.getElementById('program-director').value.trim();
        var departmentName = document.getElementById('department-name').value.trim();
        var submissionDate = document.getElementById('submission-date').value.trim();
        var vivaDate = document.getElementById('viva-date').value.trim();
        var students = getStudents();
        var single = students.length === 1;
        var pD = document.getElementById('project-description');
        var pR = document.getElementById('project-references');
        var projectDescription = pD ? pD.value.trim() : '';
        var refSample = pR ? pR.value.trim() : 'Author (Year). Title. Journal/Publisher.';

        // ---- AI Content ----
        showToast('Processing references and generating AI content...');
        var reportContent;
        var referenceText = "";

        // Read reference file if provided
        var fileInput = document.getElementById('reference-file');
        if (fileInput && fileInput.files && fileInput.files[0]) {
            try {
                showToast('Reading reference file...');
                var arrayBuffer = await fileInput.files[0].arrayBuffer();
                var result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                referenceText = result.value;
                showToast('Reference file loaded successfully.');
            } catch (err) {
                console.warn('Failed to read reference file:', err);
                showToast('Error reading reference file. Proceeding with standard AI.');
            }
        }

        try {
            reportContent = await generateReportContentWithAI(
                projectTitle,
                projectDescription,
                referenceText,
                function (m) { showToast(m); }
            );
        } catch (e) {
            console.warn('AI failed, using template:', e);
            showToast('AI failed. Using template content...');
            reportContent = generateReportContent(projectTitle, projectDescription);
        }
        showToast('Building document...');

        // ---- Logo ----
        var logoData = null;
        if (typeof SIMATS_LOGO_BASE64 !== 'undefined' && SIMATS_LOGO_BASE64) {
            try { logoData = base64ToUint8Array(SIMATS_LOGO_BASE64); } catch (e) { }
        }

        // ---- Constants (from reference docs) ----
        var F = 'Times New Roman';
        var S14 = 28, S12 = 24, S16 = 32, S20 = 40, S11 = 22, S10 = 20;
        // A4 page
        var PS = { width: convertInchesToTwip(8.28), height: convertInchesToTwip(11.69) };
        // Front page margins (Section 1): L=0.89, R=0.98, T=0.96, B=0.19
        var FPM = { top: convertInchesToTwip(0.96), right: convertInchesToTwip(0.98), bottom: convertInchesToTwip(0.19), left: convertInchesToTwip(0.89) };
        // Declaration/Certificate (Section 2,3): L=0.89, R=0.98, T=0.96, B=0.19 (logo goes in header with headerDistance)
        var DCM = { top: convertInchesToTwip(0.96), right: convertInchesToTwip(0.98), bottom: convertInchesToTwip(0.19), left: convertInchesToTwip(0.89) };
        // Acknowledgement (Section 4): L=0.89, R=0.98, T=0.96, B=0.19
        var AKM = { top: convertInchesToTwip(0.96), right: convertInchesToTwip(0.98), bottom: convertInchesToTwip(0.19), left: convertInchesToTwip(0.89) };
        // Content pages: L=1.00, R=0.96, T=1.05, B=1.20
        var CPM = { top: convertInchesToTwip(1.05), right: convertInchesToTwip(0.96), bottom: convertInchesToTwip(1.20), left: convertInchesToTwip(1.00) };
        var TW = convertInchesToTwip(6.30);
        var SB = { top: { style: BorderStyle.SINGLE, size: 1, color: '000000' }, bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' }, left: { style: BorderStyle.SINGLE, size: 1, color: '000000' }, right: { style: BorderStyle.SINGLE, size: 1, color: '000000' } };

        // Line spacings
        var LS15 = { line: 360, lineRule: LineRuleType.AUTO };
        var LS158 = { line: Math.round(1.58 * 240), lineRule: LineRuleType.AUTO };
        var LS12 = { line: Math.round(1.2 * 240), lineRule: LineRuleType.AUTO };
        var LS108 = { line: Math.round(1.08 * 240), lineRule: LineRuleType.AUTO };

        // ---- Helpers ----
        function tr(text, o) {
            o = o || {};
            return new TextRun({ text: text, font: F, size: o.size || S14, bold: o.bold || false, italics: o.italics || false });
        }
        function ep(n) {
            var a = [];
            for (var i = 0; i < (n || 1); i++) a.push(new Paragraph({ children: [new TextRun({ text: '', font: F, size: S14 })], spacing: { after: 0, before: 0 } }));
            return a;
        }
        function mkFooter() {
            return new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: F, size: S12 })] })] });
        }
        // Centered paragraph (no heading level - prevents alignment inheritance issues)
        function cp(children, spacing) {
            return new Paragraph({ alignment: AlignmentType.CENTER, children: children, spacing: spacing || { after: 0, before: 0 } });
        }
        // Logo in body
        function logoBody() {
            if (!logoData) return [];
            try {
                return [cp([new ImageRun({ data: logoData, transformation: { width: Math.round(6.31 * 96), height: Math.round(0.78 * 96) }, type: 'png' })])];
            } catch (e) { return []; }
        }
        // Logo as Header object (for Declaration/Certificate sections)
        function logoHeader() {
            if (!logoData) {
                return new Header({ children: [new Paragraph({ children: [] })] });
            }
            try {
                return new Header({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [new ImageRun({ data: logoData, transformation: { width: Math.round(6.31 * 96), height: Math.round(0.78 * 96) }, type: 'png' })],
                            spacing: { after: 0, before: 0 }
                        })
                    ]
                });
            } catch (e) {
                return new Header({ children: [new Paragraph({ children: [] })] });
            }
        }
        // Empty header (to prevent logo header from inheriting into subsequent sections)
        function emptyHeader() {
            return new Header({ children: [new Paragraph({ children: [] })] });
        }
        // Tab-based left-right (for signatures)
        function tp(l, r, o) {
            o = o || {};
            return new Paragraph({
                alignment: AlignmentType.LEFT,
                tabStops: [{ type: TabStopType.RIGHT, position: TW }],
                children: [
                    new TextRun({ text: l, font: F, size: o.size || S14, bold: o.bold || false }),
                    new TextRun({ text: '\t', font: F, size: o.size || S14 }),
                    new TextRun({ text: r, font: F, size: o.size || S14, bold: o.bold || false })
                ],
                spacing: { after: 0, before: o.sBefore || 0 }
            });
        }
        function mkTable(headers, rows) {
            var hr = new TableRow({ children: headers.map(function (h) { return new TableCell({ borders: SB, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [tr(h, { bold: true })], spacing: { after: 40, before: 40 } })], width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE } }); }), tableHeader: true });
            var dr = rows.map(function (row) { return new TableRow({ children: row.map(function (c) { return new TableCell({ borders: SB, children: [new Paragraph({ children: [tr(String(c))], spacing: { after: 40, before: 40 } })], width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE } }); }) }); });
            return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [hr].concat(dr) });
        }

        // ===================================================================
        // TITLE PAGE (Section 1) - All centered, no HeadingLevel
        // Reference: Front pages template, Section 1
        // ===================================================================
        var titleC = [].concat(
            ep(1),
            // Project Title - centered, bold
            [cp([tr(projectTitle, { bold: true })], { after: 300, before: 1500 })],
            ep(2),
            // A CAPSTONE PROJECT REPORT
            [cp([tr('A CAPSTONE PROJECT REPORT', { bold: true })], { after: 0, before: 635 })],
            ep(1),
            // Submitted in partial fulfilment - italic
            [cp([tr('Submitted in the partial fulfilment for the Course of', { italics: true })], { after: 0, before: 635 })],
            ep(1),
            // Course Code – Course Name - bold
            [cp([tr(courseCode + ' \u2013 ' + courseName, { bold: true })], { after: 0, before: 0 })],
            ep(1),
            // To the award... italic + bold
            [cp([tr('to the award of the degree of ', { italics: true }), tr('BACHELOR OF ENGINEERING ', { bold: true }), tr('IN', { bold: true })], { after: 0, before: 0, line: LS158.line, lineRule: LS158.lineRule })],
            // Branch name
            [cp([tr(branchName, { bold: true })], { after: 0, before: 0 })],
            ep(2),
            // "Submitted by" on its own centered line
            [cp([tr('Submitted by', { bold: true })], { after: 0, before: 0 })],
            // Each student on own line (1.2 spacing, 14pt bold, centered)
            students.map(function (s) {
                return cp([tr(s.name + ' (' + s.reg + ')', { bold: true })], { after: 0, before: 0, line: LS12.line, lineRule: LS12.lineRule });
            }),
            ep(1),
            // Under the Supervision
            [cp([tr('Under the Supervision of ', { bold: true }), tr(guideName, { bold: true })], { after: 0, before: 635, line: LS158.line, lineRule: LS158.lineRule })],
            ep(2),
            // Logo in body for title page
            logoBody(),
            // SIMATS ENGINEERING
            [cp([tr('SIMATS ENGINEERING', { bold: true })], { after: 0, before: 200 })],
            // Saveetha Institute...
            [cp([tr('Saveetha Institute of Medical and Technical Sciences', { bold: true })], { after: 0, before: 80 })],
            [cp([tr('Chennai \u2013 602105', { bold: true })], { after: 0, before: 0 })],
            ep(1),
            // Date
            [cp([tr(submissionDate, { bold: true })], { after: 0, before: 0 })]
        );

        // ===================================================================
        // DECLARATION (Section 2) - Logo in header
        // Reference: Section 2, top margin 2.17in, header dist 1.01in
        // ===================================================================
        var declC = [].concat(
            // Logo is in the section header, not body
            ep(1),
            // Title centered
            [cp([tr('DECLARATION', { bold: true, size: S16 })], { after: 300, before: 0 })],
            ep(1),
            // Body text - JUSTIFIED, 1.5 line spacing
            [new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                children: [tr(single ? 'I, ' : 'We, ')].concat(
                    students.reduce(function (a, s, i) { a.push(tr(s.name, { bold: true })); if (i < students.length - 1) a.push(tr(', ')); return a; }, []),
                    [tr(' of the '), tr(departmentName, { bold: true }),
                    tr(', Saveetha Institute of Medical and Technical Sciences, Saveetha University, Chennai, hereby declare that the Capstone Project Work entitled \u2018'),
                    tr(projectTitle, { bold: true }),
                    tr('\u2019 is the result of ' + (single ? 'my' : 'our') + ' own bonafide efforts. To the best of ' + (single ? 'my' : 'our') + ' knowledge, the work presented herein is original, accurate, and has been carried out in accordance with principles of engineering ethics.')]
                ),
                spacing: { after: 0, before: 0, line: LS15.line, lineRule: LS15.lineRule }
            })],
            ep(2),
            // Place and Date - LEFT aligned
            [new Paragraph({ alignment: AlignmentType.LEFT, children: [tr('Place: Chennai')], spacing: { after: 0, before: 0 } })],
            [new Paragraph({ alignment: AlignmentType.LEFT, children: [tr('Date: ' + submissionDate)], spacing: { after: 0, before: 200 } })],
            ep(5),
            // Signature - RIGHT aligned
            [new Paragraph({ alignment: AlignmentType.RIGHT, children: [tr('Signature of the ' + (single ? 'Student' : 'Students') + ' with Names')], spacing: { after: 80, before: 0 } })]
        );
        students.forEach(function (s) {
            declC.push(new Paragraph({ alignment: AlignmentType.RIGHT, children: [tr(s.name, { bold: true })], spacing: { after: 20, before: 0 } }));
            declC.push(new Paragraph({ alignment: AlignmentType.RIGHT, children: [tr('(' + s.reg + ')', { size: S12 })], spacing: { after: 60, before: 0 } }));
        });

        // ===================================================================
        // CERTIFICATE (Section 3) - Logo in header
        // Reference: Section 3, top margin 2.17in, header dist 1.01in
        // ===================================================================
        var certC = [].concat(
            ep(1),
            // Title centered
            [cp([tr('BONAFIDE CERTIFICATE', { bold: true, size: S16 })], { after: 300, before: 0 })],
            ep(1),
            // Body - JUSTIFIED, 1.5 line spacing
            [new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                children: [tr('This is to certify that the Capstone Project entitled \u201C'),
                tr(projectTitle, { bold: true }),
                tr('\u201D has been carried out by ')
                ].concat(
                    students.reduce(function (a, s, i) { a.push(tr(s.name + ' (' + s.reg + ')', { bold: true })); if (i < students.length - 1) a.push(tr(', ')); return a; }, []),
                    [tr(' under the supervision of '), tr(guideName, { bold: true }),
                    tr(' and is submitted in partial fulfilment of the requirements for the current semester of the B.Tech '),
                    tr(branchName, { bold: true }),
                    tr(' program at Saveetha Institute of Medical and Technical Sciences, Chennai.')]
                ),
                spacing: { after: 0, before: 0, line: LS15.line, lineRule: LS15.lineRule }
            })],
            ep(4),
            // Signatures using tabs
            [tp('SIGNATURE', 'SIGNATURE', { bold: false, sBefore: 0 })],
            [tp(programDirector, guideName, { bold: true, sBefore: 200 })],
            [tp('Program Director', guideDesignation, { bold: true, sBefore: 120 })],
            [tp(departmentName, departmentName, { sBefore: 120 })],
            [tp('Saveetha School of Engineering', 'Saveetha School of Engineering', { sBefore: 120 })],
            [tp('SIMATS', 'SIMATS', { sBefore: 120 })],
            ep(2),
            // Viva-Voce
            [new Paragraph({ alignment: AlignmentType.LEFT, children: [tr('Submitted for the Project work Viva-Voce held on ____________ ' + vivaDate)], spacing: { after: 0, before: 0 } })],
            ep(3),
            // Examiners
            [tp('INTERNAL EXAMINER', 'EXTERNAL EXAMINER', { bold: true, sBefore: 0 })]
        );

        // ===================================================================
        // ACKNOWLEDGEMENT (Section 4) - Logo in body
        // Reference: Section 4, top margin 1.31in
        // ===================================================================
        var si = single;
        var ackC = [].concat(
            logoBody(),
            ep(1),
            // Title centered
            [cp([tr('ACKNOWLEDGEMENT', { bold: true, size: S16 })], { after: 300, before: 0 })],
            ep(1),
            // Body Text - JUSTIFIED, 1.5 line spacing
            [new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                children: [
                    tr((si ? 'I' : 'We') + ' would like to express ' + (si ? 'my' : 'our') + ' heartfelt gratitude to all those who supported and guided ' + (si ? 'me' : 'us') + ' throughout the successful completion of ' + (si ? 'my' : 'our') + ' Capstone Project. ' + (si ? 'I am' : 'We are') + ' deeply thankful to ' + (si ? 'my' : 'our') + ' respected Founder and Chancellor, '),
                    tr('Dr. N.M. Veeraiyan', { bold: true }),
                    tr(', Saveetha Institute of Medical and Technical Sciences, for his constant encouragement and blessings. ' + (si ? 'I' : 'We') + ' also express ' + (si ? 'my' : 'our') + ' sincere thanks to ' + (si ? 'my' : 'our') + ' Pro-Chancellor, '),
                    tr('Dr. Deepak Nallaswamy Veeraiyan,', { bold: true }),
                    tr(' and ' + (si ? 'my' : 'our') + ' Vice-Chancellor, Dr. S. Suresh Kumar, for their visionary leadership and moral support during the course of this project.')
                ],
                spacing: { after: 120, before: 0, line: LS15.line, lineRule: LS15.lineRule }
            })],
            [new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                children: [
                    tr((si ? 'I am' : 'We are') + ' truly grateful to ' + (si ? 'my' : 'our') + ' Director, '),
                    tr('Dr. Ramya Deepak,', { bold: true }),
                    tr(' SIMATS Engineering, for providing ' + (si ? 'me' : 'us') + ' with the necessary resources and a motivating academic environment. ' + (si ? 'My' : 'Our') + ' special thanks to ' + (si ? 'my' : 'our') + ' Principal, Dr. B. Ramesh for granting ' + (si ? 'me' : 'us') + ' access to the institute\'s facilities and encouraging ' + (si ? 'me' : 'us') + ' throughout the process. ' + (si ? 'I' : 'We') + ' sincerely thank ' + (si ? 'my' : 'our') + ' Program Director '),
                    tr(programDirector, { bold: true }),
                    tr(' for his continuous support, valuable guidance, and constant motivation.')
                ],
                spacing: { after: 120, before: 0, line: LS15.line, lineRule: LS15.lineRule }
            })],
            [new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                children: [
                    tr((si ? 'I am' : 'We are') + ' especially indebted to ' + (si ? 'my' : 'our') + ' guide, '),
                    tr(guideName, { bold: true }),
                    tr(' for his creative suggestions, consistent feedback, and unwavering support during each stage of the project. ' + (si ? 'I' : 'We') + ' also express ' + (si ? 'my' : 'our') + ' gratitude to the Project Coordinators, Review Panel Members, and the entire faculty team for their constructive feedback. Finally, ' + (si ? 'I' : 'we') + ' thank all faculty members, lab technicians, ' + (si ? 'my' : 'our') + ' parents, and friends for their continuous encouragement and support.')
                ],
                spacing: { after: 120, before: 0, line: LS15.line, lineRule: LS15.lineRule }
            })],
            ep(3),
            [new Paragraph({ alignment: AlignmentType.RIGHT, children: [tr('Signature with Student Name')], spacing: { after: 80, before: 0 } })]
        );
        students.forEach(function (st) {
            ackC.push(new Paragraph({ alignment: AlignmentType.RIGHT, children: [tr(st.name + ' [' + st.reg + ']')], spacing: { after: 60, before: 0 } }));
        });

        // ===================================================================
        // TABLE OF CONTENTS (as Table - matches VPN report format)
        // ===================================================================
        var tocRows = [];
        var pgEst = 1;
        reportContent.chapters.forEach(function (ch) {
            var secNames = ch.sections.map(function (s) { return s.number + ' ' + s.title; });
            tocRows.push({ sno: String(ch.number) + '.', title: ch.title, subs: secNames, page: String(pgEst).padStart(2, '0') });
            // Estimate 3-4 pages per chapter with the new detailed generation
            pgEst += Math.max(4, Math.ceil(ch.sections.length * 1.5));
        });

        var tocTableRows = [
            new TableRow({
                children: [
                    new TableCell({ borders: SB, children: [cp([tr('S.NO', { bold: true })], { after: 40, before: 40 })], width: { size: 12, type: WidthType.PERCENTAGE } }),
                    new TableCell({ borders: SB, children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [tr('CONTENT', { bold: true })], spacing: { after: 40, before: 40 } })], width: { size: 70, type: WidthType.PERCENTAGE } }),
                    new TableCell({ borders: SB, children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [tr('Page. No', { bold: true })], spacing: { after: 40, before: 40 } })], width: { size: 18, type: WidthType.PERCENTAGE } }),
                ], tableHeader: true
            })
        ];
        tocRows.forEach(function (row) {
            var contentParas = [new Paragraph({ alignment: AlignmentType.LEFT, children: [tr(row.title, { bold: true })], spacing: { after: 20, before: 20 } })];
            row.subs.forEach(function (sub) {
                contentParas.push(new Paragraph({ alignment: AlignmentType.LEFT, children: [tr(sub)], spacing: { after: 10, before: 0 } }));
            });
            tocTableRows.push(new TableRow({
                children: [
                    new TableCell({ borders: SB, children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [tr(row.sno, { bold: true })], spacing: { after: 20, before: 20 } })], width: { size: 12, type: WidthType.PERCENTAGE } }),
                    new TableCell({ borders: SB, children: contentParas, width: { size: 70, type: WidthType.PERCENTAGE } }),
                    new TableCell({ borders: SB, children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [tr(row.page, { bold: true })], spacing: { after: 20, before: 20 } })], width: { size: 18, type: WidthType.PERCENTAGE } }),
                ]
            }));
        });

        var tocC = [
            cp([tr('TABLE OF CONTENTS', { bold: true, size: S20 })], { after: 300, before: 0 })
        ].concat(ep(1), [
            new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: tocTableRows })
        ]);

        // ===================================================================
        // ABSTRACT
        // ===================================================================
        var absC = [
            cp([tr('ABSTRACT', { bold: true, size: S20 })], { after: 200, before: 0 })
        ].concat(ep(1));
        absC.push(new Paragraph({ alignment: AlignmentType.LEFT, children: [tr(projectTitle, { bold: true })], spacing: { after: 100, before: 0, line: LS108.line, lineRule: LS108.lineRule } }));
        reportContent.abstract.forEach(function (p) {
            if (p.indexOf('Keywords:') === 0) {
                absC.push(new Paragraph({ alignment: AlignmentType.LEFT, children: [tr('Keywords: ', { bold: true }), tr(p.replace('Keywords: ', ''), { italics: true })], spacing: { after: 100, before: 0, line: LS108.line, lineRule: LS108.lineRule } }));
            } else {
                absC.push(new Paragraph({ alignment: AlignmentType.LEFT, children: [tr(p)], spacing: { after: 100, before: 0, line: LS108.line, lineRule: LS108.lineRule } }));
            }
        });

        // ===================================================================
        // BUILD CHAPTERS (content formatting from VPN report)
        // ===================================================================
        function buildChap(ch) {
            var c = [];
            c.push(cp([tr('CHAPTER ' + ch.number, { bold: true })], { after: 100, before: 0, line: LS108.line, lineRule: LS108.lineRule }));
            c.push(new Paragraph({ alignment: AlignmentType.LEFT, children: [tr(ch.title, { bold: true })], spacing: { after: 100, before: 0, line: LS108.line, lineRule: LS108.lineRule } }));
            c = c.concat(ep(1));

            ch.sections.forEach(function (sec) {
                c.push(new Paragraph({ alignment: AlignmentType.LEFT, children: [tr(sec.number + ' ' + sec.title, { bold: true })], spacing: { after: 100, before: 0, line: LS108.line, lineRule: LS108.lineRule } }));
                sec.content.forEach(function (item) {
                    if (typeof item === 'string') {
                        if (item.indexOf('[Figure') === 0) {
                            c.push(cp([tr(item, { italics: true, size: S12 })], { after: 100, before: 100 }));
                        } else {
                            c.push(new Paragraph({ alignment: AlignmentType.LEFT, children: [tr(item)], spacing: { after: 100, before: 0, line: LS108.line, lineRule: LS108.lineRule } }));
                        }
                    } else if (item && item.type === 'list') {
                        item.items.forEach(function (li) {
                            c.push(new Paragraph({ alignment: AlignmentType.LEFT, indent: { left: convertInchesToTwip(0.3) }, children: [tr('\u2022 ' + li)], spacing: { after: 60, before: 0, line: LS108.line, lineRule: LS108.lineRule } }));
                        });
                        c = c.concat(ep(1));
                    } else if (item && item.type === 'table') {
                        c.push(cp([tr(item.caption, { bold: true, size: S12 })], { after: 80, before: 120 }));
                        c.push(mkTable(item.headers, item.rows));
                        c = c.concat(ep(1));
                    }
                });
            });
            return c;
        }

        // ===================================================================
        // REFERENCES
        // ===================================================================
        var refC = [cp([tr('REFERENCES', { bold: true, size: S20 })], { after: 200, before: 0 })].concat(ep(1));
        reportContent.references.forEach(function (ref, idx) {
            refC.push(new Paragraph({ alignment: AlignmentType.LEFT, indent: { left: convertInchesToTwip(0.4), hanging: convertInchesToTwip(0.4) }, children: [tr('[' + (idx + 1) + '] ' + ref, { size: S12 })], spacing: { after: 80, before: 0, line: LS108.line, lineRule: LS108.lineRule } }));
        });

        // ===================================================================
        // ASSEMBLE DOCUMENT
        // ===================================================================
        var chapSecs = reportContent.chapters.map(function (ch, idx) {
            var props = { page: { size: PS, margin: CPM } };
            if (idx === 0) { props.pageNumberFormatType = NumberFormat.DECIMAL; props.pageNumberStart = 1; }
            return { properties: props, headers: { default: emptyHeader() }, footers: { default: mkFooter() }, children: buildChap(ch) };
        });

        var doc = new Document({
            features: { updateFields: true },
            styles: {
                default: {
                    document: { run: { font: F, size: S14 } }
                }
            },
            sections: [
                // Section 1: Title page
                { properties: { page: { size: PS, margin: FPM } }, headers: { default: emptyHeader() }, children: titleC },
                // Section 2: Declaration (logo in header)
                { properties: { page: { size: PS, margin: DCM } }, headers: { default: logoHeader() }, children: declC },
                // Section 3: Certificate (logo in header)
                { properties: { page: { size: PS, margin: DCM } }, headers: { default: logoHeader() }, children: certC },
                // Section 4: Acknowledgement (logo in body)
                { properties: { page: { size: PS, margin: AKM } }, headers: { default: emptyHeader() }, children: ackC },
                // TOC
                { properties: { page: { size: PS, margin: CPM }, pageNumberFormatType: NumberFormat.LOWER_ROMAN, pageNumberStart: 1 }, headers: { default: emptyHeader() }, footers: { default: mkFooter() }, children: tocC },
                // Abstract
                { properties: { page: { size: PS, margin: CPM } }, headers: { default: emptyHeader() }, footers: { default: mkFooter() }, children: absC },
            ].concat(
                chapSecs,
                [{ properties: { page: { size: PS, margin: CPM } }, headers: { default: emptyHeader() }, footers: { default: mkFooter() }, children: refC }]
            )
        });

        // ---- Generate & Save ----
        var blob = await Packer.toBlob(doc);
        var title = document.getElementById('project-title').value.trim().replace(/\s+/g, '_') || 'Capstone_Project';
        saveAs(blob, title.toUpperCase() + '_Full_Report.docx');
        showToast('Full report downloaded successfully!');

    } catch (err) {
        console.error('downloadDocx error:', err);
        showToast('Error: ' + (err.message || 'Unknown error'));
    }
}
