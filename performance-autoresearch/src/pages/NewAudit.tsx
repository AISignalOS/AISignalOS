import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { projectsApi, auditsApi } from '../lib/api'
import LoadingSpinner from '../components/LoadingSpinner'

export default function NewAudit() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    url: '',
    deviceMode: 'mobile' as 'mobile' | 'desktop',
    runs: 1,
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [phase, setPhase] = useState<'idle' | 'creating' | 'auditing' | 'done'>('idle')

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Project name is required'); return }
    if (!form.url.trim()) { setError('URL is required'); return }

    let url = form.url.trim()
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }

    setLoading(true)
    setError('')

    try {
      setPhase('creating')
      const project = await projectsApi.create({
        name: form.name.trim(),
        url,
        deviceMode: form.deviceMode,
        notes: form.notes.trim(),
      })

      setPhase('auditing')
      await auditsApi.runBaseline({
        url,
        projectId: project.id,
        deviceMode: form.deviceMode,
        notes: form.notes.trim(),
        runs: form.runs,
      })

      setPhase('done')
      navigate(`/project/${project.id}`)
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? 'Audit failed'
      setError(msg)
      setPhase('idle')
    } finally {
      setLoading(false)
    }
  }

  const phaseMessages = {
    idle: '',
    creating: 'Creating project...',
    auditing: `Running Lighthouse audit (${form.runs} run${form.runs > 1 ? 's' : ''})...`,
    done: 'Complete!',
  }

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-signal-400" />
          <span className="text-xs font-mono text-signal-400 uppercase tracking-widest">New Audit</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Create Project &amp; Run Baseline</h1>
        <p className="text-slate-400 text-sm mt-1">
          Enter a URL to audit. The baseline Lighthouse run will be stored automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <Field label="Project Name" required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="My Website Optimization"
              className="w-full bg-navy-900 border border-border rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-signal-600 transition-colors"
              disabled={loading}
            />
          </Field>

          <Field label="URL" required>
            <input
              type="text"
              value={form.url}
              onChange={(e) => update('url', e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-navy-900 border border-border rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-signal-600 transition-colors font-mono"
              disabled={loading}
            />
            <p className="text-xs text-slate-600 mt-1">Must be publicly accessible for Lighthouse to reach it.</p>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Device Mode">
              <select
                value={form.deviceMode}
                onChange={(e) => update('deviceMode', e.target.value)}
                className="w-full bg-navy-900 border border-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-signal-600 transition-colors"
                disabled={loading}
              >
                <option value="mobile">Mobile</option>
                <option value="desktop">Desktop</option>
              </select>
            </Field>

            <Field label="Runs for Averaging">
              <select
                value={form.runs}
                onChange={(e) => update('runs', parseInt(e.target.value))}
                className="w-full bg-navy-900 border border-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-signal-600 transition-colors"
                disabled={loading}
              >
                <option value={1}>1 run (fast)</option>
                <option value={3}>3 runs (stable)</option>
                <option value={5}>5 runs (precise)</option>
              </select>
            </Field>
          </div>

          <Field label="Notes (optional)">
            <textarea
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Current state, known issues, context..."
              rows={3}
              className="w-full bg-navy-900 border border-border rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-signal-600 transition-colors resize-none"
              disabled={loading}
            />
          </Field>
        </div>

        {error && (
          <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-4">
            <p className="text-red-400 text-sm font-mono">{error}</p>
            <p className="text-red-400/60 text-xs mt-1">
              Make sure Chrome is installed and the URL is publicly accessible.
            </p>
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-signal-600 hover:bg-signal-500 disabled:bg-signal-600/50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-signal-600/25 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="font-mono text-sm">{phaseMessages[phase]}</span>
              </>
            ) : (
              'Run Baseline Audit'
            )}
          </button>
        </div>
      </form>

      {loading && (
        <div className="mt-4 bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-signal-400 animate-pulse" />
            <div>
              <p className="text-sm text-white font-mono">{phaseMessages[phase]}</p>
              {phase === 'auditing' && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Lighthouse is running headless Chrome. This can take 30–120 seconds.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-signal-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}
