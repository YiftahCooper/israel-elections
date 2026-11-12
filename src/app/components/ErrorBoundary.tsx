import { Component, type ReactNode } from 'react';

/** A part of the app whose code could not be downloaded (a dropped connection, or an app updated since the page was
 *  opened, whose old code files are gone): trying again asks for it once more; reloading fetches the current app. */
export const codeNotLoaded = (e: Error) => /dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i.test(e.message);

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
    const code = codeNotLoaded(this.state.error);
    return (
      <div className="banner err" role="alert" style={{ borderRadius: 8 }}>
        <div>
          {code
            ? <><b>{he ? `לא ניתן היה להוריד את "${this.props.label}".` : `“${this.props.label}” could not be downloaded.`}</b>{' '}
              {he ? 'שאר היישום ממשיך לעבוד. נסו שוב, ואם זה לא עוזר, טענו מחדש את הדף.' : 'The rest of the app still works. Try again; if that does not help, reload the page.'}</>
            : <><b>{he ? `משהו השתבש בחלק "${this.props.label}".` : `Something went wrong in “${this.props.label}”.`}</b>{' '}
              {he ? 'שאר היישום ממשיך לעבוד; אפשר לבטל את השינוי האחרון או לנסות שוב.' : 'The rest of the app still works; undo your last change or try again.'}</>}
          <div className="tiny muted mono" style={{ marginTop: 4 }}>{this.state.error.message}</div>
          <button className="btn small" style={{ marginTop: 6 }} onClick={() => this.setState({ error: null })}>{he ? 'נסו שוב' : 'Try again'}</button>
          {code && <> <button className="btn small" style={{ marginTop: 6 }} onClick={() => location.reload()}>{he ? 'טעינה מחדש' : 'Reload'}</button></>}
        </div>
      </div>
    );
  }
}

/** The kept unsaved work of earlier visits (src/app/store.ts, workspace); dropped only by "Start fresh" below. */
const WORKSPACE_KEY = 'israel-elections:workspace:v1';

/** The whole app's last resort: an error that no panel contained shows the app's own message, never a blank page.
 *  Reload tries again; Start fresh also leaves out the unsaved work kept from earlier visits (saved scenarios and
 *  settings stay), for the case where that work is what cannot be shown. */
export class RootBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error(error); }
  render() {
    if (!this.state.error) return this.props.children;
    const he = document.documentElement.lang !== 'en';
    const fresh = () => { try { localStorage.removeItem(WORKSPACE_KEY); } catch { /* storage unavailable: nothing kept */ } location.reload(); };
    return (
      <div className="app" dir={he ? 'rtl' : 'ltr'}>
        <div className="banner err" role="alert" style={{ margin: 20, borderRadius: 8 }}>
          <div>
            <b>{he ? 'משהו השתבש, והדף לא הוצג.' : 'Something went wrong and the page could not be shown.'}</b>{' '}
            {he ? 'טענו מחדש את הדף. אם זה חוזר, "התחלה נקייה" משמיטה את העבודה שלא נשמרה מהביקור הקודם; התרחישים השמורים וההגדרות נשארים.'
              : 'Reload the page. If it happens again, Start fresh leaves out the unsaved work from your last visit; saved scenarios and settings stay.'}
            <div className="tiny muted mono" style={{ marginTop: 4 }}>{this.state.error.message}</div>
            <button className="btn small" style={{ marginTop: 6 }} onClick={() => location.reload()}>{he ? 'טעינה מחדש' : 'Reload'}</button>{' '}
            <button className="btn small" style={{ marginTop: 6 }} onClick={fresh}>{he ? 'התחלה נקייה' : 'Start fresh'}</button>
          </div>
        </div>
      </div>
    );
  }
}
