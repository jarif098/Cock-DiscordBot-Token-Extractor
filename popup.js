document.getElementById('getToken').addEventListener('click', async () => {
  const resultEl = document.getElementById('result');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.url || !tab.url.includes('discord.com')) {
    resultEl.className = 'status-box status-warn';
    resultEl.innerHTML = '⚠️ <b>Please open Discord in this tab first!</b>';
    return;
  }

  resultEl.className = 'status-box status-idle';
  resultEl.innerText = 'Extracting token...';

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    world: 'MAIN',
    func: () => {
      let token = null;
      try {
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        token = iframe.contentWindow.localStorage.token?.replace(/"/g, '');
        document.body.removeChild(iframe);
      } catch (e) {
        console.error('Method 1 failed', e);
      }

      if (!token) {
        try {
          window.webpackChunkdiscord_app.push([
            [Math.random()],
            {},
            (req) => {
              for (const m of Object.keys(req.c).map((x) => req.c[x].exports).filter((x) => x)) {
                if (m.default && m.default.getToken !== undefined) {
                  token = m.default.getToken();
                  break;
                }
                if (m.getToken !== undefined) {
                  token = m.getToken();
                  break;
                }
              }
            },
          ]);
        } catch (e) {
          console.error('Method 2 failed', e);
        }
      }
      return token;
    }
  }, (results) => {
    if (results && results[0] && results[0].result) {
      const token = results[0].result;
      navigator.clipboard.writeText(token);
      resultEl.className = 'status-box status-success';
      resultEl.innerHTML = `
        <div class="success-title">
          <span class="success-badge">✓ COPIED</span>
          <span>In Clipboard</span>
        </div>
        <textarea readonly class="token-field" id="tokenField">${token}</textarea>
        <div class="copy-tip">Click to select all</div>
      `;
      const tokenField = document.getElementById('tokenField');
      if (tokenField) {
        tokenField.addEventListener('click', () => tokenField.select());
      }
    } else {
      resultEl.className = 'status-box status-error';
      resultEl.innerHTML = '❌ <b>Could not find token</b><br>Make sure you are logged in to Discord.';
    }
  });
});
