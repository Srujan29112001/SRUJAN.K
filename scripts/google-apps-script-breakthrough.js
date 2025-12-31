// ========================================
// BREAKTHROUGH (FUNDING) TIER - Google Apps Script
// ========================================
// Copy this entire code to your Breakthrough Google Apps Script
// URL: https://script.google.com/macros/s/AKfycbwGwL1I2S3J739K07a3ewDY45C-ctc2yPOaVPrpfgvQQI2ZWuzr2_a5wyJwahEbN3xT/exec

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
            data.tier || 'breakthrough',
            data.message || '',
            data.paymentMethod || ''
        ]);

        // Send email notification
        var subject = '🚀 NEW BREAKTHROUGH FUNDING - ' + data.currency + ' ' + data.amount;

        var body = '🎉🎉🎉 MAJOR FUNDING RECEIVED! 🎉🎉🎉\n\n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
            '🚀 Tier: Fund a Breakthrough\n' +
            '👤 Name: ' + data.name + '\n' +
            '📧 Email: ' + data.email + '\n' +
            '💰 Amount: ' + data.currency + ' ' + data.amount + '\n' +
            '💳 Payment: ' + data.paymentMethod + '\n' +
            '💬 Message: ' + (data.message || 'No message') + '\n' +
            '🕐 Time: ' + new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + '\n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
            '⚡ This is a verified breakthrough investor!';

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
    return ContentService.createTextOutput('Breakthrough Funding Form API is working!')
        .setMimeType(ContentService.MimeType.TEXT);
}
