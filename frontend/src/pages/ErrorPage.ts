export function ErrorPage(): string {
    return `
        <style>
        .error-page {
            min-height: 70vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: none;
            font-family: 'DM Sans', Arial, sans-serif;
        }
        .error-img {
            width: 120px;
            height: 120px;
            margin-bottom: 24px;
            border-radius: 50%;
            background: #BABBD6;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 24px rgba(255,68,68,0.12);    
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
            <div class="error-img">😵‍💫</div>
            <div class="error-title">Oops! Something went wrong</div>
            <div class="error-desc">Please try again or contact support.<br>We're working to fix it.</div>
            <a href="#/" class="error-home-btn">Go to Home</a>
        </div>
    `;
}
