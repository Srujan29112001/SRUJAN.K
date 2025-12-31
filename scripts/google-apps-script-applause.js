// ========================================
// APPLAUSE TIER - Google Apps Script
// ========================================
// Copy this entire code to your Applause Google Apps Script
// URL: https://script.google.com/macros/s/AKfycbyfEzK-XWCLLO7WQnxB5Oo7pP-hrEUHJtHNVXAhEgr7NKcj1ZNRfK_CmZOqIO1y467q/exec

function doPost(e) {
    try {
        // Parse the incoming data
        var data = JSON.parse(e.postData.contents);

        // Get the active spreadsheet and sheet
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

        // Add headers if first row is empty
        if (sheet.getLastRow() === 0) {
            sheet.appendRow([
                'Timestamp',
                'Name',
                'Email',
                'Amount',
                'Currency',
                'Tier',
                'Message',
                'Payment Method'
            ]);
        }

        // Add row to spreadsheet
        sheet.appendRow([
            new Date(),
            data.name || '',
            data.email || '',
            data.amount || '',
            data.currency || '',
            data.tier || 'applause',
            data.message || '',
            data.paymentMethod || ''
        ]);

        // Send email notification
        var subject = '⭐ New Project Applause - ' + data.currency + ' ' + data.amount;

        var body = '🎉 New Project Supporter!\n\n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
            '⭐ Tier: Project Applause\n' +
            '👤 Name: ' + data.name + '\n' +
            '📧 Email: ' + data.email + '\n' +
            '💰 Amount: ' + data.currency + ' ' + data.amount + '\n' +
            '💳 Payment: ' + data.paymentMethod + '\n' +
            '💬 Feedback: ' + (data.message || 'No feedback') + '\n' +
            '🕐 Time: ' + new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + '\n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

        // Send to your email
        MailApp.sendEmail('srujan.hardik@gmail.com', subject, body);

        return ContentService.createTextOutput(JSON.stringify({ success: true }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        Logger.log('Error: ' + error.toString());
        return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function doGet(e) {
    return ContentService.createTextOutput('Applause Support Form API is working!')
        .setMimeType(ContentService.MimeType.TEXT);
}
