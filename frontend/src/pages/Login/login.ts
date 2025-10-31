import { getAccessToken, setAccessToken, clearAuth, isLoggedIn } from "../../state/authState"
import { getLoginHtml, TwoFAFormHtml } from "./loginTemplate"
import { setupLoginHandlers } from "./loginHandlers";
import { getElement, hideElement } from "./loginDOM"

const apiHost = `${window.location.hostname}`;

export function Login(): string {
  return getLoginHtml();
}

export function TwoFALogin(check: number): string {
  if (check === 1)
    return TwoFAFormHtml();
  else
    location.hash = "#/login";
  return ("");
}

export function loginHandlers(): void {
  setupLoginHandlers();
  setupLoginTabs();
}

  export function TwoFAForm(): string {
    const body = document.querySelector("body")!;
    body.style.background = "black";
    body.style.minHeight = "100vh";
    const html = document.querySelector("html")!;
    html.style.background = "black";

    return `
    <div class="twofa-body">
        <h1 id="2fa-title">Enable two-factor authentication (2FA)</h1>
        <div class="twofa-block">
            <div>
                <h2>Setup authenticator app</h2>
                <p id="twofa-paragraph">Authenticator apps and browser extensions like 1Password, Authy, Microsoft Authenticator, etc.
                    generate one-time passwords that are used as a second factor to verify your identity when prompted 
                    during sign-in.
                </p>
            </div>
            <div>
                <h3 id="twofa-h3-title">Scan the QR code</h3>
                <p id="twofa-paragraph">Use an authenticator app or browser extension to scan.</p>
                <div class="twofa-qrcode"></div>
            </div>
            <div>
                <h3 id="twofa-h3-title">Verify the code from the app</h3>
                <form id="twofa-form">
                    <input type="text" id="twofa-code" placeholder="6-digit code">
                    <hr style="width: 100%; border: 1px solid #5a5f66;">
                    <div id="twofa-buttons">
                    <button type="button" id="twofa-cancel" onclick="window.location.href='#/login'">Cancel</button>
                        <button id="twofa-submit" type="submit">Verify</button>
                        <p id="twofa-result"></p>
                    </div>
                    </form>
            </div>
        </div>
    </div>
      `;
  }

  export function Enable2FA(): string {
    return `
      <h2 style="color:white">Two-Factor Authentication</h2>
      <button id="enable-2fa-btn">Enable 2FA</button>
      <button id="show-qr-btn" style="display:none; margin-left:1rem;">Generate QR</button>

      <div id="qr-container" style="margin-top:1rem;"></div>
      <form id="verify-2fa-form" style="display:none; margin-top:1rem;">
        <input type="text" id="verify-2fa-code" placeholder="Enter 6-digit code" required />
        <button type="submit">Verify</button>
      </form>
      <p id="enable-2fa-result"></p>
      `;
  }

  export function enable2FAHandlers(userId: number, username: string) {
    const enableBtn = document.querySelector<HTMLButtonElement>("#enable-2fa-btn")!;
    const showQRBtn = document.querySelector<HTMLButtonElement>("#show-qr-btn")!;
    const qrContainer = document.querySelector<HTMLDivElement>("#qr-container")!;
    const form = document.querySelector<HTMLFormElement>("#verify-2fa-form")!;
    const result = document.querySelector<HTMLParagraphElement>("#enable-2fa-result")!;
    enableBtn.onclick = async () => {
      try {
        const token = getAccessToken();
        const res = await fetch(`http://${apiHost}:8080/auth/enable-2fa`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ username, userId }),
         });

         const data = await res.json();

         if (res.ok) {
          if (result)
            result.textContent = "2FA enabled. Now click 'Generate QR' to continue."
          showQRBtn.style.display = "inline-block";
          enableBtn.disabled = true;
         } else {
          result.textContent = `${data.error || "Failed to enable 2FA"}`;
         }
      } catch {
        result.textContent = "Failed to reach server";
      }
    };

        if (showQRBtn) {
          showQRBtn.onclick = async () => {
           try {
             const token = getAccessToken();
             const res = await fetch(`http://${apiHost}:8080/auth/generate-qr`, {
               method: "POST",
               headers: {
                 "Content-Type": "application/json",
                 "Authorization": `Bearer ${token}`
               },
               body: JSON.stringify({ username, userId }),
             });
 
             const data = await res.json();
 
             if (res.ok && data.qr) {
               qrContainer.innerHTML = `<img src="${data.qr}" alt="QR Code" />`;
               form.style.display = "block";
              if (result)
               result.textContent = "Scan the QR in your authentication app, then verify the code below.";
             } else {
                if (result)
                 result.textContent = `${data.error || "Failed to generate the QR Code."}`;
             }
           } catch {
            if (result)
              result.textContent = "Failed to reach server";
           }
         };
        }

    form.onsubmit = async (e) => {
      e.preventDefault();

      const code = (document.querySelector<HTMLInputElement>("#verify-2fa-code")!).value;

      try {
        const res = await fetch(`http://${apiHost}:8080/auth/verify-2fa`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, code }),
          credentials: "include",
        });

        const data = await res.json();

        if (res.ok && data.success) {
          if (result)
            result.textContent = "2FA enabled and verified!";
          qrContainer.style.display = "none";
          showQRBtn.style.display = "nono";
          form.style.display = "none";
          const userStr = localStorage.getItem("user");
          const user = JSON.parse(userStr!);
          const actualUser = user.user || user;
          actualUser.twofa = 1;
          localStorage.removeItem("user");
          localStorage.setItem("user", JSON.stringify(actualUser));
          location.reload();
        }
        if (res.ok && data.accessToken) {
          setAccessToken(data.accessToken);
        } else {
          if (result)
            result.textContent = `${data.error || "Invalid code"}`;
        }
      } catch (err) {
          if (result)
            result.textContent = "Failed to reach server";
      }
    };
  }

