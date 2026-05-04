import './styles/simple.css';
import { mountMap } from './components/map-view';
import { mountBuildingDetail, unmountBuildingDetail } from './components/building-detail';
import { initRouter, onRouteChange, parseHash } from './router';
import { fetchBuildingFeedback, submitComment, submitVote } from './utils/feedback-api';

declare global {
  interface Window {
    __submitVote?: (gate: string, isAccurate: boolean) => Promise<void>;
    __toggleComments?: (gate: string) => Promise<void>;
    __submitComment?: (gate: string) => Promise<void>;
  }
}

function installFeedbackHandlers(): void {
  window.__submitVote = async (gate: string, isAccurate: boolean) => {
    const feedback = await submitVote(gate, isAccurate);
    const count = document.querySelector<HTMLElement>(`.row[data-gate="${gate}"] .accuracy-count`);
    if (feedback && count) count.textContent = `${feedback.votes.yes} ✓ · ${feedback.votes.no} ✗`;
  };

  window.__toggleComments = async (gate: string) => {
    const body = document.getElementById(`comments-${gate}`);
    const list = document.getElementById(`comment-list-${gate}`);
    if (!body || !list) return;

    const nextDisplay = body.style.display === 'none' ? 'block' : 'none';
    body.style.display = nextDisplay;
    if (nextDisplay === 'none') return;

    const feedback = await fetchBuildingFeedback(gate);
    list.innerHTML = feedback.comments.length
      ? feedback.comments.map(comment => `<p>${escapeHtml(comment.text)}</p>`).join('')
      : '<p>No comments yet.</p>';
  };

  window.__submitComment = async (gate: string) => {
    const input = document.getElementById(`comment-input-${gate}`) as HTMLTextAreaElement | null;
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    const feedback = await submitComment(gate, text);
    input.value = '';
    const list = document.getElementById(`comment-list-${gate}`);
    if (feedback && list) {
      list.innerHTML = feedback.comments.length
        ? feedback.comments.map(comment => `<p>${escapeHtml(comment.text)}</p>`).join('')
        : '<p>No comments yet.</p>';
    }
  };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderRoute(): void {
  const route = parseHash();
  if (route.kind === 'building') {
    mountBuildingDetail(route.gate);
  } else {
    unmountBuildingDetail();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  installFeedbackHandlers();
  mountMap();
  initRouter();
  onRouteChange(renderRoute);
  renderRoute();
});
