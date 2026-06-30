const { Meeting, Transcript, Summary, ActionItem, Report } = require('../models');

// Generate and download report
const exportReport = async (req, res) => {
  try {
    const { meetingId, format } = req.params;
    
    const meeting = await Meeting.findOne({
      where: { id: meetingId, userId: req.user.id }
    });

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    const transcript = await Transcript.findOne({ where: { meetingId } });
    const summary = await Summary.findOne({ where: { meetingId } });
    const actionItems = await ActionItem.findAll({ where: { meetingId } });

    if (!summary) {
      return res.status(400).json({ message: 'AI Summary not generated yet' });
    }

    const keyPoints = JSON.parse(summary.keyPoints || '[]');
    const decisions = JSON.parse(summary.decisions || '[]');
    const risks = JSON.parse(summary.risks || '[]');
    const followUps = JSON.parse(summary.followUps || '[]');
    const segments = transcript ? JSON.parse(transcript.segments || '[]') : [];

    const dateStr = new Date(meeting.createdAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    // Save report generation log to DB
    await Report.create({
      meetingId,
      type: format,
      userId: req.user.id
    });

    // 1. TEXT FORMAT
    if (format === 'txt') {
      let content = `MEETMIND AI MEETING REPORT\n`;
      content += `=========================\n\n`;
      content += `Title: ${meeting.title}\n`;
      content += `Category: ${meeting.category}\n`;
      content += `Date: ${dateStr}\n`;
      content += `Duration: ${Math.floor(meeting.duration / 60)} minutes\n\n`;
      
      content += `EXECUTIVE SUMMARY\n`;
      content += `-----------------\n`;
      content += `${summary.executiveSummary}\n\n`;

      content += `PRODUCTIVITY SCORE: ${summary.productivityScore}/100\n`;
      content += `OVERALL SENTIMENT: ${summary.sentiment}\n\n`;

      content += `KEY DISCUSSION POINTS\n`;
      content += `---------------------\n`;
      keyPoints.forEach((point, idx) => {
        content += `${idx + 1}. ${point}\n`;
      });
      content += `\n`;

      content += `DECISIONS MADE\n`;
      content += `--------------\n`;
      decisions.forEach((dec, idx) => {
        content += `${idx + 1}. ${dec}\n`;
      });
      content += `\n`;

      content += `ACTION ITEMS\n`;
      content += `------------\n`;
      actionItems.forEach((item, idx) => {
        content += `${idx + 1}. [${item.status.toUpperCase()}] ${item.title} (Owner: ${item.owner}, Due: ${item.dueDate})\n`;
      });
      content += `\n`;

      content += `RISKS IDENTIFIED\n`;
      content += `----------------\n`;
      risks.forEach((risk, idx) => {
        content += `${idx + 1}. ${risk}\n`;
      });
      content += `\n`;

      content += `FULL TRANSCRIPT\n`;
      content += `---------------\n`;
      if (segments.length > 0) {
        segments.forEach(seg => {
          const timestamp = new Date(seg.start * 1000).toISOString().substr(14, 5);
          content += `[${timestamp}] ${seg.speaker}:\n${seg.text}\n\n`;
        });
      } else {
        content += transcript ? transcript.rawText : 'No transcript text available.';
      }

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="MeetMind_${meeting.title.replace(/\s+/g, '_')}.txt"`);
      return res.send(content);
    }

    // 2. WORD (DOCX/DOC) FORMAT using HTML rendering
    if (format === 'docx' || format === 'doc') {
      let content = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <title>${meeting.title}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; }
            h1 { color: #0f172a; font-size: 24pt; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
            h2 { color: #1e3a8a; font-size: 16pt; margin-top: 24px; border-bottom: 1px solid #e2e8f0; }
            .meta { background-color: #f1f5f9; padding: 12px; border-left: 4px solid #3b82f6; margin-bottom: 20px; }
            .meta p { margin: 4px 0; font-size: 10.5pt; }
            .badge { background: #3b82f6; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold; }
            ul { margin-top: 4px; }
            li { margin-bottom: 6px; }
            .transcript-segment { margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px dashed #f1f5f9; }
            .timestamp { color: #64748b; font-size: 9pt; font-weight: bold; }
            .speaker { font-weight: bold; color: #0f172a; }
          </style>
        </head>
        <body>
          <h1>MeetMind AI - Meeting Report</h1>
          <div class="meta">
            <p><strong>Title:</strong> ${meeting.title}</p>
            <p><strong>Category:</strong> ${meeting.category}</p>
            <p><strong>Date:</strong> ${dateStr}</p>
            <p><strong>Duration:</strong> ${Math.floor(meeting.duration / 60)} minutes</p>
            <p><strong>Productivity Score:</strong> ${summary.productivityScore}/100</p>
            <p><strong>Sentiment:</strong> ${summary.sentiment}</p>
          </div>

          <h2>Executive Summary</h2>
          <p>${summary.executiveSummary}</p>

          <h2>Key Discussion Points</h2>
          <ul>
            ${keyPoints.map(p => `<li>${p}</li>`).join('')}
          </ul>

          <h2>Decisions Made</h2>
          <ul>
            ${decisions.map(d => `<li><strong>Approved:</strong> ${d}</li>`).join('')}
          </ul>

          <h2>Action Items</h2>
          <table border="1" cellspacing="0" cellpadding="8" style="border-collapse:collapse; width:100%; border:1px solid #cbd5e1;">
            <tr style="background-color:#f8fafc;">
              <th>Task</th>
              <th>Owner</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
            ${actionItems.map(item => `
              <tr>
                <td>${item.title}</td>
                <td>${item.owner}</td>
                <td>${item.dueDate}</td>
                <td>${item.status.toUpperCase()}</td>
              </tr>
            `).join('')}
          </table>

          <h2>Risks & Constraints</h2>
          <ul>
            ${risks.map(r => `<li>${r}</li>`).join('')}
          </ul>

          <h2>Full Dialogue Transcript</h2>
          ${segments.map(seg => {
            const timestamp = new Date(seg.start * 1000).toISOString().substr(14, 5);
            return `
              <div class="transcript-segment">
                <span class="timestamp">[${timestamp}]</span> <span class="speaker">${seg.speaker}:</span><br/>
                <span>${seg.text}</span>
              </div>
            `;
          }).join('')}
        </body>
        </html>
      `;

      res.setHeader('Content-Type', 'application/msword');
      res.setHeader('Content-Disposition', `attachment; filename="MeetMind_${meeting.title.replace(/\s+/g, '_')}.doc"`);
      return res.send(content);
    }

    // 3. PDF FORMAT: Deliver as HTML view configured for printing
    if (format === 'pdf') {
      let content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>MeetMind AI Report - ${meeting.title}</title>
          <style>
            @media print {
              body { font-size: 11pt; }
              button { display: none; }
              .no-print { display: none; }
            }
            body { font-family: 'Inter', -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; line-height: 1.6; }
            header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
            h1 { font-size: 24px; margin: 0; color: #0f172a; }
            .print-btn { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px; }
            .print-btn:hover { background: #2563eb; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 30px; }
            .meta-item { font-size: 14px; }
            .meta-item strong { color: #475569; }
            h2 { font-size: 18px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-top: 30px; }
            .score-badge { display: inline-block; background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 12px; }
            .sentiment-badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 12px; margin-left: 10px; }
            .action-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            .action-table th, .action-table td { border: 1px solid #cbd5e1; padding: 12px; text-align: left; }
            .action-table th { background: #f8fafc; color: #475569; font-weight: bold; }
            .dialogue { margin-bottom: 15px; border-left: 3px solid #cbd5e1; padding-left: 12px; }
            .dialogue-speaker { font-weight: bold; color: #0f172a; font-size: 14px; }
            .dialogue-time { color: #64748b; font-size: 12px; margin-left: 8px; }
          </style>
        </head>
        <body>
          <header>
            <div>
              <h1>MeetMind AI - Report</h1>
              <small style="color: #64748b;">Enterprise Meeting Intelligence</small>
            </div>
            <button onclick="window.print()" class="print-btn no-print">Print / Save as PDF</button>
          </header>
          
          <div class="meta-grid">
            <div class="meta-item"><strong>Meeting Title:</strong> ${meeting.title}</div>
            <div class="meta-item"><strong>Category:</strong> ${meeting.category}</div>
            <div class="meta-item"><strong>Date:</strong> ${dateStr}</div>
            <div class="meta-item"><strong>Duration:</strong> ${Math.floor(meeting.duration / 60)} mins</div>
            <div class="meta-item" style="grid-column: span 2;">
              <strong>Metrics:</strong> 
              <span class="score-badge">Productivity: ${summary.productivityScore}/100</span>
              <span class="sentiment-badge">Sentiment: ${summary.sentiment}</span>
            </div>
          </div>

          <h2>Executive Summary</h2>
          <p>${summary.executiveSummary}</p>

          <h2>Key Discussion Points</h2>
          <ul>
            ${keyPoints.map(p => `<li style="margin-bottom: 8px;">${p}</li>`).join('')}
          </ul>

          <h2>Decisions Made</h2>
          <ul>
            ${decisions.map(d => `<li style="margin-bottom: 8px;"><strong>Approved:</strong> ${d}</li>`).join('')}
          </ul>

          <h2>Action Items & Deliverables</h2>
          <table class="action-table">
            <thead>
              <tr>
                <th>Action Description</th>
                <th>Owner</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${actionItems.map(item => `
                <tr>
                  <td>${item.title}</td>
                  <td><strong>${item.owner}</strong></td>
                  <td>${item.dueDate}</td>
                  <td><span style="font-weight:bold; color: ${item.status === 'completed' ? '#16a34a' : item.status === 'in progress' ? '#ea580c' : '#475569'}">${item.status.toUpperCase()}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Risks & Constraints</h2>
          <ul>
            ${risks.map(r => `<li style="margin-bottom: 8px;">${r}</li>`).join('')}
          </ul>

          <h2>Full Dialogue Transcript</h2>
          ${segments.map(seg => {
            const timestamp = new Date(seg.start * 1000).toISOString().substr(14, 5);
            return `
              <div class="dialogue">
                <div>
                  <span class="dialogue-speaker">${seg.speaker}</span>
                  <span class="dialogue-time">[${timestamp}]</span>
                </div>
                <div style="font-size: 14.5px; margin-top: 4px;">${seg.text}</div>
              </div>
            `;
          }).join('')}
        </body>
        </html>
      `;

      res.setHeader('Content-Type', 'text/html');
      return res.send(content);
    }

    res.status(400).json({ message: 'Invalid format requested' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error generating document report' });
  }
};

module.exports = {
  exportReport
};