export function setupLoginTabs(): void {
  const tabLinks = document.querySelectorAll(".login-nav-link");
  const tabPanes = document.querySelectorAll(".login-tab-panel");
  const tabLinkAccount = document.querySelectorAll(".login-nav-link-account");
  const tabLinkPassword = document.querySelectorAll(".login-nav-link-password");
  const result = getElement<HTMLParagraphElement>("#result");

  tabLinks.forEach(link => {
    link.addEventListener("click", function (this: HTMLElement, e) {
      e.preventDefault();
      e.stopPropagation();

      hideElement(result);
      
      const target = this.getAttribute("data-tab");
      if (!target) return;

      tabLinks.forEach(link => link.classList.remove("active"));
      tabPanes.forEach(pane => pane.classList.remove("active"));
      tabLinkAccount.forEach(account => account.classList.remove("active"));
      tabLinkPassword.forEach(pass => pass.classList.remove("active"));

      this.classList.add("active");
      document.getElementById(target)?.classList.add("active");

      if (target === "login-tab-panel") {
        tabLinkPassword.forEach(pass => pass.classList.add("active"));
      } else if (target === "signup-tab-panel") {
        tabLinkAccount.forEach(account => account.classList.add("active"));
      }
    });
  });

  tabLinkAccount.forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Reset all
      tabLinks.forEach(link => link.classList.remove("active"));
      tabPanes.forEach(pane => pane.classList.remove("active"));
      tabLinkAccount.forEach(account => account.classList.remove("active"));
      tabLinkPassword.forEach(pass => pass.classList.remove("active"));

      // Activate Login tab
      const loginNavLink = document.querySelector('.login-nav-link[data-tab="login-tab-panel"]');
      loginNavLink?.classList.add("active");

      document.getElementById("login-tab-panel")?.classList.add("active");
      tabLinkPassword.forEach(pass => pass.classList.add("active"));
    });
  });
}
