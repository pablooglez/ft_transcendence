export function ErrorPage(): string {
    return `
        <style>
        .error-page {
            min-height: 70vh;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            background: none;
            font-family: 'DM Sans', Arial, sans-serif;
            gap: 48px;
        }
        .error-img {
            width: 520px;
            height: 520px;
            margin-bottom: 40px;
            border-radius: 16px;
            background: none;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: none;
            font-size: 64px;
            animation: shake 0.7s;
        }
        @keyframes shake {
            0% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-8px); }
            80% { transform: translateX(8px); }
            100% { transform: translateX(0); }
        }
        .error-title {
            color: #c80000;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 12px;
            letter-spacing: 1px;
            text-shadow: 0 2px 8px rgba(200,0,0,0.10);
        }
        .error-desc {
            color: #fff;
            font-size: 1.1rem;
            margin-bottom: 32px;
            text-align: center;
            max-width: 340px;
            text-shadow: 0 2px 8px rgba(0,0,0,0.18);
        }
        .error-home-btn {
            background: #25D366;
            color: #fff;
            border: none;
            border-radius: 6px;
            padding: 10px 28px;
            font-size: 1rem;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(37,211,102,0.08);
            transition: background 0.2s;
        }
        .error-home-btn:hover {
            background: #1cae53;
        }
        </style>
        <div class="error-page">
            <div class="error-content" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:320px;">
                <div style="font-size:5rem;font-weight:900;color:#c80000;line-height:1;margin-bottom:10px;text-shadow:0 4px 24px rgba(200,0,0,0.18);">404</div>
                <div class="error-title">Page not found.</div>
                <div class="error-desc">Our experts are working on it.</div>
                <a href="#/" class="error-home-btn">Go to Home</a>
            </div>
            <div class="error-img">
                <img src="public/error_page_image.jpg" alt="Error" style="width:88%;height:88%;border-radius:12px;object-fit:cover;" />
            </div>
        </div>
    `;
}
