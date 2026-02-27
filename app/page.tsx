'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { FiShield, FiActivity, FiLock, FiEye, FiKey } from 'react-icons/fi'

import ScanInput from './sections/ScanInput'
import ResultsDashboard from './sections/ResultsDashboard'
import RemediationPanel from './sections/RemediationPanel'
import ScanHistory from './sections/ScanHistory'

// --- Types ---

interface ScanSummary {
  total_findings: number
  critical_count: number
  high_count: number
  medium_count: number
  low_count: number
}

interface SecretFinding {
  type: string
  severity: string
  location: string
  description: string
  exposed_value_preview: string
}

interface PIIFinding {
  type: string
  severity: string
  location: string
  description: string
  data_preview: string
}

interface RemediationStep {
  finding_reference: string
  priority: string
  action: string
  detailed_steps: string
  compliance_notes: string
}

interface ComplianceSummary {
  gdpr_relevant: boolean
  hipaa_relevant: boolean
  pci_dss_relevant: boolean
  sox_relevant: boolean
  notes: string
}

interface ThreatReport {
  overall_risk_level: string
  scan_summary: ScanSummary
  secret_findings: SecretFinding[]
  pii_findings: PIIFinding[]
  remediation_steps: RemediationStep[]
  compliance_summary: ComplianceSummary
}

interface HistoryEntry {
  id: string
  timestamp: string
  riskLevel: string
  totalFindings: number
  data: ThreatReport
}

// --- Constants ---

const MANAGER_AGENT_ID = '69a171bde64a6ab5efd55c8b'

const SAMPLE_DATA: ThreatReport = {
  overall_risk_level: 'Critical',
  scan_summary: {
    total_findings: 5,
    critical_count: 2,
    high_count: 1,
    medium_count: 1,
    low_count: 1,
  },
  secret_findings: [
    {
      type: 'AWS Access Key',
      severity: 'Critical',
      location: 'config/settings.py:42',
      description: 'Hardcoded AWS access key with potential full account access',
      exposed_value_preview: 'AKIA...X7Q9',
    },
    {
      type: 'Database Connection String',
      severity: 'High',
      location: 'src/db/connection.js:8',
      description: 'MongoDB connection string with embedded username and password',
      exposed_value_preview: 'mongodb://admin:p***@prod-db.example.com',
    },
    {
      type: 'JWT Secret',
      severity: 'Critical',
      location: 'src/auth/token.ts:3',
      description: 'JWT signing secret hardcoded in authentication module',
      exposed_value_preview: 'super_sec***_jwt_key',
    },
  ],
  pii_findings: [
    {
      type: 'Email Address',
      severity: 'Medium',
      location: 'src/utils/test_data.js:15',
      description: 'Personal email address hardcoded in test data file',
      data_preview: 'j***@gmail.com',
    },
    {
      type: 'Social Security Number',
      severity: 'Critical',
      location: 'tests/fixtures/users.json:28',
      description: 'Full SSN hardcoded in test fixture data',
      data_preview: '***-**-6789',
    },
  ],
  remediation_steps: [
    {
      finding_reference: 'AWS Access Key in config/settings.py:42',
      priority: 'P0',
      action: 'Rotate AWS credentials and move to environment variables',
      detailed_steps: '1. Immediately rotate the exposed AWS key in IAM console.\n2. Move credentials to environment variables or AWS Secrets Manager.\n3. Update .gitignore to prevent future exposure.\n4. Audit CloudTrail logs for unauthorized usage.',
      compliance_notes: 'SOX compliance requires audit trail of credential rotation',
    },
    {
      finding_reference: 'SSN in tests/fixtures/users.json:28',
      priority: 'P0',
      action: 'Remove real SSN and replace with synthetic test data',
      detailed_steps: '1. Replace real SSN with synthetic value (e.g., 000-00-0000).\n2. Scrub git history using BFG Repo-Cleaner.\n3. Assess if SSN belongs to a real individual.\n4. If real, initiate breach notification procedure.',
      compliance_notes: 'GDPR Article 33 requires breach notification within 72 hours. CCPA requires notification to affected individuals.',
    },
    {
      finding_reference: 'MongoDB Connection String in src/db/connection.js:8',
      priority: 'P1',
      action: 'Rotate database credentials and use environment variables',
      detailed_steps: '1. Change the MongoDB password immediately.\n2. Store connection string in environment variable.\n3. Use a secrets management solution for production.',
      compliance_notes: 'Database credential exposure may affect PCI-DSS compliance if payment data is stored.',
    },
  ],
  compliance_summary: {
    gdpr_relevant: true,
    hipaa_relevant: false,
    pci_dss_relevant: true,
    sox_relevant: true,
    notes: 'PII exposure may require GDPR breach notification within 72 hours. Database credential exposure with potential PCI-DSS implications.',
  },
}

