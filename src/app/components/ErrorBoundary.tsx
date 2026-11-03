import { Component, type ReactNode } from 'react';

/** Contains a rendering error to one panel instead of blanking the whole app. */
export class ErrorBoundary extends Component<{ children: ReactNode; label: string; resetKey?: unknown }, { error: Error | null; key: unknown }> {
  state = { error: null as Error | null, key: this.props.resetKey };
  static getDerivedStateFromError(error: Error) { return { error }; }
  static getDerivedStateFromProps(p: { resetKey?: unknown }, s: { error: Error | null; key: unknown }) {
    return p.resetKey !== s.key ? { error: null, key: p.resetKey } : null;
  }
  componentDidCatch(error: Error) { console.error(error); }
  render() {
    if (!this.state.error) return this.props.children;
    const he = document.documentElement.lang === 'he';
    return (
      <div className="banner err" role="alert" style={{ borderRadius: 8 }}>
        <div>
          <b>{he ? `משהו השתבש בחלק "${this.props.label}".` : `Something went wrong in “${this.props.label}”.`}</b>{' '}
          {he ? 'שאר היישום ממשיך לעבוד; אפשר לבטל את השינוי האחרון או לנסות שוב.' : 'The rest of the app still works; undo your last change or try again.'}
          <div className="tiny muted mono" style={{ marginTop: 4 }}>{this.state.error.message}</div>
          <button className="btn small" style={{ marginTop: 6 }} onClick={() => this.setState({ error: null })}>{he ? 'נסו שוב' : 'Try again'}</button>
        </div>
      </div>
    );
  }
}
