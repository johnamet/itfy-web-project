/**
 * Empty notice html
 * @param {string} item - The item to display the notice for
 * @param {string} message - The message to display
 * @return {HTMLDivElement} - An HTML element
 */
export function emptyNotice(item, message) {
    const notice = document.createElement('div');
    notice.className = 'empty-notice';

    const noticeMessage = document.createElement('p');
    noticeMessage.textContent = `${item} - ${message}`;
    noticeMessage.className = 'empty-notice-message';

    notice.style.background = 'linear-gradient(45deg, #ff0000, #0000ff)';
    notice.style.backgroundSize = '400% 400%';
    notice.style.animation = 'gradientAnimation 15s ease infinite';

    notice.appendChild(noticeMessage);
    return notice;
}