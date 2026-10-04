function copyWithFallback(value) {
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const succeeded = document.execCommand('copy');
  document.body.removeChild(textarea);
  if (!succeeded) {
    throw new Error('execCommand copy failed');
  }
}

export async function copyTextToClipboard(value) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error('Nothing to copy');
  }

  try {
    if (navigator.clipboard?.writeText) {
      await Promise.race([
        navigator.clipboard.writeText(value),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('clipboard timeout')), 1200);
        }),
      ]);
      return;
    }
    copyWithFallback(value);
  } catch {
    copyWithFallback(value);
  }
}
