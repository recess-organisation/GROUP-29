import { useState } from 'react';

export default function UssdSimulator() {
  const [phone, setPhone] = useState('256700000001');
  const [sessionId, setSessionId] = useState(null);
  const [step, setStep] = useState(0);
  const [response, setResponse] = useState('Press a button to start');

  async function send(input) {
    const sid = sessionId || 'ussd_' + Date.now();
    if (!sessionId) setSessionId(sid);
    if (input === '') { setStep(0); setSessionId(null); }
    const newStep = step + 1;
    setStep(newStep);
    const text = newStep === 1 ? input : (sessionId || sid) + '*' + input;
    const payload = { sessionId: sid, serviceCode: '*285#', phoneNumber: phone, text: newStep === 1 ? input : text };
    try {
      const res = await fetch('/ussd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResponse(data.response || JSON.stringify(data));
    } catch (e) {
      setResponse('Error: ' + e.message);
    }
  }

  function reset() {
    setSessionId(null); setStep(0); setResponse('Press a button to start');
  }

  return (
    <>
      <h1 className="h3 mb-3">USSD Simulator</h1>
      <div className="content-panel">
        <div className="mb-3">
          <label className="form-label">Phone number</label>
          <input className="form-control" style={{ maxWidth: 300 }} value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div className="d-flex flex-wrap gap-2 mb-3">
          <button className="btn btn-primary btn-sm" onClick={() => send('')}>Start (*285#)</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => send('1')}>1. Login</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => send('2')}>2. Learn More</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => send('1*2020')}>PIN + Age</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => send('2')}>Age: 18+</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => send('5')}>Lang: English</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => send('1')}>Option 1</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => send('0')}>Back/Exit</button>
          <button className="btn btn-secondary btn-sm" onClick={reset}>Reset</button>
        </div>
        <div className="mb-2"><strong>Custom input:</strong></div>
        <div className="input-group mb-3" style={{ maxWidth: 400 }}>
          <input className="form-control" id="ussdCustom" placeholder="e.g. 1*2020" />
          <button className="btn btn-outline-primary" onClick={() => { const v = document.getElementById('ussdCustom').value; if (v) send(v); }}>Send</button>
        </div>
        <div><strong>Response:</strong></div>
        <pre className="bg-dark text-success p-3 rounded" style={{ minHeight: 60, whiteSpace: 'pre-wrap' }}>{response}</pre>
      </div>
    </>
  );
}
