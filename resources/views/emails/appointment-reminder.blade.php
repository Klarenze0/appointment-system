<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; color: #18181b; background: #f4f4f5; margin: 0; padding: 0; }
        .wrapper { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e4e4e7; }
        .header { background: #18181b; color: #fff; padding: 24px 32px; }
        .header h1 { margin: 0; font-size: 18px; font-weight: 700; }
        .body { padding: 32px; }
        .label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #71717a; margin-bottom: 4px; }
        .value { font-size: 15px; color: #18181b; font-weight: 500; margin-bottom: 20px; }
        .footer { padding: 16px 32px; background: #f4f4f5; font-size: 11px; color: #a1a1aa; }
        .badge { display: inline-block; background: #fef9c3; color: #854d0e; padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <h1>Appointment Tomorrow 🔔</h1>
        </div>
        <div class="body">
            <span class="badge">REMINDER</span>
            <p style="margin: 0 0 24px; color: #3f3f46;">
                Hi {{ $appointment->client->name }}, this is a reminder that you have an appointment tomorrow.
            </p>

            <div class="label">Service</div>
            <div class="value">{{ $appointment->service->name }}</div>

            <div class="label">Staff</div>
            <div class="value">{{ $appointment->staff->user->name }}</div>

            <div class="label">Date & Time</div>
            <div class="value">
                {{ \Carbon\Carbon::parse($appointment->starts_at)->timezone('Asia/Manila')->format('l, F j, Y \a\t g:i A') }}
            </div>

            <div class="label">Duration</div>
            <div class="value">{{ $appointment->service->duration_minutes }} minutes</div>
        </div>
        <div class="footer">
            This is an automated message from Appointment System.
        </div>
    </div>
</body>
</html>