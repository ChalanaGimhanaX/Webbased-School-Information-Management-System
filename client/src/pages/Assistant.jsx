import React, { useCallback, useContext } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ChatPanel from '../components/assistant/ChatPanel';
import Icon from '../components/ui/Icon';

/** Full-screen Study Buddy. Students only – the backend enforces the same rule. */
const Assistant = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const initialPrompt = location.state?.prompt;

  // Clear the router state once the prompt was sent so a refresh/back does not resend it.
  const consumePrompt = useCallback(() => {
    navigate(location.pathname, { replace: true, state: null });
  }, [navigate, location.pathname]);

  if (user?.role !== 'STUDENT') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-7.5rem)] min-h-[28rem] max-w-5xl flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2 animate-fade-up">
        <div>
          <h1 className="flex items-center gap-2 text-headline-lg font-bold tracking-tight text-on-surface">
            <Icon name="smart_toy" size={28} filled className="text-primary" /> AI Study Buddy
          </h1>
          <p className="text-body-md text-on-surface-variant">A personal AI tutor that knows your timetable, attendance and published results.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-tertiary-fixed/60 px-3 py-1 text-label-md font-semibold text-on-tertiary-fixed">
          <Icon name="lock" size={14} /> Only your own records are shared with the AI
        </div>
      </div>
      <div className="min-h-0 flex-1 animate-scale-in">
        <ChatPanel variant="page" initialPrompt={initialPrompt} onInitialPromptConsumed={consumePrompt} />
      </div>
    </div>
  );
};

export default Assistant;