// --- Error Boundary ---

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 text-slate-100">
          <div className="text-center p-8 max-w-md">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-950/40 border border-red-800/40 mx-auto mb-4">
              <FiShield className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-slate-400 mb-4 text-sm">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-4 py-2 bg-cyan-600 text-white rounded-md text-sm hover:bg-cyan-500 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// --- Theme ---

const THEME_VARS = {
  '--background': '222 47% 4%',
  '--foreground': '210 40% 96%',
  '--card': '222 47% 6%',
  '--card-foreground': '210 40% 96%',
  '--primary': '187 72% 45%',
  '--primary-foreground': '222 47% 4%',
  '--secondary': '217 33% 15%',
  '--secondary-foreground': '210 40% 96%',
  '--muted': '217 33% 15%',
  '--muted-foreground': '215 20% 60%',
  '--accent': '217 33% 15%',
  '--accent-foreground': '210 40% 96%',
  '--destructive': '0 63% 31%',
  '--destructive-foreground': '210 40% 96%',
  '--border': '217 33% 15%',
  '--input': '217 33% 15%',
  '--ring': '187 72% 45%',
  '--radius': '0.5rem',
} as React.CSSProperties

// --- Agent Info ---

interface AgentInfo {
  id: string
  name: string
  role: string
  icon: React.ReactNode
}

const AGENTS: AgentInfo[] = [
  {
    id: '69a171bde64a6ab5efd55c8b',
    name: 'Threat Detection Manager',
    role: 'Orchestrates scanning pipeline and aggregates findings',
    icon: <FiShield className="h-3.5 w-3.5" />,
  },
  {
    id: '69a171a471517abcd697bca1',
    name: 'Secret Scanner Agent',
    role: 'Detects exposed API keys, passwords, tokens, and credentials',
    icon: <FiKey className="h-3.5 w-3.5" />,
  },
  {
    id: '69a171a4095ad0316e3ee748',
    name: 'PII Detection Agent',
    role: 'Identifies personally identifiable information in code',
    icon: <FiEye className="h-3.5 w-3.5" />,
  },
  {
    id: '69a171a494cd820acecdfc42',
    name: 'Remediation Advisor Agent',
    role: 'Generates actionable remediation recommendations',
    icon: <FiActivity className="h-3.5 w-3.5" />,
  },
]

// --- Main Page ---

