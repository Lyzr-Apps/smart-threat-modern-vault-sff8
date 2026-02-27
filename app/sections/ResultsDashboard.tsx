'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  FiShield,
  FiAlertTriangle,
  FiAlertCircle,
  FiKey,
  FiEye,
  FiDatabase,
  FiLock,
} from 'react-icons/fi'

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

interface ThreatReport {
  overall_risk_level: string
  scan_summary: ScanSummary
  secret_findings: SecretFinding[]
  pii_findings: PIIFinding[]
  remediation_steps: any[]
  compliance_summary: any
}

interface ResultsDashboardProps {
  data: ThreatReport
}

function getSeverityColor(severity: string): string {
  const s = (severity ?? '').toLowerCase()
  if (s === 'critical') return 'bg-red-600/20 text-red-300 border-red-600/40'
  if (s === 'high') return 'bg-orange-600/20 text-orange-300 border-orange-600/40'
  if (s === 'medium') return 'bg-yellow-600/20 text-yellow-300 border-yellow-600/40'
  if (s === 'low') return 'bg-green-600/20 text-green-300 border-green-600/40'
  return 'bg-slate-600/20 text-slate-300 border-slate-600/40'
}

function getRiskBannerColors(level: string): { bg: string; border: string; text: string; icon: string } {
  const l = (level ?? '').toLowerCase()
  if (l === 'critical') return { bg: 'bg-red-950/60', border: 'border-red-700/60', text: 'text-red-300', icon: 'text-red-400' }
  if (l === 'high') return { bg: 'bg-orange-950/60', border: 'border-orange-700/60', text: 'text-orange-300', icon: 'text-orange-400' }
  if (l === 'medium') return { bg: 'bg-yellow-950/60', border: 'border-yellow-700/60', text: 'text-yellow-300', icon: 'text-yellow-400' }
  if (l === 'low') return { bg: 'bg-green-950/60', border: 'border-green-700/60', text: 'text-green-300', icon: 'text-green-400' }
  if (l === 'clean') return { bg: 'bg-emerald-950/60', border: 'border-emerald-700/60', text: 'text-emerald-300', icon: 'text-emerald-400' }
  return { bg: 'bg-slate-800/60', border: 'border-slate-600/60', text: 'text-slate-300', icon: 'text-slate-400' }
}

export default function ResultsDashboard({ data }: ResultsDashboardProps) {
  const riskLevel = data?.overall_risk_level ?? 'Unknown'
  const summary = data?.scan_summary
  const bannerColors = getRiskBannerColors(riskLevel)
  const secrets = Array.isArray(data?.secret_findings) ? data.secret_findings : []
  const piis = Array.isArray(data?.pii_findings) ? data.pii_findings : []

  return (
    <div className="space-y-5">
      {/* Risk Level Banner */}
      <div className={`rounded-xl p-5 border ${bannerColors.bg} ${bannerColors.border} backdrop-blur-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-slate-800/40 ${bannerColors.icon}`}>
              <FiShield className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm text-slate-400 uppercase tracking-wider font-medium">Overall Risk Level</p>
              <h2 className={`text-3xl font-bold ${bannerColors.text}`}>{riskLevel}</h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Total Findings</p>
            <p className={`text-4xl font-bold ${bannerColors.text}`}>{summary?.total_findings ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-red-800/30 bg-red-950/20">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-400/80 uppercase tracking-wider font-medium">Critical</p>
                <p className="text-3xl font-bold text-red-300 mt-1">{summary?.critical_count ?? 0}</p>
              </div>
              <FiAlertCircle className="h-8 w-8 text-red-500/40" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-800/30 bg-orange-950/20">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-400/80 uppercase tracking-wider font-medium">High</p>
                <p className="text-3xl font-bold text-orange-300 mt-1">{summary?.high_count ?? 0}</p>
              </div>
              <FiAlertTriangle className="h-8 w-8 text-orange-500/40" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-800/30 bg-yellow-950/20">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-400/80 uppercase tracking-wider font-medium">Medium</p>
                <p className="text-3xl font-bold text-yellow-300 mt-1">{summary?.medium_count ?? 0}</p>
              </div>
              <FiDatabase className="h-8 w-8 text-yellow-500/40" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-800/30 bg-green-950/20">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-400/80 uppercase tracking-wider font-medium">Low</p>
                <p className="text-3xl font-bold text-green-300 mt-1">{summary?.low_count ?? 0}</p>
              </div>
              <FiEye className="h-8 w-8 text-green-500/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Findings Tables */}
      <Tabs defaultValue="secrets" className="w-full">
        <TabsList className="bg-slate-800/60 border border-slate-700/40">
          <TabsTrigger value="secrets" className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-300 text-slate-400">
            <FiKey className="h-4 w-4 mr-2" />
            Secrets ({secrets.length})
          </TabsTrigger>
          <TabsTrigger value="pii" className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-300 text-slate-400">
            <FiLock className="h-4 w-4 mr-2" />
            PII ({piis.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="secrets">
          <Card className="border-slate-700/50 bg-slate-900/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <FiKey className="h-4 w-4 text-cyan-400" />
                Exposed Secrets & Credentials
              </CardTitle>
            </CardHeader>
            <CardContent>
              {secrets.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FiShield className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No secrets found</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700/50 hover:bg-transparent">
                        <TableHead className="text-slate-400 text-xs uppercase">Type</TableHead>
                        <TableHead className="text-slate-400 text-xs uppercase">Severity</TableHead>
                        <TableHead className="text-slate-400 text-xs uppercase">Location</TableHead>
                        <TableHead className="text-slate-400 text-xs uppercase">Description</TableHead>
                        <TableHead className="text-slate-400 text-xs uppercase">Value Preview</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {secrets.map((s, i) => (
                        <TableRow key={i} className="border-slate-700/30 hover:bg-slate-800/40">
                          <TableCell className="text-sm text-slate-200 font-medium">{s?.type ?? '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${getSeverityColor(s?.severity ?? '')}`}>
                              {s?.severity ?? 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs font-mono text-cyan-400/80">{s?.location ?? '-'}</TableCell>
                          <TableCell className="text-sm text-slate-300 max-w-[250px]">{s?.description ?? '-'}</TableCell>
                          <TableCell className="text-xs font-mono text-red-400/80 bg-red-950/20 rounded">{s?.exposed_value_preview ?? '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pii">
          <Card className="border-slate-700/50 bg-slate-900/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <FiLock className="h-4 w-4 text-purple-400" />
                PII Exposure Findings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {piis.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FiShield className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No PII found</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700/50 hover:bg-transparent">
                        <TableHead className="text-slate-400 text-xs uppercase">Type</TableHead>
                        <TableHead className="text-slate-400 text-xs uppercase">Severity</TableHead>
                        <TableHead className="text-slate-400 text-xs uppercase">Location</TableHead>
                        <TableHead className="text-slate-400 text-xs uppercase">Description</TableHead>
                        <TableHead className="text-slate-400 text-xs uppercase">Data Preview</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {piis.map((p, i) => (
                        <TableRow key={i} className="border-slate-700/30 hover:bg-slate-800/40">
                          <TableCell className="text-sm text-slate-200 font-medium">{p?.type ?? '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${getSeverityColor(p?.severity ?? '')}`}>
                              {p?.severity ?? 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs font-mono text-purple-400/80">{p?.location ?? '-'}</TableCell>
                          <TableCell className="text-sm text-slate-300 max-w-[250px]">{p?.description ?? '-'}</TableCell>
                          <TableCell className="text-xs font-mono text-yellow-400/80 bg-yellow-950/20 rounded">{p?.data_preview ?? '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