export default function Page() {
  const [codeContent, setCodeContent] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<ThreatReport | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null)
  const [showSampleData, setShowSampleData] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)

  // Sample data toggle
  useEffect(() => {
    if (showSampleData) {
      setScanResult(SAMPLE_DATA)
      setCodeContent(
        `# config/settings.py\nAWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE"\nAWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"\n\n# src/db/connection.js\nconst mongoUrl = "mongodb://admin:password123@prod-db.example.com:27017/mydb"\n\n# src/utils/test_data.js\nconst testUser = {\n  email: "john.doe@gmail.com",\n  ssn: "123-45-6789"\n}`
      )
      setRepoUrl('https://github.com/example/vulnerable-app')
    } else {
      setScanResult(null)
      setCodeContent('')
      setRepoUrl('')
      setSelectedHistoryId(null)
    }
  }, [showSampleData])

  const handleScan = useCallback(async () => {
    if (!codeContent.trim() && !repoUrl.trim()) return

    setLoading(true)
    setError(null)
    setScanResult(null)
    setSelectedHistoryId(null)
    setActiveAgentId(MANAGER_AGENT_ID)

    try {
      const message = `Scan the following code for security vulnerabilities, exposed secrets, PII, and provide remediation guidance:\n\n${repoUrl.trim() ? `Repository URL: ${repoUrl.trim()}\n\n` : ''}Code Content:\n\`\`\`\n${codeContent}\n\`\`\``

      const result = await callAIAgent(message, MANAGER_AGENT_ID)

      if (result.success) {
        const data = result?.response?.result as ThreatReport | undefined

        if (data) {
          setScanResult(data)

          // Add to history
          const entry: HistoryEntry = {
            id: `scan-${Date.now()}`,
            timestamp: new Date().toISOString(),
            riskLevel: data?.overall_risk_level ?? 'Unknown',
            totalFindings: data?.scan_summary?.total_findings ?? 0,
            data: data,
          }
          setHistory((prev) => [entry, ...prev].slice(0, 10))
          setSelectedHistoryId(entry.id)
        } else {
          setError('Scan completed but no structured data was returned. The agent may have returned an unexpected format.')
        }
      } else {
        setError(result?.error ?? 'Scan failed. Please try again.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setLoading(false)
      setActiveAgentId(null)
    }
  }, [codeContent, repoUrl])

  const handleSelectHistory = useCallback((entry: HistoryEntry) => {
    setScanResult(entry.data)
    setSelectedHistoryId(entry.id)
  }, [])

  const handleClearHistory = useCallback(() => {
    setHistory([])
    setSelectedHistoryId(null)
  }, [])

  const displayData = scanResult

  return (
    <ErrorBoundary>
      <div style={THEME_VARS} className="min-h-screen bg-gray-950 text-slate-100">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-gray-950/95 backdrop-blur-md">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
                  <FiShield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white tracking-tight">SecureShield</h1>
                  <p className="text-xs text-slate-500 -mt-0.5">AI-Powered Data Loss Prevention</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Sample Data Toggle */}
                <div className="flex items-center gap-2">
                  <Label htmlFor="sample-toggle" className="text-xs text-slate-400 cursor-pointer">
                    Sample Data
                  </Label>
                  <Switch
                    id="sample-toggle"
                    checked={showSampleData}
                    onCheckedChange={setShowSampleData}
                    className="data-[state=checked]:bg-cyan-600"
                  />
                </div>

                <Separator orientation="vertical" className="h-6 bg-slate-800" />

                <div className="flex items-center gap-1.5">
                  <FiLock className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-xs text-slate-400">Secure</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6">
          <div className="flex gap-6">
            {/* Left: Main Content Area */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Scan Input */}
              <ScanInput
                codeContent={codeContent}
                setCodeContent={setCodeContent}
                repoUrl={repoUrl}
                setRepoUrl={setRepoUrl}
                loading={loading}
                error={error}
                onScan={handleScan}
              />

              {/* Results */}
              {displayData && (
                <div className="space-y-6">
                  <ResultsDashboard data={displayData} />
                  <RemediationPanel
                    remediationSteps={Array.isArray(displayData?.remediation_steps) ? displayData.remediation_steps : []}
                    complianceSummary={displayData?.compliance_summary ?? null}
                  />
                </div>
              )}

              {/* Empty State */}
              {!displayData && !loading && (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-800/40 border border-slate-700/30 mb-4">
                    <FiShield className="h-10 w-10 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-400 mb-2">Ready to Scan</h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Paste your code above or provide a repository URL to scan for exposed secrets, PII, and security vulnerabilities. Our AI agents will analyze your code and provide actionable remediation steps.
                  </p>
                </div>
              )}
            </div>

            {/* Right Sidebar: History + Agent Status */}
            <div className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-[88px]">
                <ScanHistory
                  history={history}
                  onSelect={handleSelectHistory}
                  onClear={handleClearHistory}
                  selectedId={selectedHistoryId}
                />

                {/* Agent Status */}
                <Card className="mt-4 border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
                  <CardContent className="pt-4 pb-4 px-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">AI Agents</p>
                    <div className="space-y-2.5">
                      {AGENTS.map((agent) => {
                        const isActive = activeAgentId === agent.id || (loading && agent.id === MANAGER_AGENT_ID)
                        return (
                          <div
                            key={agent.id}
                            className={cn(
                              'flex items-start gap-2.5 p-2 rounded-md transition-all duration-200',
                              isActive ? 'bg-cyan-950/30 border border-cyan-700/30' : 'bg-transparent'
                            )}
                          >
                            <div
                              className={cn(
                                'mt-0.5 flex-shrink-0 p-1 rounded',
                                isActive ? 'text-cyan-400' : 'text-slate-500'
                              )}
                            >
                              {agent.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className={cn('text-xs font-medium truncate', isActive ? 'text-cyan-300' : 'text-slate-300')}>
                                  {agent.name}
                                </p>
                                {isActive && (
                                  <Badge variant="outline" className="text-[10px] px-1 py-0 bg-cyan-950/40 text-cyan-400 border-cyan-700/40 animate-pulse">
                                    Active
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-600 mt-0.5 leading-tight">{agent.role}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Agent Status (shown at bottom on small screens) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-slate-800/60 bg-gray-950/95 backdrop-blur-md px-4 py-2 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiShield className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-xs text-slate-400">4 AI Agents</span>
            </div>
            {loading && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-cyan-950/40 text-cyan-400 border-cyan-700/40 animate-pulse">
                Scanning...
              </Badge>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
